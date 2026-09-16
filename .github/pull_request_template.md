## What this changes


## KRA source
Which official KRA document/section backs this change? (n/a for pure
tooling/refactor PRs)

## Checklist
- [ ] `npm run lint && npm run typecheck && npm test && npm run build` pass locally
- [ ] `docs/kra-contract-verification.md` updated if this adds/changes a KRA-facing endpoint or field
- [ ] No secrets, real PINs, or real communication keys anywhere in the diff
- [ ] New fiscal write endpoints use Zod validation and are marked non-retryable (`"write"` call-safety)
