# Contributing

Thanks for considering a contribution. This project's central rule is in
`docs/kra-contract-verification.md`: **nothing gets added to `src/` without
a traceable citation to an official KRA document, recorded in that file.**

## Before you start

1. Read `docs/kra-contract-verification.md` and `docs/architecture.md`.
2. If you're adding/changing an endpoint, get the relevant page(s) of the
   official KRA specification PDF in front of you. Community SDKs and
   blog posts can help you find the right page, but the PDF is the only
   thing you cite in code comments and in the verification table.
3. If something in KRA's documentation is ambiguous, silent, or internally
   inconsistent (see the "Fields the spec's own JSON samples get wrong"
   section of `docs/kra-contract-verification.md` for a real example),
   **do not guess**. Mark it `UNVERIFIED`, explain the ambiguity, and leave
   the feature out (or behind a clearly-labeled escape hatch) until someone
   can confirm it against a live sandbox.

## Development setup

```bash
git clone <your fork>
cd kra-etims
npm install
cp .env.example .env   # only needed for tests/integration
npm run typecheck
npm run lint
npm test
npm run build
```

## Project conventions

- **One domain per file** under `src/oscu/services/` — don't add a second,
  unrelated endpoint to an existing service file; create a new one and wire
  it into `src/oscu/index.ts`.
- **Endpoint paths only live in `src/oscu/endpoints.ts`.** Never inline a
  literal URL path elsewhere.
- **Zod validation is required for any new fiscal write** (anything that
  creates/mutates invoice, purchase, or stock state at KRA). Follow the
  pattern in `src/oscu/services/sales.ts`.
- **Money fields** must use `hasEtimsAmountPrecision`/`roundEtimsAmount`
  from `src/utils/numbers.ts` in any new Zod schema involving amounts.
- **Dates** must use `toEtimsDate`/`toEtimsDateTime`/`isValidEtimsDate*`
  from `src/utils/dates.ts` — never `Date#toISOString()`.
- **No secrets in logs.** Anything sensitive gets added to
  `SENSITIVE_KEYS` in `src/utils/redaction.ts`.
- Update `docs/kra-contract-verification.md` in the same PR as any new or
  changed endpoint — a code review that adds a KRA-facing field without a
  corresponding table row should be treated as incomplete.

## Tests

- Unit tests (`tests/unit/`) run in plain `npm test`, must not make real
  network calls, and should include at least one case derived directly from
  the official spec's own JSON sample for that endpoint (see
  `tests/unit/item-save-schema.test.ts` / `sales-save-schema.test.ts` for
  the pattern).
- Integration tests (`tests/integration/`) are opt-in via
  `KRA_ETIMS_RUN_INTEGRATION=true` and require real sandbox credentials in
  `.env`. Never commit real credentials, and never make integration tests a
  required CI check without sandbox-only, rotatable credentials in
  repository secrets.

## Pull requests

- Keep PRs scoped to one endpoint/feature where possible.
- Run `npm run lint && npm run typecheck && npm test && npm run build`
  before opening a PR — CI runs the same steps (see
  `.github/workflows/ci.yml`).
- Describe, in the PR body, which KRA document/section backs any new
  behavior.

## Releases

See `.github/workflows/release.yml`. Releases are triggered by pushing a
`vX.Y.Z` git tag, not by merging to the default branch — see that workflow
file for the exact flow.
