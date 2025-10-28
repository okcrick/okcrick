"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, LogOut } from "lucide-react"; // ✅ icons from lucide-react
import { auth } from "../lib/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <nav className="bg-green-600 text-white shadow-md fixed w-full z-50 top-0">
      <div className="max-w-6xl mx-auto px-4 flex justify-between items-center h-16">
        {/* Logo / Title */}
        <Link href="/" className="text-2xl font-bold tracking-wide">
          OKCrick 🏏
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6 font-medium">
          <Link href="/" className="hover:text-yellow-300 transition">Home</Link>
          <Link href="/about" className="hover:text-yellow-300 transition">About</Link>
          <Link href="/overlay" className="hover:text-yellow-300 transition">Overlay Theme</Link>
          {!user ? (
            <>
              <Link href="/login" className="hover:text-yellow-300 transition">Login</Link>
              <Link href="/register" className="hover:text-yellow-300 transition">Register</Link>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 hover:text-yellow-300 transition"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden focus:outline-none"
        >
          {menuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-green-700 px-6 py-4 space-y-3 text-center">
          <Link href="/" className="block hover:text-yellow-300" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link href="/about" className="block hover:text-yellow-300" onClick={() => setMenuOpen(false)}>About</Link>
          <Link href="/overlay" className="block hover:text-yellow-300" onClick={() => setMenuOpen(false)}>Overlay Theme</Link>

          {!user ? (
            <>
              <Link href="/login" className="block hover:text-yellow-300" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link href="/register" className="block hover:text-yellow-300" onClick={() => setMenuOpen(false)}>Register</Link>
            </>
          ) : (
            <button
              onClick={() => {
                handleLogout();
                setMenuOpen(false);
              }}
              className="w-full flex justify-center items-center space-x-1 hover:text-yellow-300 transition"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          )}
        </div>
      )}
    </nav>
  );
            }
