import { describe, expect, it, vi } from "vitest";
import { HttpClient } from "../../src/client/HttpClient.js";
import { EtimsApiError } from "../../src/errors/EtimsApiError.js";
import { EtimsAuthenticationError } from "../../src/errors/EtimsAuthenticationError.js";
import { EtimsNetworkError } from "../../src/errors/EtimsNetworkError.js";

function jsonResponse(body: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: async () => body
  } as Response;
}

describe("HttpClient", () => {
  it("returns the parsed envelope on resultCd 000", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(
        jsonResponse({
          resultCd: "000",
          resultMsg: "It is succeeded",
          resultDt: "20200226143124",
          data: { foo: "bar" }
        })
      );
    const client = new HttpClient({ baseUrl: "https://example.test", fetchImpl });
    const result = await client.post("/selectInitOsdcInfo", { tin: "A123456789Z" }, "write");
    expect(result.data).toEqual({ foo: "bar" });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("treats resultCd 001 (no search result) as success", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(
        jsonResponse({ resultCd: "001", resultMsg: "There is no search result", data: null })
      );
    const client = new HttpClient({ baseUrl: "https://example.test", fetchImpl });
    const result = await client.post("/selectItemList", {}, "read");
    expect(result.resultCd).toBe("001");
  });

  it("throws EtimsAuthenticationError for device/auth result codes", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(jsonResponse({ resultCd: "901", resultMsg: "It is not valid device", data: null }));
    const client = new HttpClient({ baseUrl: "https://example.test", fetchImpl });
    await expect(client.post("/selectInitOsdcInfo", {}, "write")).rejects.toBeInstanceOf(
      EtimsAuthenticationError
    );
  });

  it("throws EtimsApiError for other non-success result codes", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(
        jsonResponse({ resultCd: "994", resultMsg: "There is an overlapped Data", data: null })
      );
    const client = new HttpClient({ baseUrl: "https://example.test", fetchImpl });
    await expect(client.post("/saveTrnsSalesOsdc", {}, "write")).rejects.toBeInstanceOf(EtimsApiError);
  });

  it("throws EtimsNetworkError on HTTP-level failure", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({}, false, 500));
    const client = new HttpClient({ baseUrl: "https://example.test", fetchImpl, maxRetries: 0 });
    await expect(client.post("/selectItemList", {}, "read")).rejects.toBeInstanceOf(EtimsNetworkError);
  });

  it("retries read calls on network failure but not write calls", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new TypeError("network down"));
    const readClient = new HttpClient({ baseUrl: "https://example.test", fetchImpl, maxRetries: 2 });
    await expect(readClient.post("/selectItemList", {}, "read")).rejects.toBeInstanceOf(EtimsNetworkError);
    expect(fetchImpl).toHaveBeenCalledTimes(3); // 1 initial + 2 retries

    fetchImpl.mockClear();
    const writeClient = new HttpClient({ baseUrl: "https://example.test", fetchImpl, maxRetries: 2 });
    await expect(writeClient.post("/saveTrnsSalesOsdc", {}, "write")).rejects.toBeInstanceOf(
      EtimsNetworkError
    );
    expect(fetchImpl).toHaveBeenCalledTimes(1); // never retried
  });

  it("rejects a response that does not match the KRA envelope shape", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ unexpected: true }));
    const client = new HttpClient({ baseUrl: "https://example.test", fetchImpl });
    await expect(client.post("/selectItemList", {}, "read")).rejects.toBeInstanceOf(EtimsNetworkError);
  });
});
