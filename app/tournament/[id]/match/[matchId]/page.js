"use client";
import { useEffect, useState } from "react";
import { db } from "../../../../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import Navbar from "../../../../../components/Navbar";

export default function MatchDetailsPage() {
  const { id, matchId } = useParams();
  const router = useRouter();
  const [match, setMatch] = useState(null);

  useEffect(() => {
    const fetchMatch = async () => {
      const ref = doc(db, "matches", matchId);
      const snap = await getDoc(ref);
      if (snap.exists()) setMatch({ id: snap.id, ...snap.data() });
    };
    fetchMatch();
  }, [id, matchId]);

  if (!match)
    return (
      <div className="min-h-screen bg-slate-950 text-white flex justify-center items-center">
        Loading match...
      </div>
    );

  const handleContinue = () => {
    alert("✅ Continue Match (Next step: scoring panel)");
  };

  const handleCancel = () => {
    router.push(`/tournament/${id}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main className="max-w-md mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">
          {match.tournamentName} 🏆
        </h1>

        <div className="bg-slate-800 p-4 rounded mb-6">
          <p>
            <strong>Match:</strong> {match.teamA} vs {match.teamB}
          </p>
          <p>
            <strong>Type:</strong> {match.matchType}
          </p>
          <p>
            <strong>Overs:</strong> {match.overs}
          </p>
          <p>
            <strong>Match No:</strong> {match.matchNumber}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            className="w-1/2 bg-gray-600 hover:bg-gray-700 py-2 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleContinue}
            className="w-1/2 bg-green-600 hover:bg-green-700 py-2 rounded"
          >
            Continue
          </button>
        </div>
      </main>
    </div>
  );
}
