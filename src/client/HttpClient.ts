import { EtimsApiError } from "../errors/EtimsApiError.js";
import { EtimsAuthenticationError, AUTHENTICATION_RESULT_CODES } from "../errors/EtimsAuthenticationError.js";
import { EtimsNetworkError } from "../errors/EtimsNetworkError.js";
import {
  DEFAULT_MAX_RETRIES,
  DEFAULT_TIMEOUT_MS,
  RESULT_CODE_NO_RESULT,
  RESULT_CODE_SUCCESS
} from "../config/defaults.js";
import { redact } from "../utils/redaction.js";

/**
 * The response envelope shape used by every verified OSCU endpoint.
 * Source: OSCU_Specification_Document_v2.0.pdf JSON SAMPLE blocks throughout
 * section 3.3, and section 4.18 "API Response Code".
 */
export interface EtimsApiEnvelope<TData = unknown> {
  resultCd: string;
  resultMsg: string;
  resultDt?: string;
  data?: TData | null;
}

export interface HttpClientOptions {
  baseUrl: string;
  timeoutMs?: number;
  maxRetries?: number;
  fetchImpl?: typeof fetch;
  /**
   * Called with a redacted view of every outgoing request and incoming
   * response body. Never receives cmcKey, passwords, or other secrets in
   * plain text (see src/utils/redaction.ts). Intended for opt-in debug
   * logging only — disabled by default.
   */
  onDebug?: (event: { direction: "request" | "response"; path: string; body: unknown }) => void;
}

/**
 * Whether a call is safe to automatically retry on a network-level failure.
 * Fiscal write operations (anything that creates/mutates state at KRA, e.g.
 * saveTrnsSalesOsdc, insertTrnsPurchase, insertStockIO, saveItem) must never
 * be silently retried by the SDK: a timeout does not tell you whether KRA
 * processed the request before the connection dropped. Retrying blindly
 * risks duplicate fiscal submissions. Callers that need resilience for
 * writes should implement their own idempotency/reconciliation strategy —
 * see docs/security.md "Fiscal safety".
 */
export type CallSafety = "read" | "write";

/**
 * Minimal HTTP transport for the KRA eTIMS JSON API. Not OSCU/VSCU-specific
 * by itself — both integration modes speak the same JSON contract over a
 * different base URL (see src/config/types.ts).
 */
export class HttpClient {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly maxRetries: number;
  private readonly fetchImpl: typeof fetch;
  private readonly onDebug: HttpClientOptions["onDebug"];

  constructor(options: HttpClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, "");
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
    if (options.fetchImpl) {
      this.fetchImpl = options.fetchImpl;
    } else if (typeof fetch === "function") {
      this.fetchImpl = fetch;
    } else {
      throw new Error(
        "No global fetch is available in this runtime. Pass `fetchImpl` in the client config (Node.js < 18 requires a fetch polyfill)."
      );
    }
    this.onDebug = options.onDebug;
  }

  /**
   * POST a JSON body to a KRA eTIMS endpoint path (e.g. "/selectInitOsdcInfo")
   * and return the parsed `data` payload on success.
   *
   * Throws {@link EtimsAuthenticationError} for device/auth result codes,
   * {@link EtimsApiError} for any other non-success result code, and
   * {@link EtimsNetworkError} for transport-level failures.
   */
  async post<TData, TBody extends object>(
    path: string,
    body: TBody,
    safety: CallSafety
  ): Promise<EtimsApiEnvelope<TData>> {
    const url = `${this.baseUrl}${path}`;
    this.onDebug?.({ direction: "request", path, body: redact(body) });

    const attempts = safety === "read" ? this.maxRetries + 1 : 1;
    let lastNetworkError: unknown;

    for (let attempt = 0; attempt < attempts; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);
      try {
        const response = await this.fetchImpl(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal
        });
        clearTimeout(timer);

        let parsed: unknown;
        try {
          parsed = await response.json();
        } catch (cause) {
          throw new EtimsNetworkError(
            `KRA eTIMS server returned a non-JSON response (HTTP ${response.status}) for ${path}.`,
            url,
            { cause }
          );
        }

        if (!response.ok) {
          throw new EtimsNetworkError(
            `KRA eTIMS server responded with HTTP ${response.status} for ${path}.`,
            url
          );
        }

        const envelope = this.assertEnvelope(parsed, path);
        this.onDebug?.({ direction: "response", path, body: redact(envelope) });

        if (envelope.resultCd === RESULT_CODE_SUCCESS || envelope.resultCd === RESULT_CODE_NO_RESULT) {
          return envelope as EtimsApiEnvelope<TData>;
        }

        if (AUTHENTICATION_RESULT_CODES.has(envelope.resultCd)) {
          throw new EtimsAuthenticationError(
            envelope.resultMsg || "Device/authentication error",
            envelope.resultCd,
            envelope.resultMsg,
            envelope.resultDt,
            parsed
          );
        }

        throw new EtimsApiError(
          envelope.resultMsg || "Unknown KRA eTIMS API error",
          envelope.resultCd,
          envelope.resultMsg,
          envelope.resultDt,
          parsed
        );
      } catch (err) {
        clearTimeout(timer);
        if (err instanceof EtimsApiError || err instanceof EtimsNetworkError) {
          if (err instanceof EtimsNetworkError && attempt < attempts - 1) {
            lastNetworkError = err;
            continue;
          }
          throw err;
        }
        // AbortError, TypeError (fetch failure), DNS errors, etc.
        const networkError = new EtimsNetworkError(
          `Network failure calling KRA eTIMS endpoint ${path}: ${(err as Error)?.message ?? String(err)}`,
          url,
          { cause: err }
        );
        if (attempt < attempts - 1) {
          lastNetworkError = networkError;
          continue;
        }
        throw networkError;
      }
    }

    // Unreachable in practice, but keeps TypeScript's control-flow analysis happy.
    throw (
      lastNetworkError ?? new EtimsNetworkError(`Network failure calling KRA eTIMS endpoint ${path}.`, url)
    );
  }

  private assertEnvelope(parsed: unknown, path: string): EtimsApiEnvelope {
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("resultCd" in parsed) ||
      typeof (parsed as Record<string, unknown>).resultCd !== "string"
    ) {
      throw new EtimsNetworkError(
        `KRA eTIMS server response for ${path} did not match the expected {resultCd, resultMsg, resultDt, data} envelope.`,
        `${this.baseUrl}${path}`
      );
    }
    return parsed as EtimsApiEnvelope;
  }
}
