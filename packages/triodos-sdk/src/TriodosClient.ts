import assert from 'node:assert';
import { BinaryLike, createHash, createSign } from 'node:crypto';
import querystring from 'node:querystring';
import { errors as Errors, request } from 'undici';
import { v4 as uuidv4 } from 'uuid';
import {
  GetAccountBalancesOptions,
  GetAccountBalancesResponse,
  GetAccountInformationConsentStatusOptions,
  GetAccountInformationConsentStatusResponse,
  GetAccountsOptions,
  GetAccountsResponse,
  GetAuthorizationOptions,
  GetAuthorizationResponse,
  GetConfigutationResponse,
  GetInitialAccessTokenResponse,
  GetSepaPaymentAuthorisationStatusOptions,
  GetSepaPaymentAuthorisationStatusResponse,
  GetSepaPaymentDetailsOptions,
  GetSepaPaymentDetailsResponse,
  GetSepaPaymentStatusOptions,
  GetSepaPaymentStatusResponse,
  GetTokenOptions,
  GetTokenResponse,
  InitiateCrossBorderPaymentOptions,
  InitiateCrossBorderPaymentResponse,
  InitiateSepaPaymentOptions,
  InitiateSepaPaymentResponse,
  RegisterClientOptions,
  RegisterClientResponse,
  RegisterConsentOptions,
  RegisterConsentResposne,
  SubmitSepaPaymentAuthorisationStatusOptions,
  SubmitSepaPaymentAuthorisationStatusResponse,
  TridosClientOptions,
  UpdateConsentAuthorisationWithAccessTokenOptions,
  UpdateConsentAuthorisationWithAccessTokenResponse
} from './types';

class TriodosClient {
  private readonly baseUrl = 'https://xs2a-sandbox.triodos.com/'
  private readonly defaultHeaders: Record<string, string> = {}
  private readonly tenant: string
  private readonly keyId: string
  private readonly signingKey: string

  constructor({ keyId, tenant, signingCertificate, signingKey }: TridosClientOptions) {
    this.keyId = keyId
    this.signingKey = signingKey
    this.tenant = tenant

    const certificateWithoutHeaders = signingCertificate
      .replace('-----BEGIN CERTIFICATE-----', '')
      .replace('-----END CERTIFICATE-----', '')
      .trim();
    this.defaultHeaders['TPP-Signature-Certificate'] = certificateWithoutHeaders
    this.defaultHeaders['SSL-Certificate'] = certificateWithoutHeaders
    this.defaultHeaders.Accept = 'application/json'
    this.defaultHeaders['Content-Type'] = 'application/json'
  }

  /**
   * @see https://developer.triodos.com/reference/initialaccesstoken
   */
  public async getInitialAccessToken(): Promise<GetInitialAccessTokenResponse> {
    const endpoint = `${this.baseUrl}xs2a-bg/${this.tenant}/onboarding/v1`
    const { body } = await this.signedRequest(endpoint)
    const data = await body.json()

    return data
  }

  /**
   * @see https://developer.triodos.com/reference/authorizepost_1
   */
  public async registerClient({ accessToken, redirectUris, sectorIdentifierUri }: RegisterClientOptions): Promise<RegisterClientResponse> {
    const options: Parameters<typeof this.signedRequest>[1] = {}
    options.method = 'POST'
    options.headers = {}
    options.headers.Authorization = `Bearer ${accessToken}`
    options.headers['Content-Type'] = 'application/x-www-form-urlencoded'
    options.body = querystring.stringify({ redirect_uris: redirectUris, sector_identifier_uri: sectorIdentifierUri })

    const endpoint = `${this.baseUrl}auth/${this.tenant}/v1/registration`
    const { body } = await this.signedRequest(endpoint, options)
    const data = await body.json()
    return data
  }

  /**
   * @see https://developer.triodos.com/reference/configuration
   */
  public async getConfiguration(): Promise<GetConfigutationResponse> {
    const endpoint = `${this.baseUrl}auth/${this.tenant}/.well-known/openid-configuration`
    const { body } = await this.signedRequest(endpoint)
    const data = await body.json()
    return data
  }

