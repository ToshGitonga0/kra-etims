import { describe, expect, it } from "vitest";
import { itemSaveRequestSchema } from "../../src/oscu/services/items.js";

// Based on the JSON SAMPLE in OSCU_Specification_Document_v2.0.pdf, 3.3.3.2.
const validSample = {
  tin: "A123456789Z",
  bhfId: "00",
  cmcKey: "f0b9831bd2334874b7ec815e40347bc4",
  itemCd: "KE1NTXU0000006",
  itemClsCd: "5059690800",
  itemTyCd: "1",
  itemNm: "test material item 3",
  itemStdNm: null,
  orgnNatCd: "KE",
  pkgUnitCd: "NT",
  qtyUnitCd: "U",
  taxTyCd: "B",
  btchNo: null,
  bcd: null,
  dftPrc: 3500,
  grpPrcL1: 3500,
  grpPrcL2: 3500,
  grpPrcL3: 3500,
  grpPrcL4: 3500,
  grpPrcL5: null,
  addInfo: null,
  sftyQty: null,
  isrcAplcbYn: "N",
  useYn: "Y",
  regrId: "Test",
  regrNm: "Test",
  modrId: "Test",
  modrNm: "Test"
};

describe("itemSaveRequestSchema", () => {
  it("accepts the spec's own JSON sample", () => {
    const result = itemSaveRequestSchema.safeParse(validSample);
    expect(result.success).toBe(true);
  });

  it("rejects a PIN that is not 11 characters", () => {
    const result = itemSaveRequestSchema.safeParse({ ...validSample, tin: "TOO_SHORT" });
    expect(result.success).toBe(false);
  });

  it("rejects a negative default price", () => {
    const result = itemSaveRequestSchema.safeParse({ ...validSample, dftPrc: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects a missing cmcKey", () => {
    const { cmcKey: _cmcKey, ...withoutKey } = validSample;
    const result = itemSaveRequestSchema.safeParse(withoutKey);
    expect(result.success).toBe(false);
  });
});
