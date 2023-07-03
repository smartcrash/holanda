export type TridosOptions = {
  keyId: string
  tenant: string
  signingCertificate: string
  signingKey: string
}

export type GetInitialAccessTokenResponse = {
  scope: string
  access_token: string
  expires_in: number
  token_type: string
  _links: {
    registration: string
  }
}

export type RegisterClientOptions = {
  sectorIdentifierUri?: string
  redirectUris: string[]
  accessToken: string
}

export type RegisterClientResponse = {
  grant_types: string[]
  application_type: string
  client_secret_expires_at: number
  redirect_uris: string[]
  client_id_issued_at: number
  client_secret: string
  tls_client_certificate_bound_access_tokens: boolean
  token_endpoint_auth_method: string
  client_id: string
  response_types: string[]
  id_token_signed_response_alg: string
}

export type InitiateSepaPaymentResponse = {
  transactionStatus:
    | 'RCVD'
    | 'PDNG'
    | 'ACCP'
    | 'ACTC'
    | 'ACWC'
    | 'ACWP'
    | 'ACSP'
    | 'ACSC'
    | 'RJCT'
    | 'CANC'
    | 'PATC'
    | 'ACFC'
  paymentId: string
  authorisationId: string
  debtorAccount: { iban: string }
  _links: {
    scaOAuth: string
    scaRedirect: string
    scaStatus: string
    self: string
    confirmation: string
    status: string
  }
}

export type InitiateSepaPaymentOptions = {
  ipAddr: string
  redirectUri: string
  requestBody: {
    instructedAmount: {
      currency: string
      amount: string
    }
    debtorAccount: { iban: string }
    creditorAccount: { iban: string }
    creditorName: string
    requestedExecutionDate: string
  }
}

export type GetSepaPaymentStatusOptions = {
  resourceId: string
}

export type GetSepaPaymentStatusResponse = {
  transactionStatus:
    | 'RCVD'
    | 'PDNG'
    | 'ACCP'
    | 'ACTC'
    | 'ACWC'
    | 'ACWP'
    | 'ACSP'
    | 'ACSC'
    | 'RJCT'
    | 'CANC'
    | 'PATC'
    | 'ACFC'
  /**
   * This data element is contained, if a funds check has been performed and
   * if the transactionStatus is `ACTC`, `ACWC` or `ACCP`.
   */
  fundsAvailable?: boolean
}

export type GetSepaPaymentDetailsOptions = {
  resourceId: string
}

export type GetSepaPaymentDetailsResponse = {
  transactionStatus:
    | 'RCVD'
    | 'PDNG'
    | 'ACCP'
    | 'ACTC'
    | 'ACWC'
    | 'ACWP'
    | 'ACSP'
    | 'ACSC'
    | 'RJCT'
    | 'CANC'
    | 'PATC'
    | 'ACFC'
  paymentId: string
  debtorAccount: { iban: string }
  _links: {
    self: string
    status: string
  }
}

export type InitiateCrossBorderPaymentOptions = {
  ipAddr: string
  redirectUri: string
  requestBody: {
    instructedAmount: {
      currency: string
      amount: string
    }
    debtorAccount: { iban: string }
    creditorName: string
    creditorAccount: { iban: string } | { foreignAccountNumber: string }
    /**
     * When an IBAN is not supplied for the creditor account of a Foreign Payment,
     * the creditorAgent field is mandatory.
     */
    creditorAgent?: string
    chargeBearer: string
    creditorAddress: {
      streetName: string
      buildingNumber: string
      townName: string
      postcode: string
      country: string
    }
    remittanceInformationUnstructured: string
    requestedExecutionDate: string
  }
}

export type InitiateCrossBorderPaymentResponse = {
  transactionStatus:
    | 'RCVD'
    | 'PDNG'
    | 'ACCP'
    | 'ACTC'
    | 'ACWC'
    | 'ACWP'
    | 'ACSP'
    | 'ACSC'
    | 'RJCT'
    | 'CANC'
    | 'PATC'
    | 'ACFC'
  paymentId: string
  authorisationId: string
  debtorAccount: { iban: string }
  _links: {
    scaOAuth: string
    scaRedirect: string
    scaStatus: string
    self: string
    confirmation: string
    status: string
  }
}

