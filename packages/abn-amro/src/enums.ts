export enum ABNAmroScopes {
  /** Execute or cancel SEPA payment */
  PostSEPAPayment = 'psd2:payment:sepa:write',

  /** Check SEPA payment status */
  ReadSEPAPayment = 'psd2:payment:sepa:read',

  /** Execute SEPA standing order payment */
  PostSEPARecurrentPayment = 'psd2:payment:recurrent:sepa:write',

  /** Cancel SEPA standing order payment	 */
  DeleteSEPARecurrentPayment = 'psd2:payment:recurrent:sepa:delete',

  /** Post XBorder payment */
  PostXBorderPayment = 'psd2:payment:xborder:write',

  /** Read the balance of an account */
  ReadAccountBalance = 'psd2:account:balance:read',

  /** Read the transactions/mutations on an account	*/
  ReadAccountTransaction = 'psd2:account:transaction:read',

  /** Read the details of an account, such as address and currency */
  ReadAccountDetails = 'psd2:account:details:read',

  /** Check availability of funds on an account */
  ReadAccountFunds = 'psd2:account:funds:read',
}
