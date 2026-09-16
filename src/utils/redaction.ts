/**
 * Field names that must never appear in plain text in logs, thrown-error
 * messages, or debug output. Used by {@link redact} and by HttpClient's
 * debug logging hook.
 */
const SENSITIVE_KEYS = new Set([
  "cmcKey",
  "communicationKey",
  "pwd",
  "password",
  "userPassword",
  "token",
  "accessToken",
  "refreshToken",
  "apiKey",
  "secret"
]);

/**
 * Deep-clones a plain JSON-like value and replaces sensitive field values
 * with a fixed-length mask, so it is safe to pass to console/log output.
 * Non-plain-object values (functions, class instances other than
 * array/object/primitive) are returned as "[unserializable]".
 */
export function redact(value: unknown): unknown {
  return redactInner(value, 0);
}

function redactInner(value: unknown, depth: number): unknown {
  if (depth > 10) return "[max-depth]";
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) {
    return value.map((item) => redactInner(item, depth + 1));
  }
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (SENSITIVE_KEYS.has(key)) {
        out[key] = typeof val === "string" && val.length > 0 ? "***REDACTED***" : val;
      } else {
        out[key] = redactInner(val, depth + 1);
      }
    }
    return out;
  }
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }
  return "[unserializable]";
}
