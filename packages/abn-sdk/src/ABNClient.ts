import querystring from 'node:querystring';
import { Client, errors as Errors } from "undici";
import { ABNClientOptions, ABNClientRequestAccessTokenOptions, ABNClientRequestAccessTokenResponse, ABNClientRequestAuthTokenOptions, ABNClientRequestAuthTokenResponse } from './types';

class AbnClient {
  private readonly client: Client
  private readonly authUrl = 'https://auth-mtls-sandbox.abnamro.com'
  // private readonly apiUrl = 'https://api-sandbox.abnamro.com/v1/'
  private readonly clientId: string

  constructor({ clientId, privateKey, publicCertificate }: ABNClientOptions) {
    this.clientId = clientId
    this.client = new Client(this.authUrl,
      {
        connect: {
          key: privateKey,
          cert: publicCertificate
        }
      }
    )
  }

  /**
   * @see https://developer.abnamro.com/api-products/authorization-code#tag/Access-and-refresh-token/operation/requestAccessToken
   */
  public async requestAccessToken({ grantType, code, redirectUri, refreshToken }: ABNClientRequestAccessTokenOptions): Promise<ABNClientRequestAccessTokenResponse> {
    const queryParams: Record<string, string | undefined> = {
      client_id: this.clientId,
      grant_type: grantType,
      code,
      redirect_uri: redirectUri,
      refresh_token: refreshToken
    }

    const { body } = await this.client.request({
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

    const { headers } = await this.client.request({
      path: `/as/authorization.oauth2`,
      method: 'GET',
      query: queryParams,
      throwOnError: true,
    })

    return headers['location'] as string
  }
}

export { AbnClient as ABNClient, Errors };

