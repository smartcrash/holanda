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
ava_1.default.serial('returns successful response', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield client.getConfiguration();
    t.assert(typeof response === 'object');
    t.assert(typeof response.authorization_endpoint === 'string');
    t.assert(Array.isArray(response.claim_types_supported));
    t.assert(typeof response.claims_parameter_supported === 'boolean');
    t.assert(Array.isArray(response.claims_supported));
    t.assert(Array.isArray(response.code_challenge_methods_supported));
    t.assert(Array.isArray(response.display_values_supported));
    t.assert(Array.isArray(response.grant_types_supported));
    t.assert(Array.isArray(response.id_token_signing_alg_values_supported));
    t.assert(typeof response.issuer === 'string');
    t.assert(typeof response.jwks_uri === 'string');
    t.assert(typeof response.mutual_tls_sender_constrained_access_tokens === 'boolean');
    t.assert(typeof response.registration_endpoint === 'string');
    t.assert(typeof response.request_parameter_supported === 'boolean');
    t.assert(typeof response.request_uri_parameter_supported === 'boolean');
    t.assert(typeof response.require_request_uri_registration === 'boolean');
    t.assert(Array.isArray(response.response_modes_supported));
    t.assert(Array.isArray(response.response_types_supported));
    t.assert(typeof response.revocation_endpoint === 'string');
    t.assert(Array.isArray(response.revocation_endpoint_auth_methods_supported));
    t.assert(Array.isArray(response.revocation_endpoint_auth_signing_alg_values_supported));
    t.assert(Array.isArray(response.scopes_supported));
    t.assert(Array.isArray(response.subject_types_supported));
    t.assert(typeof response.token_endpoint === 'string');
    t.assert(Array.isArray(response.token_endpoint_auth_methods_supported));
    t.assert(Array.isArray(response.token_endpoint_auth_signing_alg_values_supported));
    t.assert(typeof response.userinfo_endpoint === 'string');
    t.assert(Array.isArray(response.userinfo_signing_alg_values_supported));
}));
