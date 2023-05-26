import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import test from 'ava';
import { TriodosClient, Errors } from '../src/TriodosClient'

const { ResponseStatusCodeError } = Errors

let client: TriodosClient

test.beforeEach(() => client = new TriodosClient({
  keyId: 'SN=1,CA=CN=Xs2aTpp.com, O=TriodosBank, OID.2.5.4.97=PSDGO-BES-WGXZKBYE, L=Zeist, C=NL',
  signingCertificate: readFileSync(join(__dirname, '/example-cert.pem'), { encoding: 'utf8' }),
  privateKey: readFileSync(join(__dirname, '/example-key.pem'), { encoding: 'utf8' }),
  tenant: 'nl'
}))

test.serial('getInitialAccessToken() returns successful response', async (t) => {
  const response = await client.getInitialAccessToken()

  t.assert(typeof response === 'object')
  t.assert(typeof response.scope === 'string')
  t.assert(typeof response.access_token === 'string')
  t.assert(typeof response.expires_in === 'number')
  t.assert(typeof response.token_type === 'string')
  t.assert(typeof response._links === 'object')
  t.assert(typeof response._links.registration === 'string')
});

test.serial('registerClient() returns successful response', async (t) => {
  const { access_token: accessToken } = await client.getInitialAccessToken()

  const response = await client.registerClient({ accessToken, redirectUris: ['http://example.com'] })

  t.assert(typeof response === 'object')
  t.assert(Array.isArray(response.grant_types))
  t.assert(typeof response.application_type === 'string')
  t.assert(typeof response.client_secret_expires_at === 'number')
  t.assert(Array.isArray(response.redirect_uris))
  t.assert(typeof response.client_id_issued_at === 'number')
  t.assert(typeof response.client_secret === 'string')
  t.assert(typeof response.tls_client_certificate_bound_access_tokens === 'boolean')
  t.assert(typeof response.token_endpoint_auth_method === 'string')
  t.assert(typeof response.client_id === 'string')
  t.assert(Array.isArray(response.response_types))
  t.assert(typeof response.id_token_signed_response_alg === 'string')
})

test.serial('registerClient() should return if not at least one redirect uri is given', async (t) => {
  const { access_token: accessToken } = await client.getInitialAccessToken()

  const error: any = await t.throwsAsync(
    () => client.registerClient({ accessToken, redirectUris: [] }),
    { instanceOf: Errors.ResponseStatusCodeError }
  )

  t.is(error.status, 400)
  t.is(error.body.error, 'invalid_request')
  t.is(error.body.error_description, 'There should be at least one redirect URI')
})

test.serial('registerClient() should throw if accessToken missing', async (t) => {
  const error: any = await t.throwsAsync(
    () => client.registerClient({ accessToken: '', redirectUris: ['http://example.com'] }),
    { instanceOf: Errors.ResponseStatusCodeError }
  )

  t.is(error.status, 400)
  t.is(error.body.error, 'Invalid HTTP Authorization header value')
})

test.serial('initiateSepaPayment() should return successful response', async (t) => {
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

test.serial('initiateSepaPayment() should throw error if currency is other than EUR', async (t) => {
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

test.serial('getSepaPaymentStatus() should return successful response', async (t) => {
  const { paymentId } = await client.initiateSepaPayment({
    ipAddr: '0.0.0.0',
    redirectUri: 'http://example.com',
    requestBody: {
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
  })

  const response = await client.getSepaPaymentStatus({ resourceId: paymentId })

  t.assert(typeof response === 'object')
  t.is(response.transactionStatus, 'RCVD')
})

test.serial('getSepaPaymentDetauls() should return successful response', async (t) => {
  const { paymentId } = await client.initiateSepaPayment({
    ipAddr: '0.0.0.0',
    redirectUri: 'http://example.com',
    requestBody: {
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

test.serial('initiateCrosBorderPayment() should return successful response', async (t) => {
  const requestBody = {
    instructedAmount: {
      currency: "USD",
      amount: "8.00"
    },
    debtorAccount: {
      iban: "NL37TRIO0320564487"
    },
    creditorName: "Mr Tester",
    creditorAccount: {
      iban: "NL53RABO7236495824",
    },
    chargeBearer: "SHAR",
    creditorAddress: {
      streetName: "Test st",
      buildingNumber: "26",
      townName: "Test city",
      postcode: "9999ZZ",
      country: "US"
    },
    remittanceInformationUnstructured: "Remit info",
    requestedExecutionDate: "2024-03-05"
  }
  const response = await client.initiateCrossBorderPayment({
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

test.serial('initiateCrosBorderPayment() should throw error if currency is EUR', async (t) => {
  const requestBody = {
    instructedAmount: {
      currency: "EUR",
      amount: "8.00"
    },
    debtorAccount: {
      iban: "NL37TRIO0320564487"
    },
    creditorName: "Mr Tester",
    creditorAccount: {
      iban: "NL53RABO7236495824",
    },
    chargeBearer: "SHAR",
    creditorAddress: {
      streetName: "Test st",
      buildingNumber: "26",
      townName: "Test city",
      postcode: "9999ZZ",
      country: "US"
    },
    remittanceInformationUnstructured: "Remit info",
    requestedExecutionDate: "2024-03-05"
  }
  const error: any = await t.throwsAsync(() => client.initiateCrossBorderPayment({
    ipAddr: '0.0.0.0',
    redirectUri: 'http://example.com',
    requestBody
  }))

  t.assert(typeof error === 'object')
  t.is(error.status, 400)
})
