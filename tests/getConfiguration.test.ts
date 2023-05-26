import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import test from 'ava';
import { TriodosClient } from '../src/TriodosClient'

let client: TriodosClient

test.beforeEach(() => client = new TriodosClient({
  keyId: 'SN=1,CA=CN=Xs2aTpp.com, O=TriodosBank, OID.2.5.4.97=PSDGO-BES-WGXZKBYE, L=Zeist, C=NL',
  signingCertificate: readFileSync(join(__dirname, '/example-cert.pem'), { encoding: 'utf8' }),
  signingKey: readFileSync(join(__dirname, '/example-key.pem'), { encoding: 'utf8' }),
  tenant: 'nl'
}))

test.only('returns successful response', async (t) => {
  const response = await client.getConfiguration()

  t.assert(typeof response === 'object')
  t.assert(typeof response.authorization_endpoint === 'string')
  t.assert(Array.isArray(response.claim_types_supported))
  t.assert(typeof response.claims_parameter_supported === 'boolean')
  t.assert(Array.isArray(response.claims_supported))
  t.assert(Array.isArray(response.code_challenge_methods_supported))
  t.assert(Array.isArray(response.display_values_supported))
  t.assert(Array.isArray(response.grant_types_supported))
  t.assert(Array.isArray(response.id_token_signing_alg_values_supported))
  t.assert(typeof response.issuer === 'string')
  t.assert(typeof response.jwks_uri === 'string')
  t.assert(typeof response.mutual_tls_sender_constrained_access_tokens === 'boolean')
  t.assert(typeof response.registration_endpoint === 'string')
  t.assert(typeof response.request_parameter_supported === 'boolean')
  t.assert(typeof response.request_uri_parameter_supported === 'boolean')
  t.assert(typeof response.require_request_uri_registration === 'boolean')
  t.assert(Array.isArray(response.response_modes_supported))
  t.assert(Array.isArray(response.response_types_supported))
  t.assert(typeof response.revocation_endpoint === 'string')
  t.assert(Array.isArray(response.revocation_endpoint_auth_methods_supported))
  t.assert(Array.isArray(response.revocation_endpoint_auth_signing_alg_values_supported))
  t.assert(Array.isArray(response.scopes_supported))
  t.assert(Array.isArray(response.subject_types_supported))
  t.assert(typeof response.token_endpoint === 'string')
  t.assert(Array.isArray(response.token_endpoint_auth_methods_supported))
  t.assert(Array.isArray(response.token_endpoint_auth_signing_alg_values_supported))
  t.assert(typeof response.userinfo_endpoint === 'string')
  t.assert(Array.isArray(response.userinfo_signing_alg_values_supported))
});
