// lib/firebaseAuth.js
"use client";

import app from "./firebase";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, onAuthStateChanged };

export async function googleLogin() {
  await signInWithPopup(auth, provider);
}

export async function logout() {
  await signOut(auth);
}
