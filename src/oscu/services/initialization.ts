import type { HttpClient } from "../../client/HttpClient.js";
import { OSCU_ENDPOINTS } from "../endpoints.js";

/**
 * 3.3.1.1 DeviceVerificationReq. Note this call does NOT include `cmcKey` —
 * it's the one call that predates having a communication key at all.
 */
export interface DeviceVerificationRequest {
  tin: string;
  bhfId: string;
  /** Device serial number chosen by the integrator (max length 100). */
  dvcSrlNo: string;
}

export interface InitTaxpayer {
  tin: string;
  taxprNm: string;
  bsnsActv: string;
}

export interface InitBranch {
  bhfId: string;
  bhfNm: string;
  bhfOpenDt: string;
  prvncNm: string;
  dstrtNm: string;
  sctrNm: string;
  locDesc: string;
  hqYn: "Y" | "N";
  mgrNm: string;
  mgrTelNo: string;
  mgrEmail: string;
}

export interface InitDevice {
  dvcId: string;
  sdicId: string;
  mrcNo: string;
  /**
   * Communication key. Store this securely (e.g. secret manager / encrypted
   * config) and pass it back in as `communicationKey` for every subsequent
   * call. The SDK never logs this value in plain text (see
   * src/utils/redaction.ts).
   */
  cmcKey: string;
}

export interface DeviceVerificationData {
  info: InitTaxpayer &
    Pick<
      InitBranch,
      | "bhfId"
      | "bhfNm"
      | "bhfOpenDt"
      | "prvncNm"
      | "dstrtNm"
      | "sctrNm"
      | "hqYn"
      | "mgrNm"
      | "mgrTelNo"
      | "mgrEmail"
    > &
    Pick<InitDevice, "dvcId" | "mrcNo" | "cmcKey"> & { sdcId: string; locDesc?: string };
}

export class InitializationService {
  constructor(private readonly http: HttpClient) {}

  /**
   * Activates the OSCU device for this PIN/branch and retrieves the
   * communication key required for every other call.
   *
   * Maps to KRA endpoint `POST /selectInitOsdcInfo`
   * (OSCU_Specification_Document_v2.0.pdf, 3.3.1.1).
   */
  async initialize(request: DeviceVerificationRequest): Promise<DeviceVerificationData> {
    const envelope = await this.http.post<DeviceVerificationData, DeviceVerificationRequest>(
      OSCU_ENDPOINTS.deviceVerification,
      request,
      "write"
    );
    if (!envelope.data) {
      throw new Error("KRA eTIMS device verification succeeded but returned no data payload.");
    }
    return envelope.data;
  }
}
