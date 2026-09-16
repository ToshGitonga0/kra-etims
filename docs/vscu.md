# VSCU

## What VSCU actually is

Per KRA's sign-up guide (`OSCU_VSCU_Step-by-Step_Guide-on-how-to-sign-up.pdf`):

> Virtual Sales Control Unit (VSCU) – Implemented and hosted on the client
> side. Suitable for organizations with large volumes of invoices that
> require to be generated in a short span of time.

Concretely: after KRA approves your VSCU service request, KRA makes a
**Java package (JAR) available for download** on the eTIMS taxpayer portal.
You:

1. Transfer that package to a machine you control.
2. Run it with Java 16+ (the guide states this requirement explicitly).
3. It listens on a local port (**8088 by default**, configurable).
4. Your own invoicing/ERP system talks to it over HTTP, using the **same
   JSON request/response contract** documented in the OSCU Specification
   Document — the guide's own worked example is
   `http://vscuserverhostname:8088/selectInitOsdcInfo`, i.e. the identical
   endpoint path used by OSCU.

## What this SDK does

`VscuDomain` (`src/vscu/index.ts`) is a thin subclass of `OscuDomain` that
talks to whatever `baseUrl` you give it in `VscuClientConfig`. Once your VSCU
JAR is running locally, this SDK can call it exactly like it calls OSCU:

```ts
import { EtimsClient } from "kra-etims-sdk";

const client = new EtimsClient({
  mode: "VSCU",
  pin: "A123456789Z",
  branchId: "00",
  baseUrl: "http://localhost:8088",
});

const receipt = await client.vscu!.sales.save(/* ... */);
```

## What this SDK does NOT do

- It does not download, install, configure, start, stop, or monitor the
  VSCU Java runtime for you. That remains a manual step per KRA's sign-up
  guide.
- It does not reimplement the VSCU runtime in TypeScript. KRA does not
  publish the internal workings of that Java component — only the fact
  that, once running, it exposes the eTIMS JSON API on a local port. There
  is nothing to reverse-engineer here without violating "do not invent KRA
  API contracts": the *external* contract (JSON over HTTP) is documented and
  is what this SDK implements; the *internal* behavior of the JAR is not
  published and this SDK makes no claims about it.
- It has not been field-verified for behavioral differences from OSCU beyond
  hosting location. The dedicated `VSCU_Specification_Document_v2.0.pdf` was
  not diffed field-by-field against the OSCU spec while building this
  scaffold — see the "Known gaps" table in
  `docs/kra-contract-verification.md`. Treat any VSCU-specific field
  differences as **UNVERIFIED** until someone does that diff and updates
  this file.

## Practical guidance

- If you're building a normal online web app/backend with reliable internet
  access, KRA's own guidance suggests OSCU is the intended fit ("suitable
  for systems that operate online").
- If you need VSCU (offline-capable, high invoice volume), install and run
  the KRA-provided JAR first, confirm you can reach
  `http://<host>:<port>/selectInitOsdcInfo` with a plain `curl` POST, and
  only then point this SDK at it.
