"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, LogOut } from "lucide-react";
import { auth } from "../lib/firebase"; // apni firebase file ka path sahi rakho
import { signOut, onAuthStateChanged } from "firebase/auth";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <nav className="bg-green-600 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold tracking-wide">
          OKCrick 🏏
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6 items-center">
          <Link href="/" className="hover:text-gray-200">Home</Link>
          <Link href="/about" className="hover:text-gray-200">About</Link>
          <Link href="/overlay" className="hover:text-gray-200">Overlay</Link>
          {!user && (
            <>
              <Link href="/login" className="hover:text-gray-200">Login</Link>
              <Link href="/register" className="hover:text-gray-200">Register</Link>
            </>
          )}
          {user && (
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 bg-white text-green-700 px-3 py-1 rounded-md hover:bg-gray-100"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          )}
        </div>

        {/* Hamburger Menu (Mobile) */}
        <button
          className="md:hidden p-2 rounded hover:bg-green-700"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-green-700 px-4 py-3 space-y-2">
          <Link href="/" className="block hover:text-gray-200">Home</Link>
          <Link href="/about" className="block hover:text-gray-200">About</Link>
          <Link href="/overlay" className="block hover:text-gray-200">Overlay</Link>
          {!user && (
            <>
              <Link href="/login" className="block hover:text-gray-200">Login</Link>
              <Link href="/register" className="block hover:text-gray-200">Register</Link>
            </>
          )}
          {user && (
            <button
              onClick={handleLogout}
              className="w-full text-left bg-white text-green-700 px-3 py-2 rounded-md hover:bg-gray-100"
            >
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
