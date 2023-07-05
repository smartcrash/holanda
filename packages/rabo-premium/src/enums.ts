export enum RaboPremiumScopes {
  /** Allow read from Business Account Insight services */
  AccountInformationRead = 'bai.accountinformation.read',
  /** Send batch payment files */
  BulkReadWrite = 'bbpi.bulk.read-write',
  /** Payments from your payment account */
  SingleReadWrite = 'bspi.single.read-write',
}
