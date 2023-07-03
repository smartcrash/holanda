import { ABNScopes } from "./enums"

export type ABNClientOptions = {
  apiKey: string
  clientId: string
  publicCertificate: string
  privateKey: string
}

export type RequestAuthTokenOptions = {
  /** Scopes for which the access token is issued. */
  scope: ABNScopes[]
  /** Value must be 'code'. It indicates which grant to execute. */
  responseType: string
  flow?: string
  redirectUri?: string
  state?: string
  transactionId?: string
  bank?: string
}

export type RequestAuthTokenResponse = string

export type RequestAccessTokenOptions = {
  code?: string,
  grantType: string,
  redirectUri?: string,
  refreshToken?: string
  scope?: ABNScopes[]
}

export type RequestAccessTokenResponse = {
  access_token: string
  refresh_token?: string
  token_type: string
  expires_in: number
}

export type PostSEPAPaymentOptions = {
  accessToken: string
  initiatingpartyAccountNumber?: string
  counterpartyAccountNumber: string
  counterpartyName: string
  amount: number
  requestedExecutionDate?: Date
  currency?: string
  remittanceInfo?: string
}

export type PostSEPAPaymentResponse = {
  transactionId: string
  status: "STORED" | "AUTHORIZED" | "INPROGRESS" | "SCHEDULED" | "EXECUTED" | "REJECTED" | "UNKNOWN" | "CANCEL"
  accountNumber?: string
}

export type GetConsentInfoOptions = {
  accessToken: string
}

export type GetConsentInfoResponse = {
  iban: string
  transactionId?: string
  valid: number
  scopes: string
  consentStatus: 'INITIAL' | 'FULLY_SIGNED' | 'PARTIALLY_SIGNED' | 'SYSTEM_CANCELED' | 'USER_CANCELED'
  consentExpiresIn: string
}

export type PutSEPAPaymentOptions = {
  transactionId: string
  accessToken: string
}

export type PutSEPAPaymentResponse = {
  transactionId: string
  accountHolderName: string
  accountNumber: string
  status: "STORED" | "AUTHORIZED" | "INPROGRESS" | "SCHEDULED" | "EXECUTED" | "REJECTED" | "UNKNOWN" | "CANCEL"
}

export type GetSEPAPaymentOptions = {
  transactionId: string
  accessToken: string
}

export type GetSEPAPaymentResponse = {
  transactionId: string
  accountHolderName: string
  accountNumber: string
  status: "STORED" | "AUTHORIZED" | "INPROGRESS" | "SCHEDULED" | "EXECUTED" | "REJECTED" | "UNKNOWN" | "CANCEL"
}

export type GetDetailsOptions = {
  accountNumber: string
  accessToken: string
}

export type GetDetailsResponse = {
  currency: string
  accountHolderName: string
  accountNumber: string
}

export type GetBalancesOptions = {
  accountNumber: string
  accessToken: string
}

export type GetBalancesResponse = {
  accountNumber: string
  currency: string
  balanceType: 'BOOKBALANCE'
  amount: number
}

export type GetTransactionsOptions = {
  accountNumber: string
  accessToken: string
  /**
   * Filter, only retrieve transactions that are more recent than this date. (Format: YYYY-MM-DD).
   * If field or date is omitted, the last 50 transactions are retrieved. Transactions can be retrieved for up to 18 months.
   */
  bookDateFrom?: Date | string

  /** Filter, only retrieve transactions preceding this date (Format: YYYY-MM-DD). */
  bookDateTo?: Date | string

  /** Reference key to be used as a query parameter to fetch the next set of transactions. */
  nextPageKey?: string

  /**
   * The filter of transaction data only retrieves transaction details for the provided query values.
   * If its necessary to add multiple values, separate them by comma. If all attributes added to the
   * filter, the full response will be returned. In this case the filter is superfluous.
   * If all transaction data is required, then this query parameter does not have to be supplied.
   */
  includeProperties?: ("transactionId" | "mutationCode" | "descriptionLines" | "transactionTimestamp" | "bookDate" | "balanceAfterMutation" | "counterPartyAccountNumber" | "counterPartyName" | "amount" | "currency" | "status")[]
}

