import type { EtimsRequestContext } from "../client/RequestContext.js";

/** Every request body sent to KRA carries these three fields at minimum. */
export type OscuRequest<T extends object = object> = EtimsRequestContext & T;

/**
 * Shared shape of every "search since last request date" style GET-ish
 * call (CodeSearchReq, ItemSearchReq, BhfSearchReq, etc.). Source: repeated
 * pattern across OSCU_Specification_Document_v2.0.pdf section 3.3, e.g.
 * 3.3.2.1: `{"tin":"...","bhfId":"00","lastReqDt":"20180520000000"}`.
 */
export interface LastRequestDateFilter {
  /** 14-char KRA date-time (YYYYMMDDHHmmss). Server returns rows registered/modified after this. */
  lastReqDt: string;
}

/** Common `resultCd/resultMsg/resultDt` triple returned by every response. */
export interface OscuResultMeta {
  resultCd: string;
  resultMsg: string;
  resultDt?: string;
}
