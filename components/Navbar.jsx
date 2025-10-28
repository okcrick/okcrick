"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { auth, onAuthStateChanged, googleLogin, logout } from "../lib/firebaseAuth";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  return (
    <nav className="bg-gradient-to-r from-green-600 via-emerald-600 to-lime-600 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo / Brand */}
        <Link href="/" className="text-2xl font-bold tracking-wide flex items-center gap-2">
          🏏 <span>OK Crick</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="hover:text-yellow-300">Home</Link>
          <Link href="/overlay" className="hover:text-yellow-300">Overlay Theme</Link>
          <Link href="/about" className="hover:text-yellow-300">About</Link>
          {!user && <Link href="/register" className="hover:text-yellow-300">Register</Link>}
          {!user ? (
            <button onClick={googleLogin} className="bg-white/20 px-3 py-1 rounded-lg hover:bg-white/30">
              Login
            </button>
          ) : (
            <>
              <span className="hidden sm:block text-sm">{user.displayName}</span>
              <button
                onClick={logout}
                className="bg-white/20 px-3 py-1 rounded-lg hover:bg-white/30 transition-all"
              >
                Logout
              </button>
            </>
          )}
        </div>

        {/* Hamburger Icon */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 bg-white/10 rounded-lg hover:bg-white/20 transition"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-green-700/90 backdrop-blur-md flex flex-col items-center py-4 space-y-4">
          <Link href="/" onClick={() => setMenuOpen(false)} className="hover:text-yellow-300">Home</Link>
          <Link href="/overlay" onClick={() => setMenuOpen(false)} className="hover:text-yellow-300">Overlay Theme</Link>
          <Link href="/about" onClick={() => setMenuOpen(false)} className="hover:text-yellow-300">About</Link>
          {!user && (
            <>
              <Link href="/register" onClick={() => setMenuOpen(false)} className="hover:text-yellow-300">
                Register
              </Link>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  googleLogin();
                }}
                className="bg-white/20 px-3 py-1 rounded-lg hover:bg-white/30 transition-all"
              >
                Login
              </button>
            </>
          )}
          {user && (
            <>
              <span className="text-sm">{user.displayName}</span>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                }}
                className="bg-white/20 px-3 py-1 rounded-lg hover:bg-white/30 transition-all"
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
