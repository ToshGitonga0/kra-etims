import { EtimsError } from "./EtimsError.js";

/**
 * Thrown when a request payload fails local (client-side) validation before
 * it is ever sent to KRA — e.g. a Zod schema check on a `save` call.
 * This never reaches the network, so it never risks a duplicate fiscal
 * submission.
 */
export class EtimsValidationError extends EtimsError {
  public override readonly name = "EtimsValidationError";

  constructor(
    message: string,
    /** Structured issues, typically from a Zod `ZodError.issues` array. */
    public readonly issues: ReadonlyArray<{ path: (string | number)[]; message: string }>
  ) {
    super(message);
  }
}