  /**
   * @see https://developer.triodos.com/reference/authorizeget
   */
  public async getAuthorization(options: GetAuthorizationOptions): Promise<GetAuthorizationResponse> {
    options.response_type = 'code'
    options.code_challenge_method = 'S256'

    const endpoint = `${this.baseUrl}auth/${this.tenant}/v1/auth?${querystring.stringify(options)}`
    const { statusCode, headers } = await this.signedRequest(endpoint)

    assert(statusCode === 302)
    assert(typeof headers.location === 'string')

    return headers.location
  }

  /**
   * @see https://developer.triodos.com/reference/registerconsentrequest
   */
  public async registerConsent({ ipAddr, redirectUri, bodyParams }: RegisterConsentOptions): Promise<RegisterConsentResposne> {
    const options: Parameters<typeof this.signedRequest>[1] = {}
    options.method = 'POST'
    options.headers = {}
    options.headers['PSU-IP-Address'] = ipAddr
    options.headers['TPP-Redirect-URI'] = redirectUri
    options.body = JSON.stringify(bodyParams)

    const endpoint = `${this.baseUrl}xs2a-bg/${this.tenant}/v1/consents`
    const { body } = await this.signedRequest(endpoint, options)
    const data = await body.json()
    return data
  }

  /**
   * @see https://developer.triodos.com/reference/token
   */
  public async getToken({ accessToken, clientId, clientSecret, bodyParams }: GetTokenOptions): Promise<GetTokenResponse> {
    const options: Parameters<typeof this.signedRequest>[1] = {}
    options.method = 'POST'
    options.headers = {}
    options.headers['Content-Type'] = 'application/x-www-form-urlencoded'
    options.body = querystring.stringify(bodyParams)

    if (accessToken) {
      options.headers.Authorization = `Bearer ${accessToken}`
    } else {
      assert(typeof clientId === 'string')
      assert(typeof clientSecret === 'string')
      options.headers.Authorization = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
    }

    const endpoint = `${this.baseUrl}auth/${this.tenant}/v1/token`
    const { body } = await this.signedRequest(endpoint, options)
    const data = await body.json()
    return data
  }

  /**
   * @see https://developer.triodos.com/reference/tokenrevocation
   */
  public async revokeToken() {
    throw new Error('Not Implemented')
  }

  /**
   * @see https://developer.triodos.com/reference/token
   */
  public async getUserInfo() {
    throw new Error('Not Implemented')
  }

  /**
   * @see https://developer.triodos.com/reference/getaccount
   */
  public async getAccount() {
    throw new Error('Not Implemented')
  }

  /**
   * @see https://developer.triodos.com/reference/getaccounts
   */
  public async getAccounts({ accessToken, consentId, ipAddr, withBalance: _withBalance }: GetAccountsOptions): Promise<GetAccountsResponse> {
    const options: Parameters<typeof this.signedRequest>[1] = {}
    options.headers = {}
    if (ipAddr) options.headers['PSU-IP-Address'] = ipAddr
    options.headers['Consent-ID'] = consentId
    options.headers['Authorization'] = `Bearer ${accessToken}`

    const endpoint = `${this.baseUrl}xs2a-bg/${this.tenant}/v1/accounts`
    const { body } = await this.signedRequest(endpoint, options)
    const data = await body.json()
    return data
  }

  /**
   * @see https://developer.triodos.com/reference/getbalances
   */
  public async getAccountBalances({ accessToken, accountId, consentId, ipAddr }: GetAccountBalancesOptions): Promise<GetAccountBalancesResponse> {
    const options: Parameters<typeof this.signedRequest>[1] = {}
    options.headers = {}
    if (ipAddr) options.headers['PSU-IP-Address'] = ipAddr
    options.headers['Consent-ID'] = consentId
    options.headers['Authorization'] = `Bearer ${accessToken}`

    const endpoint = `${this.baseUrl}xs2a-bg/${this.tenant}/v1/accounts/${accountId}/balances`
    const { body } = await this.signedRequest(endpoint, options)
    const data = await body.json()
    return data
  }

  /**
   * @see https://developer.triodos.com/reference/gettransactions
   */
  public async getAccountTransactions() {
    throw new Error('Not Implemented')
  }

  /**
   * @see https://developer.triodos.com/reference/getaisauthorisations
   */
  public async getAisAuthorisations() {
    throw new Error('Not Implemented')
  }

  /**
   * @see https://developer.triodos.com/reference/createaisauthorisation
   */
  public async createAisAuthorisations() {
    throw new Error('Not Implemented')
  }

  /**
   * @see https://developer.triodos.com/reference/getaisauthorisationstatus
   */
  public async getAisAuthorisationStatus() {
    throw new Error('Not Implemented')
  }

