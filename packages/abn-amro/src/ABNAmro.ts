import querystring from 'node:querystring'
import { Client, errors as Errors } from 'undici'
import {
  ABNAmroOptions,
  DeleteSEPAPaymentOptions,
  DeleteSEPAPaymentResponse,
  GetBalancesOptions,
  GetBalancesResponse,
  GetConsentInfoOptions,
  GetConsentInfoResponse,
  GetDetailsOptions,
  GetDetailsResponse,
  GetFundsOptions,
  GetFundsResponse,
  GetSEPAPaymentOptions,
  GetSEPAPaymentResponse,
  GetTransactionsOptions,
  GetTransactionsResponse,
  PostSEPAPaymentOptions,
  PostSEPAPaymentResponse,
  PostStandingOrderPaymentOptions,
  PostStandingOrderPaymentResponse,
  PostXborderPaymentOptions,
  PostXborderPaymentResponse,
  PutSEPAPaymentOptions,
  PutSEPAPaymentResponse,
  PutXborderPaymentResponse,
  RequestAccessTokenOptions,
  RequestAccessTokenResponse,
  RequestAuthCodeOptions,
  RequestAuthCodeResponse,
} from './types'

/**
 * @example
 * ```ts
 * const client = new ABNAmro({
 *   apiKey: '<API_KEY>',
 *   clientId: '<CLIENT_ID>',
 *   publicCertificate: readFileSync(join(__dirname, '/public-certificate.pem'), { encoding: 'utf8' }),
 *   privateKey: readFileSync(join(__dirname, '/private-key.pem'), { encoding: 'utf8' }),
 * })
 * ```
 */

class ABNAmro {
  private readonly clientId: string
  private readonly apiKey: string

  private readonly authUrl = 'https://auth-mtls-sandbox.abnamro.com'
  private readonly apiUrl = 'https://api-sandbox.abnamro.com'
  private readonly auth: Client
  private readonly api: Client

  /**
   * @param options
   */
  constructor({ apiKey, clientId, privateKey, publicCertificate }: ABNAmroOptions) {
    this.clientId = clientId
    this.apiKey = apiKey

    const options = {
      connect: {
        key: privateKey,
        cert: publicCertificate,
      },
    }
    this.auth = new Client(this.authUrl, options)
    this.api = new Client(this.apiUrl, options)
  }

  /**
   * Retrieves an access token and refresh Token. The access token and refresh token
   * are as used to ensure that authentication is complete and that consent has been
   * given by the client to the consumer. The access token is used when calling APIs
   * on the ABN AMRO API gateway.
   *
   * @param options
   *
   * @example
   * ```ts
   * const response = await client.requestAccessToken({ grantType: 'client_credentials' })
   * // {
   * //   access_token: '3srrbf0WcPTMKCwGBWgXdU6mNnoj',
   * //   token_type: 'Bearer',
   * //   expires_in: 7200
   * // }
   * ```
   *
   * @see https://developer.abnamro.com/api-products/authorization-code#tag/Access-and-refresh-token/operation/requestAccessToken
   */
  public async requestAccessToken({
    grantType,
    code,
    redirectUri,
    refreshToken,
    scope,
  }: RequestAccessTokenOptions): Promise<RequestAccessTokenResponse> {
    const queryParams: Record<string, string | undefined> = {
      client_id: this.clientId,
      grant_type: grantType,
      code,
      redirect_uri: redirectUri,
      refresh_token: refreshToken,
      scope: scope?.join(' '),
    }

    const { body } = await this.auth.request({
      path: '/as/token.oauth2',
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: querystring.stringify(queryParams),
      throwOnError: true,
    })

    return body.json()
  }

