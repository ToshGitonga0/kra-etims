/**
 * Every endpoint path below is taken verbatim from
 * OSCU_Specification_Document_v2.0.pdf, section 3.3 ("url : /xxx" lines
 * next to each *Req/*Res pair). Do not add paths here that are not present
 * in that document — see docs/kra-contract-verification.md.
 *
 * All paths are relative to the environment base URL in
 * src/config/defaults.ts (OSCU_BASE_URLS), which already includes the
 * "/etims-api" prefix.
 */
export const OSCU_ENDPOINTS = {
  /** 3.3.1.1 DeviceVerificationReq/Res */
  deviceVerification: "/selectInitOsdcInfo",
  /** 3.3.2.1 CodeSearchReq/Res */
  codeSearch: "/selectCodeList",
  /** 3.3.2.2 CustSearchReq/Res */
  customerSearch: "/selectCustomer",
  /** 3.3.2.3 NoticeSearchReq/Res */
  noticeSearch: "/selectNoticeList",
  /** 3.3.3.1 ItemClsSearchReq/Res */
  itemClassificationSearch: "/selectItemClsList",
  /** 3.3.3.2 ItemSaveReq/Res */
  itemSave: "/saveItem",
  /** 3.3.3.3 ItemSearchReq/Res */
  itemSearch: "/selectItemList",
  /** 3.3.4.1 BhfSearchReq/Res */
  branchSearch: "/selectBhfList",
  /** 3.3.4.2 BhfCustSaveReq/Res */
  branchCustomerSave: "/saveBhfCustomer",
  /** 3.3.4.3 BhfUserSaveReq/Res */
  branchUserSave: "/saveBhfUser",
  /** 3.3.4.4 BhfInsuranceSaveReq/Res (pharmacy taxpayers only, per spec 3.1 item 3.b) */
  branchInsuranceSave: "/saveBhfInsurance",
  /** 3.3.5.1 ImportItemSearchReq/Res */
  importItemSearch: "/selectImportItemList",
  /** 3.3.5.2 ImportItemUpdateReq/Res */
  importItemUpdate: "/updateImportItem",
  /** 3.3.6.1 TrnsSalesSaveWrReq/Res — fiscal write */
  salesSave: "/saveTrnsSalesOsdc",
  /** 3.3.7.1 TrnsPurchaseSalesReq/Res */
  purchaseSalesSearch: "/selectTrnsPurchaseSalesList",
  /** 3.3.7.2 TrnsPurchaseSaveReq/Res — fiscal write */
  purchaseSave: "/insertTrnsPurchase",
  /** 3.3.8.1 StockMoveReq/Res */
  stockMoveSearch: "/selectStockMoveList",
  /** 3.3.8.2 StockIOSaveReq/Res — fiscal write */
  stockIoSave: "/insertStockIO",
  /** 3.3.8.3 StockMasterSaveReq/Res */
  stockMasterSave: "/saveStockMaster"
} as const;

export type OscuEndpoint = (typeof OSCU_ENDPOINTS)[keyof typeof OSCU_ENDPOINTS];

/**
 * Methods documented in OSCU_Specification_Document_v2.0.pdf section 3.2.1
 * that are NOT implemented by this SDK version, with the reason. Kept here
 * so contributors don't accidentally re-discover and re-litigate the same
 * gaps — see docs/kra-contract-verification.md for the full status table.
 *
 *  - ItemExcute.saveComposition (Item Composition / BOM) — UNVERIFIED: the
 *    spec table names the request/response object pair
 *    (ItemCompositionSaveReq/Res) but the numbered "3.3.x" walkthrough in
 *    the copy of the document retrieved for this SDK does not include a
 *    field-level breakdown for it (unlike every other listed method).
 *  - StockExcute.saveMaster (Stock Master, listed as "saveMaster" in the
 *    3.2.1 function table) vs. StockMasterSaveReq/Res in 3.3.8.3 — the
 *    function table and the detailed spec disagree on whether this maps to
 *    a method called "saveMaster" or "saveIO"; the SDK implements the
 *    unambiguous, fully-specified 3.3.8.3 StockMasterSaveReq/Res contract
 *    as `stock.saveMaster()` and treats the table's phrasing as a
 *    documentation inconsistency rather than a second, separate endpoint.
 */
export const KNOWN_UNVERIFIED_GAPS = [
  "ItemExcute.saveComposition (Item Composition / BOM save) — no field-level schema found in the retrieved spec"
] as const;
