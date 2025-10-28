// lib/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

/* Your firebase config (use the values you provided) */
const firebaseConfig = {
  apiKey: "AIzaSyBMklMquJun6M-hqLxMyW2wfMbDxVzdWCw",
  authDomain: "okcrickapp.firebaseapp.com",
  databaseURL: "https://okcrickapp-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "okcrickapp",
  storageBucket: "okcrickapp.appspot.com",
  messagingSenderId: "954796316165",
  appId: "1:954796316165:web:96eebaf2894dbe0f456e6c",
  measurementId: "G-D2RN75G2DY",
};

// initialize app once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// export Firestore (safe for server & client)
export const db = getFirestore(app);

export default app;
