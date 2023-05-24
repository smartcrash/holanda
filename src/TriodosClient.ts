import assert from 'node:assert'
import { createHash, createSign, BinaryLike } from 'node:crypto'
import axios, { Axios } from 'axios'
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

class TriodosClient {
    private readonly client: Axios

    constructor({ keyId, tenant, signingCertificate, privateKey }: TridosClientOptions) {
        this.client = axios.create({
            baseURL: `https://xs2a-sandbox.triodos.com/xs2a-bg/${tenant}/`,
            headers: { Accept: 'application/json' },
        })

        this.client.defaults.headers.common['TPP-Signature-Certificate'] = signingCertificate
            .replace('-----BEGIN CERTIFICATE-----', '')
            .replace('-----END CERTIFICATE-----', '')
            .trim();
        this.client.defaults.headers.common['SSL-Certificate'] = this.client.defaults.headers.common['TPP-Signature-Certificate']


        this.client.interceptors.request.use((config) => {
            config.headers['X-Request-ID'] = uuidv4()
            config.headers['Digest'] = this.calculateMessageDigest(config.data || '')
            config.headers['Signature'] = this.calculateSignature(config.headers, keyId, privateKey)
            return config
        })
    }

    async getInitialAccessToken(): Promise<GetInitialAccessTokenResponse> {
        const { data } = await this.client.get(`onboarding/v1`)
        return data
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
