import type { EtimsEnvironment } from "./types.js";

/**
 * OSCU KRA server base URLs.
 *
 * Source: KRA "Online Sales Control Unit (OSCU) Requirements & Communication
 * Protocols" v2.0 (April 2023), section 1.2:
 *   Production: https://etims-api.kra.go.ke/etims-api/
 *   Test (sandbox): https://etims-api-sbx.kra.go.ke/etims-api/
 *
 * Cross-checked against KRA's "OSCU_VSCU_Step-by-Step_Guide-on-how-to-sign-up.pdf",
 * which gives the sandbox device-activation URL as
 * https://etims-api-sbx.kra.go.ke/selectInitOsdcInfo — i.e. the same host,
 * without the trailing "/etims-api" segment shown in that particular guide.
 * The OSCU Specification Document (the authoritative API contract document)
 * is used as the source of truth here; the "/etims-api" path prefix is kept
 * because it is stated explicitly in that document. If you observe a
 * mismatch against your sandbox credentials, override with `baseUrl` in the
 * client config rather than assuming this constant is wrong — KRA has
 * changed these URLs between spec revisions before (see the document
 * revision history in OSCU_Specification_Document_v2.0.pdf: "2.0 Updated
 * OSCU production and test urls").
 */
export const OSCU_BASE_URLS: Record<EtimsEnvironment, string> = {
  production: "https://etims-api.kra.go.ke/etims-api",
  sandbox: "https://etims-api-sbx.kra.go.ke/etims-api"
};

/** Default request timeout, in milliseconds. */
export const DEFAULT_TIMEOUT_MS = 15_000;

/** Default number of retries for network-level failures on read-only calls. */
export const DEFAULT_MAX_RETRIES = 2;

/**
 * KRA API response code for unambiguous success.
 * Source: OSCU_Specification_Document_v2.0.pdf, section 4.18 "API Response Code".
 */
export const RESULT_CODE_SUCCESS = "000";

/**
 * KRA API response code meaning "there is no search result" — treated as a
 * successful, empty response by this SDK rather than an error.
 * Source: OSCU_Specification_Document_v2.0.pdf, section 4.18.
 */
export const RESULT_CODE_NO_RESULT = "001";
