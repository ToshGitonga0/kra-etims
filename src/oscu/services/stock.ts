import type { HttpClient } from "../../client/HttpClient.js";
import { OSCU_ENDPOINTS } from "../endpoints.js";
import type { LastRequestDateFilter, OscuRequest } from "../types.js";
import type { StockMovementTypeCode } from "../codes.js";

export type StockMoveSearchRequest = OscuRequest<LastRequestDateFilter>;

export interface StockMoveItem {
  itemSeq: number;
  itemClsCd: string;
  itemCd: string;
  itemNm: string;
  bcd: string | null;
  pkgUnitCd: string;
  pkg: number;
  qtyUnitCd: string;
  qty: number;
  itemExprDt: string | null;
  prc: number;
  splyAmt: number;
  totDcAmt: number;
  taxblAmt: number;
  taxTyCd: string;
  taxAmt: number;
  totAmt: number;
}

export interface StockMoveEntry {
  custTin: string;
  custBhfId: string;
  sarNo: number;
  ocrnDt: string;
  totItemCnt: number;
  totTaxblAmt: number;
  totTaxAmt: number;
  totAmt: number;
  remark: string | null;
  itemList: StockMoveItem[];
}

export interface StockMoveSearchData {
  stockList: StockMoveEntry[];
}

export interface StockIoItem {
  itemSeq: number;
  itemCd?: string | null;
  itemClsCd: string;
  itemNm: string;
  bcd?: string | null;
  pkgUnitCd: string;
  pkg: number;
  qtyUnitCd: string;
  qty: number;
  itemExprDt?: string | null;
  prc: number;
  splyAmt: number;
  totDcAmt: number;
  taxblAmt: number;
  taxTyCd: string;
  taxAmt: number;
  totAmt: number;
}

export interface StockIoSaveRequest extends OscuRequest {
  sarNo: number;
  orgSarNo: number;
  regTyCd: string;
  custTin?: string | null;
  custNm?: string | null;
  custBhfId?: string | null;
  sarTyCd: StockMovementTypeCode;
  ocrnDt: string;
  totItemCnt: number;
  totTaxblAmt: number;
  totTaxAmt: number;
  totAmt: number;
  remark?: string | null;
  regrId: string;
  regrNm: string;
  modrId: string;
  modrNm: string;
  itemList: StockIoItem[];
}

export interface StockMasterSaveRequest extends OscuRequest {
  itemCd: string;
  rsdQty: number;
  regrId: string;
  regrNm: string;
  modrId: string;
  modrNm: string;
}

export class StockService {
  constructor(private readonly http: HttpClient) {}

  /**
   * Maps to `POST /selectStockMoveList` (OSCU_Specification_Document_v2.0.pdf,
   * 3.3.8.1). Reports stock movement between head office and branches.
   */
  async searchMoves(request: StockMoveSearchRequest): Promise<StockMoveSearchData> {
    const envelope = await this.http.post<StockMoveSearchData, StockMoveSearchRequest>(
      OSCU_ENDPOINTS.stockMoveSearch,
      request,
      "read"
    );
    return envelope.data ?? { stockList: [] };
  }

  /**
   * Records stock in/out movement. Maps to `POST /insertStockIO`
   * (OSCU_Specification_Document_v2.0.pdf, 3.3.8.2). Per the TIS/OSCU
   * technical specification, every stock in/out record must correspond to
   * sales invoice information already sent to KRA — this SDK does not
   * enforce that ordering for you; the caller is responsible for sequencing
   * sales.save() before stock.saveIo() for outbound (sale) movements.
   */
  async saveIo(request: StockIoSaveRequest): Promise<void> {
    await this.http.post(OSCU_ENDPOINTS.stockIoSave, request, "write");
  }

  /**
   * Maps to `POST /saveStockMaster` (OSCU_Specification_Document_v2.0.pdf,
   * 3.3.8.3). Stores the resulting remaining-quantity master record after a
   * stock in/out event.
   */
  async saveMaster(request: StockMasterSaveRequest): Promise<void> {
    await this.http.post(OSCU_ENDPOINTS.stockMasterSave, request, "write");
  }
}
