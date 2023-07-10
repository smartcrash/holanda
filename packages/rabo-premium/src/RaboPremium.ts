import { pki } from 'node-forge'
import assert from 'node:assert'
import { Client, Dispatcher, request } from 'undici'
import { v4 as uuidv4 } from 'uuid'
import rsaSha512 from './helpers/rsaSha512'
import sha512 from './helpers/sha512'
import toBase64 from './helpers/toBase64'
import {
  GetAccountDetailsOptions,
  GetAccountDetailsResponse,
  GetAccountListOptions,
  GetAccountListResponse,
  GetAccountTransactionsOptions,
  GetAccountTransactionsResponse,
  GetAuthorizationCodeOptions,
  GetAuthorizationCodeResponse,
  GetBalanceOptions,
  GetBalanceResponse,
  GetConsentDetailsOptions,
  GetConsentDetailsResponse,
  RaboPremiumOptions,
  RequestAccessTokenOptions,
  RequestAccessTokenResponse,
} from './types'

class RaboPremium {
  private readonly AUTH_URL = 'https://oauth-sandbox.rabobank.nl/openapi/sandbox/oauth2-premium'
  private readonly client: Client
  private readonly key: string
  private readonly serialNumber: string
  private readonly clientId: string
  private readonly clientSecret: string

  private readonly defaultHeaders: Record<string, string> = {}

  /**
   * @param options
   */
  constructor({ clientId, clientSecret, key, cert }: RaboPremiumOptions) {
    this.clientId = clientId
    this.clientSecret = clientSecret
    this.client = new Client('https://api-sandbox.rabobank.nl', { connect: { key, cert } })
    this.key = key

    this.serialNumber = BigInt(`0x${pki.certificateFromPem(cert).serialNumber}`).toString(10)

    this.defaultHeaders['X-IBM-Client-Id'] = clientId
    this.defaultHeaders['Accept'] = 'application/json'
    this.defaultHeaders['Signature-Certificate'] = cert
      .replace('-----BEGIN CERTIFICATE-----', '')
      .replace('-----END CERTIFICATE-----', '')
      .replace(/\n/g, '')
  }

  /**
   * Before you can request an access token you need to redirect your user to
   * this endpoint to obtain consent. After giving consent the user will be
   * redirected back to the "OAuth Redirect URI" that you provided in your
   * application settings.
   * @param options
   *
   * @see https://developer-sandbox.rabobank.nl/product/46913/api/46910#/AccessAuthorizationSandbox_109/operation/%2Fauthorize/get
   */
  public getAuthorizationCode({
    responseType,
    scope,
    redirectUri,
    state,
  }: GetAuthorizationCodeOptions): GetAuthorizationCodeResponse {
    const queryParams = new URLSearchParams()
    queryParams.set('client_id', this.clientId)
    queryParams.set('scope', Array.isArray(scope) ? scope.join(' ') : scope)
    queryParams.set('response_type', responseType)
    if (redirectUri) queryParams.set('redirect_uri', redirectUri)
    if (state) queryParams.set('state', state)

    return `${this.AUTH_URL}/authorize?${queryParams.toString()}`
  }

  /**
   * This endpoint allows requesting an access token following one of the flows below:
   * - Authorization Code (exchange code for access token)
   * - Refresh Token (exchange refresh token for a new access token)
   * @param options
   *
   * @see https://developer-sandbox.rabobank.nl/product/46913/api/46910#/AccessAuthorizationSandbox_109/operation/%2Ftoken/post
   */
  public async requestAccessToken({
    grantType,
    code,
    redirectUri,
    refreshToken,
  }: RequestAccessTokenOptions): Promise<RequestAccessTokenResponse> {
    const bodyParams = new URLSearchParams()
    bodyParams.set('grant_type', grantType)
    if (code) bodyParams.set('code', code)
    if (redirectUri) bodyParams.set('redirect_uri', redirectUri)
    if (refreshToken) bodyParams.set('refresh_token', refreshToken)

    const { body } = await request(`${this.AUTH_URL}/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${toBase64(`${this.clientId}:${this.clientSecret}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: bodyParams.toString(),
      throwOnError: true,
    })

