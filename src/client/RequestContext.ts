/**
 * Fields that KRA's OSCU contract requires on nearly every request body
 * (tin/bhfId/cmcKey). Individual service request types extend this rather
 * than repeating the three fields by hand.
 *
 * Source: every *Req object in OSCU_Specification_Document_v2.0.pdf section
 * 3.3 carries `tin`, `bhfId`, and (except device verification itself)
 * `cmcKey` as the first three attributes.
 */
export interface EtimsRequestContext {
  /** Taxpayer PIN ("tin" in KRA's schema), 11 characters. */
  tin: string;
  /** Branch office ID ("bhfId"), 2 characters, "00" = head office. */
  bhfId: string;
  /**
   * Communication key issued by KRA at device initialization. Omitted only
   * from the device-verification (`initialize`) call itself.
   */
  cmcKey?: string;
}
