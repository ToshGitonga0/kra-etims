/**
 * KRA eTIMS distinguishes two independent axes. Conflating them is a common
 * integration mistake, so the SDK models them as two separate types rather
 * than a single "environment" string.
 *
 *  - `IntegrationMode`  -> WHICH solution: OSCU (KRA-hosted) or VSCU (taxpayer-hosted).
 *  - `EtimsEnvironment` -> WHICH KRA server tier: sandbox (test) or production.
 *
 * Source: KRA "Online Sales Control Unit (OSCU) Requirements & Communication
 * Protocols", v2.0 (April 2023), section 1.2 "Environment"; and KRA
 * "eTIMS Online Sales Control Unit (OSCU) AND Virtual Sales Control Unit
 * (VSCU) sign-up guide". See docs/kra-contract-verification.md.
 */
export type IntegrationMode = "OSCU" | "VSCU";

export type EtimsEnvironment = "sandbox" | "production";

/**
 * Configuration required to construct an {@link EtimsClient} for OSCU.
 *
 * OSCU always talks to a KRA-hosted server. The SDK resolves the correct
 * base URL from `environment` unless `baseUrl` is explicitly supplied (useful
 * for testing against a local proxy/mock).
 */
export interface OscuClientConfig {
  mode: "OSCU";
  /** Sandbox vs production KRA server tier. */
  environment: EtimsEnvironment;
  /** Taxpayer PIN (KRA "tin"), 11 characters, e.g. "A123456789Z". */
  pin: string;
  /** Branch office ID, "00" for head office. Required on nearly every call. */
  branchId: string;
  /**
   * Communication key ("cmcKey") issued by KRA after device initialization
   * (`DeviceVerificationRes.data.info.cmcKey`). Required on every call
   * except the initial device-verification call itself. Never log this
   * value; the SDK redacts it automatically (see src/utils/redaction.ts).
   */
  communicationKey?: string;
  /** Override the resolved KRA server base URL. For tests/proxies only. */
  baseUrl?: string;
  /** Request timeout in milliseconds. Default: 15000. */
  timeoutMs?: number;
  /** Number of automatic retries for network-level failures on read-only (GET-shaped) calls. Default: 2. Never applied to fiscal write calls (see src/client/HttpClient.ts). */
  maxRetries?: number;
  /** Optional custom fetch implementation (for testing or non-Node runtimes). */
  fetchImpl?: typeof fetch;
}

/**
 * Configuration for VSCU integration mode.
 *
 * IMPORTANT: VSCU is a taxpayer-hosted Java runtime component distributed by
 * KRA after service approval (KRA sign-up guide: "Required Java (JRE/JDK)
 * Version is Java 16 or higher", VSCU listens on port 8088 by default). This
 * SDK does NOT embed, replace, or reimplement that Java component — it
 * cannot, since KRA does not publish the VSCU binary's internal protocol
 * for reimplementation, only the fact that once running locally it exposes
 * the same JSON request/response contract as OSCU on a taxpayer-controlled
 * host and port.
 *
 * This type exists so the public API can express "point me at a VSCU
 * instance you already run" without pretending the SDK ships that runtime.
 * See src/vscu/index.ts and docs/vscu.md.
 */
export interface VscuClientConfig {
  mode: "VSCU";
  /** Taxpayer PIN. */
  pin: string;
  branchId: string;
  communicationKey?: string;
  /**
   * Full base URL of the taxpayer-operated VSCU host, e.g.
   * "http://localhost:8088". There is no KRA-hosted default for VSCU —
   * this is always required.
   */
  baseUrl: string;
  timeoutMs?: number;
  maxRetries?: number;
  fetchImpl?: typeof fetch;
}

export type EtimsClientConfig = OscuClientConfig | VscuClientConfig;
