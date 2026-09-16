# kra-etims-sdk

An **unofficial, community** TypeScript SDK for the Kenya Revenue Authority
(KRA) eTIMS **OSCU** system-to-system JSON API, with a compatible **VSCU**
client for taxpayer-hosted deployments. Not affiliated with, endorsed by, or
officially supported by KRA.

> **Read this first:** `docs/kra-contract-verification.md`. It lists, for
> every endpoint this SDK implements, exactly which KRA document and section
> it came from, and it lists what is **not** implemented and why. This
> README summarizes; that document is the source of truth.

## What this SDK is

- A typed client for KRA's real, published OSCU JSON REST API
  (`OSCU_Specification_Document_v2.0.pdf`, v2.0, April 2023): device
  initialization, code/customer/notice lookup, item classification & save,
  branch management, import item reconciliation, sales, purchases, and
  stock.
- A client that can also talk to a **VSCU** instance you already run
  (same JSON contract, taxpayer-hosted), once KRA has approved your VSCU
  service request and you have the runtime running — see `docs/vscu.md`.
- Strict about fiscal safety: write operations are never silently retried,
  and the two highest-risk writes (`items.save`, `sales.save`) are
  validated locally with Zod before anything is sent over the network.

## What this SDK is NOT

- **Not** an implementation of the VSCU Java runtime itself. KRA
  distributes that as a separate downloadable package after service
  approval; this SDK talks *to* it, it does not replace it. See
  `docs/vscu.md`.
- **Not** an implementation of the local TIS↔SCU device IPC/XML protocol
  described in KRA's "Technical Specification of TIS for OSCU/VSCU"
  document — that's a different protocol for device firmware, not for
  typical backend integration. See `docs/kra-contract-verification.md`.
- **Not** certified, vetted, or endorsed by KRA. Passing your own
  integration through KRA's testing/certification process remains your
  responsibility.
- **Not** exercised against a live KRA sandbox as part of building this
  scaffold (no sandbox credentials were available). Every type and
  endpoint is sourced from KRA's own specification PDFs and unit-tested
  against fixtures derived from the spec's own JSON samples — see the
  status legend in `docs/kra-contract-verification.md` for exactly what
  "verified" means here versus what still needs sandbox testing by you.

## Supported integration modes and environments

These are two independent settings — see `docs/architecture.md`:

| | OSCU | VSCU |
|---|---|---|
| Hosted by | KRA | You (taxpayer), KRA-provided Java runtime |
| `environment: "sandbox" \| "production"` | Yes, resolves KRA's base URL | No — you supply `baseUrl` directly |
| Implemented by this SDK | Full JSON API client | Full JSON API client, pointed at your runtime |

## Installation

```bash
npm install kra-etims-sdk
```

> **Package name note:** the scope `@kra-etims/sdk` requested in some
> project templates is **not automatically publishable** — npm scopes
> (`@kra-etims`) must be claimed as an npm organization/user before you can
> publish under them, and nothing in this scaffold claims that
> organization for you. This package is set up under the unscoped name
> `kra-etims-sdk` instead, which is publishable as-is (subject to the name
> being available at publish time — check with `npm view kra-etims-sdk`
> before your first publish). If you control the `@kra-etims` npm
> organization, renaming back to a scoped package is a one-line change in
> `package.json`.

## Quick start

```ts
import { EtimsClient } from "kra-etims-sdk";

const client = new EtimsClient({
  mode: "OSCU",
  environment: "sandbox",
  pin: "A123456789Z",
  branchId: "00",
});

// One-time: activate the device and obtain your communication key.
const { info } = await client.oscu!.init.initialize({
  tin: "A123456789Z",
  bhfId: "00",
  dvcSrlNo: "dev-serial-0001",
});

console.log("Store this securely, do not log it again:", info.cmcKey);
```

See `docs/sandbox.md` for the full onboarding walkthrough and
`examples/` for runnable code.

## Configuration

```ts
interface OscuClientConfig {
  mode: "OSCU";
  environment: "sandbox" | "production";
  pin: string;         // KRA "tin", 11 characters
  branchId: string;     // "00" = head office
  communicationKey?: string; // cmcKey, once you have one
  baseUrl?: string;     // override, e.g. for a test proxy
  timeoutMs?: number;   // default 15000
  maxRetries?: number;  // default 2, read-only calls only — see "Fiscal safety"
  fetchImpl?: typeof fetch;
}

interface VscuClientConfig {
  mode: "VSCU";
  pin: string;
  branchId: string;
  communicationKey?: string;
  baseUrl: string;      // required — your VSCU runtime's host, e.g. http://localhost:8088
  timeoutMs?: number;
  maxRetries?: number;
  fetchImpl?: typeof fetch;
}
```

## Sales

