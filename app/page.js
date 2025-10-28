"use client";
import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import Navbar from "../components/Navbar";
import Link from "next/link";

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [tournaments, setTournaments] = useState([]);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => setUser(u));
    const unsubMatches = onSnapshot(collection(db, "matches"), (snap) => {
      setTournaments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => {
      unsubAuth();
      unsubMatches();
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">🏆 Tournaments</h1>

        {user && (
          <Link
            href="/create-tournament"
            className="inline-block mb-6 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
          >
            + Create Tournament
          </Link>
        )}

        {tournaments.length === 0 ? (
          <p className="text-gray-400">No tournaments created yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {tournaments.map((t) => (
              <div
                key={t.id}
                className="bg-slate-800 p-4 rounded-lg hover:bg-slate-700 transition"
              >
                <h2 className="text-xl font-semibold">{t.name}</h2>
                <p className="text-gray-400 text-sm mt-1">
                  {t.teamA?.name} vs {t.teamB?.name}
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  Overs: {t.oversLimit} | Status: {t.status}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
