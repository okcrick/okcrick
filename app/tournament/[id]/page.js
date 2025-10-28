"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "../../../lib/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import Navbar from "../../../components/Navbar";

export default function TournamentDetails() {
  const { id } = useParams();
  const router = useRouter();

  const [tournament, setTournament] = useState(null);
  const [teamName, setTeamName] = useState("");
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [playerName, setPlayerName] = useState("");

  useEffect(() => {
    async function fetchData() {
      const ref = doc(db, "tournaments", id);
      const snap = await getDoc(ref);
      if (snap.exists()) setTournament({ id: snap.id, ...snap.data() });
    }
    fetchData();
  }, [id]);

  const addTeam = async () => {
    if (!teamName.trim()) return alert("Enter team name");
    const ref = doc(db, "tournaments", id);
    const newTeam = { name: teamName, players: [] };
    await updateDoc(ref, { teams: arrayUnion(newTeam) });
    alert("✅ Team Added!");
    setTeamName("");
    location.reload();
  };

  const addPlayer = async () => {
    if (!playerName.trim() || selectedTeam === null)
      return alert("Select a team and enter player name");

    const ref = doc(db, "tournaments", id);
    const tSnap = await getDoc(ref);
    const data = tSnap.data();
    const teams = data.teams || [];

    teams[selectedTeam].players.push(playerName);
    await updateDoc(ref, { teams });
    alert("✅ Player Added!");
    setPlayerName("");
    location.reload();
  };

  const createMatch = async () => {
    if (!tournament?.teams || tournament.teams.length < 2) {
      alert("Add at least 2 teams to create a match");
      return;
    }

    await addDoc(collection(db, "matches"), {
      tournamentId: id,
      tournamentName: tournament.name,
      teamA: tournament.teams[0],
      teamB: tournament.teams[1],
      oversLimit: tournament.oversLimit,
      status: "not_started",
      createdAt: serverTimestamp(),
    });

    alert("✅ Match Created Successfully!");
    router.push("/");
  };

  if (!tournament) return <div className="text-white p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">{tournament.name}</h1>

        <div className="bg-slate-800 p-4 rounded mb-6">
          <p><b>📍 Location:</b> {tournament.location}</p>
          <p><b>👤 Organiser:</b> {tournament.organiser}</p>
          <p><b>📞 Mobile:</b> {tournament.mobile}</p>
          <p><b>📅 Start Date:</b> {tournament.startDate}</p>
          <p><b>🏏 Overs Limit:</b> {tournament.oversLimit}</p>
        </div>

        <div className="bg-slate-800 p-4 rounded mb-6">
          <h2 className="text-xl font-semibold mb-2">Add Team</h2>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Team Name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="flex-1 p-2 rounded bg-slate-700"
            />
            <button
              onClick={addTeam}
              className="bg-indigo-600 hover:bg-indigo-700 px-3 rounded"
            >
              Add
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {tournament.teams?.map((team, i) => (
              <div
                key={i}
                className="bg-slate-700 p-3 rounded"
              >
                <h3 className="text-lg font-semibold">
                  🏏 {team.name}
                </h3>

                <ul className="text-sm mt-2 list-disc ml-5">
                  {team.players.map((p, j) => (
                    <li key={j}>{p}</li>
                  ))}
                </ul>

                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    placeholder="Add Player"
                    value={selectedTeam === i ? playerName : ""}
                    onChange={(e) => {
                      setSelectedTeam(i);
                      setPlayerName(e.target.value);
                    }}
                    className="flex-1 p-2 rounded bg-slate-800"
                  />
                  <button
                    onClick={addPlayer}
                    className="bg-green-600 hover:bg-green-700 px-3 rounded"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={createMatch}
          className="w-full bg-pink-600 hover:bg-pink-700 py-2 rounded font-semibold"
        >
          🎯 Create Match
        </button>
      </main>
    </div>
  );
    }
