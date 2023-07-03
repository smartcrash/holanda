import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import test from 'ava'
import { Triodos, Errors } from '../src/Triodos'

let client: Triodos

test.beforeEach(
  () =>
    (client = new Triodos({
      keyId: 'SN=1,CA=CN=Xs2aTpp.com, O=TriodosBank, OID.2.5.4.97=PSDYG-LJFPYJY-PD6RJYY, L=Zeist, C=NL',
      signingCertificate: readFileSync(join(__dirname, '/example-cert.pem'), { encoding: 'utf8' }),
      signingKey: readFileSync(join(__dirname, '/example-key.pem'), { encoding: 'utf8' }),
      tenant: 'nl',
    })),
)

test.serial('returns successful response', async (t) => {
  const { access_token: accessToken } = await client.getInitialAccessToken()

  const response = await client.registerClient({ accessToken, redirectUris: ['http://example.com'] })

  t.assert(typeof response === 'object')
  t.assert(Array.isArray(response.grant_types))
  t.assert(typeof response.application_type === 'string')
  t.assert(typeof response.client_secret_expires_at === 'number')
  t.assert(Array.isArray(response.redirect_uris))
  t.assert(typeof response.client_id_issued_at === 'number')
  t.assert(typeof response.client_secret === 'string')
  t.assert(typeof response.tls_client_certificate_bound_access_tokens === 'boolean')
  t.assert(typeof response.token_endpoint_auth_method === 'string')
  t.assert(typeof response.client_id === 'string')
  t.assert(Array.isArray(response.response_types))
  t.assert(typeof response.id_token_signed_response_alg === 'string')
})

test.serial('should return if not at least one redirect uri is given', async (t) => {
  const { access_token: accessToken } = await client.getInitialAccessToken()

  const error: any = await t.throwsAsync(() => client.registerClient({ accessToken, redirectUris: [] }), {
    instanceOf: Errors.ResponseStatusCodeError,
  })

  t.is(error.status, 400)
  t.is(error.body.error, 'invalid_request')
  t.is(error.body.error_description, 'There should be at least one redirect URI')
})

test.serial('should throw if accessToken missing', async (t) => {
  const error: any = await t.throwsAsync(
    () => client.registerClient({ accessToken: '', redirectUris: ['http://example.com'] }),
    { instanceOf: Errors.ResponseStatusCodeError },
  )

  t.is(error.status, 400)
  t.is(error.body.error, 'Invalid HTTP Authorization header value')
})