```ts
import { EtimsClient, roundEtimsAmount, toEtimsDate, toEtimsDateTime } from "kra-etims-sdk";

const receipt = await client.oscu!.sales.save({
  tin: "A123456789Z",
  bhfId: "00",
  cmcKey: process.env.ETIMS_CMC_KEY!,
  trdInvcNo: "INV-0001",
  invcNo: 1,
  orgInvcNo: 0,
  custTin: null,
  custNm: "Walk-in customer",
  rcptTyCd: "S",
  pmtTyCd: "01",
  salesSttsCd: "02",
  cfmDt: toEtimsDateTime(new Date()),
  salesDt: toEtimsDate(new Date()),
  stockRlsDt: toEtimsDateTime(new Date()),
  cnclReqDt: null, cnclDt: null, rfdDt: null, rfdRsnCd: null,
  totItemCnt: 1,
  taxblAmtA: 0, taxblAmtB: 100, taxblAmtC: 0, taxblAmtD: 0, taxblAmtE: 0,
  taxRtA: 0, taxRtB: 16, taxRtC: 0, taxRtD: 0, taxRtE: 0,
  taxAmtA: 0, taxAmtB: roundEtimsAmount(16), taxAmtC: 0, taxAmtD: 0, taxAmtE: 0,
  totTaxblAmt: 100, totTaxAmt: 16, totAmt: 116,
  prchrAcptcYn: "N",
  remark: null,
  regrId: "admin", regrNm: "Admin", modrId: "admin", modrNm: "Admin",
  receipt: {
    custTin: null, custMblNo: null,
    rcptPbctDt: toEtimsDateTime(new Date()),
    trdeNm: null, adrs: null, topMsg: null, btmMsg: null,
    prchrAcptcYn: "N",
  },
  itemList: [{
    itemSeq: 1, itemClsCd: "5059690800", itemCd: "KE1NTXU0000001", itemNm: "Sample item",
    bcd: null, pkgUnitCd: "NT", pkg: 1, qtyUnitCd: "U", qty: 1,
    prc: 116, splyAmt: 100, dcRt: 0, dcAmt: 0,
    isrccCd: null, isrccNm: null, isrcRt: null, isrcAmt: null,
    taxTyCd: "B", taxblAmt: 100, totTaxAmt: 16, totAmt: 116,
  }],
});

// Print receipt.intrlData and receipt.rcptSign on the customer receipt —
// see TIS-for-OSCU--VSCU-Technical-Specifications-v2.0.pdf §6.23.
```

## Customers, Items, Purchases, Stock

```ts
await client.oscu!.customers.search({ tin, bhfId, cmcKey, custmTin: "P987654321X" });
await client.oscu!.items.search({ tin, bhfId, cmcKey, lastReqDt: "20200101000000" });
await client.oscu!.purchases.searchPurchaseSales({ tin, bhfId, cmcKey, lastReqDt: "20200101000000" });
await client.oscu!.stock.searchMoves({ tin, bhfId, cmcKey, lastReqDt: "20200101000000" });
```

Full field-level types for every request/response are exported from the
package root — see `src/index.ts` or your editor's autocomplete.

## Errors

```ts
import { EtimsNetworkError, EtimsApiError, EtimsAuthenticationError, EtimsValidationError } from "kra-etims-sdk";

try {
  await client.oscu!.sales.save(request);
} catch (err) {
  if (err instanceof EtimsValidationError) {
    // Never left your machine — fix err.issues and resubmit safely.
  } else if (err instanceof EtimsAuthenticationError) {
    // Device/cmcKey problem — see docs/troubleshooting.md.
  } else if (err instanceof EtimsApiError) {
    // KRA responded with a business-rule failure — err.resultCd/resultMsg.
  } else if (err instanceof EtimsNetworkError) {
    // Request may or may not have reached KRA — see "Fiscal safety" below
    // before retrying a write call.
  }
}
```

## Fiscal safety

Fiscal writes (`sales.save`, `purchases.save`, `stock.saveIo`) are **never**
automatically retried by this SDK, even on a network timeout — see
`docs/architecture.md`. A dropped connection does not tell you whether KRA
processed the request. Before resubmitting a write after a network error,
use the corresponding search endpoint
(`purchases.searchPurchaseSales`, `stock.searchMoves`) to check whether the
original submission already landed, and give it a new `invcNo`/`sarNo` only
if it didn't.

## Testing

```bash
npm test                    # unit tests, no network calls, safe in CI
npm run test:integration    # opt-in, requires real sandbox credentials in .env
```

## Sandbox

See `docs/sandbox.md` for the full KRA onboarding walkthrough (service
request, device activation, communication key).

## Security

See `SECURITY.md`.

## Architecture

See `docs/architecture.md`.

## Contributing

See `CONTRIBUTING.md`. The short version: every KRA-facing detail must cite
an official KRA document in `docs/kra-contract-verification.md`.

## Versioning

This package follows semver relative to its own public TypeScript API.
`docs/kra-contract-verification.md` separately tracks which version of
KRA's own specification (`OSCU_Specification_Document_v2.0.pdf`, v2.0) this
SDK was built against — a future KRA contract revision may require a new
SDK major version if field shapes change.

## License

MIT — see `LICENSE`. This project is independent and not affiliated with
KRA; see the notice at the bottom of `LICENSE`.
