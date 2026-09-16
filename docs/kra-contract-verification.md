# KRA eTIMS contract verification

This document records, endpoint by endpoint, what this SDK implements, which
KRA document each detail comes from, and what remains unverified. It is the
source of truth for "is this real, or did the SDK invent it?" — if something
in `src/` is not traceable to a row in this document, treat it as a bug and
open an issue.

## Status legend

| Status | Meaning |
|---|---|
| **Verified** | Field names, types, required/optional flags, and lengths are taken directly from an official KRA PDF. |
| **Verified, sandbox-untested** | Same as above, but this SDK has not yet been exercised against a live KRA sandbox (no sandbox credentials were available while building this scaffold — see `CHANGELOG.md`). |
| **UNVERIFIED** | KRA's documentation is silent, ambiguous, or internally inconsistent on this point. The SDK either omits the feature or clearly flags the gap in code comments. |

Unless individually noted otherwise below, every implemented OSCU endpoint is
**Verified, sandbox-untested**.

## Primary sources

| Document | Version / date | Retrieved from |
|---|---|---|
| Online Sales Control Unit (OSCU) Requirements & Communication Protocols | v2.0, April 2023 | `https://www.kra.go.ke/images/publications/OSCU_Specification_Document_v2.0.pdf` |
| Virtual Sales Control Unit (VSCU) Requirements & Communication Protocols | v2.0 (referenced; same family as OSCU doc) | `https://www.kra.go.ke/images/publications/VSCU_Specification_Document_v2.0.pdf` |
| Technical Specification of TIS for OSCU/VSCU | v2.0, released April 2023 | `https://www.kra.go.ke/images/publications/TIS-for-OSCU--VSCU-Technical-Specifications-v2.0.pdf` |
| OSCU/VSCU sign-up guide ("eTIMS Online Sales Control Unit (OSCU) AND Virtual Sales Control Unit...") | undated | `https://www.kra.go.ke/images/publications/OSCU_VSCU_Step-by-Step_Guide-on-how-to-sign-up.pdf` |
| eTIMS System to System Integration (landing page) | live page | `https://www.kra.go.ke/business/etims-electronic-tax-invoice-management-system/learn-about-etims/etims-system-to-system-integration` |

Secondary/community sources (**inspected only as corroborating evidence,
never as the source of a field name or endpoint** — see Source Priority
below): the community TypeScript/PHP/Python SDKs published by Paybill Kenya
(`paybill.ke/docs/kra-etims-oscu`), and several community Node.js/PHP/Python
integration repositories on GitHub and PyPI, which independently confirm the
sandbox/production base URLs and the `resultCd/resultMsg/resultDt/data`
envelope shape.

### Source priority actually applied

