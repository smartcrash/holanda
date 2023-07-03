import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import test from 'ava';
import { ABNClient, Errors } from '../src/ABNClient'
import { ABNScopes } from '../src/enums';

const { ResponseStatusCodeError } = Errors

let client: ABNClient

test.beforeEach(() => client = new ABNClient({
  apiKey: 'u8cVObtL8jnUbdAGc4ji1ybp08OoCrQg',
  clientId: 'TPP_test',
  publicCertificate: readFileSync(join(__dirname, '/public-certificate.pem'), { encoding: 'utf8' }),
  privateKey: readFileSync(join(__dirname, '/private-key.pem'), { encoding: 'utf8' }),
}))

test.serial('should return successful response', async (t) => {
  const { access_token: accessToken } = await client.requestAccessToken({
    grantType: 'client_credentials',
    scope: [ABNScopes.PostSEPAPayment],
  })

  const response = await client.getConsentInfo({ accessToken })

  t.assert(typeof response === 'object')
  t.assert(typeof response.valid === 'number')
  t.is(response.scopes, ABNScopes.PostSEPAPayment)
  t.is(response.consentStatus, 'FULLY_SIGNED')
  t.is(response.consentExpiresIn, '2 days, 2 hours, 2 minutes, and 2 seconds')
});

test.serial('should throw with accessToken', async (t) => {
  const error: any = await t.throwsAsync(
    () => client.getConsentInfo({ accessToken: '1234567890' }),
    { instanceOf: ResponseStatusCodeError }
  )

  t.is(error.status, 401)
  t.is(error.statusCode, 401)
  t.assert(Array.isArray(error.body.errors))
  t.is(error.body.errors.length, 1)
  t.is(error.body.errors[0].category, 'INVALID_ACCESS_TOKEN')
  t.is(error.body.errors[0].message, 'The presented access token is not valid or expired')
});