export type GetTransactionsResponse = {
  accountNumber: string
  nextPageKey: string
  transactions: {
    mutationCode: string
    descriptionLines: string[]
    transactionTimestamp: string
    bookDate: string
    balanceAfterMutation: number
    counterPartyAccountNumber: string
    counterPartyName: string
    amount: number
    currency: string
    transactionId: string
  }[]
}

export type GetFundsOptions = {
  accountNumber: string
  accessToken: string
  amount: number
  currency?: string
}

export type GetFundsResponse = {
  accountNumber: string
  amount: number
  currency: string
  available: boolean
}

export type DeleteSEPAPaymentOptions = {
  transactionId: string
  accessToken: string
}

export type DeleteSEPAPaymentResponse = boolean

export type PostXborderPaymentOptions = {
  accessToken: string

  initiatingParty?: {
    /**
     * Currency of the accountNumber using ISO 4217 currency code.
     * For example, EUR or USD. If not provided, the currency of
     * the initiating account is used.
     */
    accountCurrency?: string

    /**
     * Account number, in IBAN format, of the ordering party initiating the
     * transaction. If omitted, the account number will be selected during
     * the authorization of the payment. If the account cannot be authorized,
     * the account holder can select a different account.
     */
    accountNumber: string
  }

  counterParty: {
    /** Indicates the type of accountNumber used, IBAN or BBAN. BBAN is used for domestic/basic formatting. */
    accountNumberType: 'iban' | 'BBAN'
    /**
     * Indicates the type of bankIdentifier used; "SWIFTBIC", for a BIC; "UKSORTCODE", for a UK sortcode; or "FEDWIRE", for a US bankcode.
     */
    bankIdentifierType: "SWIFTBIC" | "UKSORTCODE" | "FEDWIRE"
    /** Specifies the `BankIdentifier` for the selected `bankIdentifierType`. */
    bankIdentifier: string
    /**
     * Indicates the bank name of the creditor. After March 21st 2023 this
     * attribute is mandatory, if the bank identifier type is FEDWIRE or UKSORTCODE.
     */
    bankName?: string
    bankAddress?: {
      /**
       * Indicates the town name of the creditor bank address.
       * After March 21st 2023 this attribute is mandatory,
       * if the bank identifier type is FEDWIRE or UKSORTCODE.
       */
      townName?: string

      /**
       * ISO 3166 Alpha-2 Country code of the of the creditor bank address.
       * After March 21st 2023 this attribute is mandatory,
       * if the bank identifier type is FEDWIRE or UKSORTCODE.
       */
      country: string
    }
    /** The name of the counter party */
    name: string
    /** The IBAN or BBAN formatted account number of the counterparty, as indicated by `accountNumberType`. */
    accountNumber: string
    creditorAddress?: {
      /** Indicates the street name of the creditor address. */
      streetName?: string
      /** Indicates the building number of the creditor address */
      buildingNumber?: string
      /** Specifies the postal code of the creditor address. */
      postCode?: string
      /**
       * Indicates the name of the town of the creditor address. Attribute is
       * mandatory, if the initiating party bank country, the counter party bank
       * country and the country of the currency are not within the European
       * Economic Area (EEA).
       */
      townName?: string
      /** Province, state, or other administrative subdivision of the country. */
      countrySubDivision?: string
      /**
       * ISO 3166 Alpha-2 Country code of the creditor address. Attribute is
       * mandatory, if the initiating party bank country, the counter party
       * bank country and the country of the currency are not within the
       * European Economic Area (EEA).
       */
      country?: string
    }
  }
  /**
   * The amount of the transaction. This is always positive, the number of decimals
   * used must match the used currency. The maximum amount is equal to that set for
   * the online banking channel, Internet Banking or Access Online.
   */
  amount: number

  /**
   * Currency of the amount, using ISO 4217 currency code.
   */
  currency: string

  /**
   * Indicates who pays the charges related to the payment: BEN = beneficiary,
   * OUR = initiating party, SHA = both parties share the charges.
   * If not specified, SHA is assumed. Always use SHA in EEA.
   */
  chargesBearer: "SHA" | "BEN" | "OUR"

  /**
   * Optional date on which the initiated payment is to be executed.
   * If the execution date is in the past, or if the requested execution
   * date is empty, the payment will be executed immediately.
   * This date should be no more than 364 days after the current date.
   * The format of the date is a ISO8601 full-date conforming to RFC 3339, (CCYY-MM-DD).
   * If there is no clearing of payments on the execution date,
   * it will be processed on the first available bookdate.
   */
  requestedExecutionDate: Date | string

  /** Specifies the remittance information. */
  remittanceInfo: string
}

