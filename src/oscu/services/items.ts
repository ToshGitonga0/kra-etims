import { z } from "zod";
import type { HttpClient } from "../../client/HttpClient.js";
import { OSCU_ENDPOINTS } from "../endpoints.js";
import type { LastRequestDateFilter, OscuRequest } from "../types.js";
import { EtimsValidationError } from "../../errors/EtimsValidationError.js";

export type ItemClassificationSearchRequest = OscuRequest<LastRequestDateFilter>;

export interface ItemClassification {
  itemClsCd: string;
  itemClsNm: string;
  itemClsLvl: number;
  taxTyCd: string | null;
  mjrTgYn: "Y" | "N" | null;
  useYn: "Y" | "N";
}

export interface ItemClassificationSearchData {
  itemClsList: ItemClassification[];
}

export type ItemSearchRequest = OscuRequest<LastRequestDateFilter>;

export interface ItemInfo {
  tin: string;
  itemCd: string;
  itemClsCd: string;
  itemTyCd: string;
  itemNm: string;
  itemStdNm: string | null;
  orgnNatCd: string;
  pkgUnitCd: string;
  qtyUnitCd: string;
  taxTyCd: string;
  btchNo: string | null;
  regBhfId: string;
  bcd: string | null;
  dftPrc: number;
  grpPrcL1: number | null;
  grpPrcL2: number | null;
  grpPrcL3: number | null;
  grpPrcL4: number | null;
  grpPrcL5: number | null;
  addInfo: string | null;
  sftyQty: number | null;
  isrcAplcbYn: "Y" | "N";
  rraModYn: "Y" | "N";
  useYn: "Y" | "N";
}

export interface ItemSearchData {
  itemList: ItemInfo[];
}

/**
 * 3.3.3.2 ItemSaveReq. Validated with Zod because this is a write that
 * establishes the price/tax basis every future sale for this item is
 * checked against — a malformed submission here has downstream fiscal
 * consequences even though it is not itself a receipt.
 */
export const itemSaveRequestSchema = z.object({
  tin: z.string().length(11),
  bhfId: z.string().length(2),
  cmcKey: z.string().min(1),
  itemClsCd: z.string().max(10),
  itemCd: z.string().max(20),
  itemTyCd: z.string().max(5),
  itemNm: z.string().min(1).max(200),
  itemStdNm: z.string().max(200).nullish(),
  orgnNatCd: z.string().max(5),
  pkgUnitCd: z.string().max(5),
  qtyUnitCd: z.string().max(5),
  taxTyCd: z.string().max(5),
  btchNo: z.string().max(10).nullish(),
  bcd: z.string().max(20).nullish(),
  dftPrc: z.number().nonnegative(),
  grpPrcL1: z.number().nonnegative().nullish(),
  grpPrcL2: z.number().nonnegative().nullish(),
  grpPrcL3: z.number().nonnegative().nullish(),
  grpPrcL4: z.number().nonnegative().nullish(),
  grpPrcL5: z.number().nonnegative().nullish(),
  addInfo: z.string().max(7).nullish(),
  sftyQty: z.number().nonnegative().nullish(),
  isrcAplcbYn: z.enum(["Y", "N"]),
  useYn: z.enum(["Y", "N"]),
  regrId: z.string().max(20),
  regrNm: z.string().max(60),
  modrId: z.string().max(20),
  modrNm: z.string().max(60)
});

export type ItemSaveRequest = z.infer<typeof itemSaveRequestSchema>;

export class ItemService {
  constructor(private readonly http: HttpClient) {}

  /** Maps to `POST /selectItemClsList` (OSCU_Specification_Document_v2.0.pdf, 3.3.3.1). */
  async searchClassifications(
    request: ItemClassificationSearchRequest
  ): Promise<ItemClassificationSearchData> {
    const envelope = await this.http.post<ItemClassificationSearchData, ItemClassificationSearchRequest>(
      OSCU_ENDPOINTS.itemClassificationSearch,
      request,
      "read"
    );
    return envelope.data ?? { itemClsList: [] };
  }

  /** Maps to `POST /selectItemList` (OSCU_Specification_Document_v2.0.pdf, 3.3.3.3). */
  async search(request: ItemSearchRequest): Promise<ItemSearchData> {
    const envelope = await this.http.post<ItemSearchData, ItemSearchRequest>(
      OSCU_ENDPOINTS.itemSearch,
      request,
      "read"
    );
    return envelope.data ?? { itemList: [] };
  }

  /**
   * Maps to `POST /saveItem` (OSCU_Specification_Document_v2.0.pdf, 3.3.3.2).
   * Throws {@link EtimsValidationError} locally (no network call made) if
   * `request` fails schema validation.
   */
  async save(request: ItemSaveRequest): Promise<void> {
    const result = itemSaveRequestSchema.safeParse(request);
    if (!result.success) {
      throw new EtimsValidationError(
        "Invalid item save request.",
        result.error.issues.map((issue) => ({ path: issue.path, message: issue.message }))
      );
    }
    await this.http.post(OSCU_ENDPOINTS.itemSave, result.data, "write");
  }
}
