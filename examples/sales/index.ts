/**
 * Records a minimal sales transaction.
 * Run with: npx tsx examples/sales/index.ts
 * Requires ETIMS_PIN, ETIMS_BRANCH_ID, ETIMS_CMC_KEY in the environment.
 */
import { EtimsClient, roundEtimsAmount, toEtimsDate, toEtimsDateTime } from "../../src/index.js";

async function main() {
  const tin = process.env.ETIMS_PIN ?? "A123456789Z";
  const bhfId = process.env.ETIMS_BRANCH_ID ?? "00";
  const cmcKey = process.env.ETIMS_CMC_KEY ?? "";

  if (!cmcKey) {
    throw new Error("Set ETIMS_CMC_KEY (from examples/initialize-oscu) before running this example.");
  }

  const client = new EtimsClient({ mode: "OSCU", environment: "sandbox", pin: tin, branchId: bhfId });

  const now = new Date();
  const receipt = await client.oscu!.sales.save({
    tin,
    bhfId,
    cmcKey,
    trdInvcNo: `INV-${Date.now()}`,
    invcNo: 1,
    orgInvcNo: 0,
    custTin: null,
    custNm: "Walk-in customer",
    rcptTyCd: "S",
    pmtTyCd: "01",
    salesSttsCd: "02",
    cfmDt: toEtimsDateTime(now),
    salesDt: toEtimsDate(now),
    stockRlsDt: toEtimsDateTime(now),
    cnclReqDt: null,
    cnclDt: null,
    rfdDt: null,
    rfdRsnCd: null,
    totItemCnt: 1,
    taxblAmtA: 0,
    taxblAmtB: 100,
    taxblAmtC: 0,
    taxblAmtD: 0,
    taxblAmtE: 0,
    taxRtA: 0,
    taxRtB: 16,
    taxRtC: 0,
    taxRtD: 0,
    taxRtE: 0,
    taxAmtA: 0,
    taxAmtB: roundEtimsAmount(16),
    taxAmtC: 0,
    taxAmtD: 0,
    taxAmtE: 0,
    totTaxblAmt: 100,
    totTaxAmt: 16,
    totAmt: 116,
    prchrAcptcYn: "N",
    remark: null,
    regrId: "admin",
    regrNm: "Admin",
    modrId: "admin",
    modrNm: "Admin",
    receipt: {
      custTin: null,
      custMblNo: null,
      rcptPbctDt: toEtimsDateTime(now),
      trdeNm: null,
      adrs: null,
      topMsg: null,
      btmMsg: null,
      prchrAcptcYn: "N",
    },
    itemList: [
      {
        itemSeq: 1,
        itemClsCd: "5059690800",
        itemCd: "KE1NTXU0000001",
        itemNm: "Sample item",
        bcd: null,
        pkgUnitCd: "NT",
        pkg: 1,
        qtyUnitCd: "U",
        qty: 1,
        prc: 116,
        splyAmt: 100,
        dcRt: 0,
        dcAmt: 0,
        isrccCd: null,
        isrccNm: null,
        isrcRt: null,
        isrcAmt: null,
        taxTyCd: "B",
        taxblAmt: 100,
        totTaxAmt: 16,
        totAmt: 116,
      },
    ],
  });

  console.log("Sale recorded. Print these on the receipt:");
  console.log("Internal Data:", receipt.intrlData);
  console.log("Receipt Signature:", receipt.rcptSign);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