  /**
   * @see https://developer.triodos.com/reference/submitaisauthorisation
   */
  public async submitAisAuthorisation() {
    throw new Error('Not Implemented')
  }

  /**
   * @see https://developer.triodos.com/reference/getaisconsent
   */
  public async getAisConsent() {
    throw new Error('Not Implemented')
  }

  /**
   * @see https://developer.triodos.com/reference/deleteaisconsent
   */
  public async deleteAisConsent() {
    throw new Error('Not Implemented')
  }

  /**
   * @see https://developer.triodos.com/reference/getaisconsentstatus
   */
  public async getAisConsentStatus() {
    throw new Error('Not Implemented')
  }

  /**
   * @see https://developer.triodos.com/reference/confirmfundsavailable
   */
  public async createConfirmationOfFunds() {
    throw new Error('Not Implemented')
  }

  /**
   * @see https://developer.triodos.com/reference/getpiisauthorisations
   */
  public async getConfirmationOfFundsAuthorisations() {
    throw new Error('Not Implemented')
  }

  /**
   * @see https://developer.triodos.com/reference/createpiisauthorisation
   */
  public async createConfirmationOfFundsAuthorisations() {
    throw new Error('Not Implemented')
  }

  /**
   * @see https://developer.triodos.com/reference/getpiisauthorisationstatus
   */
  public async getConfirmationOfFundsAuthorisationStatus() {
    throw new Error('Not Implemented')
  }

  /**
   * @see https://developer.triodos.com/reference/submitpiisauthorisation
   */
  public async submitConfirmationOfFundsAuthorisation() {
    throw new Error('Not Implemented')
  }

  /**
   * @see https://developer.triodos.com/reference/getpiisconsent
   */
  public async getConfirmationOfFundsConsent() {
    throw new Error('Not Implemented')
  }

  /**
   * @see https://developer.triodos.com/reference/deletepiisconsent
   */
  public async deleteConfirmationOfFundsConsent() {
    throw new Error('Not Implemented')
  }

  /**
   * @see https://developer.triodos.com/reference/getpiisconsentstatus
   */
  public async getConfirmationOfFundsConsentStatus() {
    throw new Error('Not Implemented')
  }

  /**
   * @see https://developer.triodos.com/reference/registerconsentrequest_1
   */
  public async registerConfirmationOfFundsConsent() {
    throw new Error('Not Implemented')
  }

  /**
   * @see https://developer.triodos.com/reference/initiatesepapayment
   */
  public async initiateSepaPayment({ ipAddr, redirectUri, requestBody }: InitiateSepaPaymentOptions): Promise<InitiateSepaPaymentResponse> {
    const options: Parameters<typeof this.signedRequest>[1] = {}
    options.method = 'POST'
    options.headers = {}
    options.headers['PSU-IP-Address'] = ipAddr
    options.headers['TPP-Redirect-URI'] = redirectUri
    options.body = JSON.stringify(requestBody)

    const endpoint = `${this.baseUrl}xs2a-bg/${this.tenant}/v1/payments/sepa-credit-transfers`
    const response = await this.signedRequest(endpoint, options)
    const data = await response.body.json()
    return data
  }

  /**
   * @see https://developer.triodos.com/reference/getauthorisation
   */
  public async getSepaPaymentAuthorisationStatus({ resourceId, authorisationId }: GetSepaPaymentAuthorisationStatusOptions): Promise<GetSepaPaymentAuthorisationStatusResponse> {
    const endpoint = `${this.baseUrl}xs2a-bg/${this.tenant}/v1/payments/sepa-credit-transfers/${resourceId}/authorisations/${authorisationId}`
    const response = await this.signedRequest(endpoint)
    const data = await response.body.json()
    return data
  }

  /**
   * @see https://developer.triodos.com/reference/getaisconsentstatus
   */
  public async getAccountInformationConsentStatus({ resourceId }: GetAccountInformationConsentStatusOptions): Promise<GetAccountInformationConsentStatusResponse> {
    const endpoint = `${this.baseUrl}xs2a-bg/${this.tenant}/v1/consents/${resourceId}/status`
    const response = await this.signedRequest(endpoint)
    const data = await response.body.json()
    return data
  }

