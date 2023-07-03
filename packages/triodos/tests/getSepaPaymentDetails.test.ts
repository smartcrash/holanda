import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import test from 'ava'
import { Triodos } from '../src/Triodos'

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

test.serial('should return successful response', async (t) => {
  const { paymentId } = await client.initiateSepaPayment({
    ipAddr: '0.0.0.0',
    redirectUri: 'http://example.com',
    requestBody: {
      instructedAmount: {
        currency: 'EUR',
        amount: '11',
      },
      debtorAccount: {
        iban: 'NL86TRIO0320614433',
      },
      creditorAccount: {
        iban: 'NL49RABO4963487330',
      },
      creditorName: 'Jhon Doe',
      requestedExecutionDate: '2024-02-22',
    },
  })

  const response = await client.getSepaPaymentDetails({ resourceId: paymentId })

  t.assert(typeof response === 'object')
  t.is(response.transactionStatus, 'RCVD')
  t.is(response.paymentId, paymentId)
  t.assert(typeof response.debtorAccount === 'object')
  t.assert(typeof response.debtorAccount.iban === 'string')
  t.assert(typeof response._links === 'object')
  t.assert(typeof response._links.self === 'string')
  t.assert(typeof response._links.status === 'string')
})
