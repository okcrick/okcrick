"use client";
import { useEffect, useState } from "react";
import { db } from "../../../../lib/firebase";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import Navbar from "../../../../components/Navbar";

export default function CreateMatchPage() {
  const { id } = useParams();
  const router = useRouter();
  const [tournament, setTournament] = useState(null);
  const [match, setMatch] = useState({
    teamA: "",
    teamB: "",
    matchType: "League",
    overs: "",
    matchNumber: "",
  });

  useEffect(() => {
    const fetchTournament = async () => {
      const docRef = doc(db, "tournaments", id);
      const snap = await getDoc(docRef);
      if (snap.exists()) setTournament({ id: snap.id, ...snap.data() });
    };
    fetchTournament();
  }, [id]);

  const handleChange = (e) => {
    setMatch({ ...match, [e.target.name]: e.target.value });
  };

  const handleCancel = () => router.push(`/tournament/${id}`);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!match.teamA || !match.teamB || match.teamA === match.teamB) {
      return alert("Please select two different teams!");
    }

    try {
      const matchRef = await addDoc(collection(db, "matches"), {
        tournamentId: id,
        tournamentName: tournament.name,
        teamA: match.teamA,
        teamB: match.teamB,
        matchType: match.matchType,
        overs: Number(match.overs),
        matchNumber: Number(match.matchNumber),
        createdAt: serverTimestamp(),
        status: "not_started",
      });

      alert("✅ Match Created Successfully!");
      router.push(`/tournament/${id}/match/${matchRef.id}`);
    } catch (error) {
      console.error(error);
      alert("❌ Failed to create match!");
    }
  };

  if (!tournament)
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading tournament...
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main className="max-w-md mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">
          {tournament.name} 🏆
        </h1>

        <form onSubmit={handleCreate} className="space-y-4">
          <select
            name="teamA"
            value={match.teamA}
            onChange={handleChange}
            className="w-full p-2 rounded bg-slate-800"
          >
            <option value="">Select Team A</option>
            {tournament.teams?.map((t, i) => (
              <option key={i} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>

          <select
            name="teamB"
            value={match.teamB}
            onChange={handleChange}
            className="w-full p-2 rounded bg-slate-800"
          >
            <option value="">Select Team B</option>
            {tournament.teams?.map((t, i) => (
              <option key={i} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>

          <select
            name="matchType"
            value={match.matchType}
            onChange={handleChange}
            className="w-full p-2 rounded bg-slate-800"
          >
            <option value="League">League</option>
            <option value="Quarter Final">Quarter Final</option>
            <option value="Semi Final">Semi Final</option>
            <option value="Final">Final</option>
          </select>

          <input
            type="number"
            name="overs"
            placeholder="Overs"
            value={match.overs}
            onChange={handleChange}
            className="w-full p-2 rounded bg-slate-800"
            required
          />

          <input
            type="number"
            name="matchNumber"
            placeholder="Match Number"
            value={match.matchNumber}
            onChange={handleChange}
            className="w-full p-2 rounded bg-slate-800"
            required
          />

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="w-1/2 bg-gray-600 hover:bg-gray-700 py-2 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-1/2 bg-indigo-600 hover:bg-indigo-700 py-2 rounded"
            >
              Create
            </button>
          </div>
        </form>
      </main>
    </div>
  );
            }
              
