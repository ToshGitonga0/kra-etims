# Security policy

## Reporting a vulnerability

Please do not open a public GitHub issue for security vulnerabilities.
Instead, use the repository's private vulnerability reporting form:

**[Report a vulnerability privately](https://github.com/ToshGitonga0/kra-etims/security/advisories/new)**

If private vulnerability reporting is unavailable, contact the repository
maintainer through the [repository's owner profile](https://github.com/ToshGitonga0).
The `author` field in [`package.json`](./package.json) is currently empty, so
there is no maintainer email address published there.

Include:

- A description of the issue and its potential impact.
- Steps to reproduce, or a minimal repro if possible.
- The SDK version and Node.js version you're using.

We aim to acknowledge reports within 5 business days.

## What this SDK never does

- **Never logs secrets in plain text.** `cmcKey`, passwords, tokens, and
  similar fields are redacted automatically by any debug-logging hook (see
  [`src/utils/redaction.ts`](./src/utils/redaction.ts) and
  [`HttpClientOptions.onDebug`](./src/client/HttpClient.ts#L15-L26)). If you
  build your own logging on top of this SDK, redact request/response bodies the
  same way — don't assume application-level logging is safe just because the
  SDK's own logging is.
- **Never hard-codes credentials.** There are no embedded PINs,
  communication keys, or test credentials anywhere in [`src/`](./src/). Every
  example and test fixture uses clearly synthetic values (`A123456789Z`, etc. —
  taken directly from KRA's own published specification samples, which use the
  same placeholder-style PIN).
- **Never commits `.env`.** [`.gitignore`](./.gitignore) excludes `.env` and
  `.env.*` (except `.env.example`). If you find a real credential committed to
  this repository's history, treat it as compromised, report it privately per
  the process above, and rotate it with KRA immediately.
- **Never retries fiscal writes automatically.** See ["Fiscal safety" in the
  README](./README.md#fiscal-safety) and [the architecture notes](./docs/architecture.md#retry-policy-and-fiscal-safety) — a network timeout on
  `sales.save()`/`purchases.save()`/`stock.saveIo()` does not mean KRA didn't
  process the request. Blind retries risk duplicate fiscal submissions, which
  has real tax-compliance consequences for the taxpayer. Build your own
  idempotency/reconciliation layer using the search endpoints
  (`purchases.searchPurchaseSales`, `stock.searchMoves`) before retrying a
  write.

## Communication key (`cmcKey`) handling

The `cmcKey` returned by `oscu.init.initialize()` is a long-lived credential
for your device registration — treat it like an API secret:

- Store it in a secret manager or encrypted configuration, not in source
  control or plaintext application logs.
- Scope access to it the same way you'd scope access to a database password.
- If you suspect it has leaked, KRA's device-initialization flow is the
  mechanism for re-registering — see [the sandbox onboarding guide](./docs/sandbox.md)
  and [KRA's sign-up guide](https://www.kra.go.ke/images/publications/OSCU_VSCU_Step-by-Step_Guide-on-how-to-sign-up.pdf)
  for how to request a new device registration.

## Dependency updates

This package intentionally has a small dependency surface: `zod` at runtime,
and standard dev tooling (`typescript`, `tsup`, `vitest`, `eslint`, `prettier`)
for development only — none of the dev dependencies ship in the published
package ([`files` in `package.json`](./package.json#L29-L33) includes only `dist`,
`README.md`, `LICENSE`, `CHANGELOG.md`). Dependency versions should be reviewed
and bumped periodically; `npm audit` is run as part of `npm install` output and
should be checked before releases.

## Disclaimer

This is an independent, unofficial SDK. It is not affiliated with, endorsed by,
or officially supported by the Kenya Revenue Authority. Use of this SDK does not
substitute for KRA's own device-certification/vetting process, and correctness of
fiscal submissions remains the taxpayer's responsibility.
