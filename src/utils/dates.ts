/**
 * KRA's OSCU JSON API uses plain numeric-string date/date-time formats, NOT
 * ISO 8601. Two formats appear across the verified contract
 * (OSCU_Specification_Document_v2.0.pdf):
 *
 *   - "Date"     -> YYYYMMDD           (8 chars)  e.g. request `lastReqDt`
 *                    is actually a *date-time* (14 chars) in every verified
 *                    sample - see {@link toEtimsDateTime}. Plain 8-char
 *                    dates appear for fields like `bhfOpenDt`, `pchsDt`.
 *   - "DateTime" -> YYYYMMDDHHmmss     (14 chars) e.g. `lastReqDt`, `cfmDt`,
 *                    `regDt`, `resultDt`.
 *
 * These do NOT match `new Date().toISOString()` and must never be produced
 * by naive ISO conversion.
 */

function pad(n: number, width: number): string {
  return String(n).padStart(width, "0");
}

/** Format a Date as KRA's 8-character YYYYMMDD date string. */
export function toEtimsDate(date: Date): string {
  return `${date.getFullYear()}${pad(date.getMonth() + 1, 2)}${pad(date.getDate(), 2)}`;
}

/** Format a Date as KRA's 14-character YYYYMMDDHHmmss date-time string. */
export function toEtimsDateTime(date: Date): string {
  return toEtimsDate(date) + pad(date.getHours(), 2) + pad(date.getMinutes(), 2) + pad(date.getSeconds(), 2);
}

const DATE_RE = /^\d{8}$/;
const DATETIME_RE = /^\d{14}$/;

/** Validate a string is a well-formed KRA 8-char YYYYMMDD date. */
export function isValidEtimsDate(value: string): boolean {
  if (!DATE_RE.test(value)) return false;
  return isPlausibleCalendarDate(value.slice(0, 4), value.slice(4, 6), value.slice(6, 8));
}

/** Validate a string is a well-formed KRA 14-char YYYYMMDDHHmmss date-time. */
export function isValidEtimsDateTime(value: string): boolean {
  if (!DATETIME_RE.test(value)) return false;
  const hh = Number(value.slice(8, 10));
  const mm = Number(value.slice(10, 12));
  const ss = Number(value.slice(12, 14));
  if (hh > 23 || mm > 59 || ss > 59) return false;
  return isPlausibleCalendarDate(value.slice(0, 4), value.slice(4, 6), value.slice(6, 8));
}

function isPlausibleCalendarDate(y: string, m: string, d: string): boolean {
  const year = Number(y);
  const month = Number(m);
  const day = Number(d);
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  if (year < 1900 || year > 2200) return false;
  return true;
}

/**
 * Parse a KRA 14-char date-time string into a JS Date, interpreted in the
 * local timezone (KRA does not specify a timezone in the spec; the sandbox
 * has been observed to use East Africa Time). Throws if malformed.
 */
export function parseEtimsDateTime(value: string): Date {
  if (!isValidEtimsDateTime(value)) {
    throw new RangeError(`Not a valid KRA eTIMS date-time string: "${value}"`);
  }
  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(4, 6)) - 1;
  const day = Number(value.slice(6, 8));
  const hh = Number(value.slice(8, 10));
  const mm = Number(value.slice(10, 12));
  const ss = Number(value.slice(12, 14));
  return new Date(year, month, day, hh, mm, ss);
}
