import { RaboPremiumScopes } from './enums'

export type RaboPremiumOptions = {
  /**
   * This ID uniquely identifies your registered application. The client_id is registered at Rabobank Developer Portal.
   * @example 06d46060-c193-41a8-9867-c9f06a1e52a2
   */
  clientId: string
  /**
   * Client secret as provided by the Rabobank developer portal.
   */
  clientSecret: string
  /**
   * Private key
   */
  key: string
  /**
   * Signing certificate
   */
  cert: string
}

export type GetAuthorizationCodeOptions = {
  /**
   * The value `code` indicates the authorization grant flow. Other response types are currently not supported.
   * @example code
   */
  responseType: 'code'
  /**
   * A space separated list of scopes. Scopes represent permissions to resources
   * which your application requests from the user.
   * @example bip.payments.write
   */
  scope: RaboPremiumScopes[] | string

  /**
   * We do not support dynamic redirect URIs. Please make sure that you have
   * provided the "OAuth Redirect URI" in your application settings.
   * If you use this parameter it has to be exactly the same as the value in
   * your application settings.
   * @example https://localhost/auth
   */
  redirectUri?: string
  /**
   * An opaque value used by the client to maintain state between the request
   * and callback. The authorization server includes this value as a request
   * parameter when redirecting the user back to the redirect URI of the client.
   * The parameter **SHOULD** be used for preventing cross-site request forgery.
   * @example TX
   */
  state?: string
}

/**
 * Redirect URI endpoint to obtain consent.
 */
export type GetAuthorizationCodeResponse = string

export type RequestAccessTokenOptions = {
  /**
   * Type of grant.
   * @example refresh_token
   */
  grantType: 'authorization_code' | 'refresh_token'
  /**
   * Authorization code provided by the /oauth2-premium/authorize endpoint.
   * @example AAIRLkC40xlyomUDGuo90rseWaROvSp-4TLYBx1fGpPaMHoDbiBDS6Qe35IC77dn3A-Vg6N8WrZApXEBoF83HO5Mrv7YJ2TLoESI3xGQ9CeAm-6ymuy2Iek9Dxf5gs1vm7KKMN-d8u8AmC1c0P3vKzx6RTKShUPkVTcfuaupLMRMt1mUGUo8V_ZD-vFKEcba2d4XvddfELhCJ955Xaqhy8uid5-4M_5XZb6lvreOoHFyb22A_amEIKviGsacoZNKOy4GcfdXTSiJ1HbvMaoatnuH5KXtAZ2Gv6W67D76JIjEIafKG0pL4at0jESrtU1gmMW58bdOVH1_jhkqGeY8PHCh-UQ-ZcSflaMwr6rZxSqWuL1vmvrH0t3ULqyC25tM9SE
   */
  code?: string
  /**
   * Required only if the redirect_uri parameter was included in the authorization
   * request /oauth2-premium/authorize; their values MUST be identical.
   * @example https://localhost/auth
   */
  redirectUri?: string
  /**
   * The refresh token that the client wants to exchange for a new access
   * token (refresh_token grant_type)
   */
  refreshToken?: string
}

export type RequestAccessTokenResponse = {
  token_type: string
  access_token: string
  expires_in: number
  /**
   * Epoch timestamp in seconds of the time when the consent was given.
   */
  consented_on?: number
  /**
   * The scopes for consent has been given. The oauth2.consents.read is given by
   * default and can be used to retrieve consent details from the Consent details API
   * @example bip.payments.write oauth2.consents.read 52807440-2c6a-4b23-9e17-ee34ea43b2f4_bip.payments.write
   */
  scope?: string
  refresh_token?: string
  /** The time in seconds that the refresh token can be used. */
  refresh_token_expires_in?: number
  /**
   * The metadata containing the consentId for a given consent. This `consentId`
   * can be used to retrieve the consent from the consent Details API.
   * This property will be returned only if the `grant_type` is `authorization_code`
   * @example a:consentId b75f5ee4-6b25-41af-bb9c-31128d09151b
   */
  metadata?: string
}

export type GetConsentDetailsOptions = {
  consentId: string
}

export type AccountReference = {
  iban: string
  currency: string
  status: 'valid' | 'expired' | 'revokedByPsu' | 'terminatedByTpp' | 'received' | 'rejected'
  validUntil: string
}

