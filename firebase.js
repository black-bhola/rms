// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database'; // Make sure to import getDatabase

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA0S7A6_ka41Oc8p789QSU9L7-1lTmzQvU",
  authDomain: "coll-495ac.firebaseapp.com",
  databaseURL: "https://coll-495ac-default-rtdb.firebaseio.com",
  projectId: "coll-495ac",
  storageBucket: "coll-495ac.firebasestorage.app",
  messagingSenderId: "528284647384",
  appId: "1:528284647384:web:209a550034bc7643113cad",
  measurementId: "G-SC64BMPFGY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the services you need
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

// --- FIX ---
// You were missing the export for the Realtime Database.
export const database = getDatabase(app);
