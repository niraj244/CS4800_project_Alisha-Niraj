import { initializeApp } from "firebase/app";

const VITE_FIREBASE_APP_API_KEY = import.meta.env.VITE_FIREBASE_APP_API_KEY;
const VITE_FIREBASE_APP_AUTH_DOMAIN = import.meta.env.VITE_FIREBASE_APP_AUTH_DOMAIN;
const VITE_FIREBASE_APP_PROJECT_ID = import.meta.env.VITE_FIREBASE_APP_PROJECT_ID;
const VITE_FIREBASE_APP_STORAGE_BUCKET = import.meta.env.VITE_FIREBASE_APP_STORAGE_BUCKET;
const VITE_FIREBASE_APP_MESSAGING_SENDER_ID = import.meta.env.VITE_FIREBASE_APP_MESSAGING_SENDER_ID;
const VITE_FIREBASE_APP_APP_ID = import.meta.env.VITE_FIREBASE_APP_APP_ID;

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: VITE_FIREBASE_APP_API_KEY,
  authDomain: VITE_FIREBASE_APP_AUTH_DOMAIN,
  projectId: VITE_FIREBASE_APP_PROJECT_ID,
  storageBucket: VITE_FIREBASE_APP_STORAGE_BUCKET,
  messagingSenderId: VITE_FIREBASE_APP_MESSAGING_SENDER_ID,
  appId: VITE_FIREBASE_APP_APP_ID
};

// Validate Firebase configuration
const isFirebaseConfigValid = () => {
  const requiredVars = {
    VITE_FIREBASE_APP_API_KEY,
    VITE_FIREBASE_APP_AUTH_DOMAIN,
    VITE_FIREBASE_APP_PROJECT_ID,
    VITE_FIREBASE_APP_STORAGE_BUCKET,
    VITE_FIREBASE_APP_MESSAGING_SENDER_ID,
    VITE_FIREBASE_APP_APP_ID
  };
  
  const missingVars = Object.entries(requiredVars)
    .filter(([key, value]) => !value)
    .map(([key]) => key);
  
  if (missingVars.length > 0) {
    console.warn("Firebase configuration is incomplete. Missing environment variables:", missingVars);
    console.warn("Please set the following environment variables in Vercel:");
    missingVars.forEach(varName => console.warn(`  - ${varName}`));
    return false;
  }
  
  return true;
};

// Initialize Firebase only if config is valid
let firebaseApp;
try {
  if (isFirebaseConfigValid()) {
    firebaseApp = initializeApp(firebaseConfig);
    console.log("Firebase initialized successfully");
  } else {
    console.error("Firebase configuration is incomplete. Firebase features will not work.");
    console.error("To fix this, add the required environment variables in Vercel:");
    console.error("  - VITE_FIREBASE_APP_API_KEY");
    console.error("  - VITE_FIREBASE_APP_AUTH_DOMAIN");
    console.error("  - VITE_FIREBASE_APP_PROJECT_ID");
    console.error("  - VITE_FIREBASE_APP_STORAGE_BUCKET");
    console.error("  - VITE_FIREBASE_APP_MESSAGING_SENDER_ID");
    console.error("  - VITE_FIREBASE_APP_APP_ID");
  }
} catch (error) {
  console.error("Error initializing Firebase:", error);
  console.error("Please check your Firebase configuration and ensure all environment variables are set correctly.");
}

export { firebaseApp };