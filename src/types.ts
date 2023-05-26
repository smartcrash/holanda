/*
export type AutherizationGetOptions = {
    tenant: string
    response_type: string
    client_id: string
    redirect_uri: string
    scope: string
    code_challenge: string
    code_challenge_method: string
    id_token_hint: string
    state?: string
    nonce?: string
    response_mode?: string
    prompt?: string
    max_age?: string
}

export type AutherizationGetResponse = void
*/

export type GetInitialAccessTokenResponse = {
  scope: string
  access_token: string
  expires_in: number
  token_type: string
  _links: {
    registration: string
  }
}

export type TridosClientOptions = {
  keyId: string
  tenant: string
  signingCertificate: string
  signingKey: string
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
  transactionStatus: 'RCVD' | 'PDNG' | 'ACCP' | 'ACTC' | 'ACWC' | 'ACWP' | 'ACSP' | 'ACSC' | 'RJCT' | 'CANC' | 'PATC' | 'ACFC'
  paymentId: string
  authorisationId: string
  debtorAccount: { iban: string },
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
  transactionStatus: 'RCVD' | 'PDNG' | 'ACCP' | 'ACTC' | 'ACWC' | 'ACWP' | 'ACSP' | 'ACSC' | 'RJCT' | 'CANC' | 'PATC' | 'ACFC'
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
  transactionStatus: 'RCVD' | 'PDNG' | 'ACCP' | 'ACTC' | 'ACWC' | 'ACWP' | 'ACSP' | 'ACSC' | 'RJCT' | 'CANC' | 'PATC' | 'ACFC'
  paymentId: string
  debtorAccount: { iban: string },
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
    },
    debtorAccount: { iban: string },
    creditorName: string
    creditorAccount: { iban: string } | { foreignAccountNumber: string },
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
    },
    remittanceInformationUnstructured: string
    requestedExecutionDate: string
  }
}

export type InitiateCrossBorderPaymentResponse = {
  transactionStatus: 'RCVD' | 'PDNG' | 'ACCP' | 'ACTC' | 'ACWC' | 'ACWP' | 'ACSP' | 'ACSC' | 'RJCT' | 'CANC' | 'PATC' | 'ACFC'
  paymentId: string
  authorisationId: string
  debtorAccount: { iban: string },
  _links: {
    scaOAuth: string
    scaRedirect: string
    scaStatus: string
    self: string
    confirmation: string
    status: string
  }
}
