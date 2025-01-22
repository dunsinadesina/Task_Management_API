"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminAuth = exports.auth = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const app_1 = require("firebase/app");
const auth_1 = require("firebase/auth"); // For client-side auth
dotenv_1.default.config();
// Initialize Firebase Admin SDK (for server-side)
firebase_admin_1.default.initializeApp({
    credential: firebase_admin_1.default.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
});
// Initialize Firebase Client SDK (for client-side)
if (!(0, app_1.getApps)().length) {
    (0, app_1.initializeApp)({
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
    });
}
exports.auth = (0, auth_1.getAuth)();
exports.adminAuth = firebase_admin_1.default.auth();
//# sourceMappingURL=firebase.js.map