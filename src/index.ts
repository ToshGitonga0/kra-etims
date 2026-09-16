export { EtimsClient } from "./client/EtimsClient.js";
export type { EtimsApiEnvelope, HttpClientOptions, CallSafety } from "./client/HttpClient.js";
export type { EtimsRequestContext } from "./client/RequestContext.js";

export type {
  IntegrationMode,
  EtimsEnvironment,
  OscuClientConfig,
  VscuClientConfig,
  EtimsClientConfig
} from "./config/types.js";
export {
  OSCU_BASE_URLS,
  DEFAULT_TIMEOUT_MS,
  DEFAULT_MAX_RETRIES,
  RESULT_CODE_SUCCESS,
  RESULT_CODE_NO_RESULT
} from "./config/defaults.js";

export { OscuDomain } from "./oscu/index.js";
export { VscuDomain } from "./vscu/index.js";

export {
  EtimsError,
  EtimsNetworkError,
  EtimsApiError,
  EtimsValidationError,
  EtimsAuthenticationError,
  AUTHENTICATION_RESULT_CODES
} from "./errors/index.js";

export {
  toEtimsDate,
  toEtimsDateTime,
  isValidEtimsDate,
  isValidEtimsDateTime,
  parseEtimsDateTime,
  redact,
  roundEtimsAmount,
  hasEtimsAmountPrecision
} from "./utils/index.js";

// Domain service types re-exported for convenience.
export type { DeviceVerificationRequest, DeviceVerificationData } from "./oscu/services/initialization.js";
export type {
  CodeSearchRequest,
  CodeSearchData,
  NoticeSearchRequest,
  NoticeSearchData,
  CustomerSearchRequest,
  CustomerSearchData
} from "./oscu/services/codes.js";
export type {
  ItemClassificationSearchRequest,
  ItemClassificationSearchData,
  ItemSearchRequest,
  ItemSearchData,
  ItemSaveRequest
} from "./oscu/services/items.js";
export { itemSaveRequestSchema } from "./oscu/services/items.js";
export type {
  BranchSearchRequest,
  BranchSearchData,
  BranchCustomerSaveRequest,
  BranchUserSaveRequest,
  BranchInsuranceSaveRequest
} from "./oscu/services/branches.js";
export type {
  ImportItemSearchRequest,
  ImportItemSearchData,
  ImportItemUpdateRequest
} from "./oscu/services/importItems.js";
export type { SalesSaveRequest, SalesSaveData } from "./oscu/services/sales.js";
export { salesSaveRequestSchema } from "./oscu/services/sales.js";
export type {
  PurchaseSalesSearchRequest,
  PurchaseSalesSearchData,
  PurchaseSaveRequest
} from "./oscu/services/purchases.js";
export type {
  StockMoveSearchRequest,
  StockMoveSearchData,
  StockIoSaveRequest,
  StockMasterSaveRequest
} from "./oscu/services/stock.js";

export * from "./oscu/codes.js";