    return body.json()
  }

  /**
   * Returns the scope and products associated with the consent object
   * @param options
   * @see https://developer-sandbox.rabobank.nl/product/46913/api/46090#/ConsentDetailsServiceSandbox_1016/operation/%2Fv1%2Fconsents%2F{consentId}/get
   */
  public async getConsentDetails({ consentId }: GetConsentDetailsOptions): Promise<GetConsentDetailsResponse> {
    const { body } = await this.signedRequest({
      path: `/openapi/sandbox/oauth2-premium/v1/consents/${consentId}`,
      method: 'GET',
    })

    return body.json()
  }

  /**
   * Delivers all the consented payments accounts for a specific Rabobank customer.
   * @param options
   * @see https://developer-sandbox.rabobank.nl/product/51891/api/48763#/BusinessAccountInsightAccounts_1124/operation/%2Faccounts/get
   */
  public async getAccountList({ accessToken }: GetAccountListOptions): Promise<GetAccountListResponse> {
    const { body } = await this.signedRequest({
      path: '/openapi/sandbox/payments/insight/accounts',
      headers: { Authorization: `Bearer ${accessToken}` },
      method: 'GET',
    })

    return body.json()
  }

  /**
   * Delivers information about specific payment account.
   * @param options
   * @see https://developer-sandbox.rabobank.nl/product/51891/api/48763#/BusinessAccountInsightAccounts_1124/operation/%2Faccounts%2F{account-id}/get
   */
  public async getAccountDetails({
    accessToken,
    accountId,
  }: GetAccountDetailsOptions): Promise<GetAccountDetailsResponse> {
    const { body } = await this.signedRequest({
      path: `/openapi/sandbox/payments/insight/accounts/${accountId}`,
      headers: { Authorization: `Bearer ${accessToken}` },
      method: 'GET',
    })

    return body.json()
  }

  /**
   * Delivers the actual and end of day balance for a specific consented payment account.
   * @param options
   * @see https://developer-sandbox.rabobank.nl/product/51891/api/50832#/BusinessAccountInsightBalances_1124/operation/%2Faccounts%2F{account-id}%2Fbalances/get
   */
  public async getBalance({ accessToken, accountId }: GetBalanceOptions): Promise<GetBalanceResponse> {
    const { body } = await this.signedRequest({
      path: `/openapi/sandbox/payments/insight/accounts/${accountId}/balances`,
      headers: { Authorization: `Bearer ${accessToken}` },
      method: 'GET',
    })

    return body.json()
  }

  /**
   * Delivers transactions for a specific consented payment account.
   * @param options
   * @see https://developer-sandbox.rabobank.nl/product/51891/api/51888#/BusinessAccountInsightTransactions_122/operation/%2Faccounts%2F{account-id}%2Ftransactions/get
   */
  public async getAccountTransactions({
    accountId,
    accessToken,
    bookingStatus,
    dateFrom,
    dateTo,
    dropFields,
    nextPageToken,
    size,
  }: GetAccountTransactionsOptions): Promise<GetAccountTransactionsResponse> {
    const queryParams = new URLSearchParams()
    queryParams.set('bookingStatus', bookingStatus)
    queryParams.set('dateFrom', new Date(dateFrom).toISOString())
    queryParams.set('dateTo', new Date(dateTo).toISOString())
    if (nextPageToken) queryParams.set('nextPageToken', nextPageToken)
    if (size) queryParams.set('size', size.toString())
    if (dropFields) queryParams.set('dropFields', dropFields.join(','))

    const { body } = await this.signedRequest({
      path: `/openapi/sandbox/payments/insight/accounts/${accountId}/transactions?${queryParams}`,
      headers: { Authorization: `Bearer ${accessToken}` },
      method: 'GET',
    })

    return body.json()
  }

  private signedRequest: Dispatcher['request'] = (options) => {
    options.headers ||= {}

    assert(!Array.isArray(options.headers))

    options.headers = Object.assign({}, this.defaultHeaders, options.headers)
    options.headers['X-Request-ID'] = uuidv4()
    options.headers['Date'] = new Date().toUTCString()
    options.headers['Digest'] = `sha-512=${sha512('', 'base64')}`
    options.headers.Signature = this.createSignature(options.headers)
    options.throwOnError = true

    return this.client.request(options)
  }

  private createSignature(headers: Record<string, string | string[] | undefined> = {}): string {
    return Object.entries({
      keyId: this.serialNumber,
      algorithm: 'rsa-sha512',
      headers: 'date digest x-request-id',
      signature: rsaSha512(
        `date: ${headers.Date}\ndigest: ${headers.Digest}\nx-request-id: ${headers['X-Request-ID']}`,
        this.key,
        'base64',
      ),
    })
      .map(([key, value]) => `${key}="${value}"`)
      .join(',')
  }
}

export { RaboPremium }
