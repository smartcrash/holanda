import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import test from 'ava'
import { Triodos, Errors } from '../src/Triodos'

const { ResponseStatusCodeError } = Errors

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

test.serial('throws error if resourceId and/or authorizationId does not exists', async (t) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const error: any = await t.throwsAsync(
    () => client.getSepaPaymentAuthorisationStatus({ resourceId: '', authorisationId: '' }),
    { instanceOf: ResponseStatusCodeError },
  )

  t.is(error.status, 404)
  t.is(error.body.tppMessages[0].text, 'Not Found')
  t.is(error.body.tppMessages[0].category, 'ERROR')
})
