import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import test from 'ava';
import { TriodosClient } from '../src/TriodosClient'

let client: TriodosClient

test.beforeEach(() => client = new TriodosClient({
  keyId: 'SN=1,CA=CN=Xs2aTpp.com, O=TriodosBank, OID.2.5.4.97=PSDGO-BES-WGXZKBYE, L=Zeist, C=NL',
  signingCertificate: readFileSync(join(__dirname, '/example-cert.pem'), { encoding: 'utf8' }),
  signingKey: readFileSync(join(__dirname, '/example-key.pem'), { encoding: 'utf8' }),
  tenant: 'nl'
}))

test.serial('returns successful response', async (t) => {
  const bodyParams = {
    access: {
      accounts: [],
      balances: [],
      transactions: [],
    },
    recurringIndicator: true,
    validUntil: '9999-12-31',
    frequencyPerDay: 4,
    combinedServiceIndicator: false,
  };

  const { consentId } = await client.registerConsent({
    ipAddr: '0.0.0.0',
    redirectUri: 'http://example.com',
    bodyParams,
  })

  const response = await client.getAccountInformationConsentStatus({ resourceId: consentId })

  t.assert(typeof response === 'object')
  t.is(response.consentStatus, 'received')
});
