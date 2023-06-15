import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import test from 'ava';
import { ABNClient, Errors } from '../src/ABNClient'

const { ResponseStatusCodeError } = Errors

let client: ABNClient

test.beforeEach(() => client = new ABNClient({
  clientId: 'TPP_test',
  publicCertificate: readFileSync(join(__dirname, '/public-certificate.pem'), { encoding: 'utf8' }),
  privateKey: readFileSync(join(__dirname, '/private-key.pem'), { encoding: 'utf8' }),
}))

test.serial('should return sccessful response with minimun options', async (t) => {
  const response = await client.requestAccessToken({ grantType: 'client_credentials' })

  t.assert(typeof response === 'object')
  t.assert(typeof response.access_token === 'string')
  t.is(response.token_type, 'Bearer')
  t.is(response.expires_in, 7200)
});

test.serial('should throw error if no `grantType` is passed', async (t) => {
  const error: any = await t.throwsAsync(
    () => client.requestAccessToken({ grantType: '' }),
    { instanceOf: ResponseStatusCodeError },
  );

  t.is(error.status, 400)
  t.is(error.body.error, 'invalid_request')
  t.is(error.body.error_description, 'grant_type is required')
});
