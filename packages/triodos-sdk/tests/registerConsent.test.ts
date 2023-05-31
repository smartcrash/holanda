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

  const response = await client.registerConsent({
    ipAddr: '0.0.0.0',
    redirectUri: 'http://example.com',
    bodyParams,
  })

  t.assert(typeof response === 'object')
  t.is(response.consentStatus, 'received')
  t.assert(typeof response.consentId === 'string')
  t.assert(typeof response.authorisationId === 'string')
  t.assert(typeof response.access === 'object')
  t.assert(Array.isArray(response.access.accounts))
  t.assert(Array.isArray(response.access.balances))
  t.assert(Array.isArray(response.access.transactions))
  t.assert(typeof response.recurringIndicator === 'boolean')
  t.assert(typeof response.validUntil === 'string')
  t.assert(typeof response.frequencyPerDay === 'number')
  t.assert(typeof response.lastActionDate === 'string')
  t.assert(typeof response._links === 'object')
  t.assert(typeof response._links.scaOAuth === 'string')
  t.assert(typeof response._links.scaRedirect === 'string')
  t.assert(typeof response._links.scaStatus === 'string')
  t.assert(typeof response._links.self === 'string')
  t.assert(typeof response._links.status === 'string')
  t.assert(typeof response._links.confirmation === 'string')
});
