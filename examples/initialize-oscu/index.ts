/**
 * One-time OSCU device activation.
 * Run with: npx tsx examples/initialize-oscu/index.ts
 *
 * IMPORTANT: this call fails with resultCd 902 ("This device is installed")
 * if you run it twice for the same PIN/branch/device serial. Store the
 * returned cmcKey after the first successful run — see docs/sandbox.md.
 */
import { EtimsClient } from "../../src/index.js";

async function main() {
  const pin = process.env.ETIMS_PIN ?? "A123456789Z";
  const branchId = process.env.ETIMS_BRANCH_ID ?? "00";

  const client = new EtimsClient({
    mode: "OSCU",
    environment: "sandbox",
    pin,
    branchId,
  });

  const { info } = await client.oscu!.init.initialize({
    tin: pin,
    bhfId: branchId,
    dvcSrlNo: process.env.ETIMS_DEVICE_SERIAL ?? "dev-serial-0001",
  });

  console.log("Device activated.");
  console.log("Store this cmcKey securely (e.g. in a secret manager), do not commit it:");
  console.log(info.cmcKey);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
