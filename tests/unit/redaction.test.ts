import { describe, expect, it } from "vitest";
import { redact } from "../../src/utils/redaction.js";

describe("redact", () => {
  it("masks sensitive keys", () => {
    const result = redact({
      tin: "A123456789Z",
      cmcKey: "supersecret",
      nested: { pwd: "hunter2" }
    }) as Record<string, unknown>;
    expect(result.tin).toBe("A123456789Z");
    expect(result.cmcKey).toBe("***REDACTED***");
    expect((result.nested as Record<string, unknown>).pwd).toBe("***REDACTED***");
  });

  it("leaves non-sensitive arrays and primitives intact", () => {
    const result = redact({ itemList: [{ itemCd: "KE1NTXU0000001", qty: 2 }] }) as Record<string, unknown>;
    expect(result.itemList).toEqual([{ itemCd: "KE1NTXU0000001", qty: 2 }]);
  });

  it("does not throw on null/undefined", () => {
    expect(redact(null)).toBeNull();
    expect(redact(undefined)).toBeUndefined();
  });
});
