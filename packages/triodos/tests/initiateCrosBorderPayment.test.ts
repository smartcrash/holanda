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
  const requestBody = {
    instructedAmount: {
      currency: 'USD',
      amount: '8.00',
    },
    debtorAccount: {
      iban: 'NL86TRIO0320614433',
    },
    creditorName: 'Mr Tester',
    creditorAccount: {
      iban: 'NL53RABO7236495824',
    },
    chargeBearer: 'SHAR',
    creditorAddress: {
      streetName: 'Test st',
      buildingNumber: '26',
      townName: 'Test city',
      postcode: '9999ZZ',
      country: 'US',
    },
    remittanceInformationUnstructured: 'Remit info',
    requestedExecutionDate: '2024-03-05',
  }
  const response = await client.initiateCrossBorderPayment({
    ipAddr: '0.0.0.0',
    redirectUri: 'http://example.com',
    requestBody,
  })

  t.assert(typeof response === 'object')
  t.is(response.transactionStatus, 'RCVD')
  t.assert(typeof response.paymentId === 'string')
  t.assert(typeof response.authorisationId === 'string')
  t.assert(typeof response.debtorAccount === 'object')
  t.assert(typeof response.debtorAccount.iban === 'string')
  t.assert(typeof response._links === 'object')
  t.assert(typeof response._links.scaOAuth === 'string')
  t.assert(typeof response._links.scaRedirect === 'string')
  t.assert(typeof response._links.scaStatus === 'string')
  t.assert(typeof response._links.self === 'string')
  t.assert(typeof response._links.status === 'string')
})

test.serial('should throw error if currency is EUR', async (t) => {
  const requestBody = {
    instructedAmount: {
      currency: 'EUR',
      amount: '8.00',
    },
    debtorAccount: {
      iban: 'NL86TRIO0320614433',
    },
    creditorName: 'Mr Tester',
    creditorAccount: {
      iban: 'NL53RABO7236495824',
    },
    chargeBearer: 'SHAR',
    creditorAddress: {
      streetName: 'Test st',
      buildingNumber: '26',
      townName: 'Test city',
      postcode: '9999ZZ',
      country: 'US',
    },
    remittanceInformationUnstructured: 'Remit info',
    requestedExecutionDate: '2024-03-05',
  }
  const error: any = await t.throwsAsync(() =>
    client.initiateCrossBorderPayment({
      ipAddr: '0.0.0.0',
      redirectUri: 'http://example.com',
      requestBody,
    }),
  )

  t.assert(typeof error === 'object')
  t.is(error.status, 400)
})
