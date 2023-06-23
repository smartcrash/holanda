export enum ABNScopes {
  /** Post (structured) SEPA payment */
  PostSEPAPayment = 'psd2:payment:sepa:write',

  /** Check SEPA payment status */
  ReadSEPAPayment = 'psd2:payment:sepa:read',

  /** Post XBorder payment */
  PostXBorderPayment = 'psd2:payment:xborder:write',

  /** Post SEPA standing order payment */
  PostSEPAStandingOrderPayment = 'psd2:payment:recurrent:sepa:write'
}
