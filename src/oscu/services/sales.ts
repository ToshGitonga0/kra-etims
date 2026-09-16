import { z } from "zod";
import type { HttpClient } from "../../client/HttpClient.js";
import { OSCU_ENDPOINTS } from "../endpoints.js";
import { EtimsValidationError } from "../../errors/EtimsValidationError.js";
import { hasEtimsAmountPrecision } from "../../utils/numbers.js";

const amount = () =>
  z.number().refine(hasEtimsAmountPrecision, {
    message:
      "Amount must have at most 2 decimal places (KRA NUMBER(18,2) fields). Use roundEtimsAmount() before building the request."
  });

const saleItemSchema = z.object({
  itemSeq: z.number().int().positive(),
  itemClsCd: z.string().max(10).nullish(),
  itemCd: z.string().max(20),
  itemNm: z.string().max(200),
  bcd: z.string().max(20).nullish(),
  pkgUnitCd: z.string().max(5),
  pkg: amount(),
  qtyUnitCd: z.string().max(5),
  qty: amount(),
  prc: amount(),
  splyAmt: amount(),
  dcRt: amount(),
  dcAmt: amount(),
  isrccCd: z.string().max(10).nullish(),
  isrccNm: z.string().max(100).nullish(),
  isrcRt: z.number().nullish(),
  isrcAmt: amount().nullish(),
  taxTyCd: z.string().max(5),
  taxblAmt: amount(),
  totTaxAmt: amount(),
  totAmt: amount()
});

const receiptSchema = z.object({
  custTin: z.string().max(11).nullish(),
  custMblNo: z.string().max(20).nullish(),
  rcptPbctDt: z.string().length(14),
  trdeNm: z.string().max(20).nullish(),
  adrs: z.string().max(200).nullish(),
  topMsg: z.string().max(20).nullish(),
  btmMsg: z.string().max(20).nullish(),
  prchrAcptcYn: z.enum(["Y", "N"])
});

/**
 * 3.3.6.1 TrnsSalesSaveWrReq. This is the single most fiscally sensitive
 * call in the SDK: it registers a sales transaction and invoice with KRA
 * and returns the receipt signature/internal-data pair that MUST be printed
 * on the taxpayer's receipt (see the printed-receipt layout requirements in
 * TIS-for-OSCU--VSCU-Technical-Specifications-v2.0.pdf, item 6.23).
 *
 * The SDK does not retry this call automatically under any circumstances
 * (see HttpClient's `"write"` call-safety class) and validates it strictly
 * before sending.
 */
export const salesSaveRequestSchema = z.object({
  tin: z.string().length(11),
  bhfId: z.string().length(2),
  cmcKey: z.string().min(1),
  trdInvcNo: z.string().max(50),
  invcNo: z.number().int().nonnegative(),
  orgInvcNo: z.number().int().nonnegative(),
  custTin: z.string().max(11).nullish(),
  custNm: z.string().max(60).nullish(),
  rcptTyCd: z.enum(["S", "R"]),
  pmtTyCd: z.string().max(5).nullish(),
  salesSttsCd: z.enum(["01", "02", "03", "04", "05", "06"]),
  cfmDt: z.string().length(14),
  salesDt: z.string().length(8),
  stockRlsDt: z.string().length(14).nullish(),
  cnclReqDt: z.string().length(14).nullish(),
  cnclDt: z.string().length(14).nullish(),
  rfdDt: z.string().length(14).nullish(),
  rfdRsnCd: z.string().max(5).nullish(),
  totItemCnt: z.number().int().positive(),
  taxblAmtA: amount(),
  taxblAmtB: amount(),
  taxblAmtC: amount(),
  taxblAmtD: amount(),
  taxblAmtE: amount(),
  taxRtA: z.number(),
  taxRtB: z.number(),
  taxRtC: z.number(),
  taxRtD: z.number(),
  taxRtE: z.number(),
  taxAmtA: amount(),
  taxAmtB: amount(),
  taxAmtC: amount(),
  taxAmtD: amount(),
  taxAmtE: amount(),
  totTaxblAmt: amount(),
  totTaxAmt: amount(),
  totAmt: amount(),
  prchrAcptcYn: z.enum(["Y", "N"]),
  remark: z.string().max(400).nullish(),
  regrId: z.string().max(20),
  regrNm: z.string().max(60),
  modrId: z.string().max(20),
  modrNm: z.string().max(60),
  receipt: receiptSchema,
  itemList: z.array(saleItemSchema).min(1)
});

export type SalesSaveRequest = z.infer<typeof salesSaveRequestSchema>;

export interface SalesSaveData {
  curRcptNo: string;
  totRcptNo: string;
  /** Internal Data — must be printed on the receipt, dash-separated every 4 chars. */
  intrlData: string;
  /** Receipt Signature — must be printed on the receipt, dash-separated every 4 chars. */
  rcptSign: string;
  sdcDateTime: string;
}

export class SalesService {
  constructor(private readonly http: HttpClient) {}

  /**
   * Registers a sales transaction and invoice with KRA. Maps to
   * `POST /saveTrnsSalesOsdc` (OSCU_Specification_Document_v2.0.pdf, 3.3.6.1).
   *
   * Throws {@link EtimsValidationError} without making a network call if
   * `request` fails local schema validation, so malformed input never
   * risks an ambiguous duplicate submission.
   */
  async save(request: SalesSaveRequest): Promise<SalesSaveData> {
    const result = salesSaveRequestSchema.safeParse(request);
    if (!result.success) {
      throw new EtimsValidationError(
        "Invalid sales save request.",
        result.error.issues.map((issue) => ({ path: issue.path, message: issue.message }))
      );
    }
    const envelope = await this.http.post<SalesSaveData, SalesSaveRequest>(
      OSCU_ENDPOINTS.salesSave,
      result.data,
      "write"
    );
    if (!envelope.data) {
      throw new Error("KRA eTIMS sales save succeeded but returned no receipt data payload.");
    }
    return envelope.data;
  }
}
