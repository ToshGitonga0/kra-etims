import type { HttpClient } from "../../client/HttpClient.js";
import { OSCU_ENDPOINTS } from "../endpoints.js";
import type { LastRequestDateFilter, OscuRequest } from "../types.js";

export type PurchaseSalesSearchRequest = OscuRequest<LastRequestDateFilter>;

export interface PurchaseSalesItem {
  itemSeq: number;
  itemClsCd: string;
  itemCd: string;
  itemNm: string;
  bcd: string | null;
  pkgUnitCd: string;
  pkg: number;
  qtyUnitCd: string;
  qty: number;
  prc: number;
  splyAmt: number;
  dcRt: number;
  dcAmt: number;
  taxTyCd: string;
  taxblAmt: number;
  taxAmt: number;
  totAmt: number;
}

export interface PurchaseSalesEntry {
  spplrTin: string;
  spplrNm: string;
  spplrBhfId: string;
  spplrInvcNo: number;
  rcptTyCd: string;
  pmtTyCd: string;
  cfmDt: string;
  salesDt: string;
  stockRlsDt: string;
  totItemCnt: number;
  taxblAmtA: number;
  taxblAmtB: number;
  taxblAmtC: number;
  taxblAmtD: number;
  taxblAmtE: number;
  taxRtA: number;
  taxRtB: number;
  taxRtC: number;
  taxRtD: number;
  taxRtE: number;
  taxAmtA: number;
  taxAmtB: number;
  taxAmtC: number;
  taxAmtD: number;
  taxAmtE: number;
  totTaxblAmt: number;
  totTaxAmt: number;
  totAmt: number;
  remark: string | null;
  itemList: PurchaseSalesItem[];
}

export interface PurchaseSalesSearchData {
  saleList: PurchaseSalesEntry[];
}

export interface PurchaseSaveItem {
  itemSeq: number;
  itemCd?: string | null;
  itemClsCd: string;
  itemNm: string;
  bcd?: string | null;
  spplrItemClsCd?: string | null;
  spplrItemCd?: string | null;
  spplrItemNm?: string | null;
  pkgUnitCd?: string | null;
  pkg: number;
  qtyUnitCd: string;
  qty: number;
  prc: number;
  splyAmt: number;
  dcRt: number;
  dcAmt: number;
  taxblAmt: number;
  taxTyCd: string;
  taxAmt: number;
  totAmt: number;
  itemExprDt?: string | null;
}

export interface PurchaseSaveRequest extends OscuRequest {
  spplrTin?: string | null;
  invcNo: number;
  orgInvcNo: number;
  spplrBhfId?: string | null;
  spplrNm?: string | null;
  spplrInvcNo?: number | null;
  regTyCd: string;
  pchsTyCd: string;
  rcptTyCd: string;
  pmtTyCd: string;
  pchsSttsCd: string;
  cfmDt?: string | null;
  pchsDt: string;
  wrhsDt?: string | null;
  cnclReqDt?: string | null;
  cnclDt?: string | null;
  rfdDt?: string | null;
  totItemCnt: number;
  taxblAmtA: number;
  taxblAmtB: number;
  taxblAmtC: number;
  taxblAmtD: number;
  taxblAmtE: number;
  taxRtA: number;
  taxRtB: number;
  taxRtC: number;
  taxRtD: number;
  taxRtE: number;
  taxAmtA: number;
  taxAmtB: number;
  taxAmtC: number;
  taxAmtD: number;
  taxAmtE: number;
  totTaxblAmt: number;
  totTaxAmt: number;
  totAmt: number;
  remark?: string | null;
  regrId: string;
  regrNm: string;
  modrId: string;
  modrNm: string;
  itemList: PurchaseSaveItem[];
}

export class PurchaseService {
  constructor(private readonly http: HttpClient) {}

  /**
   * Looks up sales that name this PIN as the purchaser, for purchase
   * confirmation / stock reconciliation. Maps to
   * `POST /selectTrnsPurchaseSalesList` (OSCU_Specification_Document_v2.0.pdf,
   * 3.3.7.1).
   */
  async searchPurchaseSales(request: PurchaseSalesSearchRequest): Promise<PurchaseSalesSearchData> {
    const envelope = await this.http.post<PurchaseSalesSearchData, PurchaseSalesSearchRequest>(
      OSCU_ENDPOINTS.purchaseSalesSearch,
      request,
      "read"
    );
    return envelope.data ?? { saleList: [] };
  }

  /**
   * Records a purchase transaction. Maps to `POST /insertTrnsPurchase`
   * (OSCU_Specification_Document_v2.0.pdf, 3.3.7.2). Treated as a fiscal
   * write: never automatically retried on network failure.
   */
  async save(request: PurchaseSaveRequest): Promise<void> {
    await this.http.post(OSCU_ENDPOINTS.purchaseSave, request, "write");
  }
}
