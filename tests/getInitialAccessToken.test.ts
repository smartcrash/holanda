import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import test from 'ava';
import { TriodosClient } from '../src/TriodosClient'

let client: TriodosClient

test.beforeEach(() => client = new TriodosClient({
  keyId: 'SN=1,CA=CN=Xs2aTpp.com, O=TriodosBank, OID.2.5.4.97=PSDGO-BES-WGXZKBYE, L=Zeist, C=NL',
  signingCertificate: readFileSync(join(__dirname, '/example-cert.pem'), { encoding: 'utf8' }),
  privateKey: readFileSync(join(__dirname, '/example-key.pem'), { encoding: 'utf8' }),
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
