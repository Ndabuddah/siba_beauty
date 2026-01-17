import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// Import getAnalytics dynamically to avoid SSR warnings
import { getAnalytics, isSupported } from "firebase/analytics";

// Read config from Vite env variables (define in .env.local)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  // measurementId is optional; include if present
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ? { measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID as any } : {}),
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Analytics only in production and if supported
let analyticsInstance: ReturnType<typeof getAnalytics> | null = null;
if (import.meta.env.PROD && typeof window !== "undefined") {
  // isSupported checks for browser support (avoids errors in unsupported envs)
  isSupported().then((supported) => {
    if (supported) {
      analyticsInstance = getAnalytics(app);
    }
  }).catch(() => {
    // ignore analytics init errors in dev/test
  });
}

export const analytics = analyticsInstance;