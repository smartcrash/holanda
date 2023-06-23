import querystring from 'node:querystring';
import { Client, errors as Errors } from "undici";
import { ABNClientGetConsentInfoOptions, ABNClientGetConsentInfoResponse, ABNClientOptions, ABNClientPostSEPAPaymentOptions, ABNClientPostSEPAPaymentResponse, ABNClientRequestAccessTokenOptions, ABNClientRequestAccessTokenResponse, ABNClientRequestAuthTokenOptions, ABNClientRequestAuthTokenResponse, GetSEPAPaymentOptions, GetSEPAPaymentResponse, PutSEPAPaymentOptions, PutSEPAPaymentResponse } from './types';

class ABNClient {
  private readonly clientId: string
  private readonly apiKey: string

  private readonly authUrl = 'https://auth-mtls-sandbox.abnamro.com'
  private readonly apiUrl = 'https://api-sandbox.abnamro.com'
  private readonly auth: Client
  private readonly api: Client

  constructor({ apiKey, clientId, privateKey, publicCertificate }: ABNClientOptions) {
    this.clientId = clientId
    this.apiKey = apiKey

    const options = {
      connect: {
        key: privateKey,
        cert: publicCertificate
      }
    }
    this.auth = new Client(this.authUrl, options)
    this.api = new Client(this.apiUrl, options)
  }

  /**
   * @see https://developer.abnamro.com/api-products/authorization-code#tag/Access-and-refresh-token/operation/requestAccessToken
   */
  public async requestAccessToken({ grantType, code, redirectUri, refreshToken, scope }: ABNClientRequestAccessTokenOptions): Promise<ABNClientRequestAccessTokenResponse> {
    const queryParams: Record<string, string | undefined> = {
      client_id: this.clientId,
      grant_type: grantType,
      code,
      redirect_uri: redirectUri,
      refresh_token: refreshToken,
      scope: scope?.join(' ')
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
   * @see https://developer.abnamro.com/api-products/authorization-code#tag/Authorization-code/operation/requestAuthCode
   */
  public async requestAuthCode({ scope, responseType, flow, redirectUri, state, transactionId, bank }: ABNClientRequestAuthTokenOptions): Promise<ABNClientRequestAuthTokenResponse> {
    const queryParams: Record<string, string | undefined> = {
      client_id: this.clientId,
      response_type: responseType,
      flow,
      scope: scope.join(' '),
      redirect_uri: redirectUri,
      state,
      transactionId,
      bank
    }

    const { headers } = await this.auth.request({
      path: `/as/authorization.oauth2`,
      method: 'GET',
      query: queryParams,
      throwOnError: true,
    })

    return headers['location'] as string
  }

  /**
   * @see https://developer.abnamro.com/api-products/payment-initiation-psd2/reference-documentation#tag/Single-payments/operation/postSEPAPayment
   */
  public async postSEPAPayment({ accessToken, ...bodyParams }: ABNClientPostSEPAPaymentOptions): Promise<ABNClientPostSEPAPaymentResponse> {
    const { body } = await this.api.request({
      path: '/v1/payments',
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'API-Key': this.apiKey,
      },
      body: JSON.stringify(bodyParams),
      throwOnError: true,
    })

    return body.json();
  }

  /**
   * @see https://developer.abnamro.com/api-products/account-information-psd2/reference-documentation#tag/Consent-Information/operation/getConsentInfo
   */
  public async getConsentInfo({ accessToken }: ABNClientGetConsentInfoOptions): Promise<ABNClientGetConsentInfoResponse> {
    const { body } = await this.api.request({
      path: '/v1/consentinfo',
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'API-Key': this.apiKey,
      },
      throwOnError: true,
    })

    return body.json();
  }

  /**
   * @see https://developer.abnamro.com/api-products/payment-initiation-psd2/reference-documentation#tag/Single-payments/operation/putSEPAPayment
   */
  public async putSEPAPayment({ transactionId, accessToken }: PutSEPAPaymentOptions): Promise<PutSEPAPaymentResponse> {
    const { body } = await this.api.request({
      path: `/v1/payments/${transactionId}`,
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'API-Key': this.apiKey,
      },
      throwOnError: true,
    })

    return body.json();
  }

  /**
   * @see https://developer.abnamro.com/api-products/payment-initiation-psd2/reference-documentation#tag/Single-payments/operation/getSEPAPayment
   */
  public async getSEPAPayment({ transactionId, accessToken }: GetSEPAPaymentOptions): Promise<GetSEPAPaymentResponse> {
    const { body } = await this.api.request({
      path: `/v1/payments/${transactionId}`,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'API-Key': this.apiKey,
      },
      throwOnError: true,
    })

    return body.json();
  }
}

export { ABNClient, Errors };
