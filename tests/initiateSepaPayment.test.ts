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

test.serial('should return successful response', async (t) => {
  const requestBody = {
    instructedAmount: {
      currency: "EUR",
      amount: "11"
    },
    debtorAccount: {
      iban: "NL37TRIO0320564487"
    },
    creditorAccount: {
      iban: "NL49RABO4963487330"
    },
    creditorName: "Jhon Doe",
    requestedExecutionDate: "2024-02-22",
  }

  const response = await client.initiateSepaPayment({
    ipAddr: '0.0.0.0',
    redirectUri: 'http://example.com',
    requestBody
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

test.serial('should throw error if currency is other than EUR', async (t) => {
  const requestBody = {
    instructedAmount: {
      currency: "GBP",
      amount: "11"
    },
    debtorAccount: {
      iban: "NL37TRIO0320564487"
    },
    creditorAccount: {
      iban: "NL49RABO4963487330"
    },
    creditorName: "Jhon Doe",
    requestedExecutionDate: "2024-02-22",
  }

  const error: any = await t.throwsAsync(() => client.initiateSepaPayment({
    ipAddr: '0.0.0.0',
    redirectUri: 'http://example.com',
    requestBody
  }), { instanceOf: ResponseStatusCodeError })

  t.assert(typeof error === 'object')
  t.is(error.status, 400)
})