export type GetConfigutationResponse = {
  authorization_endpoint: string
  claim_types_supported: string[]
  claims_parameter_supported: boolean
  claims_supported: string[]
  code_challenge_methods_supported: string[]
  display_values_supported: string[]
  grant_types_supported: string[]
  id_token_signing_alg_values_supported: string[]
  issuer: string
  jwks_uri: string
  mutual_tls_sender_constrained_access_tokens: boolean
  registration_endpoint: string
  request_parameter_supported: boolean
  request_uri_parameter_supported: boolean
  require_request_uri_registration: boolean
  response_modes_supported: string[]
  response_types_supported: string[]
  revocation_endpoint: string
  revocation_endpoint_auth_methods_supported: string[]
  revocation_endpoint_auth_signing_alg_values_supported: string[]
  scopes_supported: string[]
  subject_types_supported: string[]
  token_endpoint: string
  token_endpoint_auth_methods_supported: string[]
  token_endpoint_auth_signing_alg_values_supported: string[]
  userinfo_endpoint: string
  userinfo_signing_alg_values_supported: string[]
}

export type GetAuthorizationOptions = {
  /** Always set to "code" */
  response_type?: 'code'
  client_id: string
  redirect_uri: string
  scope: string // TODO: define enum
  state?: string
  nonce?: string
  response_mode?: string
  prompt?: string
  max_age?: string
  code_challenge: string
  /** Always set to "S256" */
  code_challenge_method?: 'S256'
  id_token_hint?: string
}

export type GetAuthorizationResponse = string

export type RegisterConsentOptions = {
  /** The forwarded IP Address header field consists of the corresponding HTTP request IP Address field between PSU and TPP */
  ipAddr: string
  /** Where the transaction flow shall be redirected to after a redirect */
  redirectUri: string
  bodyParams: {
    access: {
      accounts: {
        /**  If an iban is provided then `ukSortCode` and `ukAccountNumber` should be left empty */
        iban?: string
        /** If a `foreignAccountNumber` is provided then `iban`, `ukSortCode` and `ukAccountNumber` should be left empty */
        foreignAccountNumber?: string
        /** If `ukSortCode` and `ukAccountNumber` are provided then iban should be left empty */
        ukSortCode?: string
        ukAccountNumber?: string
        currency?: string
      }[]
      balances: {
        /**  If an iban is provided then `ukSortCode` and `ukAccountNumber` should be left empty */
        iban?: string
        /** If a `foreignAccountNumber` is provided then `iban`, `ukSortCode` and `ukAccountNumber` should be left empty */
        foreignAccountNumber?: string
        /** If `ukSortCode` and `ukAccountNumber` are provided then iban should be left empty */
        ukSortCode?: string
        ukAccountNumber?: string
        currency?: string
      }[]
      transactions: {
        /**  If an iban is provided then `ukSortCode` and `ukAccountNumber` should be left empty */
        iban?: string
        /** If a `foreignAccountNumber` is provided then `iban`, `ukSortCode` and `ukAccountNumber` should be left empty */
        foreignAccountNumber?: string
        /** If `ukSortCode` and `ukAccountNumber` are provided then iban should be left empty */
        ukSortCode?: string
        ukAccountNumber?: string
        currency?: string
      }[]
    }
    /** `true`, if the consent is for recurring access to the account data. `false`, if the consent is for one access to the account data */
    recurringIndicator: boolean
    /**
     * Valid until date for the requested consent in ISODate Format e.g. "2017-10-30".
     * If a maximal available date is requested, a date in far future is to be used: "9999-12-31"
     * */
    validUntil: string
    /** This field indicates the requested maximum frequency for an access per day */
    frequencyPerDay: number
    /** Sessions are not supported. Should be to `false` */
    combinedServiceIndicator: boolean
  }
}

export type RegisterConsentResposne = {
  consentStatus: 'received' | 'valid' | 'rejected' | 'expired' | 'terminatedByTpp' | 'revokedByPsu'
  consentId: string
  authorisationId: string
  access: {
    accounts: {
      iban?: string
      foreignAccountNumber?: string
      ukSortCode?: string
      ukAccountNumber?: string
      currency?: string
    }[]
    balances: {
      iban?: string
      foreignAccountNumber?: string
      ukSortCode?: string
      ukAccountNumber?: string
      currency?: string
    }[]
    transactions: {
      iban?: string
      foreignAccountNumber?: string
      ukSortCode?: string
      ukAccountNumber?: string
      currency?: string
    }[]
  }
  recurringIndicator: boolean
  validUntil: string
  frequencyPerDay: number
  lastActionDate: string
  _links: {
    scaOAuth: string
    scaRedirect: string
    scaStatus: string
    self: string
    confirmation: string
    status: string
  }
}

