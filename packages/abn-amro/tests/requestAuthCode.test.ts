import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import test from 'ava'
import { ABNAmro } from '../src/ABNAmro'
import { ABNAmroScopes } from '../src/enums'

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

test.serial('should return redirect URL', async (t) => {
  const response = await client.requestAuthCode({
    scope: [ABNAmroScopes.PostSEPAPayment],
    redirectUri: 'https://localhost/auth',
    responseType: 'code',
  })

  t.is(typeof response, 'string')
  t.true(response.startsWith('https://auth-sandbox.abnamro.com/as/authorization.oauth2?'))
  t.true(response.includes('client_id=TPP_test'))
  t.true(response.includes(`redirect_uri=${encodeURIComponent('https://localhost/auth')}`))
  t.true(response.includes('response_type=code'))
  t.true(response.includes(`scope=${encodeURIComponent(ABNAmroScopes.PostSEPAPayment)}`))
})
