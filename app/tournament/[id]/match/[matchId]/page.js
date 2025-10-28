"use client";
import { useEffect, useState } from "react";
import { db } from "../../../../../lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import Navbar from "../../../../../components/Navbar";

export default function MatchDetailsPage() {
  const { id, matchId } = useParams();
  const router = useRouter();
  const [match, setMatch] = useState(null);
  const [showToss, setShowToss] = useState(false);
  const [tossData, setTossData] = useState({ winner: "", decision: "" });

  useEffect(() => {
    const fetchMatch = async () => {
      const ref = doc(db, "matches", matchId);
      const snap = await getDoc(ref);
      if (snap.exists()) setMatch({ id: snap.id, ...snap.data() });
    };
    fetchMatch();
  }, [matchId]);

  const handleContinue = () => {
    if (!match?.toss) {
      setShowToss(true); // show toss first time
    } else {
      router.push(`/tournament/${id}/match/${matchId}/scoring-panel`);
    }
  };

  const handleTossSubmit = async () => {
    if (!tossData.winner || !tossData.decision)
      return alert("Please select both toss winner and decision!");

    const ref = doc(db, "matches", matchId);
    await updateDoc(ref, {
      toss: tossData,
      status: "toss_done",
    });

    alert("✅ Toss completed!");
    router.push(`/tournament/${id}/match/${matchId}/scoring-panel`);
  };

  const handleBack = () => setShowToss(false);
  const handleCancel = () => router.push(`/tournament/${id}`);

  if (!match)
    return (
      <div className="min-h-screen bg-slate-950 text-white flex justify-center items-center">
        Loading match...
      </div>
    );

  // 🏏 --- Normal Match Details (Before Toss) ---
  if (!showToss)
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

            {match.toss && (
              <p className="mt-2 text-green-400">
                🪙 Toss Done — {match.toss.winner} chose {match.toss.decision}
              </p>
            )}
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

  // 🪙 --- Toss Section ---
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main className="max-w-md mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">
          🪙 Toss — {match.teamA} vs {match.teamB}
        </h1>

        <div className="space-y-4 bg-slate-800 p-4 rounded">
          <div>
            <label className="block mb-2 font-semibold">Toss Winner</label>
            <select
              value={tossData.winner}
              onChange={(e) =>
                setTossData({ ...tossData, winner: e.target.value })
              }
              className="w-full p-2 rounded bg-slate-700"
            >
              <option value="">Select Winner</option>
              <option value={match.teamA}>{match.teamA}</option>
              <option value={match.teamB}>{match.teamB}</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 font-semibold">Decision</label>
            <select
              value={tossData.decision}
              onChange={(e) =>
                setTossData({ ...tossData, decision: e.target.value })
              }
              className="w-full p-2 rounded bg-slate-700"
            >
              <option value="">Choose Decision</option>
              <option value="Batting">Batting</option>
              <option value="Fielding">Fielding</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleBack}
              className="w-1/2 bg-gray-600 hover:bg-gray-700 py-2 rounded"
            >
              Back
            </button>
            <button
              onClick={handleTossSubmit}
              className="w-1/2 bg-indigo-600 hover:bg-indigo-700 py-2 rounded"
            >
              Confirm Toss
            </button>
          </div>
        </div>
      </main>
    </div>
  );
                }
                
