# Architecture

## Two independent axes: integration mode and environment

```
integration mode:
    OSCU   -> KRA-hosted server, JSON REST API
    VSCU   -> taxpayer-hosted Java runtime, same JSON REST API on a caller-supplied host/port

environment (OSCU only):
    sandbox
    production
```

`VscuClientConfig` has no `environment` field because VSCU has no KRA-hosted
sandbox/production distinction — you point it at whichever VSCU instance
you're running (test or production is a fact about *that instance*, not
something the SDK resolves a URL for). See
`docs/kra-contract-verification.md` for sources.

## Layers

```
src/
  config/     -> IntegrationMode, EtimsEnvironment, base URLs, defaults. No I/O.
  client/     -> HttpClient (transport: fetch, timeout, retry policy, error
                 mapping) and EtimsClient (public entry point; wires config
                 -> HttpClient -> OscuDomain | VscuDomain).
  oscu/       -> One verified OSCU domain service per spec section 3.3.x
                 (init, codes, customers, notices, items, branches,
                 importItems, sales, purchases, stock), plus endpoint path
                 constants and code tables.
  vscu/       -> Re-exposes the OSCU domain services against a VSCU base
                 URL — see docs/vscu.md for why this is safe to do (same
                 verified JSON contract) and what it does NOT cover (the
                 Java runtime itself).
  errors/     -> EtimsError base class and four concrete subclasses,
                 covering exactly the failure modes the verified contract
                 can produce (network, API result-code, authentication
                 result-code, local validation). No EtimsDeviceError exists
                 because the REST contract has no device-hardware error
                 class distinct from EtimsApiError/EtimsAuthenticationError
                 — that concept belongs to the *local* TIS<->SCU protocol,
                 which this SDK does not implement (see
                 docs/kra-contract-verification.md).
  utils/      -> Pure functions: KRA date formatting/parsing, secret
                 redaction, monetary-precision guards. No network, no state.
```

## Why "domain services" instead of one flat client

Each KRA function category (§3.1 in the OSCU spec: initialization, basic
data, branch info, item info, imported item info, sales, purchase, stock)
becomes one service class with a narrow, typed surface
(`oscu.sales.save(...)`, `oscu.stock.saveIo(...)`). This:

- keeps each file small and focused on one spec section, so a KRA contract
  change to (say) the sales endpoint touches one file;
- lets contract-verification tests target one service at a time
  (`tests/unit/sales-save-schema.test.ts`, etc.);
- avoids one 2,000-line "God client" that mixes read lookups with fiscal
  writes.

## Why request validation is Zod-based, but only on two endpoints

Zod is used for `items.save()` and `sales.save()` because these are the
two calls with real fiscal/financial consequences if malformed data reaches
KRA (see "Fiscal safety" in `README.md`). Every other endpoint still has
full TypeScript request/response types (so you get compile-time field-name
and type checking), but does not yet have a runtime Zod schema. Extending
Zod validation to every write endpoint is a reasonable next contribution —
see `CONTRIBUTING.md` — but was intentionally scoped down here rather than
generating twenty near-identical schemas without being able to verify each
one against a live sandbox.

## Why there is no `accessToken`/`refreshToken` concept anywhere

Because the verified OSCU contract doesn't have one. See "Authentication" in
`docs/kra-contract-verification.md`.

## Retry policy and fiscal safety

`HttpClient.post(path, body, safety)` takes an explicit `"read"` or
`"write"` tag per call (see `src/client/HttpClient.ts`). Only `"read"` calls
are automatically retried on network-level failure, and only up to
`maxRetries` (default 2). `"write"` calls — every endpoint that creates or
mutates fiscal state at KRA — are **never** automatically retried, because a
timeout on a write call does not tell you whether KRA processed it before
the connection dropped. See the "Fiscal safety" section of the README.
