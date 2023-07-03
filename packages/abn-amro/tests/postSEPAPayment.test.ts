import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import test from 'ava'
import { ABNAmro, Errors } from '../src/ABNAmro'
import { ABNAmroScopes } from '../src/enums'

const { ResponseStatusCodeError } = Errors

let client: ABNAmro

test.beforeEach(
  () =>
    (client = new ABNAmro({
      apiKey: 'u8cVObtL8jnUbdAGc4ji1ybp08OoCrQg',
      clientId: 'TPP_test',
      publicCertificate: readFileSync(join(__dirname, '/public-certificate.pem'), { encoding: 'utf8' }),
      privateKey: readFileSync(join(__dirname, '/private-key.pem'), { encoding: 'utf8' }),
    })),
)

test.serial('should return successful response', async (t) => {
  const { access_token: accessToken } = await client.requestAccessToken({
    grantType: 'client_credentials',
    scope: [ABNAmroScopes.PostSEPAPayment],
  })

  const response = await client.postSEPAPayment({
    accessToken,
    counterpartyName: 'John Doe',
    counterpartyAccountNumber: 'NL12ABNA9999876523',
    amount: 149.99,
  })

  t.assert(typeof response === 'object')
  t.assert(typeof response.transactionId === 'string')
  t.is(response.status, 'STORED')
})

test.serial('throws if Token have insuficient scopes', async (t) => {
  const { access_token: accessToken } = await client.requestAccessToken({
    grantType: 'client_credentials',
    scope: [],
  })

  const error: any = await t.throwsAsync(
    () =>
      client.postSEPAPayment({
        accessToken,
        counterpartyName: 'John Doe',
        counterpartyAccountNumber: 'NL12ABNA9999876523',
        amount: 149.99,
      }),
    { instanceOf: ResponseStatusCodeError },
  )

  t.assert(typeof error === 'object')
  t.is(error.status, 403)
  t.is(error.statusCode, 403)
  t.is(error.body.errors.length, 1)
  t.is(error.body.errors[0].message, 'Insufficient scope of the token.Token cannot be used for this call.')
  t.is(error.body.errors[0].category, 'INSUFFICIENT_SCOPE')
  t.is(error.body.errors[0].code, 'ERR_3002_003')
})
