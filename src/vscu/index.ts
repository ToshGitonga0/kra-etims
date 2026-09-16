import type { HttpClient } from "../client/HttpClient.js";
import { OscuDomain } from "../oscu/index.js";

/**
 * VSCU (Virtual Sales Control Unit) integration mode.
 *
 * VERIFIED: per KRA's sign-up guide
 * (OSCU_VSCU_Step-by-Step_Guide-on-how-to-sign-up.pdf), a VSCU device is a
 * Java package ("Required Java (JRE/JDK) Version is Java 16 or higher")
 * that KRA makes available for download after service approval, which the
 * taxpayer deploys and runs on their own infrastructure — the guide's
 * example activation URL is `http://vscuserverhostname:8088/selectInitOsdcInfo`,
 * i.e. the SAME endpoint path and (per the same source family as the OSCU
 * specification) the same JSON request/response contract as OSCU, just
 * served from a taxpayer-controlled host/port instead of a KRA-hosted
 * sandbox/production server.
 *
 * WHAT THIS SDK DOES: once you already have a VSCU instance running
 * (installed and started per KRA's guide, listening on e.g.
 * `http://localhost:8088`), this SDK can speak the JSON contract to it —
 * the request/response types, endpoints, and validation are identical to
 * OSCU, so `VscuDomain` simply re-exposes {@link OscuDomain} against the
 * VSCU base URL you configured.
 *
 * WHAT THIS SDK DOES NOT DO: it does not download, install, run, manage,
 * or reimplement the VSCU Java runtime/JAR itself. KRA does not publish the
 * internal protocol of that runtime for third-party reimplementation — only
 * the fact that, once running, it exposes the eTIMS JSON API. Attempting to
 * reimplement the Java component in TypeScript would not be based on
 * verified KRA documentation and is explicitly out of scope for this SDK.
 * See docs/vscu.md.
 */
export class VscuDomain extends OscuDomain {
  constructor(http: HttpClient) {
    super(http);
  }
}
