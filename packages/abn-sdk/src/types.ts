import { ABNScopes } from "./enums"

export type ABNClientOptions = {
  apiKey: string
  clientId: string
  publicCertificate: string
  privateKey: string
}

export type ABNClientRequestAuthTokenOptions = {
  /** Scopes for which the access token is issued. */
  scope: ABNScopes[]
  /** Value must be 'code'. It indicates which grant to execute. */
  responseType: string
  flow?: string
  redirectUri?: string
  state?: string
  transactionId?: string
  bank?: string
}

export type ABNClientRequestAuthTokenResponse = string

export type ABNClientRequestAccessTokenOptions = {
  code?: string,
  grantType: string,
  redirectUri?: string,
  refreshToken?: string
  scope?: ABNScopes[]
}

export type ABNClientRequestAccessTokenResponse = {
  access_token: string
  refresh_token?: string
  token_type: string
  expires_in: number
}

export type ABNClientPostSEPAPaymentOptions = {
  accessToken: string
  initiatingpartyAccountNumber?: string
  counterpartyAccountNumber: string
  counterpartyName: string
  amount: number
  requestedExecutionDate?: Date
  currency?: string
  remittanceInfo?: string
}

export type ABNClientPostSEPAPaymentResponse = {
  transactionId: string
  status: "STORED" | "AUTHORIZED" | "INPROGRESS" | "SCHEDULED" | "EXECUTED" | "REJECTED" | "UNKNOWN" | "CANCEL"
  accountNumber?: string
}

export type ABNClientGetConsentInfoOptions = {
  accessToken: string
}

export type ABNClientGetConsentInfoResponse = {
  iban: string
  transactionId?: string
  valid: number
  scopes: string
  consentStatus: 'INITIAL' | 'FULLY_SIGNED' | 'PARTIALLY_SIGNED' | 'SYSTEM_CANCELED' | 'USER_CANCELED'
  consentExpiresIn: string
}

export type PutSEPAPaymentOptions = {
  transactionId: string
  accessToken: string
}

export type PutSEPAPaymentResponse = {
  transactionId: string
  accountHolderName: string
  accountNumber: string
  status: "STORED" | "AUTHORIZED" | "INPROGRESS" | "SCHEDULED" | "EXECUTED" | "REJECTED" | "UNKNOWN" | "CANCEL"
}

export type GetSEPAPaymentOptions = {
  transactionId: string
  accessToken: string
}

export type GetSEPAPaymentResponse = {
  transactionId: string
  accountHolderName: string
  accountNumber: string
  status: "STORED" | "AUTHORIZED" | "INPROGRESS" | "SCHEDULED" | "EXECUTED" | "REJECTED" | "UNKNOWN" | "CANCEL"
}

export type GetDetailsOptions = {
  accountNumber: string
  accessToken: string
}

export type GetDetailsResponse = {
  currency: string
  accountHolderName: string
  accountNumber: string
}

export type GetBalancesOptions = {
  accountNumber: string
  accessToken: string
}

export type GetBalancesResponse = {
  accountNumber: string
  currency: string
  balanceType: 'BOOKBALANCE'
  amount: number
}

export type GetTransactionsOptions = {
  accountNumber: string
  accessToken: string
  /**
   * Filter, only retrieve transactions that are more recent than this date. (Format: YYYY-MM-DD).
   * If field or date is omitted, the last 50 transactions are retrieved. Transactions can be retrieved for up to 18 months.
   */
  bookDateFrom?: Date | string

  /** Filter, only retrieve transactions preceding this date (Format: YYYY-MM-DD). */
  bookDateTo?: Date | string

  /** Reference key to be used as a query parameter to fetch the next set of transactions. */
  nextPageKey?: string

  /**
   * The filter of transaction data only retrieves transaction details for the provided query values.
   * If its necessary to add multiple values, separate them by comma. If all attributes added to the
   * filter, the full response will be returned. In this case the filter is superfluous.
   * If all transaction data is required, then this query parameter does not have to be supplied.
   */
  includeProperties?: ("transactionId" | "mutationCode" | "descriptionLines" | "transactionTimestamp" | "bookDate" | "balanceAfterMutation" | "counterPartyAccountNumber" | "counterPartyName" | "amount" | "currency" | "status")[]
}

export type GetTransactionsResponse = {
  accountNumber: string
  nextPageKey: string
  transactions: {
    mutationCode: string
    descriptionLines: string[]
    transactionTimestamp: string
    bookDate: string
    balanceAfterMutation: number
    counterPartyAccountNumber: string
    counterPartyName: string
    amount: number
    currency: string
    transactionId: string
  }[]
}
