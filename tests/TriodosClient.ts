import test from 'ava';
import { v4 as uuidv4 } from 'uuid'
import { TriodosClient, Errors } from '../src/TriodosClient'

const signingCertificate = `-----BEGIN CERTIFICATE-----
MIIEmDCCA4CgAwIBAgIBATANBgkqhkiG9w0BAQsFADBmMQswCQYDVQQGEwJOTDEOMAwGA1UEBxMFWmVpc3QxGzAZBgNVBGETElBTREdPLUJFUy1XR1haS0JZRTEUMBIGA1UEChMLVHJpb2Rvc0JhbmsxFDASBgNVBAMTC1hzMmFUcHAuY29tMB4XDTIzMDUxNTE1MTkwNVoXDTI1MDUyMjE1MTkwNVowdzELMAkGA1UEBhMCTkwxEDAOBgNVBAcTB1V0cmVjaHQxGjAYBgNVBGETEVBTRE5MLUROQi1SMDAwMDAwMRcwFQYDVQQKEw5EaWVnbyBEYSdTaWx2YTEhMB8GA1UEAxMYeHMyYS1zYW5kYm94LnRyaW9kb3MuY29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnck+idrIoZ4/flE98CLKgUmqfvlxZ3+uhmSysIXgCy/gNUdH77cY9zIojUR2/sYD+X0lDH5Jj1uLFzu7XZaO16LRL+UW+gl/BA0/UsgWmEv5PW3NOEhXhFEKFZyMXdGvMGcUOyj3fdeGhXJh9BZB0PKR681hve9kGSn+ER0yi1UVqiP1XJ8tJOdy77kEVjLF5qU2+dJmzmzf0Js1iRI4oGaXnaEC7Nz2NScAj4eJlhfy+IXfaxibte+V14qWo2IfMruyPxXr/j2XCWz6ixdZmezioZjZUA6NKdiaCqrlmF1KteQHvzVw4qeZdTd5FW/zUF44jSO2Z7XAoJl8Bb5A8QIDAQABo4IBPjCCATowDAYDVR0TAQH/BAIwADCBkAYDVR0jBIGIMIGFgBQIceqshLew84gIBmMxmTsbtKYMm6FqpGgwZjELMAkGA1UEBhMCTkwxDjAMBgNVBAcTBVplaXN0MRswGQYDVQRhExJQU0RHTy1CRVMtV0dYWktCWUUxFDASBgNVBAoTC1RyaW9kb3NCYW5rMRQwEgYDVQQDEwtYczJhVHBwLmNvbYIBATAdBgNVHQ4EFgQUx+RFF6elAebCCUDGPfdJhE8RzlMwDgYDVR0PAQH/BAQDAgKkMGgGCCsGAQUFBwEDAQH/BFkwVzBVBgYEAIGYJwIwSzA5MBEGBwQAgZgnAQIMBlBTUF9QSTARBgcEAIGYJwEDDAZQU1BfQUkwEQYHBACBmCcBBAwGUFNQX0lDDAduY2FOYW1lDAVuY2FJZDANBgkqhkiG9w0BAQsFAAOCAQEAZ7g+kb6YNFW1TxoN95nfY+pLf6IV1hbtK9GFjXQky2qmTUEzjavWW2Gdg7hYG5rWmt4WcbX5lr29wfp05U92ViciyOYpeCkznWFezAyv2s7lmAoIQu4m/eMKmZjrQz2kBFeSpe/6Zpta9aPlzqIcFawbZbXbGjA6NJf5e/P076bwwBHuIVumGEnaw2HrOZ1eTADyTNekBtaXO2ixwjUFi70H1vPOgX+W6F4Q92dYQZLmQsbVvwFUxDU3tWB3ni5QC5t9cL3C58lPKVIyolnfhTPo3k4uLiFkf4hd+t8v0wTL+pZH+KkI0MKO+6HWvlD00NNAdo/oxoZtPKhNItr7ZA==
-----END CERTIFICATE-----`
const privateKey = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCdyT6J2sihnj9+UT3wIsqBSap++XFnf66GZLKwheALL+A1R0fvtxj3MiiNRHb+xgP5fSUMfkmPW4sXO7tdlo7XotEv5Rb6CX8EDT9SyBaYS/k9bc04SFeEUQoVnIxd0a8wZxQ7KPd914aFcmH0FkHQ8pHrzWG972QZKf4RHTKLVRWqI/Vcny0k53LvuQRWMsXmpTb50mbObN/QmzWJEjigZpedoQLs3PY1JwCPh4mWF/L4hd9rGJu175XXipajYh8yu7I/Fev+PZcJbPqLF1mZ7OKhmNlQDo0p2JoKquWYXUq15Ae/NXDip5l1N3kVb/NQXjiNI7ZntcCgmXwFvkDxAgMBAAECggEAIYS4tkw1xq95SXo0sCiT4Dcn8uVGg/gJuR73Hqyx1W6MMIU98Nxyf0C2gJwEs0aZXYyKLEc/lSabO4pC2TS8j25VBdmisecGhnPR+eHretrYzYXfzI8BmGgmvkSNRPjgQGYFVDP1r1PzjbGowVNhE+QTv4XXt6N9HiNfh38uV46cAVhllituq1/sdZq45bIqK7W93LCnYk99O2CfpLIM2D94PDTEht1pqn1C/QBZYN0G7ISU94gVykZl0SVIuVvN2hubXYIXHjZWBJL27dKTTUVdu7JFzprWBmknitOPzAS+c7Nvjvr7not5+L4Gdj6xBSgJfkEL/vBg+dsYq2Cj4QKBgQDW0AaZcvNnBJc64ce/SkFjVzTEvB0TmlZfQBNLoYCrPG3Hs02phFTr0BYj/XoEQXxh/gN/7IGhCBoGYca2rHI1pbB1IxjWhOVRUifjBm7S+A8NazSbbQqD1aTW5Rj+Dru9k6MRCzYc/rgotW4IhBjwa2NGHi5capF9Vlh/TRVq5QKBgQC8Chmzd3+gfTx5HtZ8wU3hQc5YFcvngTEZky50dBi2uLxOZSPbh5vHnFxDPsRBYeBg9QB9D4GDqgr1On+L/g/irObzPfFzd/5/QQ1+xYp1f1I/jNDZ8wnV5IcPwI/VYLnQpZ7w2RhAQrAQuN97viYmKm5pqCwkxhSibRRnlalBHQKBgQC7XJKFAPhAIIbvesLInDHQPd3uwszxriorxi2OR/18Xaa7Ci9w7dVMISFOnuXwFFYy+mV/DIA8Pl7Etj+mUV8EX9I7OTOO2DdT6L6Vi6TaKjam05z8++yx9IRkU0qrPZqOzdjrIsY+IAXsq+KfVuiRunjKTcTOIr1nfwqNbmSB6QKBgAuoWKWOsAPkH76mkceUOF7RtJgzabvFf6TFQikIFYwmcc4uaQWwJ5E9eV7V4lbnWYDJT6lxL6dZAGrpoISuUI/OBldoLLLq6oU7JDoKxyW3qgK0mTIZ5i8zhsgMOR6Sa5Kq4equmtlJCR9QRtKmHDlbghLc0TfKa/cR6iTt21tlAoGBAKhegcGHyo4U9iMDnrSROcWo6USRLzZzlgniRJ2MvpIoQqJdue0yo4ZvxQgTB9NJMMwCWJyjdRYszhLchOAfK+F610FfOXZkEPIyQ+hLlDWPvDILs1yD92IQL22GxKkonm4fuiLQqPujyQgLjFGtmL6XanOy3ITU7Ck2upQXys4s
-----END PRIVATE KEY-----`
const keyId = 'SN=1,CA=CN=Xs2aTpp.com, O=TriodosBank, OID.2.5.4.97=PSDGO-BES-WGXZKBYE, L=Zeist, C=NL';

let client: TriodosClient

test.beforeEach(() => client = new TriodosClient({ keyId, signingCertificate, privateKey, tenant: 'nl' }))

test.serial('getInitialAccessToken() returns successful response', async (t) => {
  const response = await client.getInitialAccessToken()

  t.assert(typeof response === 'object')
  t.assert(typeof response.scope === 'string')
  t.assert(typeof response.access_token === 'string')
  t.assert(typeof response.expires_in === 'number')
  t.assert(typeof response.token_type === 'string')
  t.assert(typeof response._links === 'object')
  t.assert(typeof response._links.registration === 'string')
});

test.serial('registerClient() returns successful response', async (t) => {
  const { access_token: accessToken } = await client.getInitialAccessToken()

  const response = await client.registerClient({ accessToken, redirectUris: ['http://example.com'] })

  t.assert(typeof response === 'object')
  t.assert(Array.isArray(response.grant_types))
  t.assert(typeof response.application_type === 'string')
  t.assert(typeof response.client_secret_expires_at === 'number')
  t.assert(Array.isArray(response.redirect_uris))
  t.assert(typeof response.client_id_issued_at === 'number')
  t.assert(typeof response.client_secret === 'string')
  t.assert(typeof response.tls_client_certificate_bound_access_tokens === 'boolean')
  t.assert(typeof response.token_endpoint_auth_method === 'string')
  t.assert(typeof response.client_id === 'string')
  t.assert(Array.isArray(response.response_types))
  t.assert(typeof response.id_token_signed_response_alg === 'string')
})

test.serial('registerClient() should return if not at least one redirect uri is given', async (t) => {
  const { access_token: accessToken } = await client.getInitialAccessToken()

  const error: any = await t.throwsAsync(
    () => client.registerClient({ accessToken, redirectUris: [] }),
    { instanceOf: Errors.ResponseStatusCodeError }
  )

  t.is(error.status, 400)
  t.is(error.body.error, 'invalid_request')
  t.is(error.body.error_description, 'There should be at least one redirect URI')
})

test.serial('registerClient() should throw if accessToken missing', async (t) => {
  const error: any = await t.throwsAsync(
    () => client.registerClient({ accessToken: '', redirectUris: ['http://example.com'] }),
    { instanceOf: Errors.ResponseStatusCodeError }
  )

  t.is(error.status, 400)
  t.is(error.body.error, 'Invalid HTTP Authorization header value')
})

test.serial('initiateSepaPayment() should return successful response', async (t) => {
  const requestBody = {
    instructedAmount: {
      currency: "EUR",
      amount: "11"
    },
    debtorAccount: {
      iban: "NL37TRIO0320564487"
    },
    creditorAccount: {
      iban: "NL49RABO4963487330"
    },
    creditorName: "Jhon Doe",
    requestedExecutionDate: "2024-02-22",
  }

  const response = await client.initiateSepaPayment({
    ipAddr: '0.0.0.0',
    redirectUri: 'http://example.com',
    requestBody
  })

  t.assert(typeof response === 'object')
  t.is(response.transactionStatus, 'RCVD')
  t.assert(typeof response.paymentId === 'string')
  t.assert(typeof response.authorisationId === 'string')
  t.assert(typeof response.debtorAccount === 'object')
  t.assert(typeof response.debtorAccount.iban === 'string')
  t.assert(typeof response._links === 'object')
  t.assert(typeof response._links.scaOAuth === 'string')
  t.assert(typeof response._links.scaRedirect === 'string')
  t.assert(typeof response._links.scaStatus === 'string')
  t.assert(typeof response._links.self === 'string')
  t.assert(typeof response._links.status === 'string')
})

test.serial('getSepaPaymentStatus() should return successful response', async (t) => {
  const { paymentId } = await client.initiateSepaPayment({
    ipAddr: '0.0.0.0',
    redirectUri: 'http://example.com',
    requestBody: {
      instructedAmount: {
        currency: "EUR",
        amount: "11"
      },
      debtorAccount: {
        iban: "NL37TRIO0320564487"
      },
      creditorAccount: {
        iban: "NL49RABO4963487330"
      },
      creditorName: "Jhon Doe",
      requestedExecutionDate: "2024-02-22",
    }
  })

  const response = await client.getSepaPaymentStatus({ resourceId: paymentId })

  t.assert(typeof response === 'object')
  t.is(response.transactionStatus, 'RCVD')
})
