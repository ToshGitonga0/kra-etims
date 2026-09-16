import type { HttpClient } from "../../client/HttpClient.js";
import type { EtimsRequestContext } from "../../client/RequestContext.js";
import { OSCU_ENDPOINTS } from "../endpoints.js";
import type { LastRequestDateFilter, OscuRequest } from "../types.js";

export type CodeSearchRequest = OscuRequest<LastRequestDateFilter>;

export interface CodeDetail {
  cd: string;
  cdNm: string;
  cdDesc: string | null;
  srtOrd: number;
  userDfnCd1: string | null;
  userDfnCd2: string | null;
  userDfnCd3: string | null;
  useYn: "Y" | "N";
}

export interface CodeClassification {
  cdCls: string;
  cdClsNm: string;
  cdClsDesc: string | null;
  userDfnNm1: string | null;
  userDfnNm2: string | null;
  userDfnNm3: string | null;
  useYn: "Y" | "N";
  dtlList: CodeDetail[];
}

export interface CodeSearchData {
  clsList: CodeClassification[];
}

export class CodeService {
  constructor(private readonly http: HttpClient) {}

  /**
   * Maps to `POST /selectCodeList` (OSCU_Specification_Document_v2.0.pdf, 3.3.2.1).
   * Pass `lastReqDt` = "19700101000000" (or similar) to fetch the full list
   * on first sync.
   */
  async search(request: CodeSearchRequest): Promise<CodeSearchData> {
    const envelope = await this.http.post<CodeSearchData, CodeSearchRequest>(
      OSCU_ENDPOINTS.codeSearch,
      request,
      "read"
    );
    return envelope.data ?? { clsList: [] };
  }
}

export type NoticeSearchRequest = OscuRequest<LastRequestDateFilter>;

export interface NoticeEntry {
  noticeNo: number;
  title: string;
  cont: string;
  dtlUrl: string;
  regrNm: string;
  regDt: string;
}

export interface NoticeSearchData {
  noticeList: NoticeEntry[];
}

export class NoticeService {
  constructor(private readonly http: HttpClient) {}

  /** Maps to `POST /selectNoticeList` (OSCU_Specification_Document_v2.0.pdf, 3.3.2.3). */
  async search(request: NoticeSearchRequest): Promise<NoticeSearchData> {
    const envelope = await this.http.post<NoticeSearchData, NoticeSearchRequest>(
      OSCU_ENDPOINTS.noticeSearch,
      request,
      "read"
    );
    return envelope.data ?? { noticeList: [] };
  }
}

export interface CustomerSearchRequest extends EtimsRequestContext {
  /** PIN of the customer being looked up. */
  custmTin: string;
}

export interface CustomerInfo {
  tin: string;
  taxprNm: string;
  taxprSttsCd: string;
  prvncNm: string;
  dstrtNm: string;
  sctrNm: string;
  locDesc: string;
}

export interface CustomerSearchData {
  custList: CustomerInfo[];
}

export class CustomerService {
  constructor(private readonly http: HttpClient) {}

  /** Maps to `POST /selectCustomer` (OSCU_Specification_Document_v2.0.pdf, 3.3.2.2). */
  async search(request: CustomerSearchRequest): Promise<CustomerSearchData> {
    const envelope = await this.http.post<CustomerSearchData, CustomerSearchRequest>(
      OSCU_ENDPOINTS.customerSearch,
      request,
      "read"
    );
    return envelope.data ?? { custList: [] };
  }
}
