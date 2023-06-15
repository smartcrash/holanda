import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import test from 'ava';
import { ABNClient } from '../src/ABNClient'
import { Scopes } from '../src/enums';

let client: ABNClient

test.beforeEach(() => client = new ABNClient({
  clientId: 'TPP_test',
  publicCertificate: readFileSync(join(__dirname, '/public-certificate.pem'), { encoding: 'utf8' }),
  privateKey: readFileSync(join(__dirname, '/private-key.pem'), { encoding: 'utf8' }),
}))

test.serial('should return redirect URL', async (t) => {
  const response = await client.requestAuthCode({
    scope: [Scopes.PostSEPAPayment, Scopes.PostSEPAStandingOrderPayment, Scopes.PostXBorderPayment],
    redirectUri: "https://localhost/auth",
    responseType: 'code'
  })

  t.is(typeof response, 'string')
  t.true(response.startsWith('https://asb-consent'))
});
