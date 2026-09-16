import { describe, expect, it } from "vitest";
import { EtimsClient } from "../../src/index.js";

/**
 * Opt-in integration test against a real KRA sandbox. Skipped unless
 * KRA_ETIMS_RUN_INTEGRATION=true and ETIMS_CMC_KEY are set — see
 * docs/sandbox.md. Never run as part of plain `npm test` / CI's default job.
 */
const shouldRun = process.env.KRA_ETIMS_RUN_INTEGRATION === "true" && !!process.env.ETIMS_CMC_KEY;

describe.runIf(shouldRun)("KRA sandbox integration", () => {
  it("fetches the code list", async () => {
    const client = new EtimsClient({
      mode: "OSCU",
      environment: "sandbox",
      pin: process.env.ETIMS_PIN!,
      branchId: process.env.ETIMS_BRANCH_ID!
    });

    const result = await client.oscu!.codes.search({
      tin: process.env.ETIMS_PIN!,
      bhfId: process.env.ETIMS_BRANCH_ID!,
      cmcKey: process.env.ETIMS_CMC_KEY!,
      lastReqDt: "19700101000000"
    });

    expect(Array.isArray(result.clsList)).toBe(true);
  });
});

if (!shouldRun) {
  describe("KRA sandbox integration", () => {
    it.skip("skipped: set KRA_ETIMS_RUN_INTEGRATION=true and ETIMS_CMC_KEY to run against a real sandbox", () => {});
  });
}
