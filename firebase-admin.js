"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminDb = exports.adminAuth = void 0;
const app_1 = require("firebase-admin/app");
const auth_1 = require("firebase-admin/auth");
const firestore_1 = require("firebase-admin/firestore");
if (!(0, app_1.getApps)().length) {
    const serviceAccount = {
        type: 'service_account',
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`,
        universe_domain: 'googleapis.com'
    };
    if (!process.env.FIREBASE_PRIVATE_KEY) {
        console.error('Missing FIREBASE_PRIVATE_KEY environment variable');
    }
    if (!process.env.FIREBASE_CLIENT_EMAIL) {
        console.error('Missing FIREBASE_CLIENT_EMAIL environment variable');
    }
    if (!process.env.FIREBASE_PROJECT_ID) {
        console.error('Missing FIREBASE_PROJECT_ID environment variable');
    }
    (0, app_1.initializeApp)({
        credential: (0, app_1.cert)(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID,
    });
}
exports.adminAuth = (0, auth_1.getAuth)();
exports.adminDb = (0, firestore_1.getFirestore)();
