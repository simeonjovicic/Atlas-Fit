import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyD4vRAFbOTjCS7E-VysKlmZO321oRMZXF4",
  authDomain: "atlasfit-9d127.firebaseapp.com",
  projectId: "atlasfit-9d127",
  storageBucket: "atlasfit-9d127.firebasestorage.app",
  messagingSenderId: "287614351971",
  appId: "1:287614351971:web:97ac2954f4ee1b95e39656"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Note: Firebase Storage is NOT used to avoid costs
// Profile photos are stored as Base64 strings in Firestore instead

