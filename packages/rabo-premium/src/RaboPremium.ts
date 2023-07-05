import { request } from 'undici'
import {
  GetAuthorizationCodeOptions,
  GetAuthorizationCodeResponse,
  RaboPremiumOptions,
  RequestAccessTokenOptions,
  RequestAccessTokenResponse,
} from './types'

class RaboPremium {
  private readonly AUTH_URL = 'https://oauth-sandbox.rabobank.nl/openapi/sandbox/oauth2-premium'

  private readonly clientId: string
  private readonly clientSecret: string

  /**
   * @param options
   */
  constructor({ clientId, clientSecret }: RaboPremiumOptions) {
    this.clientId = clientId
    this.clientSecret = clientSecret
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
        Authorization: `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: bodyParams.toString(),
      throwOnError: true,
    })

    return body.json()
  }

  /**
   * @todo
   * @see https://developer-sandbox.rabobank.nl/product/46913/api/46090#/ConsentDetailsServiceSandbox_1016/operation/%2Fv1%2Fconsents%2F{consentId}/get
   */
  public async getConsentDetails() {
    throw new Error('Not Implemented')
  }
}

export { RaboPremium }