1. Official KRA technical specification (OSCU_Specification_Document_v2.0.pdf) — used for every field name, type, and endpoint path in this SDK.
2. Official KRA "Technical Specification of TIS for OSCU/VSCU" — used for receipt-printing rules, receipt labels, and the *local* TIS↔SCU device protocol (out of scope for this SDK's REST client — see "What this SDK is not" below).
3. Official KRA sign-up guide — used to confirm sandbox/production URL shape and VSCU's local-deployment model (Java runtime, port 8088).
4. Official KRA notices — none consulted; none were needed for the endpoints implemented.
5. Official KRA website guidance (system-to-system integration landing page) — used to confirm the OSCU/VSCU conceptual split.
6. Verified KRA technical material — n/a beyond the above.
7. Third-party implementations — used only to cross-check the base URLs and envelope shape already stated in the primary source; never used to add a field or endpoint not present in the primary source.

## Two specifications, two protocols — do not conflate them

KRA publishes **two different protocol documents** relevant to OSCU/VSCU, and
they describe **two different things**:

1. **"Technical Specification of TIS for OSCU/VSCU"** describes a *local*
   IPC protocol between a physical/software Trader Invoicing System (TIS,
   e.g. a POS or ECR) and an OSCU/VSCU *device* sitting on the same
   machine/network — commands like `SEND_RECEIPT`, `RECV_RECEIPT`,
   `SIGNATURE_REQUEST`, exchanged as `<PIN><CMD><DATA><STATUS>` XML/plain-text
   messages with a 1000ms timeout. This protocol is for people building the
   OSCU/VSCU *device firmware itself* (or a TIS that talks to one at the
   hardware/IPC level), not for typical "system-to-system" API integrators.
2. **"OSCU Specification Document"** describes the *JSON REST API* between a
   taxpayer's own backend/ERP and KRA's central eTIMS API server (or, for
   VSCU, a taxpayer-hosted Java component that exposes the same JSON
   contract). This is the "system-to-system integration" KRA's website
   describes, and it is what every community SDK (Paybill's, and the
   several Node/PHP/Python repositories referenced above) actually
   implements.

**This SDK implements only the second protocol (the JSON REST API).** It does
not implement the local TIS↔SCU IPC protocol from document (1). If your use
case requires building OSCU/VSCU device firmware itself, this SDK is not the
right tool — see `docs/architecture.md`.

## OSCU vs VSCU vs sandbox vs production

These are two independent axes, not one "environment" setting:

- **Integration mode** — `OSCU` (KRA-hosted device/server) or `VSCU`
  (taxpayer-hosted Java runtime). Source: KRA system-to-system integration
  page and the OSCU/VSCU sign-up guide.
- **Environment** — `sandbox` (test) or `production`. Source:
  `OSCU_Specification_Document_v2.0.pdf` section 1.2.

See `src/config/types.ts` (`IntegrationMode`, `EtimsEnvironment`) and
`docs/architecture.md`.

## Base URLs

| Mode | Environment | Base URL | Source |
|---|---|---|---|
| OSCU | production | `https://etims-api.kra.go.ke/etims-api` | OSCU_Specification_Document_v2.0.pdf §1.2 |
| OSCU | sandbox | `https://etims-api-sbx.kra.go.ke/etims-api` | OSCU_Specification_Document_v2.0.pdf §1.2 |
| VSCU | n/a (taxpayer-hosted) | e.g. `http://localhost:8088` (caller-supplied) | OSCU_VSCU_Step-by-Step_Guide-on-how-to-sign-up.pdf (VSCU section, example `http://vscuserverhostname:8088/selectInitOsdcInfo`), Java 16+ runtime requirement stated in the same guide |

**Ambiguity noted:** the sign-up guide's own worked example for OSCU
sandbox activation gives the URL as
`https://etims-api-sbx.kra.go.ke/selectInitOsdcInfo` — i.e. *without* the
`/etims-api` path segment that the OSCU Specification Document states
explicitly in its "Interface data format" table. This SDK follows the OSCU
Specification Document (the dedicated API contract document, and the more
recently revised one per its own revision history: *"2.0 Updated OSCU
production and test urls"*) as the higher-priority source. If your sandbox
credentials 404 against the default, override with `baseUrl` in the client
config — do not assume the constant is simply wrong without checking your
own sandbox portal first.

## Response envelope

Every verified endpoint returns:

```json
{ "resultCd": "000", "resultMsg": "It is succeeded", "resultDt": "20200226143124", "data": { ... } }
```

`resultCd` "000" = success, "001" = success with no results (both treated as
success by `HttpClient`). Every other code in the table in
`OSCU_Specification_Document_v2.0.pdf` §4.18 is surfaced as either
`EtimsAuthenticationError` (codes 900-903) or `EtimsApiError` (everything
else). See `src/errors/` and `src/oscu/codes.ts` (`API_RESPONSE_CODES`).

## Authentication

**Verified**: authentication is not a bearer-token/OAuth flow. Every request
body after device initialization carries `tin` (PIN), `bhfId` (branch ID),
and `cmcKey` (the communication key returned once by device initialization,
`OSCU_Specification_Document_v2.0.pdf` §3.3.1.1). The SDK does not implement
`accessToken`/`refreshToken` handling because the verified contract has none.
If you have seen a KRA integration guide describing OAuth2/bearer tokens for
eTIMS, note it here with a source before adding it — the copy of the
specification used to build this SDK does not describe one.

## Endpoint-by-endpoint status

| # | SDK method | HTTP method | KRA endpoint | Request type | Response type | Spec section | Status |
|---|---|---|---|---|---|---|---|
| 1 | `oscu.init.initialize()` | POST | `/selectInitOsdcInfo` | `DeviceVerificationReq` | `DeviceVerificationRes` | §3.3.1.1 | Verified, sandbox-untested |
| 2 | `oscu.codes.search()` | POST | `/selectCodeList` | `CodeSearchReq` | `CodeSearchRes` | §3.3.2.1 | Verified, sandbox-untested |
| 3 | `oscu.customers.search()` | POST | `/selectCustomer` | `CustSearchReq` | `CustSearchRes` | §3.3.2.2 | Verified, sandbox-untested |
| 4 | `oscu.notices.search()` | POST | `/selectNoticeList` | `NoticeSearchReq` | `NoticeSearchRes` | §3.3.2.3 | Verified, sandbox-untested |
| 5 | `oscu.items.searchClassifications()` | POST | `/selectItemClsList` | `ItemClsSearchReq` | `ItemClsSearchRes` | §3.3.3.1 | Verified, sandbox-untested |
| 6 | `oscu.items.save()` | POST | `/saveItem` | `ItemSaveReq` | `ItemSaveRes` | §3.3.3.2 | Verified, sandbox-untested; Zod-validated |
| 7 | `oscu.items.search()` | POST | `/selectItemList` | `ItemSearchReq` | `ItemSearchRes` | §3.3.3.3 | Verified, sandbox-untested |
| 8 | `oscu.branches.search()` | POST | `/selectBhfList` | `BhfSearchReq` | `BhfSearchRes` | §3.3.4.1 | Verified, sandbox-untested |
| 9 | `oscu.branches.saveCustomer()` | POST | `/saveBhfCustomer` | `BhfCustSaveReq` | `BhfCustSaveRes` | §3.3.4.2 | Verified, sandbox-untested |
| 10 | `oscu.branches.saveUser()` | POST | `/saveBhfUser` | `BhfUserSaveReq` | `BhfUserSaveRes` | §3.3.4.3 | Verified, sandbox-untested |
| 11 | `oscu.branches.saveInsurance()` | POST | `/saveBhfInsurance` | `BhfInsuranceSaveReq` | `BhfInsuranceSaveRes` | §3.3.4.4 | Verified, sandbox-untested; pharmacy taxpayers only per spec §3.1 |
| 12 | `oscu.importItems.search()` | POST | `/selectImportItemList` | `ImportItemSearchReq` | `ImportItemSearchRes` | §3.3.5.1 | Verified, sandbox-untested |
| 13 | `oscu.importItems.update()` | POST | `/updateImportItem` | `ImportItemUpdateReq` | `ImportItemUpdateRes` | §3.3.5.2 | Verified, sandbox-untested |
| 14 | `oscu.sales.save()` | POST | `/saveTrnsSalesOsdc` | `TrnsSalesSaveWrReq` | `TrnsSalesSaveWrRes` | §3.3.6.1 | Verified, sandbox-untested; Zod-validated; fiscal write, never auto-retried |
| 15 | `oscu.purchases.searchPurchaseSales()` | POST | `/selectTrnsPurchaseSalesList` | `TrnsPurchaseSalesReq` | `TrnsPurchaseSalesRes` | §3.3.7.1 | Verified, sandbox-untested |
| 16 | `oscu.purchases.save()` | POST | `/insertTrnsPurchase` | `TrnsPurchaseSaveReq` | `TrnsPurchaseSaveRes` | §3.3.7.2 | Verified, sandbox-untested; fiscal write, never auto-retried |
| 17 | `oscu.stock.searchMoves()` | POST | `/selectStockMoveList` | `StockMoveReq` | `StockMoveRes` | §3.3.8.1 | Verified, sandbox-untested |
| 18 | `oscu.stock.saveIo()` | POST | `/insertStockIO` | `StockIOSaveReq` | `StockIOSaveRes` | §3.3.8.2 | Verified, sandbox-untested; fiscal write, never auto-retried |
| 19 | `oscu.stock.saveMaster()` | POST | `/saveStockMaster` | `StockMasterSaveReq` | `StockMasterSaveRes` | §3.3.8.3 | Verified, sandbox-untested |

Every path above is copied verbatim from the "(url : /xxx)" annotation next
to its section heading in `OSCU_Specification_Document_v2.0.pdf`.

## Known gaps — UNVERIFIED / not implemented

| Feature | KRA source | Status | Notes |
|---|---|---|---|
| `ItemExcute.saveComposition` (item composition / BOM save) | Named in the §3.2.1 function table (`ItemCompositionSaveReq/Res`) | **UNVERIFIED — not implemented** | The retrieved copy of the specification lists this method in the summary table but does not include a numbered `3.3.x` field-level breakdown for it, unlike every other method. Implementing it would require guessing field names, which this SDK's rules forbid. |
| VSCU-specific field/behavior differences (if any) beyond base URL/hosting | `VSCU_Specification_Document_v2.0.pdf` | **UNVERIFIED** | This scaffold treats VSCU as "the same JSON contract as OSCU, served from a taxpayer-hosted runtime instead of a KRA-hosted server" based on the sign-up guide's worked example (`http://vscuserverhostname:8088/selectInitOsdcInfo` — same path as OSCU). The dedicated VSCU spec PDF was not fully diffed field-by-field against the OSCU spec for this scaffold. Before relying on VSCU in production, diff the two PDFs directly and update this row. |
| Local TIS↔SCU device IPC protocol (`SEND_RECEIPT`, `RECV_RECEIPT`, `SIGNATURE_REQUEST`, `COUNTERS_REQUEST`, `DATE_TIME_REQUEST`, `ID_REQUEST`, `EJ_DATA`, `STATUS`, and the `<PIN><CMD><DATA><STATUS>` message format) | `TIS-for-OSCU--VSCU-Technical-Specifications-v2.0.pdf` §21 | **Out of scope, not implemented** | This is a different protocol (see "Two specifications, two protocols" above), not a gap in the JSON API coverage. |
| Digital signature / cryptographic verification of `intrlData` / `rcptSign` on the client side | Not described in any retrieved document | **UNVERIFIED — not implemented** | KRA computes and returns these values; the retrieved specification does not describe a client-side algorithm to independently verify or recompute them, nor a signing key the taxpayer holds. The SDK stores/returns them as opaque strings and does not invent a verification algorithm. |
| Large reference code tables (countries §4.4, packaging units §4.6, quantity units §4.7, currencies §4.8) | `OSCU_Specification_Document_v2.0.pdf` §4 | **Verified but intentionally not hard-coded** | These are large, KRA-maintained lists. The SDK fetches them live via `oscu.codes.search()` rather than embedding a copy that can drift out of date. Only the small, stable enumerations (tax type, transaction type, payment method, etc.) are modeled as TypeScript literal unions in `src/oscu/codes.ts`. |
| OAuth2 / bearer token authentication | Not described in the OSCU Specification Document | **Explicitly not implemented — do not add without a cited source** | Some community repositories implement a `getToken()`/bearer-token flow. This was not found in the primary KRA specification document used here, which authenticates via `tin`/`bhfId`/`cmcKey` in the request body. If you have a KRA document describing an OAuth layer, open an issue with the citation before this is added. |

## Fields the spec's own JSON samples get wrong

Documented here rather than silently "corrected" in code, per this project's
rule against silent guessing:

- **§3.3.6.1 `TrnsSalesSaveWrReq`**: the field *table* lists `rcptTyCd` as a
  required field (see "Sales Receipt Type", §4.9), but the worked JSON
  sample in the same section uses a field called `salesTyCd` with value
  `"N"` instead. The SDK follows the field **table**, not the inconsistent
  sample, and `tests/unit/sales-save-schema.test.ts` documents this
  discrepancy directly in its fixture comment.

## What this SDK is NOT

- Not a replacement for the VSCU Java runtime KRA distributes. See
  `docs/vscu.md`.
- Not an implementation of the local TIS↔SCU IPC/XML protocol described in
  the "Technical Specification of TIS for OSCU/VSCU" document.
- Not a receipt-printing/formatting library, though the fields needed to
  build a compliant printed receipt (per that same document's §6.23) are all
  exposed on `SalesSaveData`.
- Not audited, certified, or endorsed by KRA. You are responsible for
  KRA's own device-certification/vetting process before using this in
  production — see the sign-up guide.
