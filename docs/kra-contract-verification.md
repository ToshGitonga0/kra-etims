# KRA eTIMS contract verification

This document records, endpoint by endpoint, what this SDK implements, which KRA document each detail comes from, and what remains unverified. If something in [src/](../src/) is not traceable to a row in this document, treat it as a bug and open an issue.

## Status legend

| Status | Meaning |
|---|---|
| **Verified** | Field names, types, required/optional flags, and lengths are taken directly from an official KRA PDF. |
| **Verified, sandbox-untested** | Same as above, but this SDK has not yet been exercised against a live KRA sandbox; see [CHANGELOG.md](../CHANGELOG.md). |
| **UNVERIFIED** | KRA's documentation is silent, ambiguous, or internally inconsistent on this point. |

Unless individually noted otherwise, every implemented OSCU endpoint is **Verified, sandbox-untested**.

## Primary sources

| Document | Version / date | Retrieved from |
|---|---|---|
| Online Sales Control Unit (OSCU) Requirements & Communication Protocols | v2.0, April 2023 | [OSCU Specification Document v2.0](https://www.kra.go.ke/images/publications/OSCU_Specification_Document_v2.0.pdf) |
| Virtual Sales Control Unit (VSCU) Requirements & Communication Protocols | v2.0 | [VSCU Specification Document v2.0](https://www.kra.go.ke/images/publications/VSCU_Specification_Document_v2.0.pdf) |
| Technical Specification of TIS for OSCU/VSCU | v2.0, April 2023 | [TIS for OSCU/VSCU Technical Specifications v2.0](https://www.kra.go.ke/images/publications/TIS-for-OSCU--VSCU-Technical-Specifications-v2.0.pdf) |
| OSCU/VSCU sign-up guide | undated | [OSCU/VSCU step-by-step sign-up guide](https://www.kra.go.ke/images/publications/OSCU_VSCU_Step-by-Step_Guide-on-how-to-sign-up.pdf) |
| eTIMS System to System Integration | live page | [KRA system-to-system integration](https://www.kra.go.ke/business/etims-electronic-tax-invoice-management-system/learn-about-etims/etims-system-to-system-integration) |

Secondary/community sources were inspected only as corroborating evidence: [Paybill Kenya's OSCU documentation](https://paybill.ke/docs/kra-etims-oscu) and community SDKs. They were not used as the source of any field name or endpoint.

### Source priority

1. [Official OSCU technical specification](https://www.kra.go.ke/images/publications/OSCU_Specification_Document_v2.0.pdf) — field names, types, and endpoint paths.
2. [Official TIS/OSCU/VSCU technical specification](https://www.kra.go.ke/images/publications/TIS-for-OSCU--VSCU-Technical-Specifications-v2.0.pdf) — receipt-printing rules and local TIS↔SCU protocol.
3. [Official sign-up guide](https://www.kra.go.ke/images/publications/OSCU_VSCU_Step-by-Step_Guide-on-how-to-sign-up.pdf) — URL shape and VSCU deployment model.
4. [KRA system-to-system integration guidance](https://www.kra.go.ke/business/etims-electronic-tax-invoice-management-system/learn-about-etims/) — OSCU/VSCU conceptual split.
5. Third-party implementations — URL and response-envelope corroboration only.

## Two specifications, two protocols

The [TIS for OSCU/VSCU specification](https://www.kra.go.ke/images/publications/TIS-for-OSCU--VSCU-Technical-Specifications-v2.0.pdf) describes a local IPC protocol between a TIS and an OSCU/VSCU device, including commands such as `SEND_RECEIPT`, `RECV_RECEIPT`, and `SIGNATURE_REQUEST`. The [OSCU specification](https://www.kra.go.ke/images/publications/OSCU_Specification_Document_v2.0.pdf) describes the JSON REST API between a taxpayer backend and KRA's API server (or a taxpayer-hosted VSCU runtime).

**This SDK implements only the JSON REST API.** It does not implement the local TIS↔SCU IPC protocol. See [docs/architecture.md](./architecture.md).

## OSCU, VSCU, sandbox, and production

- **Integration mode:** `OSCU` (KRA-hosted) or `VSCU` (taxpayer-hosted Java runtime).
- **Environment:** `sandbox` or `production` for OSCU. VSCU uses a caller-supplied URL.

See [`IntegrationMode` and `EtimsEnvironment`](../src/config/types.ts) and [docs/architecture.md](./architecture.md).

## Base URLs

| Mode | Environment | Base URL | Source |
|---|---|---|---|
| OSCU | production | `https://etims-api.kra.go.ke/etims-api` | [OSCU specification §1.2](https://www.kra.go.ke/images/publications/OSCU_Specification_Document_v2.0.pdf) |
| OSCU | sandbox | `https://etims-api-sbx.kra.go.ke/etims-api` | [OSCU specification §1.2](https://www.kra.go.ke/images/publications/OSCU_Specification_Document_v2.0.pdf) |
| VSCU | n/a | Caller-supplied, e.g. `http://localhost:8088` | [OSCU/VSCU sign-up guide](https://www.kra.go.ke/images/publications/OSCU_VSCU_Step-by-Step_Guide-on-how-to-sign-up.pdf) |

The sign-up guide also shows a sandbox URL without `/etims-api`, while the OSCU specification includes that path. This SDK follows the dedicated OSCU specification. If sandbox requests return 404, override `baseUrl` after checking the URL supplied by KRA.

## Response envelope and authentication

Verified endpoints return an envelope such as:

```json
{ "resultCd": "000", "resultMsg": "It is succeeded", "resultDt": "20200226143124", "data": {} }
```

`000` and `001` are treated as success by `HttpClient`; other codes become `EtimsAuthenticationError` (900–903) or `EtimsApiError`. See [src/errors/](../src/errors/) and [src/oscu/codes.ts](../src/oscu/codes.ts).

Authentication is not bearer-token/OAuth. Requests after initialization carry `tin`, `bhfId`, and `cmcKey`, as described in the [OSCU specification §3.3.1.1](https://www.kra.go.ke/images/publications/OSCU_Specification_Document_v2.0.pdf). The SDK therefore does not implement `accessToken` or `refreshToken` handling.

## Endpoint-by-endpoint status

| # | SDK method | HTTP | KRA endpoint | Request → response | Spec section | Status |
|---:|---|---|---|---|---|---|
| 1 | `oscu.init.initialize()` | POST | `/selectInitOsdcInfo` | `DeviceVerificationReq` → `DeviceVerificationRes` | §3.3.1.1 | Verified, sandbox-untested |
| 2 | `oscu.codes.search()` | POST | `/selectCodeList` | `CodeSearchReq` → `CodeSearchRes` | §3.3.2.1 | Verified, sandbox-untested |
| 3 | `oscu.customers.search()` | POST | `/selectCustomer` | `CustSearchReq` → `CustSearchRes` | §3.3.2.2 | Verified, sandbox-untested |
| 4 | `oscu.notices.search()` | POST | `/selectNoticeList` | `NoticeSearchReq` → `NoticeSearchRes` | §3.3.2.3 | Verified, sandbox-untested |
| 5 | `oscu.items.searchClassifications()` | POST | `/selectItemClsList` | `ItemClsSearchReq` → `ItemClsSearchRes` | §3.3.3.1 | Verified, sandbox-untested |
| 6 | `oscu.items.save()` | POST | `/saveItem` | `ItemSaveReq` → `ItemSaveRes` | §3.3.3.2 | Verified, sandbox-untested; Zod-validated |
| 7 | `oscu.items.search()` | POST | `/selectItemList` | `ItemSearchReq` → `ItemSearchRes` | §3.3.3.3 | Verified, sandbox-untested |
| 8 | `oscu.branches.search()` | POST | `/selectBhfList` | `BhfSearchReq` → `BhfSearchRes` | §3.3.4.1 | Verified, sandbox-untested |
| 9 | `oscu.branches.saveCustomer()` | POST | `/saveBhfCustomer` | `BhfCustSaveReq` → `BhfCustSaveRes` | §3.3.4.2 | Verified, sandbox-untested |
| 10 | `oscu.branches.saveUser()` | POST | `/saveBhfUser` | `BhfUserSaveReq` → `BhfUserSaveRes` | §3.3.4.3 | Verified, sandbox-untested |
| 11 | `oscu.branches.saveInsurance()` | POST | `/saveBhfInsurance` | `BhfInsuranceSaveReq` → `BhfInsuranceSaveRes` | §3.3.4.4 | Verified, sandbox-untested |
| 12 | `oscu.importItems.search()` | POST | `/selectImportItemList` | `ImportItemSearchReq` → `ImportItemSearchRes` | §3.3.5.1 | Verified, sandbox-untested |
| 13 | `oscu.importItems.update()` | POST | `/updateImportItem` | `ImportItemUpdateReq` → `ImportItemUpdateRes` | §3.3.5.2 | Verified, sandbox-untested |
| 14 | `oscu.sales.save()` | POST | `/saveTrnsSalesOsdc` | `TrnsSalesSaveWrReq` → `TrnsSalesSaveWrRes` | §3.3.6.1 | Verified, sandbox-untested; Zod-validated; no auto-retry |
| 15 | `oscu.purchases.searchPurchaseSales()` | POST | `/selectTrnsPurchaseSalesList` | `TrnsPurchaseSalesReq` → `TrnsPurchaseSalesRes` | §3.3.7.1 | Verified, sandbox-untested |
| 16 | `oscu.purchases.save()` | POST | `/insertTrnsPurchase` | `TrnsPurchaseSaveReq` → `TrnsPurchaseSaveRes` | §3.3.7.2 | Verified, sandbox-untested; no auto-retry |
| 17 | `oscu.stock.searchMoves()` | POST | `/selectStockMoveList` | `StockMoveReq` → `StockMoveRes` | §3.3.8.1 | Verified, sandbox-untested |
| 18 | `oscu.stock.saveIo()` | POST | `/insertStockIO` | `StockIOSaveReq` → `StockIOSaveRes` | §3.3.8.2 | Verified, sandbox-untested; no auto-retry |
| 19 | `oscu.stock.saveMaster()` | POST | `/saveStockMaster` | `StockMasterSaveReq` → `StockMasterSaveRes` | §3.3.8.3 | Verified, sandbox-untested |

## Known gaps

| Feature | Source | Status |
|---|---|---|
| `ItemExcute.saveComposition` / BOM save | [OSCU specification §3.2.1](https://www.kra.go.ke/images/publications/OSCU_Specification_Document_v2.0.pdf) | **UNVERIFIED — not implemented** |
| VSCU-specific field or behavior differences | [VSCU specification](https://www.kra.go.ke/images/publications/VSCU_Specification_Document_v2.0.pdf) | **UNVERIFIED** |
| Local TIS↔SCU IPC protocol | [TIS specification](https://www.kra.go.ke/images/publications/TIS-for-OSCU--VSCU-Technical-Specifications-v2.0.pdf) | **UNVERIFIED — not implemented** |
| Client-side cryptographic verification of `intrlData` / `rcptSign` | No retrieved source | **UNVERIFIED — not implemented** |
| Large reference code tables | [OSCU specification §4](https://www.kra.go.ke/images/publications/OSCU_Specification_Document_v2.0.pdf) | **Verified but intentionally not hard-coded** |
| OAuth2 / bearer-token authentication | Not described in the OSCU specification | **Explicitly not implemented** |

## Inconsistent sample

In §3.3.6.1, the field table lists required `rcptTyCd`, while the worked JSON sample uses `salesTyCd: "N"`. The SDK follows the field table; [tests/unit/sales-save-schema.test.ts](../tests/unit/sales-save-schema.test.ts) documents the discrepancy.

## What this SDK is not

- Not a replacement for the VSCU Java runtime. See [docs/vscu.md](./vscu.md).
- Not an implementation of the local TIS↔SCU IPC/XML protocol.
- Not a receipt-printing or formatting library.
- Not audited, certified, or endorsed by KRA; follow KRA's device-certification process before production use.
