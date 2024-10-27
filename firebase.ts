import dotenv from "dotenv";
import admin from "firebase-admin";
import { getApps, initializeApp as initializeClientApp } from "firebase/app";
import { getAuth as getClientAuth } from "firebase/auth"; // For client-side auth

dotenv.config();

// Ensure the FIREBASE_SERVICE_ACCOUNT variable is defined
if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
  throw new Error("FIREBASE_SERVICE_ACCOUNT environment variable is not set.");
}

// Parse the service account JSON from environment variable
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) as {
  project_id: string;
  client_email: string;
  private_key: string;
};

// Log the parsed service account for debugging
console.log("Parsed Service Account:", serviceAccount);

// Check if projectId is present
if (!serviceAccount.project_id) {
  throw new Error("Missing project_id in service account credentials");
}

// Check if all required Firebase environment variables are defined
if (!process.env.FIREBASE_PROJECT_ID ||
  !process.env.FIREBASE_CLIENT_EMAIL ||
  !process.env.FIREBASE_PRIVATE_KEY) {
  throw new Error("Missing required Firebase environment variables");
}

// Initialize Firebase Admin SDK (for server-side)
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: serviceAccount.project_id,
    clientEmail: serviceAccount.client_email,
    privateKey: serviceAccount.private_key.replace(/\\n/g, '\n'),
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