export type GetConsentDetailsResponse = {
  consentId: string
  /**
   * An associative array relating scopes (field names) to consented products (values).
   * @example
   * ```json
   * {
   *    "bai.accountinformation.read":[
   *       {
   *          "iban":"NL52RABO0125618484",
   *          "currency":"EUR",
   *          "status":"valid",
   *          "validUntil":"9999-12-31"
   *       },
   *       {
   *          "iban":"NL80RABO1127000002",
   *          "currency":"EUR",
   *          "status":"valid",
   *          "validUntil":"9999-12-31"
   *       }
   *    ],
   *    "bbpi.bulk.read-write":[
   *       {
   *          "iban":"NL52RABO0125618484",
   *          "currency":"EUR",
   *          "status":"valid",
   *          "validUntil":"9999-12-31"
   *       },
   *       {
   *          "iban":"NL80RABO1127000002",
   *          "currency":"EUR",
   *          "status":"valid",
   *          "validUntil":"9999-12-31"
   *       }
   *    ],
   *    "bdd.payments.write":[
   *       {
   *          "iban":"NL52RABO0125618484",
   *          "currency":"EUR",
   *          "status":"valid",
   *          "validUntil":"9999-12-31"
   *       },
   *       {
   *          "iban":"NL80RABO1127000002",
   *          "currency":"EUR",
   *          "status":"valid",
   *          "validUntil":"9999-12-31"
   *       }
   *    ]
   * }
   * ```
   */
  access: {
    'bai.accountinformation.read': AccountReference[]
    'bbpi.bulk.read-write': AccountReference[]
    'bdd.payments.write': AccountReference[]
  }
}

export type GetAccountListOptions = {
  accessToken: string
}

/**
 * Links to the account, which can be directly used for retrieving account
 * information from this dedicated account. Links to "balances" and/or
 * "transactions" These links are only supported, when the corresponding
 * consent has been already granted.
 */
export type LinksAccountDetails = {
  account: string
  balances: string
  transactions: string
}

/**
 * Account status. The value is one of the following:
 * - "enabled": account is available
 * - "deleted": account is terminated
 * - "blocked": account is blocked e.g. for legal reasons
 */
export type AccountStatus = 'enabled' | 'deleted' | 'blocked'

export type AccountDetails = {
  _links: LinksAccountDetails
  /** ISO 4217 Alpha 3 currency code */
  currency: string
  /** IBAN of an account */
  iban: string
  /** The given alias the holder has given to the account. */
  name: string
  /** The name of the account holder. */
  ownerName: string
  /** Account Id. */
  resourceId: string

  status: AccountStatus
}

export type GetAccountListResponse = {
  accounts: AccountDetails[]
}

export type GetAccountDetailsOptions = {
  accessToken: string
  /**
   * This is the internal id of the particular IBAN and present in the response
   * of the Read Account List call. Its value is constant throughout the
   * lifecycle of a given consent.
   */
  accountId: string
}

export type GetAccountDetailsResponse = AccountDetails

export type GetBalanceOptions = {
  accessToken: string
  accountId: string
}

export type GetBalanceResponse = {
  account: {
    /** ISO 4217 Alpha 3 currency code. */
    currency: string
    /** IBAN of the account. */
    iban: string
  }
  /**
   * A list of balances regarding this account, e.g. the current balance, the last booked balance.
   * The list might be restricted to the current balance.
   */
  balances: {
    balanceAmount: {
      /**
       * The amount given with fractional digits, where fractions must be
       * compliant to the currency definition. Up to 14 significant figures.
       * Negative amounts are signed by minus. The decimal separator is a dot.
       */
      amount: string
      currency: string
    }
    balanceType:
      | 'closingBooked'
      | 'expected'
      | 'authorised'
      | 'openingBooked'
      | 'interimAvailable'
      | 'forwardAvailable'
      | 'nonInvoiced'
      | 'available'
    /**
     * @example 2023-02-01T14:07:17.000Z
     */
    lastChangeDateTime?: string
    /**
     * @example 2023-01-31
     */
    referenceDate?: string
  }[]
}

