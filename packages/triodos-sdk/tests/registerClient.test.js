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
    const { access_token: accessToken } = yield client.getInitialAccessToken();
    const response = yield client.registerClient({ accessToken, redirectUris: ['http://example.com'] });
    t.assert(typeof response === 'object');
    t.assert(Array.isArray(response.grant_types));
    t.assert(typeof response.application_type === 'string');
    t.assert(typeof response.client_secret_expires_at === 'number');
    t.assert(Array.isArray(response.redirect_uris));
    t.assert(typeof response.client_id_issued_at === 'number');
    t.assert(typeof response.client_secret === 'string');
    t.assert(typeof response.tls_client_certificate_bound_access_tokens === 'boolean');
    t.assert(typeof response.token_endpoint_auth_method === 'string');
    t.assert(typeof response.client_id === 'string');
    t.assert(Array.isArray(response.response_types));
    t.assert(typeof response.id_token_signed_response_alg === 'string');
}));
ava_1.default.serial('should return if not at least one redirect uri is given', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const { access_token: accessToken } = yield client.getInitialAccessToken();
    const error = yield t.throwsAsync(() => client.registerClient({ accessToken, redirectUris: [] }), { instanceOf: TriodosClient_1.Errors.ResponseStatusCodeError });
    t.is(error.status, 400);
    t.is(error.body.error, 'invalid_request');
    t.is(error.body.error_description, 'There should be at least one redirect URI');
}));
ava_1.default.serial('should throw if accessToken missing', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const error = yield t.throwsAsync(() => client.registerClient({ accessToken: '', redirectUris: ['http://example.com'] }), { instanceOf: TriodosClient_1.Errors.ResponseStatusCodeError });
    t.is(error.status, 400);
    t.is(error.body.error, 'Invalid HTTP Authorization header value');
}));
