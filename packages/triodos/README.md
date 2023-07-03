# **Triodos SDK**

## Getting started

```ts
import fs from 'node:fs'
import { Triodos } from '@holanda'

const client = new Triodos({
  keyId: '<YOUR_KEY_ID>',
  signingCertificate: fs.readFileSync('./example-cert.pem', {
    encoding: 'utf8',
  }),
  signingKey: readFileSync('./example-key.pem', { encoding: 'utf8' }),
  tenant: 'nl',
})
```

# Examples

## **SEPA Payment Initiation**

```ts
const requestBody = {
  instructedAmount: {
    currency: 'EUR',
    amount: '11',
  },
  debtorAccount: {
    iban: 'NL86TRIO0320614433',
  },
  creditorAccount: {
    iban: 'NL49RABO4963487330',
  },
  creditorName: 'Jhon Doe',
  requestedExecutionDate: '2024-02-22',
}

const response = await client.initiateSepaPayment({
  ipAddr: '0.0.0.0',
  redirectUri: 'http://example.com',
  requestBody,
})
```
