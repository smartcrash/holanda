import test from 'ava'
import { RaboPremium } from '../src/RaboPremium'

let client: RaboPremium

test.beforeEach(() => (client = new RaboPremium({ clientId: '4225fcd061965924da6e3fe519cbe32a' })))

test.serial('should return correct URI', async (t) => {
  const response = client.getAuthorizationCode({
    responseType: 'code',
    scope: 'bai.accountinformation.read',
    redirectUri: 'http://example.com',
    state: '12345',
  })

  t.true(response.startsWith('https://oauth-sandbox.rabobank.nl/openapi/sandbox/oauth2-premium/authorize'))
  t.true(response.includes('scope=bai.accountinformation.read'))
  t.true(response.includes('response_type=code'))
  t.true(response.includes('client_id='))
  t.true(response.includes(`redirect_uri=${encodeURIComponent('http://example.com')}`))
  t.true(response.includes(`state=12345`))
})
