import { describe, expect, it } from "vitest";
import { hasEtimsAmountPrecision, roundEtimsAmount } from "../../src/utils/numbers.js";

describe("KRA eTIMS numeric precision helpers", () => {
  it("rounds classic float-drift sums correctly", () => {
    expect(roundEtimsAmount(10.1 + 10.2)).toBe(20.3);
  });

  it("accepts values already at 2 decimal places", () => {
    expect(hasEtimsAmountPrecision(295000)).toBe(true);
    expect(hasEtimsAmountPrecision(1602.5)).toBe(true);
    expect(hasEtimsAmountPrecision(96101.7)).toBe(true);
  });

  it("rejects values with more than 2 decimal places", () => {
    expect(hasEtimsAmountPrecision(10.567)).toBe(false);
    expect(hasEtimsAmountPrecision(1602.499)).toBe(false);
  });
});
