# **Triodos SDK**

## Getting started

```ts
import fs from "node:fs";
import { TriodosClient } from "@holanda";

const client = new TriodosClient({
  keyId: "<YOUR_KEY_ID>",
  signingCertificate: fs.readFileSync("./example-cert.pem", {
    encoding: "utf8",
  }),
  signingKey: readFileSync("./example-key.pem", { encoding: "utf8" }),
  tenant: "nl",
});
```

# Examples

## **SEPA Payment Initiation**

```ts
const requestBody = {
  instructedAmount: {
    currency: "EUR",
    amount: "11",
  },
  debtorAccount: {
    iban: "NL37TRIO0320564487",
  },
  creditorAccount: {
    iban: "NL49RABO4963487330",
  },
  creditorName: "Jhon Doe",
  requestedExecutionDate: "2024-02-22",
};

const response = await client.initiateSepaPayment({
  ipAddr: "0.0.0.0",
  redirectUri: "http://example.com",
  requestBody,
});
```

### **TODO**

- [+] Add boilerplate for missing methods, should throw
  `new Error('Not Implemented')`
- [+] Organize test files
- [ ] Inistantiate lerna project
- [+] Rename options `signingCertificate` to `certificate`
- [ ] Add Prettier and ESLint
- [ ] Add example of complete payment initiation