export type GetTokenOptions = {
  accessToken?: string
  clientId?: string
  clientSecret?: string
  bodyParams: {
    redirect_uri?: string
    code?: string
    refresh_token?: string
    grant_type: 'implicit' | 'authorization_code' | 'refresh_token' | 'password' | 'client_credentials' | 'jwt_bearer'
    code_verifier?: string
  }
}

export type GetTokenResponse = {
  access_token: string
  scope: string
  id_token: string
  token_type: string
  expires_in: number
}

export type GetSepaPaymentAuthorisationStatusOptions = {
  resourceId: string
  authorisationId: string
}

export type SubmitSepaPaymentAuthorisationStatusOptions = {
  accessToken: string
  resourceId: string
  authorisationId: string
}

export type SubmitSepaPaymentAuthorisationStatusResponse = {
  scaStatus: string
  authorisationId: string
  _links: {
    scaStatus: string
    confirmation: string
  }
}

export type GetSepaPaymentAuthorisationStatusResponse = {
  scaStatus:
    | 'received'
    | 'psuIdentified'
    | 'psuAuthenticated'
    | 'scaMethodSelected'
    | 'started'
    | 'unconfirmed'
    | 'finalised'
    | 'failed'
    | 'exempted'
}

export type GetAccountInformationConsentStatusOptions = {
  resourceId: string
}

export type GetAccountInformationConsentStatusResponse = {
  consentStatus: 'received' | 'valid'
}

export type UpdateConsentAuthorisationWithAccessTokenOptions = {
  accessToken: string
  resourceId: string
  authorisationId: string
}

export type UpdateConsentAuthorisationWithAccessTokenResponse = {
  scaStatus:
    | 'received'
    | 'psuIdentified'
    | 'psuAuthenticated'
    | 'scaMethodSelected'
    | 'started'
    | 'unconfirmed'
    | 'finalised'
    | 'failed'
    | 'exempted'
  authorisationId: string
  _links: {
    scaStatus: string
    confirmation: string
  }
}

export type GetAccountsOptions = {
  accessToken: string
  consentId: string
  /** Not supported, should be unset */
  withBalance?: boolean
  ipAddr?: string
}

export type GetAccountsResponse = {
  accounts: {
    iban: string
    currency: string
    resourceId: string
    cashAccountType: string
    name: string
    status: string
    _links: {
      account: string
      transactions: string
      balances: string
    }
  }[]
}

export type GetAccountBalancesOptions = {
  accessToken: string
  accountId: string
  consentId: string
  ipAddr?: string
}

export type GetAccountBalancesResponse = {
  account: {
    iban: string
  }
  balances: {
    balanceType: 'closingBooked' | 'expected' | 'openingBooked' | 'interimAvailable' | 'forwardAvailable'
    balanceAmount: {
      currency: string
      amount: string
    }
    referenceDate: string
    creditLimitIncluded: boolean
  }[]
}

export type GetAccountTransactionsOptions = {
  consentId: string
  accessToken: string
  ipAddr?: string
  accountId: string
  bookingStatus: 'booked' | 'pending' | 'both'
  dateFrom: Date
  /** End date (inclusive the data dateTo) of the transaction list, default is now if not given. */
  dateTo?: Date
  /** Not supported, should be unset */
  withBalance?: boolean
  /** Not supported, should be unset */
  entryReferenceFrom?: string
  /** Not supported, should be unset */
  deltaList?: boolean
  /** Pagination edge token, to be used when paging through transactions */
  edgeToken: {
    edgeTokenTransactionTimestamp: string
    edgeTokenTransactionID: { temporaryKey: boolean }
    bookingStatus: 'booked' | 'pending' | 'both' | 'information' | 'all'
    dateFrom: string
    dateTo: string
  }
}

type Transaction = {
  transactionId: string
  bookingDate: string
  valueDate: string
  transactionAmount: {
    currency: string
    amount: string
  }
  creditorName?: string
  creditorAccount?: {
    iban: string
  }
  debtorName?: string
  debtorAccount?: {
    iban: string
  }
  remittanceInformationUnstructured: string
  proprietaryBankTransactionCode: string
  endToEndIdentification: string
}

export type GetAccountTransactionsResponse = {
  account: {
    iban: string
  }
  transactions: {
    booked?: Transaction[]
    pending?: Transaction[]
    _links: {
      account: string
      first: string
      next?: string
    }
  }
}

export type DeleteAccountInformationServiceConsentOptions = {
  resourceId: string
}

export type DeleteAccountInformationServiceConsentResponse = boolean
