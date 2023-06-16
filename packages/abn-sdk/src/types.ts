import { Scopes } from "./enums"

export type ABNClientOptions = {
  apiKey: string
  clientId: string
  publicCertificate: string
  privateKey: string
}

export type ABNClientRequestAuthTokenOptions = {
  /** Scopes for which the access token is issued. */
  scope: Scopes[]
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
  scope?: Scopes[]
}

export type ABNClientRequestAccessTokenResponse = {
  access_token: string
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