  /**
   * Retrieves an authorization code. The authorization code is used to ensure
   * that an ABN AMRO client or end user has provided permission to the API consumer.
   * This authorization code is passed to the authorization server when requesting
   * and access and a refresh token.
   * @param options
   *
   * @example
   * ```ts
   * const response = client.requestAuthCode({
   *   scope: [ABNAmroScopes.PostSEPAPayment],
   *   redirectUri: 'https://localhost/auth',
   *   responseType: 'code',
   * })
   * // https://auth-sandbox.abnamro.com/as/authorization.oauth2?client_id=TPP_test&response_type=code&scope=psd2%3Apayment%3Asepa%3Awrite&redirect_uri=https%3A%2F%2Flocalhost%2Fauth
   * ```
   *
   * @see https://developer.abnamro.com/api-products/authorization-code#tag/Authorization-code/operation/requestAuthCode
   */
  public requestAuthCode({
    scope,
    responseType,
    flow,
    redirectUri,
    state,
    transactionId,
    bank,
  }: RequestAuthCodeOptions): RequestAuthCodeResponse {
    const queryParams = new URLSearchParams()
    queryParams.set('client_id', this.clientId)
    queryParams.set('response_type', responseType)
    queryParams.set('scope', scope.join(' '))
    if (bank) queryParams.set('bank', bank)
    if (flow) queryParams.set('flow', flow)
    if (redirectUri) queryParams.set('redirect_uri', redirectUri)
    if (state) queryParams.set('state', state)
    if (transactionId) queryParams.set('transactionId', transactionId)

    return `https://auth-sandbox.abnamro.com/as/authorization.oauth2?${queryParams.toString()}`
  }

  /**
   * @see https://developer.abnamro.com/api-products/payment-initiation-psd2/reference-documentation#tag/Single-payments/operation/postSEPAPayment
   */
  public async postSEPAPayment({
    accessToken,
    ...bodyParams
  }: PostSEPAPaymentOptions): Promise<PostSEPAPaymentResponse> {
    const { body } = await this.api.request({
      path: '/v1/payments',
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'API-Key': this.apiKey,
      },
      body: JSON.stringify(bodyParams),
      throwOnError: true,
    })

