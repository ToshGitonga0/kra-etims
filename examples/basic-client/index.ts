/**
 * Run with: npx tsx examples/basic-client/index.ts
 * Requires .env (copy from .env.example) with sandbox credentials loaded
 * into the environment first, e.g.:
 *   export $(grep -v '^#' .env | xargs) && npx tsx examples/basic-client/index.ts
 * or install the optional `dotenv` package yourself and add
 * `import "dotenv/config";` here.
 */
import { EtimsClient } from "../../src/index.js";

async function main() {
  const client = new EtimsClient({
    mode: "OSCU",
    environment: (process.env.ETIMS_ENVIRONMENT as "sandbox" | "production") ?? "sandbox",
    pin: process.env.ETIMS_PIN ?? "A123456789Z",
    branchId: process.env.ETIMS_BRANCH_ID ?? "00",
  });

  const codes = await client.oscu!.codes.search({
    tin: process.env.ETIMS_PIN ?? "A123456789Z",
    bhfId: process.env.ETIMS_BRANCH_ID ?? "00",
    cmcKey: process.env.ETIMS_CMC_KEY ?? "",
    lastReqDt: "19700101000000",
  });

  console.log(`Fetched ${codes.clsList.length} code classifications.`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
