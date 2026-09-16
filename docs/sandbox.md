# Sandbox / onboarding

This describes the process per KRA's published sign-up guide
(`OSCU_VSCU_Step-by-Step_Guide-on-how-to-sign-up.pdf`). It has not been
walked through end-to-end while building this scaffold — treat each step as
**documented, not personally verified** until you or a contributor confirms
it and updates this file.

## 1. Sign up for eTIMS taxpayer sandbox access

Register for access to the eTIMS taxpayer sandbox portal using your KRA PIN
and password.

## 2. Request an OSCU or VSCU service

From the sandbox portal: **Service Request → eTIMS → complete the Service
Request form**, selecting either:

- **VSCU** — "Implemented and hosted on the client side. Suitable for
  organizations with large volumes of invoices that require to be generated
  in a short span of time."
- **OSCU** — "Implemented and hosted at KRA. Integration organization
  requires to customize their trader invoicing system to work with OSCU
  API. Suitable for systems that operate online."

You'll also need to complete and upload the eTIMS Commitment Form (linked
from the same guide) and the eTIMS Bio-Data Form for OSCU and VSCU.

## 3. Wait for approval and device registration

KRA verifies and approves the device. For OSCU, this activates a
KRA-hosted endpoint for your PIN/branch. For VSCU, KRA makes a Java package
available for download on the portal — see `docs/vscu.md`.

## 4. Initialize the device (OSCU)

Once approved, call `oscu.init.initialize(...)` against the **sandbox**
base URL with your PIN, branch ID, and a device serial number you choose:

```ts
import { EtimsClient } from "kra-etims-sdk";

const client = new EtimsClient({
  mode: "OSCU",
  environment: "sandbox",
  pin: process.env.ETIMS_PIN!,
  branchId: process.env.ETIMS_BRANCH_ID!,
});

const { info } = await client.oscu!.init.initialize({
  tin: process.env.ETIMS_PIN!,
  bhfId: process.env.ETIMS_BRANCH_ID!,
  dvcSrlNo: process.env.ETIMS_DEVICE_SERIAL!,
});

// Store info.cmcKey securely — every subsequent call needs it.
console.log("Communication key issued. Store it securely, do not log it again.");
```

Do not log `info.cmcKey` in plain text — the SDK's own debug logging hook
redacts it automatically, but application-level `console.log` calls will
not.

## 5. Use the communication key for every subsequent call

```ts
const authedClient = new EtimsClient({
  mode: "OSCU",
  environment: "sandbox",
  pin: process.env.ETIMS_PIN!,
  branchId: process.env.ETIMS_BRANCH_ID!,
  communicationKey: process.env.ETIMS_CMC_KEY!, // from step 4
});
```

Note: `communicationKey` on the client config is currently a convenience
placeholder for your own request-building code — each service method still
takes `cmcKey` explicitly as part of its request object (matching KRA's
per-request field), so wire `authedClient`'s stored key into each call
yourself, e.g. via a small wrapper in your application code. A future
version of this SDK may thread it through automatically; see
`CONTRIBUTING.md`.

## 6. Move to production

Once your integration passes KRA's testing/vetting/certification process
(per the system-to-system integration page), switch `environment` to
`"production"` and re-run device initialization against the production base
URL — sandbox and production communication keys are separate credentials
tied to separate device registrations.

## Running the SDK's own integration tests against your sandbox

```bash
cp .env.example .env
# fill in ETIMS_PIN, ETIMS_BRANCH_ID, ETIMS_CMC_KEY, ETIMS_DEVICE_SERIAL
npm run test:integration
```

`tests/integration/*` is gated behind `KRA_ETIMS_RUN_INTEGRATION=true` and
is never run by plain `npm test`, so CI and casual contributors never make
real network calls to KRA by accident.
