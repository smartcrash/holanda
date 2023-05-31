"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const ava_1 = __importDefault(require("ava"));
const TriodosClient_1 = require("../src/TriodosClient");
let client;
ava_1.default.beforeEach(() => client = new TriodosClient_1.TriodosClient({
    keyId: 'SN=1,CA=CN=Xs2aTpp.com, O=TriodosBank, OID.2.5.4.97=PSDGO-BES-WGXZKBYE, L=Zeist, C=NL',
    signingCertificate: (0, node_fs_1.readFileSync)((0, node_path_1.join)(__dirname, '/example-cert.pem'), { encoding: 'utf8' }),
    signingKey: (0, node_fs_1.readFileSync)((0, node_path_1.join)(__dirname, '/example-key.pem'), { encoding: 'utf8' }),
    tenant: 'nl'
}));
ava_1.default.serial('should return successful response', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const requestBody = {
        instructedAmount: {
            currency: "USD",
            amount: "8.00"
        },
        debtorAccount: {
            iban: "NL37TRIO0320564487"
        },
        creditorName: "Mr Tester",
        creditorAccount: {
            iban: "NL53RABO7236495824",
        },
        chargeBearer: "SHAR",
        creditorAddress: {
            streetName: "Test st",
            buildingNumber: "26",
            townName: "Test city",
            postcode: "9999ZZ",
            country: "US"
        },
        remittanceInformationUnstructured: "Remit info",
        requestedExecutionDate: "2024-03-05"
    };
    const response = yield client.initiateCrossBorderPayment({
        ipAddr: '0.0.0.0',
        redirectUri: 'http://example.com',
        requestBody
    });
    t.assert(typeof response === 'object');
    t.is(response.transactionStatus, 'RCVD');
    t.assert(typeof response.paymentId === 'string');
    t.assert(typeof response.authorisationId === 'string');
    t.assert(typeof response.debtorAccount === 'object');
    t.assert(typeof response.debtorAccount.iban === 'string');
    t.assert(typeof response._links === 'object');
    t.assert(typeof response._links.scaOAuth === 'string');
    t.assert(typeof response._links.scaRedirect === 'string');
    t.assert(typeof response._links.scaStatus === 'string');
    t.assert(typeof response._links.self === 'string');
    t.assert(typeof response._links.status === 'string');
}));
ava_1.default.serial('should throw error if currency is EUR', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const requestBody = {
        instructedAmount: {
            currency: "EUR",
            amount: "8.00"
        },
        debtorAccount: {
            iban: "NL37TRIO0320564487"
        },
        creditorName: "Mr Tester",
        creditorAccount: {
            iban: "NL53RABO7236495824",
        },
        chargeBearer: "SHAR",
        creditorAddress: {
            streetName: "Test st",
            buildingNumber: "26",
            townName: "Test city",
            postcode: "9999ZZ",
            country: "US"
        },
        remittanceInformationUnstructured: "Remit info",
        requestedExecutionDate: "2024-03-05"
    };
    const error = yield t.throwsAsync(() => client.initiateCrossBorderPayment({
        ipAddr: '0.0.0.0',
        redirectUri: 'http://example.com',
        requestBody
    }));
    t.assert(typeof error === 'object');
    t.is(error.status, 400);
}));
