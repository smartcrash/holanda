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

test.serial('throws error if resourceId and/or authorizationId does not exists', async (t) => {
  const error: any = await t.throwsAsync(
    () => client.getSepaPaymentAuthorizationStatus({ resourceId: '', authorizationId: '' }),
    { instanceOf: ResponseStatusCodeError }
  )

  t.is(error.status, 404)
  t.is(error.body.tppMessages[0].text, 'Not Found')
  t.is(error.body.tppMessages[0].category, 'ERROR')
});
