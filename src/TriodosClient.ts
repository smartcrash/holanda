import assert from 'node:assert'
import querystring from 'node:querystring';
import { createHash, createSign, BinaryLike } from 'node:crypto'
import { request, errors as Errors } from 'undici'
import { v4 as uuidv4 } from 'uuid';

/*
type AutherizationGetOptions = {
    tenant: string
    response_type: string
    client_id: string
    redirect_uri: string
    scope: string
    code_challenge: string
    code_challenge_method: string
    id_token_hint: string
    state?: string
    nonce?: string
    response_mode?: string
    prompt?: string
    max_age?: string
}

type AutherizationGetResponse = void
*/

type GetInitialAccessTokenResponse = {
  scope: string
  access_token: string
  expires_in: number
  token_type: string
  _links: {
    registration: string
  }
}

type TridosClientOptions = {
  keyId: string
  tenant: string
  signingCertificate: string
  privateKey: string
}

type RegisterClientOptions = {
  sectorIdentifierUri?: string
  redirectUris: string[]
  accessToken: string
}

type RegisterClientResponse = {
  grant_types: string[]
  application_type: string
  client_secret_expires_at: number
  redirect_uris: string[]
  client_id_issued_at: number
  client_secret: string
  tls_client_certificate_bound_access_tokens: boolean
  token_endpoint_auth_method: string
  client_id: string
  response_types: string[]
  id_token_signed_response_alg: string
}

type InitiateSepaPaymentResponse = {
  transactionStatus: 'RCVD' | 'PDNG' | 'ACCP' | 'ACTC' | 'ACWC' | 'ACWP' | 'ACSP' | 'ACSC' | 'RJCT' | 'CANC' | 'PATC' | 'ACFC'
  paymentId: string
  authorisationId: string
  debtorAccount: { iban: string },
  _links: {
    scaOAuth: string
    scaRedirect: string
    scaStatus: string
    self: string
    confirmation: string
    status: string
  }
}

type InitiateSepaPaymentOptions = {
  ipAddr: string
  redirectUri: string
  requestBody: {
    instructedAmount: {
      currency: string
      amount: string
    }
    debtorAccount: { iban: string }
    creditorAccount: { iban: string }
    creditorName: string
    requestedExecutionDate: string
  }
}

type GetSepaPaymentStatusOptions = {
  resourceId: string
}

type GetSepaPaymentStatusResponse = {
  transactionStatus: 'RCVD' | 'PDNG' | 'ACCP' | 'ACTC' | 'ACWC' | 'ACWP' | 'ACSP' | 'ACSC' | 'RJCT' | 'CANC' | 'PATC' | 'ACFC'
  /**
   * This data element is contained, if a funds check has been performed and
   * if the transactionStatus is `ACTC`, `ACWC` or `ACCP`.
   */
  fundsAvailable?: boolean
}

type GetSepaPaymentDetailsOptions = {
  resourceId: string
}

type GetSepaPaymentDetailsResponse = {
  transactionStatus: 'RCVD' | 'PDNG' | 'ACCP' | 'ACTC' | 'ACWC' | 'ACWP' | 'ACSP' | 'ACSC' | 'RJCT' | 'CANC' | 'PATC' | 'ACFC'
  paymentId: string
  debtorAccount: { iban: string },
  _links: {
    self: string
    status: string
  }
}

type InitiateCrosBorderPaymentOptions = {
  ipAddr: string
  redirectUri: string
  requestBody: {
    instructedAmount: {
      currency: string
      amount: string
    },
    debtorAccount: { iban: string },
    creditorName: string
    creditorAccount: { iban: string } | { foreignAccountNumber: string },
    /**
     * When an IBAN is not supplied for the creditor account of a Foreign Payment,
     * the creditorAgent field is mandatory.
    */
    creditorAgent?: string
    chargeBearer: string
    creditorAddress: {
      streetName: string
      buildingNumber: string
      townName: string
      postcode: string
      country: string
    },
    remittanceInformationUnstructured: string
    requestedExecutionDate: string
  }
}

type InitiateCrosBorderPaymentResponse = {
  transactionStatus: 'RCVD' | 'PDNG' | 'ACCP' | 'ACTC' | 'ACWC' | 'ACWP' | 'ACSP' | 'ACSC' | 'RJCT' | 'CANC' | 'PATC' | 'ACFC'
  paymentId: string
  authorisationId: string
  debtorAccount: { iban: string },
  _links: {
    scaOAuth: string
    scaRedirect: string
    scaStatus: string
    self: string
    confirmation: string
    status: string
  }
}


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

  public async initiateCrosBorderPayment({ ipAddr, redirectUri, requestBody }: InitiateCrosBorderPaymentOptions): Promise<InitiateCrosBorderPaymentResponse> {
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

export { TriodosClient, Errors }
