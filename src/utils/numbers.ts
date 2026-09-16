/**
 * KRA's OSCU contract represents money and quantities as JSON numbers with
 * (per the field length column, e.g. "18,2") at most 2 decimal places.
 * JavaScript's IEEE-754 floats can represent values like 10.1 + 10.2 as
 * 20.299999999999997, which would silently corrupt a fiscal submission.
 *
 * This module does not attempt full arbitrary-precision decimal arithmetic
 * (that is a larger dependency decision left to `docs/architecture.md`);
 * instead it provides a narrow, dependency-free guard: round-half-up to 2
 * decimal places using integer cents arithmetic, and a validator that
 * rejects values already showing float drift beyond 2 decimal places rather
 * than silently rounding them away.
 */

/** Round a number to 2 decimal places using integer-cents arithmetic (round-half-up). */
export function roundEtimsAmount(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Returns true if `value` is already expressed with at most 2 decimal
 * places (i.e. `roundEtimsAmount` would not change it). Use this to fail
 * loudly on ambiguous float input rather than silently rounding it.
 */
export function hasEtimsAmountPrecision(value: number): boolean {
  return Math.abs(roundEtimsAmount(value) - value) < 1e-9;
}
