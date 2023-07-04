import { GetAuthorizationCodeOptions, GetAuthorizationCodeResponse, RaboPremiumOptions } from './types'

class RaboPremium {
  private readonly AUTH_URL = 'https://oauth-sandbox.rabobank.nl/openapi/sandbox/oauth2-premium'

  private readonly clientId: string

  constructor({ clientId }: RaboPremiumOptions) {
    this.clientId = clientId
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
   * @todo
   * @see https://developer-sandbox.rabobank.nl/product/46913/api/46910#/AccessAuthorizationSandbox_109/operation/%2Ftoken/post
   */
  public async requestAccessToken() {
    throw new Error('Not Implemented')
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
