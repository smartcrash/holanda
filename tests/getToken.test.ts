import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import test from 'ava';
import { TriodosClient, Errors } from '../src/TriodosClient'

const { ResponseStatusCodeError } = Errors

let client: TriodosClient

test.beforeEach(() => client = new TriodosClient({
  keyId: 'SN=1,CA=CN=Xs2aTpp.com, O=TriodosBank, OID.2.5.4.97=PSDGO-BES-WGXZKBYE, L=Zeist, C=NL',
  signingCertificate: readFileSync(join(__dirname, '/example-cert.pem'), { encoding: 'utf8' }),
  signingKey: readFileSync(join(__dirname, '/example-key.pem'), { encoding: 'utf8' }),
  tenant: 'nl'
}))

test.serial('returns error is code is empty', async (t) => {
  const { access_token: accessToken } = await client.getInitialAccessToken()
  const error: any = await t.throwsAsync(
    () => client.getToken({ accessToken, bodyParams: { grant_type: 'authorization_code', code: '' } }),
    { instanceOf: ResponseStatusCodeError }
  )

  t.is(error.status, 400)
  t.is(error.body.error, 'invalid_request')
  t.is(error.body.error_description, 'Invalid authorization code')
});
