import { createHash, randomBytes } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import test from 'ava';
import { Triodos } from '../src/Triodos'

let client: Triodos

test.beforeEach(() => client = new Triodos({
  keyId: 'SN=1,CA=CN=Xs2aTpp.com, O=TriodosBank, OID.2.5.4.97=PSDYG-LJFPYJY-PD6RJYY, L=Zeist, C=NL',
  signingCertificate: readFileSync(join(__dirname, '/example-cert.pem'), { encoding: 'utf8' }),
  signingKey: readFileSync(join(__dirname, '/example-key.pem'), { encoding: 'utf8' }),
  tenant: 'nl'
}))

test.serial('returns successful response', async (t) => {
  const { access_token: accessToken } = await client.getInitialAccessToken()
  const { client_id } = await client.registerClient({ accessToken, redirectUris: ['http://example.com'] })

  const response = await client.getAuthorization({
    client_id,
    redirect_uri: 'http://example.com',
    scope: 'openid',
    code_challenge: createHash('sha256').update(randomBytes(32)).digest('base64'),
  })

  t.assert(typeof response === 'string');
  t.assert(response.startsWith('https://xs2a-sandbox.triodos.com/auth/internalonly/authorise.html'));
});
