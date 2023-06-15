import { Scopes } from "./enums"

export type ABNClientOptions = {
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
}

export type ABNClientRequestAccessTokenResponse = {
  access_token: string
  token_type: string
  expires_in: number
}