  /**
   * @see https://developer.triodos.com/reference/submitaisauthorisation
   */
  public async updateConsentAuthorisationWithAccessToken({ accessToken, resourceId, authorisationId }: UpdateConsentAuthorisationWithAccessTokenOptions): Promise<UpdateConsentAuthorisationWithAccessTokenResponse> {
    const options: Parameters<typeof this.signedRequest>[1] = {}
    options.method = 'PUT'
    options.headers = { Authorization: `Bearer ${accessToken}` }

    const endpoint = `${this.baseUrl}xs2a-bg/${this.tenant}/v1/consents/${resourceId}/authorisations/${authorisationId}`
    const response = await this.signedRequest(endpoint, options)
    const data = await response.body.json()
    return data
  }

  /**
   * @see https://developer.triodos.com/reference/submitauthorisation
   */
  public async submitSepaPaymentAuthorisation({ accessToken, resourceId, authorisationId }: SubmitSepaPaymentAuthorisationStatusOptions): Promise<SubmitSepaPaymentAuthorisationStatusResponse> {
    const options: Parameters<typeof this.signedRequest>[1] = {}
    options.method = 'PUT'
    options.headers = { Authorization: `Bearer ${accessToken}` }

    const endpoint = `${this.baseUrl}xs2a-bg/${this.tenant}/v1/payments/sepa-credit-transfers/${resourceId}/authorisations/${authorisationId}`
    const response = await this.signedRequest(endpoint, options)
    const data = await response.body.json()
    return data
  }

  /**
   * @see https://developer.triodos.com/reference/getstatus_3
   */
  public async getSepaPaymentStatus({ resourceId }: GetSepaPaymentStatusOptions): Promise<GetSepaPaymentStatusResponse> {
    const endpoint = `${this.baseUrl}xs2a-bg/${this.tenant}/v1/payments/sepa-credit-transfers/${resourceId}/status`
    const response = await this.signedRequest(endpoint)
    const data = await response.body.json()
    return data
  }

  public async getSepaPaymentDetails({ resourceId }: GetSepaPaymentDetailsOptions): Promise<GetSepaPaymentDetailsResponse> {
    const endpoint = `${this.baseUrl}xs2a-bg/${this.tenant}/v1/payments/sepa-credit-transfers/${resourceId}`
    const response = await this.signedRequest(endpoint)
    const data = await response.body.json()
    return data
  }

  /**
   * @see https://developer.triodos.com/reference/initiatecrossborderpayment
   */
  public async initiateCrossBorderPayment({ ipAddr, redirectUri, requestBody }: InitiateCrossBorderPaymentOptions): Promise<InitiateCrossBorderPaymentResponse> {
    const options: Parameters<typeof this.signedRequest>[1] = {}
    options.method = 'POST'
    options.headers = {}
    options.headers['PSU-IP-Address'] = ipAddr
    options.headers['TPP-Redirect-URI'] = redirectUri
    options.body = JSON.stringify(requestBody)

    const endpoint = `${this.baseUrl}xs2a-bg/${this.tenant}/v1/payments/cross-border-credit-transfers`
    const response = await this.signedRequest(endpoint, options)
    const data = await response.body.json()
    return data
  }

  private signedRequest: typeof request = (url, options = {}) => {
    options.headers ||= {}

    assert(!Array.isArray(options.headers))

    options.headers = Object.assign({}, this.defaultHeaders, options.headers)
    options.headers['X-Request-ID'] = uuidv4()
    options.headers['Digest'] = this.calculateMessageDigest(String(options?.body))
    options.headers['Signature'] = this.calculateSignature(options.headers, this.keyId, this.signingKey)

    options.throwOnError = true

    return request(url, options)
  }

  private calculateMessageDigest = (data: BinaryLike) => "SHA-256=" + createHash('sha256').update(data).digest('base64')

  private getSigningString(headers: Record<string, any>) {
    assert(typeof headers['Digest'] === 'string')
    assert(typeof headers['X-Request-ID'] === 'string')

    return `digest: ${headers['Digest']}\n`
      + `x-request-id: ${headers['X-Request-ID']}`
  }

  private calculateSignature(headers: Record<string, any>, keyId: string, privateKey: string) {
    return `keyId="${keyId}",`
      + 'algorithm="rsa-sha256",'
      + 'headers="digest x-request-id",'
      + `signature="${createSign('RSA-SHA256')
        .update(this.getSigningString(headers))
        .sign(privateKey, 'base64')}"`;
  }
}

export { TriodosClient, Errors };
