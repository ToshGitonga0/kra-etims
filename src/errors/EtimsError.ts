/** Base class for every error thrown by this SDK. */
export class EtimsError extends Error {
  public override readonly name: string = "EtimsError";

  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
