import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAPU9EvWp90nQ1RS0pDwa2aUUfGqlm_0u0",
  authDomain: "lofty-digit-479406-s8.firebaseapp.com",
  projectId: "lofty-digit-479406-s8",
  storageBucket: "lofty-digit-479406-s8.firebasestorage.app",
  messagingSenderId: "147824396924",
  appId: "1:147824396924:web:6aea844e1592cc035917f9"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
