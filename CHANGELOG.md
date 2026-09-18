# Changelog

All notable changes to this project are documented in this file.
The format loosely follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.1.4] - 2026-09-18

### Changed
- Updated README repository references and documentation links.
- Improved sandbox usage documentation.
- Expanded and clarified VSCU documentation.

## [0.1.3] - 2026-09-17

### Fixed
- Converted README repository file references into clickable Markdown links,
  including links to [`SECURITY.md`](SECURITY.md), documentation, contributing guidelines,
  source files, and the license.

## [0.1.0] - Unreleased

### Added
- Initial repo: `EtimsClient` with explicit `IntegrationMode` (`OSCU` |
  `VSCU`) and `EtimsEnvironment` (`sandbox` | `production`) configuration,
  kept as two independent axes rather than a single "environment" flag.
- OSCU domain services covering every field-level-specified endpoint in
  `OSCU_Specification_Document_v2.0.pdf` v2.0 (April 2023): device
  initialization, code/notice/customer lookup, item classification/search/save,
  branch search/customer/user/insurance save, import item search/update,
  sales save, purchase-sales search/save, stock move search / stock I-O save /
  stock master save. See [`docs/kra-contract-verification.md`](docs/kra-contract-verification.md) for the full
  endpoint-by-endpoint verification table.
- VSCU domain that reuses the verified OSCU JSON contract against a
  taxpayer-supplied host/port, with explicit documentation of what is and is
  not implemented (see [`docs/vscu.md`](docs/vscu.md)).
- Typed error hierarchy: `EtimsNetworkError`, `EtimsApiError`,
  `EtimsAuthenticationError`, `EtimsValidationError`.
- Zod-validated request schemas for the two highest-risk fiscal writes
  (`saveItem`, `saveTrnsSalesOsdc`), with a float-drift guard on monetary
  fields.
- Secret redaction for `cmcKey` and other sensitive fields in any debug
  logging hook.
- Unit test suite (Vitest) covering date/number utilities, redaction,
  HTTP error-code mapping, client construction, and schema validation against
  fixtures derived directly from the spec's own JSON samples.

### Known limitations
- VSCU's underlying Java runtime is not implemented, embedded, or
  reimplemented by this package — see [`docs/vscu.md`](docs/vscu.md).
- `ItemExcute.saveComposition` (item composition / BOM) is not implemented;
  no field-level schema was found in the retrieved specification. See
  [`docs/kra-contract-verification.md`](docs/kra-contract-verification.md).
- No KRA sandbox credentials were available while building this repo;
  nothing in this package has been exercised against a live KRA sandbox or
  production server. Every request/response type is sourced from KRA's
  published specification documents, not from live testing. Treat this as
  **spec-verified, sandbox-untested** until you run it against your own
  sandbox credentials — see the status legend in
  [`docs/kra-contract-verification.md`](docs/kra-contract-verification.md).
