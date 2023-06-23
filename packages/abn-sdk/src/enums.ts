export enum ABNScopes {
  PostSEPAPayment = 'psd2:payment:sepa:write',
  ReadSEPAPayment = 'psd2:payment:sepa:read',
  PostXBorderPayment = 'psd2:payment:xborder:write',
  PostSEPAStandingOrderPayment = 'psd2:payment:recurrent:sepa:write'
}
