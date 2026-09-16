import { EtimsError } from "./EtimsError.js";

/**
 * Thrown when the HTTP request to KRA could not be completed at all:
 * DNS failure, connection refused, TLS error, or a timeout with no response
 * received. Distinct from {@link EtimsApiError}, which means KRA *did*
 * respond but reported a business/result-code failure.
 *
 * A network error for a fiscal write call (e.g. sales.save) does NOT mean
 * the transaction was not recorded by KRA — see docs/security.md and the
 * "Fiscal safety" section of the README before retrying blindly.
 */
export class EtimsNetworkError extends EtimsError {
  public override readonly name = "EtimsNetworkError";

  constructor(
    message: string,
    public readonly requestUrl: string,
    options?: { cause?: unknown }
  ) {
    super(message, options);
  }
}
