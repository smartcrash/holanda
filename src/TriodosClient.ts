import assert from 'node:assert';
import { BinaryLike, createHash, createSign } from 'node:crypto';
import querystring from 'node:querystring';
import { errors as Errors, request } from 'undici';
import { v4 as uuidv4 } from 'uuid';
import {
  GetInitialAccessTokenResponse,
  GetSepaPaymentDetailsOptions,
  GetSepaPaymentDetailsResponse,
  GetSepaPaymentStatusOptions,
  GetSepaPaymentStatusResponse,
  InitiateCrossBorderPaymentOptions,
  InitiateCrossBorderPaymentResponse,
  InitiateSepaPaymentOptions,
  InitiateSepaPaymentResponse,
  RegisterClientOptions,
  RegisterClientResponse,
  TridosClientOptions
} from './types';

class TriodosClient {
  private readonly baseUrl = 'https://xs2a-sandbox.triodos.com/'
  private readonly defaultHeaders: Record<string, string> = {}
  private readonly tenant: string
  private readonly keyId: string
  private readonly privateKey: string

  constructor({ keyId, tenant, signingCertificate, privateKey }: TridosClientOptions) {
    this.keyId = keyId
    this.privateKey = privateKey
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

  public async getInitialAccessToken(): Promise<GetInitialAccessTokenResponse> {
    const endpoint = `${this.baseUrl}xs2a-bg/${this.tenant}/onboarding/v1`
    const { body } = await this.signedRequest(endpoint)
    const data = await body.json()

    return data
  }

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
    options.headers['Signature'] = this.calculateSignature(options.headers, this.keyId, this.privateKey)

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

