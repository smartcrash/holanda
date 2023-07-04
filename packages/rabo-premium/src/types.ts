export type RaboPremiumOptions = {
  /**
   * This ID uniquely identifies your registered application. The client_id is registered at Rabobank Developer Portal.
   * @example 06d46060-c193-41a8-9867-c9f06a1e52a2
   */
  clientId: string
}

export type GetAuthorizationCodeOptions = {
  /**
   * The value `code` indicates the authorization grant flow. Other response types are currently not supported.
   * @example code
   */
  responseType: 'code'
  /**
   * A space separated list of scopes. Scopes represent permissions to resources
   * which your application requests from the user.
   * @example bip.payments.write
   */
  scope: string[] | string

  /**
   * We do not support dynamic redirect URIs. Please make sure that you have
   * provided the "OAuth Redirect URI" in your application settings.
   * If you use this parameter it has to be exactly the same as the value in
   * your application settings.
   * @example https://localhost/auth
   */
  redirectUri?: string
  /**
   * An opaque value used by the client to maintain state between the request
   * and callback. The authorization server includes this value as a request
   * parameter when redirecting the user back to the redirect URI of the client.
   * The parameter **SHOULD** be used for preventing cross-site request forgery.
   * @example TX
   */
  state?: string
}

/**
 * Redirect URI endpoint to obtain consent.
 */
export type GetAuthorizationCodeResponse = string
