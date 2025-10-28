import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBMklMquJun6M-hqLxMyW2wfMbDxVzdWCw",
  authDomain: "okcrickapp.firebaseapp.com",
  databaseURL: "https://okcrickapp-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "okcrickapp",
  storageBucket: "okcrickapp.appspot.com", // ✅ Corrected
  messagingSenderId: "954796316165",
  appId: "1:954796316165:web:96eebaf2894dbe0f456e6c",
  measurementId: "G-D2RN75G2DY"
};

// ✅ Ensure app is initialized only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
