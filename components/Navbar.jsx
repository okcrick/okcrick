"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { auth, onAuthStateChanged, googleLogin, logout } from "../lib/firebaseAuth";

export default function Navbar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  return (
    <nav className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-3 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold tracking-wide">🏏 CrickPro</Link>

        <div className="flex items-center gap-4">
          <Link href="/" className="hover:text-yellow-300">Home</Link>
          {user && <Link href="/create-tournament" className="hover:text-yellow-300">Create Tournament</Link>}
          {user ? (
            <>
              <span className="hidden sm:block text-sm">{user.displayName}</span>
              <button onClick={logout} className="bg-white/20 px-3 py-1 rounded hover:bg-white/30">Logout</button>
            </>
          ) : (
            <button onClick={googleLogin} className="bg-white/20 px-3 py-1 rounded hover:bg-white/30">Login with Google</button>
          )}
        </div>
      </div>
    </nav>
  );
}
