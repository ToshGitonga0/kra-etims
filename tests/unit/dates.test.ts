import { describe, expect, it } from "vitest";
import {
  isValidEtimsDate,
  isValidEtimsDateTime,
  parseEtimsDateTime,
  toEtimsDate,
  toEtimsDateTime
} from "../../src/utils/dates.js";

describe("KRA eTIMS date utilities", () => {
  it("formats a date as YYYYMMDD", () => {
    expect(toEtimsDate(new Date(2023, 0, 20))).toBe("20230120");
  });

  it("formats a date-time as YYYYMMDDHHmmss", () => {
    expect(toEtimsDateTime(new Date(2023, 0, 20, 11, 7, 35))).toBe("20230120110735");
  });

  it("validates a well-formed date", () => {
    expect(isValidEtimsDate("20230120")).toBe(true);
    expect(isValidEtimsDate("2023-01-20")).toBe(false);
    expect(isValidEtimsDate("20231301")).toBe(false); // month 13
  });

  it("validates a well-formed date-time from the spec's example", () => {
    // From OSCU_Specification_Document_v2.0.pdf sample: "20200226143124"
    expect(isValidEtimsDateTime("20200226143124")).toBe(true);
    expect(isValidEtimsDateTime("20200226256099")).toBe(false); // bad hh/mm/ss
  });

  it("round-trips parseEtimsDateTime", () => {
    const parsed = parseEtimsDateTime("20200226143124");
    expect(parsed.getFullYear()).toBe(2020);
    expect(parsed.getMonth()).toBe(1); // February, 0-indexed
    expect(parsed.getDate()).toBe(26);
    expect(parsed.getHours()).toBe(14);
    expect(parsed.getMinutes()).toBe(31);
    expect(parsed.getSeconds()).toBe(24);
  });

  it("throws on malformed input", () => {
    expect(() => parseEtimsDateTime("not-a-date")).toThrow(RangeError);
  });
});
