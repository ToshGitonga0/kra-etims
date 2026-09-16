import { describe, expect, it } from "vitest";
import { salesSaveRequestSchema } from "../../src/oscu/services/sales.js";

// Adapted from the JSON SAMPLE in OSCU_Specification_Document_v2.0.pdf, 3.3.6.1.
// The spec's own sample is missing a couple of required fields (rcptTyCd is
// given as "salesTyCd" in that particular sample, which is inconsistent with
// the field table above it) — this fixture uses the field TABLE as the
// source of truth per docs/kra-contract-verification.md, and is flagged
// there as a documentation inconsistency in the spec itself.
const validSample = {
  tin: "A123456789Z",
  bhfId: "00",
  cmcKey: "f0b9831bd2334874b7ec815e40347bc4",
  trdInvcNo: "123",
  invcNo: 1,
  orgInvcNo: 0,
  custTin: "A123456789Z",
  custNm: "Taxpayer1112",
  rcptTyCd: "S",
  pmtTyCd: "01",
  salesSttsCd: "02",
  cfmDt: "20200127210300",
  salesDt: "20200127",
  stockRlsDt: "20200127210300",
  cnclReqDt: null,
  cnclDt: null,
  rfdDt: null,
  rfdRsnCd: null,
  totItemCnt: 2,
  taxblAmtA: 0,
  taxblAmtB: 10500,
  taxblAmtC: 0,
  taxblAmtD: 0,
  taxblAmtE: 0,
  taxRtA: 0,
  taxRtB: 18,
  taxRtC: 0,
  taxRtD: 0,
  taxRtE: 0,
  taxAmtA: 0,
  taxAmtB: 1602,
  taxAmtC: 0,
  taxAmtD: 0,
  taxAmtE: 0,
  totTaxblAmt: 10500,
  totTaxAmt: 1602,
  totAmt: 10500,
  prchrAcptcYn: "N",
  remark: null,
  regrId: "Test",
  regrNm: "Test",
  modrId: "Test",
  modrNm: "Test",
  receipt: {
    custTin: "A123456789Z",
    custMblNo: null,
    rcptPbctDt: "20201118120300",
    trdeNm: null,
    adrs: null,
    topMsg: null,
    btmMsg: null,
    prchrAcptcYn: "N"
  },
  itemList: [
    {
      itemSeq: 1,
      itemCd: "KE1NTXU0000001",
      itemClsCd: "5059690800",
      itemNm: "test item 1",
      bcd: null,
      pkgUnitCd: "NT",
      pkg: 2,
      qtyUnitCd: "U",
      qty: 2,
      prc: 3500,
      splyAmt: 7000,
      dcRt: 0,
      dcAmt: 0,
      isrccCd: null,
      isrccNm: null,
      isrcRt: null,
      isrcAmt: null,
      taxTyCd: "B",
      taxblAmt: 7000,
      totTaxAmt: 1068,
      totAmt: 7000
    }
  ]
};

describe("salesSaveRequestSchema", () => {
  it("accepts a well-formed sales save request derived from the spec sample", () => {
    const result = salesSaveRequestSchema.safeParse(validSample);
    if (!result.success) {
      console.error(result.error.issues);
    }
    expect(result.success).toBe(true);
  });

  it("rejects a request with zero items", () => {
    const result = salesSaveRequestSchema.safeParse({ ...validSample, itemList: [] });
    expect(result.success).toBe(false);
  });

  it("rejects amounts with more than 2 decimal places (float-drift guard)", () => {
    const result = salesSaveRequestSchema.safeParse({ ...validSample, totAmt: 10500.0001 });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid receipt type code", () => {
    const result = salesSaveRequestSchema.safeParse({ ...validSample, rcptTyCd: "X" });
    expect(result.success).toBe(false);
  });

  it("rejects a malformed salesDt (must be 8 chars)", () => {
    const result = salesSaveRequestSchema.safeParse({ ...validSample, salesDt: "2020-01-27" });
    expect(result.success).toBe(false);
  });
});
