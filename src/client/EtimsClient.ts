import type { EtimsClientConfig } from "../config/types.js";
import { OSCU_BASE_URLS } from "../config/defaults.js";
import { HttpClient } from "./HttpClient.js";
import { OscuDomain } from "../oscu/index.js";
import { VscuDomain } from "../vscu/index.js";

/**
 * Entry point for the SDK. Construct with either an OSCU or VSCU config
 * (see {@link EtimsClientConfig}) and use `client.oscu.*` or `client.vscu.*`
 * accordingly. Only one of the two domains is populated per instance,
 * matching the fact that a given device is registered as either OSCU or
 * VSCU with KRA — never both (see docs/architecture.md).
 */
export class EtimsClient {
  public readonly mode: EtimsClientConfig["mode"];
  public readonly oscu?: OscuDomain;
  public readonly vscu?: VscuDomain;
  private readonly http: HttpClient;

  constructor(config: EtimsClientConfig) {
    this.mode = config.mode;

    const baseUrl =
      config.mode === "OSCU" ? (config.baseUrl ?? OSCU_BASE_URLS[config.environment]) : config.baseUrl;

    this.http = new HttpClient({
      baseUrl,
      timeoutMs: config.timeoutMs,
      maxRetries: config.maxRetries,
      fetchImpl: config.fetchImpl
    });

    if (config.mode === "OSCU") {
      this.oscu = new OscuDomain(this.http);
    } else {
      this.vscu = new VscuDomain(this.http);
    }
  }

  /**
   * Escape hatch for calling a KRA endpoint this SDK does not yet wrap, or
   * for contract-verification tests. Prefer `client.oscu.*` / `client.vscu.*`
   * for normal use.
   */
  get transport(): HttpClient {
    return this.http;
  }
}
