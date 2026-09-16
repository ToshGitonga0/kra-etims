import { EtimsApiError } from "./EtimsApiError.js";

/**
 * A narrower subclass of {@link EtimsApiError} thrown when the `resultCd`
 * indicates a device-identity / authentication problem rather than an
 * ordinary business-rule failure:
 *
 *   900 - There is no Header information
 *   901 - It is not valid device
 *   902 - This device is installed
 *   903 - Only OSCU device can be verified
 *
 * Source: OSCU_Specification_Document_v2.0.pdf, section 4.18.
 *
 * NOTE: the SDK deliberately does NOT model a generic `accessToken` /
 * `refreshToken` / `Authorization: Bearer` flow. The verified OSCU contract
 * authenticates every call using the taxpayer PIN, branch ID, and the
 * `cmcKey` communication key issued during device initialization
 * (`DeviceVerificationRes.data.info.cmcKey`) as request body fields — not
 * HTTP bearer tokens. If your sandbox credentials require a different
 * scheme, treat that as environment-specific and open an issue rather than
 * assuming this SDK is missing an OAuth layer.
 */
export class EtimsAuthenticationError extends EtimsApiError {
  public override readonly name = "EtimsAuthenticationError";
}

export const AUTHENTICATION_RESULT_CODES = new Set(["900", "901", "902", "903"]);