export type PostXborderPaymentResponse = {
  accountNumber?: string
  transactionId: string
  status: "STORED" | "AUTHORIZED" | "INPROGRESS" | "SCHEDULED" | "EXECUTED" | "REJECTED" | "UNKNOWN" | "CANCEL"
  accountHolderName?: string
}


export type PutXborderPaymentOptions = {
  transactionId: string
  accessToken: string
}

export type PutXborderPaymentResponse = {
  accountNumber?: string
  transactionId: string
  status: "STORED" | "AUTHORIZED" | "INPROGRESS" | "SCHEDULED" | "EXECUTED" | "REJECTED" | "UNKNOWN" | "CANCEL"
  accountHolderName?: string
}

export type PostStandingOrderPaymentOptions = {
  /** Client credentials 'access-token' to be passed as a bearer token. */
  accessToken: string

  /**
   * Start date of the standing order in the format: yyyy-mm-dd. Must be a future date up to a maximum of 30 days.
   */
  startDate: Date | string

  /** Optional end date of the standing order in the format: yyyy-mm-dd. If this value is blank, the end date is indefinite. */
  endDate?: Date | string

  /**
   * Defines the behavior when a recurring payment date falls on a weekend or
   * bank holiday. This value is case sensitive. It is accepted for input, but not used.
   */
  executionRule?: 'FOLLOWING' | 'PRECEEDING'

  /** Frequency with which the standing order is executed. The 'EventFrequencyCode' of ISO 20022 is supported. This value is case sensitive. */
  frequency: "DAILY" | "WEEKLY" | "EVERYTWOWEEKS" | "MONTHLY" | "EVERYTWOMONTHS" | "QUARTERLY" | "SEMIANNUAL" | "ANNUAL"

  /** Day of execution as a string. This string always consists of two characters. The field is accepted for input, but not used. */
  dayOfExecution?: "01" | "02" | "03" | "04" | "05" | "06" | "07" | "08" | "09" | "10" | "11" | "12" | "13" | "14" | "15" | "16" | "17" | "18" | "19" | "20" | "21" | "22" | "23" | "24" | "25" | "26" | "27" | "28" | "29" | "30" | "31"

  payment: {
    /** Account number, in IBAN format, of the ordering part initiating the transaction. If the account cannot be authorized, the account holder can select a different account. */
    initiatingpartyAccountNumber: string

    /** Account number of the counterparty in IBAN format. */
    counterpartyAccountNumber: string

    /** Name of the counterparty. */
    counterpartyName: string

    /**
     * The amount of the transaction. This value is always positive.
     * The maximum amount is equal to that set for the online banking channel Internet Banking or Access Online.
     */
    amount: number

    /**
     * Currency of the transaction using ISO-4217 currency. EUR is supported Only. If omitted, EUR is assumed.
     */
    currency?: string

    /** Information for the beneficiary about the payment. */
    remittanceInfo?: string
  }
}

export type PostStandingOrderPaymentResponse = {
  /**
   * Unique transaction ID that for authorizing the standing order by the account holder.
   * Is also required as input for PUT payments.
   */
  transactionId: string
  /**
   * Status of the standing order.
   * Initial status at registration is STORED. AUTHORIZED indicates consent is given,
   * and ACTIVATED indicates the SDO is active.
   */
  status: "STORED" | "AUTHORIZED" | "REJECTED" | "ACTIVATED"
  /** Initiating party account number. */
  accountNumber?: string
}
