/**
 * Code tables from OSCU_Specification_Document_v2.0.pdf, section 4
 * "Code Definition". Only the small, stable enumerations are modeled as
 * TypeScript literal unions; large reference tables (countries, currencies,
 * packaging units, quantity units) are fetched live via
 * `oscu.codes.search()` against KRA's `/selectCodeList` endpoint instead of
 * being hard-coded, since KRA states codes are "registered or modified"
 * over time and the SDK should not drift out of sync with the server's
 * authoritative list.
 */

/** 4.1 Tax Type */
export type TaxTypeCode = "A" | "B" | "C" | "D" | "E";

/** 4.9 Transaction Type (sales/purchase transaction type, NOT receipt type) */
export type TransactionTypeCode = "C" | "N" | "P" | "T";

/** 4.10 Sales Receipt Type */
export type SalesReceiptTypeCode = "S" | "R";

/** 4.11 Payment Method */
export type PaymentMethodCode = "01" | "02" | "03" | "04" | "05" | "06" | "07";

/** 4.12 Transaction Progress (used as both sales and purchase status code) */
export type TransactionProgressCode = "01" | "02" | "03" | "04" | "05" | "06";

/** 4.13 Registration Type */
export type RegistrationTypeCode = "A" | "M";

/** 4.14 Purchase Receipt Type */
export type PurchaseReceiptTypeCode = "P" | "R";

/** 4.15 Stock In/Out (stored-and-released movement type) */
export type StockMovementTypeCode =
  "01" | "02" | "03" | "04" | "05" | "06" | "11" | "12" | "13" | "14" | "15" | "16";

/** 4.16 Import Item Status */
export type ImportItemStatusCode = "1" | "2" | "3" | "4";

/** 4.17 Credit Note Reason */
export type CreditNoteReasonCode = "01" | "02" | "03" | "04" | "05" | "06";

/** 4.3 Product Type */
export type ProductTypeCode = "1" | "2" | "3";

/** 4.2 Taxpayer Status */
export type TaxpayerStatusCode = "A" | "D";

/**
 * 4.18 API Response Code. This is a reference list of every documented
 * `resultCd` value, including the two the SDK treats as success (000, 001).
 * Non-success codes surface via {@link import("../errors/EtimsApiError.js").EtimsApiError}.
 */
export const API_RESPONSE_CODES: Record<string, string> = {
  "000": "It is succeeded",
  "001": "There is no search result",
  "891": "An error occurred while Request URL is created",
  "892": "An error occurred while Request Header data is created",
  "893": "An error occurred while Request Body data is created",
  "894": "An error regarding server communication occurred",
  "895": "An error regarding unallowed Request Method occurred",
  "896": "An error regarding Request Status occurred",
  "899": "An error regarding Client occurred",
  "900": "There is no Header information",
  "901": "It is not valid device",
  "902": "This device is installed",
  "903": "Only OSCU device can be verified",
  "910": "Request parameter error",
  "911": "There is no request full text",
  "912": "There is a request Method error",
  "921": "Sales or sales invoice data which is declared cannot be received",
  "922": "Sales invoice data can be received after receiving the sales data",
  "990": "The maximum number of views are exceeded",
  "991": "There is an error during registration",
  "992": "There is an error during modification",
  "993": "There is an error during deletion",
  "994": "There is an overlapped Data",
  "995": "There is no downloaded file",
  "999": "There is an unknown error. Please ask it administrator"
};