export type GetAccountTransactionsOptions = {
  accessToken: string
  accountId: string

  /** The status of the booking in the bank backend, only "booked" is supported. */
  bookingStatus: 'booked'

  /** Start booking date time in UTC. Date can be max 15 months before now. */
  dateFrom: Date | string

  /** End booking date time in UTC. */
  dateTo: Date | string

  /** nextPageToken as returned in the previous response leading to the next page of transactions. */
  nextPageToken?: string

  /**
   * Number of transactions to be returned in one response. When not provided,
   * the default is 500, maximum is 500.
   */
  size?: number

  /**
   * List of fields to be dropped from the response.
   * When not provided, the values are present in the response.
   * @todo Implement fancy key autocompletion and remove keys from response
   */
  dropFields?: (
    | 'creditorAgent'
    | 'creditorId'
    | 'creditorName'
    | 'debtorAgent'
    | 'debtorName'
    | 'endToEndId'
    | 'currencyExchange'
    | 'initiatingPartyName'
    | 'mandateId'
    | 'numberOfTransactions'
    | 'paymentInformationIdentification'
    | 'purposeCode'
    | 'raboBookingDateTime'
    | 'raboDetailedTransactionType'
    | 'raboTransactionTypeName'
    | 'reasonCode'
    | 'remittanceInformationStructured'
    | 'remittanceInformationUnstructured'
    | 'ultimateCreditor'
    | 'ultimateDebtor'
    | 'valueDate'
  )[]
}

export type AccountReportAccountReference = {
  /** Basic Bank Account Number (BBAN) Identifier. */
  bban?: string
  /** ISO 4217 Alpha 3 currency code. */
  currency: string
  /** IBAN of an account. */
  iban: string
}

export type GetAccountTransactionsResponse = {
  account: {
    bban?: string
    currency?: string
    iban: string
  }
  transactions: {
    _links: {
      /** A link to the resource providing the details of one account */
      account: string
      /** Navigation link for paginated account reports */
      next: string
    }
    /** Array of transaction details */
    booked: [
      {
        /**
         * Bank transaction code as used by the ASPSP and using the sub elements
         * of this structured code defined by ISO 20022.
         * This code type is concatenating the three ISO20022 Codes
         * - Domain Code,
         * - Family Code, and
         * - SubFamiliy Code
         * by hyphens, resulting in “DomainCode”-“FamilyCode”-“SubFamilyCode”.
         * @example PMNT-RCDT-ESCT
         */
        bankTransactionCode?: string
        /**
         * @example 2021-08-17
         */
        bookingDate: string
        creditorAccount: AccountReportAccountReference
        /** Creditor Agent BIC. */
        creditorAgent?: string
        /** Identification of Creditors, e.g. a SEPA Creditor ID. */
        creditorId?: string
        /** Creditor Name */
        creditorName?: string
        debtorAccount: AccountReportAccountReference
        /** Debtor Agent BIC. */
        debtorAgent?: string
        /** Debtor name */
        debtorName: string
        /** Unique end to end identity. */
        endToEndId?: string
        /** Sequence number of the booking on a Rabobank account. */
        entryReference?: string
        currencyExchange?: {
          sourceCurrency: string
          targetCurrency: string
          exchangeRate: string
        }[]
        /** Name of initiating party. */
        initiatingPartyName?: string
        /** Original amount (f.e. USD amount paid towards the EUR DbtrAcct). */
        instructedAmount?: {
          amount: number
          sourceCurrency: string
        }
        /**
         * Identification of Mandates, e.g. a SEPA Mandate ID.
         */
        mandateId?: string
        /** Number Of Transactions in batch */
        numberOfTransactions?: number
        /** Payment Information Identification */
        paymentInformationIdentification?: string
        /** ExternalPurposeCode from ISO 20022.
         * Contains the category purpose code, which is the reason for payment transactions.
         * List available on http://www.iso20022.org/external_code_list.page
         */
        purposeCode?: string
        /**
         * Date on which the transaction is booked at the Rabobank using the Zulu
         * time standard which is in GMT/UTC timezone.
         * @example 2021-08-17T14:21Z
         */
        raboBookingDateTime: string
        /** Rabo Detailed Transaction Type */
        raboDetailedTransactionType: string
        /**
         * Name of Transaction Type
         * @example st
         */
        raboTransactionTypeName?: string
        /** Reason Code */
        reasonCode?: string
        /** Reference as contained in the structured remittance reference
         * structure (without the surrounding XML structure).
         * Different from other places the content is containt in plain
         * form not in form of a structered field.
         */
        remittanceInformationStructured?: string
        remittanceInformationUnstructured: string
        transactionAmount: {
          value: string
          currency: string
        }
        ultimateCreditor?: string
        ultimateDebtor?: string
        /**
         * Value date / interest date in format CCYY-MM-DD. C = Century, Y = Year, M = Month, D = Day
         * @example 2021-08-17
         */
        valueDate: string
        /** Same as Source Currency */
        unitCurrency?: string
        /** This is the balance of the account after the booked transaction */
        balanceAfterBooking: {
          balanceType: string
          balanceAmount: {
            value: string
            currency: string
          }
        }
      },
    ]
  }
}
