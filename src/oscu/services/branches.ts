import type { HttpClient } from "../../client/HttpClient.js";
import { OSCU_ENDPOINTS } from "../endpoints.js";
import type { LastRequestDateFilter, OscuRequest } from "../types.js";

export type BranchSearchRequest = OscuRequest<LastRequestDateFilter>;

export interface BranchInfo {
  tin: string;
  bhfId: string;
  bhfNm: string;
  bhfSttsCd: string;
  prvncNm: string;
  dstrtNm: string;
  sctrNm: string;
  locDesc: string;
  mgrNm: string;
  mgrTelNo: string;
  mgrEmail: string;
  hqYn: "Y" | "N";
}

export interface BranchSearchData {
  bhfList: BranchInfo[];
}

export interface BranchCustomerSaveRequest extends OscuRequest {
  custNo: string;
  custTin: string;
  custNm: string;
  adrs?: string | null;
  telNo?: string | null;
  email?: string | null;
  faxNo?: string | null;
  useYn: "Y" | "N";
  remark?: string | null;
  regrId: string;
  regrNm: string;
  modrId: string;
  modrNm: string;
}

export interface BranchUserSaveRequest extends OscuRequest {
  userId: string;
  userNm: string;
  /** Never logged: redacted automatically (src/utils/redaction.ts). */
  pwd: string;
  adrs?: string | null;
  cntc?: string | null;
  authCd?: string | null;
  remark?: string | null;
  useYn: "Y" | "N";
  regrId: string;
  regrNm: string;
  modrId: string;
  modrNm: string;
}

/** Applies to pharmacy taxpayers only — see spec section 3.1 item 3.b. */
export interface BranchInsuranceSaveRequest extends OscuRequest {
  isrccCd: string;
  isrccNm: string;
  isrcRt: number;
  useYn: "Y" | "N";
  regrId: string;
  regrNm: string;
  modrId: string;
  modrNm: string;
}

export class BranchService {
  constructor(private readonly http: HttpClient) {}

  /** Maps to `POST /selectBhfList` (OSCU_Specification_Document_v2.0.pdf, 3.3.4.1). */
  async search(request: BranchSearchRequest): Promise<BranchSearchData> {
    const envelope = await this.http.post<BranchSearchData, BranchSearchRequest>(
      OSCU_ENDPOINTS.branchSearch,
      request,
      "read"
    );
    return envelope.data ?? { bhfList: [] };
  }

  /** Maps to `POST /saveBhfCustomer` (OSCU_Specification_Document_v2.0.pdf, 3.3.4.2). */
  async saveCustomer(request: BranchCustomerSaveRequest): Promise<void> {
    await this.http.post(OSCU_ENDPOINTS.branchCustomerSave, request, "write");
  }

  /** Maps to `POST /saveBhfUser` (OSCU_Specification_Document_v2.0.pdf, 3.3.4.3). */
  async saveUser(request: BranchUserSaveRequest): Promise<void> {
    await this.http.post(OSCU_ENDPOINTS.branchUserSave, request, "write");
  }

  /**
   * Maps to `POST /saveBhfInsurance` (OSCU_Specification_Document_v2.0.pdf,
   * 3.3.4.4). Applicable to pharmacy taxpayers only, per the spec.
   */
  async saveInsurance(request: BranchInsuranceSaveRequest): Promise<void> {
    await this.http.post(OSCU_ENDPOINTS.branchInsuranceSave, request, "write");
  }
}
