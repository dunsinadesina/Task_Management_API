import dotenv from "dotenv";
import admin from "firebase-admin";
import { getApps, initializeApp as initializeClientApp } from "firebase/app";
import { getAuth as getClientAuth } from "firebase/auth"; // For client-side auth

dotenv.config();

// Initialize Firebase Admin SDK (for server-side)
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
});

// Initialize Firebase Client SDK (for client-side)
if (!getApps().length) {
  initializeClientApp({
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

export const auth = getClientAuth();
export const adminAuth = admin.auth();
