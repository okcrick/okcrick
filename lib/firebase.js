// lib/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// import { getStorage } from "firebase/storage"; // ❌ optional, remove if not using

// ✅ Your corrected Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBMklMquJun6M-hqLxMyW2wfMbDxVzdWCw",
  authDomain: "okcrickapp.firebaseapp.com",
  databaseURL: "https://okcrickapp-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "okcrickapp",
  storageBucket: "okcrickapp.appspot.com", // ✅ fixed: remove `.firebasestorage.app`
  messagingSenderId: "954796316165",
  appId: "1:954796316165:web:96eebaf2894dbe0f456e6c",
  measurementId: "G-D2RN75G2DY",
};

// ✅ Prevent re-initialization error
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// ✅ Export commonly used Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
// export const storage = getStorage(app); // ❌ comment out for now (causes undici build issue)

export default app;

