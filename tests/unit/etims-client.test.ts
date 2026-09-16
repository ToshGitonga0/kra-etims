import { describe, expect, it, vi } from "vitest";
import { EtimsClient } from "../../src/client/EtimsClient.js";
import { OSCU_BASE_URLS } from "../../src/config/defaults.js";

function mockFetch() {
  return vi
    .fn()
    .mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ resultCd: "000", resultMsg: "ok", data: {} })
    });
}

describe("EtimsClient", () => {
  it("resolves the sandbox base URL for OSCU + sandbox", async () => {
    const fetchImpl = mockFetch();
    const client = new EtimsClient({
      mode: "OSCU",
      environment: "sandbox",
      pin: "A123456789Z",
      branchId: "00",
      fetchImpl: fetchImpl as unknown as typeof fetch
    });
    expect(client.oscu).toBeDefined();
    expect(client.vscu).toBeUndefined();
    await client.oscu!.codes.search({
      tin: "A123456789Z",
      bhfId: "00",
      cmcKey: "key",
      lastReqDt: "20200101000000"
    });
    const calledUrl = fetchImpl.mock.calls[0]?.[0] as string;
    expect(calledUrl).toBe(`${OSCU_BASE_URLS.sandbox}/selectCodeList`);
  });

  it("resolves the production base URL for OSCU + production", async () => {
    const fetchImpl = mockFetch();
    const client = new EtimsClient({
      mode: "OSCU",
      environment: "production",
      pin: "A123456789Z",
      branchId: "00",
      fetchImpl: fetchImpl as unknown as typeof fetch
    });
    await client.oscu!.codes.search({
      tin: "A123456789Z",
      bhfId: "00",
      cmcKey: "key",
      lastReqDt: "20200101000000"
    });
    const calledUrl = fetchImpl.mock.calls[0]?.[0] as string;
    expect(calledUrl).toBe(`${OSCU_BASE_URLS.production}/selectCodeList`);
  });

  it("populates client.vscu, not client.oscu, for VSCU mode, using the supplied host", async () => {
    const fetchImpl = mockFetch();
    const client = new EtimsClient({
      mode: "VSCU",
      pin: "A123456789Z",
      branchId: "00",
      baseUrl: "http://localhost:8088",
      fetchImpl: fetchImpl as unknown as typeof fetch
    });
    expect(client.vscu).toBeDefined();
    expect(client.oscu).toBeUndefined();
    await client.vscu!.codes.search({
      tin: "A123456789Z",
      bhfId: "00",
      cmcKey: "key",
      lastReqDt: "20200101000000"
    });
    const calledUrl = fetchImpl.mock.calls[0]?.[0] as string;
    expect(calledUrl).toBe("http://localhost:8088/selectCodeList");
  });

  it("allows overriding baseUrl for OSCU (e.g. for a test proxy)", async () => {
    const fetchImpl = mockFetch();
    const client = new EtimsClient({
      mode: "OSCU",
      environment: "sandbox",
      pin: "A123456789Z",
      branchId: "00",
      baseUrl: "http://localhost:9999",
      fetchImpl: fetchImpl as unknown as typeof fetch
    });
    await client.oscu!.codes.search({
      tin: "A123456789Z",
      bhfId: "00",
      cmcKey: "key",
      lastReqDt: "20200101000000"
    });
    const calledUrl = fetchImpl.mock.calls[0]?.[0] as string;
    expect(calledUrl).toBe("http://localhost:9999/selectCodeList");
  });
});