    return body.json()
  }

  /**
   * @see https://developer.abnamro.com/api-products/account-information-psd2/reference-documentation#tag/Consent-Information/operation/getConsentInfo
   */
  public async getConsentInfo({ accessToken }: GetConsentInfoOptions): Promise<GetConsentInfoResponse> {
    const { body } = await this.api.request({
      path: '/v1/consentinfo',
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'API-Key': this.apiKey,
      },
      throwOnError: true,
    })

    return body.json()
  }

  /**
   * @see https://developer.abnamro.com/api-products/payment-initiation-psd2/reference-documentation#tag/Single-payments/operation/putSEPAPayment
   */
  public async putSEPAPayment({ transactionId, accessToken }: PutSEPAPaymentOptions): Promise<PutSEPAPaymentResponse> {
    const { body } = await this.api.request({
      path: `/v1/payments/${transactionId}`,
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'API-Key': this.apiKey,
      },
      throwOnError: true,
    })

    return body.json()
  }

  /**
   * @see https://developer.abnamro.com/api-products/payment-initiation-psd2/reference-documentation#tag/Single-payments/operation/getSEPAPayment
   */
  public async getSEPAPayment({ transactionId, accessToken }: GetSEPAPaymentOptions): Promise<GetSEPAPaymentResponse> {
    const { body } = await this.api.request({
      path: `/v1/payments/${transactionId}`,
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'API-Key': this.apiKey,
      },
      throwOnError: true,
    })

    return body.json()
  }

  /**
   * @see https://developer.abnamro.com/api-products/account-information-psd2/reference-documentation#tag/Account-information-services/operation/getDetails
   */
  public async getDetails({ accountNumber, accessToken }: GetDetailsOptions): Promise<GetDetailsResponse> {
    const { body } = await this.api.request({
      path: `/v1/accounts/${accountNumber}/details`,
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'API-Key': this.apiKey,
      },
      throwOnError: true,
    })

    return body.json()
  }

  /**
   * @see https://developer.abnamro.com/api-products/account-information-psd2/reference-documentation#tag/Account-information-services/operation/getBalances
   */
  public async getBalances({ accountNumber, accessToken }: GetBalancesOptions): Promise<GetBalancesResponse> {
    const { body } = await this.api.request({
      path: `/v1/accounts/${accountNumber}/balances`,
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'API-Key': this.apiKey,
      },
      throwOnError: true,
    })

    return body.json()
  }

  /**
   * @see https://developer.abnamro.com/api-products/account-information-psd2/reference-documentation#tag/Account-information-services/operation/getTransactions
   */
  public async getTransactions({
    accountNumber,
    accessToken,
    bookDateFrom,
    bookDateTo,
    nextPageKey,
    includeProperties,
  }: GetTransactionsOptions): Promise<GetTransactionsResponse> {
    const queryParams = new URLSearchParams()
    if (bookDateFrom)
      queryParams.set(
        'bookDateFrom',
        typeof bookDateFrom === 'string' ? bookDateFrom : bookDateFrom.toISOString().slice(0, 10),
      )
    if (bookDateTo)
      queryParams.set('bookDateTo', typeof bookDateTo === 'string' ? bookDateTo : bookDateTo.toISOString().slice(0, 10))
    if (nextPageKey) queryParams.set('nextPageKey', nextPageKey)
    if (includeProperties && includeProperties.length)
      queryParams.set('includeProperties ', includeProperties.join(','))

    const { body } = await this.api.request({
      path: `/v1/accounts/${accountNumber}/transactions?${queryParams.toString()}`,
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'API-Key': this.apiKey,
      },
      throwOnError: true,
    })

    return body.json()
  }

  /**
   * @see https://developer.abnamro.com/api-products/account-information-psd2/reference-documentation#tag/Check-availability-of-funds/operation/getFunds
   */
  public async getFunds({ accessToken, accountNumber, amount, currency }: GetFundsOptions): Promise<GetFundsResponse> {
    const queryParams = new URLSearchParams()
    queryParams.set('amount', amount.toString())
    if (currency) queryParams.set('currency', currency)

    const { body } = await this.api.request({
      path: `/v1/accounts/${accountNumber}/funds?${queryParams.toString()}`,
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'API-Key': this.apiKey,
      },
      throwOnError: true,
    })

    return body.json()
  }

  /**
   * @see https://developer.abnamro.com/api-products/payment-initiation-psd2/reference-documentation#tag/Single-payments/operation/deleteSEPAPayment
   */
  public async deleteSEPAPayment({
    transactionId,
    accessToken,
  }: DeleteSEPAPaymentOptions): Promise<DeleteSEPAPaymentResponse> {
    const { statusCode } = await this.api.request({
      path: `/v1/payments/${transactionId}`,
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'API-Key': this.apiKey,
      },
      throwOnError: true,
    })

    return statusCode === 200
  }

  /**
   * @see https://developer.abnamro.com/api-products/payment-initiation-psd2/reference-documentation#tag/Single-payments/operation/postXborderPayment
   */
  public async postXborderPayment({
    accessToken,
    ...bodyParams
  }: PostXborderPaymentOptions): Promise<PostXborderPaymentResponse> {
    const { body } = await this.api.request({
      path: '/v1/payments/xborder',
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'API-Key': this.apiKey,
      },
      body: JSON.stringify(bodyParams),
      throwOnError: true,
    })

    return body.json()
  }

  /**
   * @see https://developer.abnamro.com/api-products/payment-initiation-psd2/reference-documentation#tag/Single-payments/operation/putXborderPayment
   */
  public async putXborderPayment({
    transactionId,
    accessToken,
  }: PutSEPAPaymentOptions): Promise<PutXborderPaymentResponse> {
    const { body } = await this.api.request({
      path: `/v1/payments/xborder/${transactionId}`,
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'API-Key': this.apiKey,
      },
      throwOnError: true,
    })

    return body.json()
  }

  /**
   * @see https://developer.abnamro.com/api-products/payment-initiation-psd2/reference-documentation#tag/Single-payments/operation/postStandingOrderPayment
   */
  public async postStandingOrderPayment({
    accessToken,
    ...bodyParams
  }: PostStandingOrderPaymentOptions): Promise<PostStandingOrderPaymentResponse> {
    const { body } = await this.api.request({
      path: '/v1/payments/standingorder',
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'API-Key': this.apiKey,
      },
      body: JSON.stringify(bodyParams),
      throwOnError: true,
    })

    return body.json()
  }
}

export { ABNAmro, Errors }
