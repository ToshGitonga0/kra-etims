import { EtimsError } from "./EtimsError.js";

/**
 * Thrown when KRA's eTIMS API server responded over HTTP, but the response
 * body's `resultCd` indicates a failure (i.e. anything other than "000"
 * success, or "001" no-search-result which the SDK treats as success).
 *
 * See docs/kra-contract-verification.md and
 * OSCU_Specification_Document_v2.0.pdf section 4.18 "API Response Code" for
 * the full list of codes this wraps.
 */
export class EtimsApiError extends EtimsError {
  public override readonly name: string = "EtimsApiError";

  constructor(
    message: string,
    public readonly resultCd: string,
    public readonly resultMsg: string,
    public readonly resultDt: string | undefined,
    /** The full, unmodified JSON body KRA returned, for debugging. */
    public readonly raw: unknown
  ) {
    super(`KRA eTIMS API error ${resultCd}: ${message}`);
  }
}
