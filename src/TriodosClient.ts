import assert from 'node:assert'
import querystring from 'node:querystring';
import { createHash, createSign, BinaryLike } from 'node:crypto'
import { request } from 'undici'
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
    }

    public async getInitialAccessToken(): Promise<GetInitialAccessTokenResponse> {
        const { body } = await this.signedRequest(this.baseUrl + `xs2a-bg/${this.tenant}/onboarding/v1`)
        const data = await body.json()

        return data
    }

    public async registerClient({ accessToken, redirectUris, sectorIdentifierUri }: RegisterClientOptions): Promise<RegisterClientResponse> {
        const { body } = await this.signedRequest(this.baseUrl + `auth/${this.tenant}/v1/registration`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: 'application/json',
                    'Content-type': 'application/x-www-form-urlencoded'
                },
                body: querystring.stringify({
                    redirect_uris: redirectUris,
                    sector_identifier_uri: sectorIdentifierUri
                })
            }
        )

        const data = await body.json()

        return data
    }

    private signedRequest: typeof request = (url, options = {}) => {
        options.headers ||= {}

        assert(!Array.isArray(options.headers))

        Object.assign(options.headers, this.defaultHeaders)
        options.headers['X-Request-ID'] = uuidv4()
        options.headers['Digest'] = this.calculateMessageDigest(String(options?.body))
        options.headers['Signature'] = this.calculateSignature(options.headers, this.keyId, this.privateKey)

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

export { TriodosClient }
