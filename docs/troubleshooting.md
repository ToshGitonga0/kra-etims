# Troubleshooting

## `EtimsAuthenticationError` with resultCd 901/902/903

- **901 "It is not valid device"** — your `dvcSrlNo` (device init) or
  `cmcKey` (subsequent calls) doesn't match what KRA has on record for this
  PIN/branch. Re-run [device initialization](../README.md#quick-start) if
  you've lost the key.
- **902 "This device is installed"** — you're calling
  `oscu.init.initialize()` again for a device that's already activated. This is
  a normal guard, not a bug — store the `cmcKey` from the first successful call
  instead of re-initializing.
- **903 "Only OSCU device can be verified"** — you called
  `/selectInitOsdcInfo` against a VSCU-mode client, or vice versa. Double check
  [`mode` in your client config](../README.md#configuration).

## `EtimsApiError` with resultCd 994 "There is an overlapped Data"

Usually means you're resubmitting a sales/purchase/stock record with an
invoice or reference number KRA has already recorded. See ["Fiscal safety" in
the README](../README.md#fiscal-safety) before retrying — confirm via a search
call (`oscu.purchases.searchPurchaseSales`, etc.) whether the original
submission actually landed before resubmitting with a new number.

## `EtimsNetworkError` on every call, including simple lookups

1. Confirm you can reach the base URL directly:
   ```bash
   curl -i -X POST https://etims-api-sbx.kra.go.ke/etims-api/selectCodeList \
     -H "Content-Type: application/json" \
     -d '{"tin":"A123456789Z","bhfId":"00","cmcKey":"...","lastReqDt":"20200101000000"}'
   ```
   If this also fails, the issue is network/firewall/DNS, not the SDK.
2. Check you're not accidentally mixing sandbox credentials with the
   production base URL or vice versa — see the [Base URLs and environment
   notes](./kra-contract-verification.md#base-urls) regarding the exact base
   URL.
3. For VSCU, confirm the local Java runtime is actually running and listening
   on the port you configured — see the [VSCU guide](./vscu.md).

## `EtimsValidationError` on `items.save()` or `sales.save()`

The request never left your machine — read `error.issues` for the exact
field(s) that failed Zod validation. Common causes:
- A monetary field has more than 2 decimal places (float drift). Run it
  through [`roundEtimsAmount()`](../src/utils/numbers.ts) before building the
  request.
- `tin` is not exactly 11 characters, or `bhfId` is not exactly 2.
- A required field is `undefined` instead of `null` for an "optional but
  present" KRA field — KRA's own samples frequently send explicit `null`
  rather than omitting the key.

## TypeScript can't find types after `npm install`

Make sure you're on TypeScript's `"moduleResolution": "Bundler"` (or
`"NodeNext"`) — this package ships as ESM-only (`"type": "module"`,
`exports.import`) with no CommonJS build. If your project is CommonJS,
either switch to ESM, use a dynamic `import()`, or [open an issue](https://github.com/ToshGitonga0/kra-etims/issues/new) describing your use case (a dual CJS/ESM build is a reasonable future addition — see
[`CONTRIBUTING.md`](../CONTRIBUTING.md)).

## `npm install` fails with an esbuild "Symbol not found" / dyld error on macOS

This happens on older macOS versions (Big Sur/Monterey and earlier) because
newer esbuild binary releases require a newer macOS SDK than your system
provides. `package.json` pins `esbuild` to `0.25.5` via `overrides`, which
supports macOS 11+. If it still fails:

```bash
rm -rf node_modules package-lock.json
npm install
```

If it fails a third time, check `node -v` — this package requires Node.js
18.17+.
