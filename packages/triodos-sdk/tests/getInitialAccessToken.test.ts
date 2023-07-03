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

test('returns successful response', async (t) => {
  const response = await client.getInitialAccessToken()

  t.assert(typeof response === 'object')
  t.assert(typeof response.scope === 'string')
  t.assert(typeof response.access_token === 'string')
  t.assert(typeof response.expires_in === 'number')
  t.assert(typeof response.token_type === 'string')
  t.assert(typeof response._links === 'object')
  t.assert(typeof response._links.registration === 'string')
});
