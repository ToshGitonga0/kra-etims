import type { HttpClient } from "../../client/HttpClient.js";
import { OSCU_ENDPOINTS } from "../endpoints.js";
import type { LastRequestDateFilter, OscuRequest } from "../types.js";
import type { ImportItemStatusCode } from "../codes.js";

export type ImportItemSearchRequest = OscuRequest<LastRequestDateFilter>;

export interface ImportItemEntry {
  taskCd: string;
  dclDe: string;
  itemSeq: number;
  dclNo: string;
  hsCd: string;
  itemNm: string;
  imptItemsttsCd: ImportItemStatusCode;
  orgnNatCd: string;
  exptNatCd: string;
  pkg: number;
  pkgUnitCd: string | null;
  qty: number;
  qtyUnitCd: string;
  totWt: number;
  netWt: number;
  spplrNm: string;
  agntNm: string;
  invcFcurAmt: number;
  invcFcurCd: string;
  invcFcurExcrt: number;
}

export interface ImportItemSearchData {
  itemList: ImportItemEntry[];
}

export interface ImportItemUpdateRequest extends OscuRequest {
  taskCd: string;
  dclDe: string;
  itemSeq: number;
  hsCd: string;
  itemClsCd: string;
  itemCd: string;
  imptItemsttsCd: ImportItemStatusCode;
  remark?: string | null;
  modrId: string;
  modrNm: string;
}

export class ImportItemService {
  constructor(private readonly http: HttpClient) {}

  /**
   * Maps to `POST /selectImportItemList`
   * (OSCU_Specification_Document_v2.0.pdf, 3.3.5.1). Returns import
   * declarations recorded against this PIN by KRA Customs, for stock
   * reconciliation.
   */
  async search(request: ImportItemSearchRequest): Promise<ImportItemSearchData> {
    const envelope = await this.http.post<ImportItemSearchData, ImportItemSearchRequest>(
      OSCU_ENDPOINTS.importItemSearch,
      request,
      "read"
    );
    return envelope.data ?? { itemList: [] };
  }

  /**
   * Approves/rejects an imported item and links it to a local item/stock
   * code. Maps to `POST /updateImportItem`
   * (OSCU_Specification_Document_v2.0.pdf, 3.3.5.2).
   */
  async update(request: ImportItemUpdateRequest): Promise<void> {
    await this.http.post(OSCU_ENDPOINTS.importItemUpdate, request, "write");
  }
}
