#!/usr/bin/env tsx
/**
 * Sanity check that every endpoint path implemented in src/oscu/endpoints.ts
 * is documented in docs/kra-contract-verification.md, and prints the full
 * SDK-method -> HTTP-method -> KRA-endpoint mapping for manual review.
 *
 * This is deliberately NOT a network test — it never contacts KRA. It only
 * checks internal consistency between code and documentation.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { OSCU_ENDPOINTS } from "../src/oscu/endpoints.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const docPath = path.join(__dirname, "..", "docs", "kra-contract-verification.md");

function main(): void {
  const doc = readFileSync(docPath, "utf8");
  const missing: string[] = [];

  console.log("KRA eTIMS OSCU endpoint -> documentation cross-check\n");
  for (const [name, urlPath] of Object.entries(OSCU_ENDPOINTS)) {
    const documented = doc.includes(`\`${urlPath}\``);
    console.log(`  ${documented ? "✓" : "✗"} ${name.padEnd(28)} ${urlPath}`);
    if (!documented) missing.push(urlPath);
  }

  console.log("");
  if (missing.length > 0) {
    console.error(
      `✗ ${missing.length} endpoint(s) implemented in src/oscu/endpoints.ts are not referenced in docs/kra-contract-verification.md:`
    );
    for (const m of missing) console.error(`  - ${m}`);
    console.error("\nEvery implemented endpoint must have a row in the verification table before merging.");
    process.exitCode = 1;
    return;
  }

  console.log(`✓ All ${Object.keys(OSCU_ENDPOINTS).length} implemented endpoints are documented.`);
}

main();
