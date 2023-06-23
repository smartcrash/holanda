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
  transactionId: string
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
