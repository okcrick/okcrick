"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "../../../../../../components/Navbar";
import {
  doc,
  onSnapshot,
  runTransaction,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../../../../../lib/firebase";

/**
 * Scoring Panel page — TV style.
 *
 * Features:
 * - Real-time onSnapshot for match document
 * - Uses match.toss to figure batting side; if toss missing, show message
 * - Ball events recorded atomically via runTransaction
 * - Undo (removes last event and reverses its impact)
 * - Next Over: choose next bowler (prompt)
 * - Ends innings when overs limit reached or 10 wickets fall
 *
 * Firestore match doc structure expected (example):
 * {
 *   teamA: { name: "Team A", players: ["A1","A2",...] },
 *   teamB: { name: "Team B", players: [...] },
 *   overs: 20,
 *   matchType: "League",
 *   toss: { winner: "Team A", decision: "Batting" } // optional
 *   score: {
 *     A: { runs:0, wickets:0, balls:0, batsmenStats: {...}, bowlersStats: {...} },
 *     B: { runs:0, wickets:0, balls:0, batsmenStats: {...}, bowlersStats: {...} }
 *   }
 *   events: [ { type: 'ball', runs:1, isWicket:false, bowler:'X', batsman:'Y', ts } , ...]
 *   inning: 1
 *   status: "in_progress" | "completed" | ...
 * }
 */

function oversString(balls) {
  const overs = Math.floor(balls / 6);
  const b = balls % 6;
  return `${overs}.${b}`;
}

export default function ScoringPanelPage() {
  const { id, matchId } = useParams(); // id = tournament id, matchId = match doc id
  const router = useRouter();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStriker, setSelectedStriker] = useState("");
  const [selectedNonStriker, setSelectedNonStriker] = useState("");
  const [currentBowler, setCurrentBowler] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!matchId) return;
    const ref = doc(db, "matches", matchId);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          setMatch({ id: snap.id, ...snap.data() });
        } else {
          setMatch(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error("snapshot err", err);
        setMessage("Failed to load match data.");
        setLoading(false);
      }
    );
    return () => unsub();
  }, [matchId]);

  // Helper: determine batting side key 'A' or 'B'
  const getBattingKey = (m) => {
    if (!m) return "A";
    // First check explicit battingFirst (some earlier code used battingFirst)
    if (m.battingFirst === "A" || m.battingFirst === "B") return m.battingFirst;
    // else derive from toss: winner + decision
    if (m.toss) {
      const { winner, decision } = m.toss;
      // winner is team name string (not 'A'/'B'), so compare
      const teamAName = m.teamA?.name;
      const winnerKey = winner === teamAName ? "A" : "B";
      if (decision === "Batting") return winnerKey;
      return winnerKey === "A" ? "B" : "A";
    }
    // fallback: A
    return "A";
  };

  const battingKey = getBattingKey(match);
  const battingTeam = match ? (battingKey === "A" ? match.teamA : match.teamB) : null;
  const fieldingTeam = match ? (battingKey === "A" ? match.teamB : match.teamA) : null;
  const score = match ? (match.score?.[battingKey] || { runs: 0, wickets: 0, balls: 0 }) : null;
  const oversLimit = match?.overs || match?.oversLimit || 20;
  const inningsOver =
    score && (Math.floor(score.balls / 6) >= Number(oversLimit) || score.wickets >= 10);

  // When user records a ball: use runTransaction to update score and events atomically
  async function recordBall(runs = 0, isWicket = false) {
    if (!match) return;
    if (inningsOver) {
      alert("Innings is already over.");
      return;
    }
    if (!selectedStriker) {
      alert("Select striker first.");
      return;
    }
    if (!currentBowler) {
      alert("Select current bowler.");
      return;
    }

    const matchRef = doc(db, "matches", matchId);

    try {
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(matchRef);
        if (!snap.exists()) throw new Error("Match does not exist");
        const cur = snap.data();

        // determine batting side
        const bKey =
          cur.battingFirst === "A" || cur.battingFirst === "B"
            ? cur.battingFirst
            : (() => {
                if (cur.toss) {
                  const teamAName = cur.teamA?.name;
                  const winnerKey = cur.toss.winner === teamAName ? "A" : "B";
                  return cur.toss.decision === "Batting"
                    ? winnerKey
                    : winnerKey === "A"
                    ? "B"
                    : "A";
                }
                return "A";
              })();

        // prepare score object if missing
        cur.score = cur.score || { A: { runs: 0, wickets: 0, balls: 0 }, B: { runs: 0, wickets: 0, balls: 0 } };
        const s = cur.score[bKey];

        // update numeric fields step-by-step (digit-safe)
        // runs
        const prevRuns = Number(s.runs || 0);
        const newRuns = prevRuns + Number(runs);
        s.runs = newRuns;
        // balls
        const prevBalls = Number(s.balls || 0);
        const newBalls = prevBalls + 1;
        s.balls = newBalls;
        // wickets
        if (isWicket) {
          const prevW = Number(s.wickets || 0);
          s.wickets = prevW + 1;
        }

        // update batsman stats
        cur.score[bKey].batsmenStats = cur.score[bKey].batsmenStats || {};
        const batsmenStats = cur.score[bKey].batsmenStats;
        if (!batsmenStats[selectedStriker]) batsmenStats[selectedStriker] = { runs: 0, balls: 0, out: false };
        batsmenStats[selectedStriker].runs += Number(runs);
        batsmenStats[selectedStriker].balls += 1;
        if (isWicket) batsmenStats[selectedStriker].out = true;

        // update bowler stats
        cur.score[bKey].bowlersStats = cur.score[bKey].bowlersStats || {};
        const bowlersStats = cur.score[bKey].bowlersStats;
        if (!bowlersStats[currentBowler]) bowlersStats[currentBowler] = { overs: 0, balls: 0, runs: 0, wickets: 0 };
        bowlersStats[currentBowler].balls += 1;
        bowlersStats[currentBowler].runs += Number(runs);
        if (isWicket) bowlersStats[currentBowler].wickets += 1;
        // normalize overs for bowler (digit-by-digit)
        bowlersStats[currentBowler].overs = Math.floor(bowlersStats[currentBowler].balls / 6) + (bowlersStats[currentBowler].balls % 6) / 10;

        // push event
        cur.events = cur.events || [];
        const ev = {
          type: "ball",
          runs: Number(runs),
          isWicket: !!isWicket,
          bowler: currentBowler,
          batsman: selectedStriker,
          striker: selectedStriker,
          nonStriker: selectedNonStriker || null,
          inning: cur.inning || 1,
          ts: serverTimestamp(),
        };
        cur.events.push(ev);

        // check end-of-innings
        const oversCompleted = Math.floor(s.balls / 6);
        const isOverComplete = oversCompleted >= Number(oversLimit);
        const isAllOut = s.wickets >= 10;
        if (isOverComplete || isAllOut) {
          // if first inning and second not started, flip inning
          if (!cur.inning || cur.inning === 1) {
            cur.inning = 2;
            // switch battingFirst
            cur.battingFirst = bKey === "A" ? "B" : "A";
            cur.status = "in_between_innings";
          } else {
            cur.status = "completed";
          }
        } else {
          cur.status = "in_progress";
        }

        tx.update(matchRef, { score: cur.score, events: cur.events, inning: cur.inning, battingFirst: cur.battingFirst, status: cur.status });
      });
    } catch (err) {
      console.error("recordBall tx err", err);
      alert("Failed to record ball: " + (err.message || err));
    }
  }

  // Undo last event
  async function undoLast() {
    const matchRef = doc(db, "matches", matchId);
    try {
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(matchRef);
        if (!snap.exists()) throw new Error("Match not found");
        const cur = snap.data();
        const evs = cur.events || [];
        if (evs.length === 0) throw new Error("No events to undo");
        const last = evs[evs.length - 1];
        if (last.type !== "ball") throw new Error("Last event not a ball");
        // determine batting key when that event happened — use last.inning and battingFirst at that time not tracked; assume it was same side as current inning's(ball recorded side)
        const bKeyAtEvent = (() => {
          // simple heuristic: if last.batsman exists in teamA players then A else B
          const teamAPlayers = cur.teamA?.players || [];
          return teamAPlayers.includes(last.batsman) ? "A" : "B";
        })();

        // revert numeric fields
        const s = cur.score[bKeyAtEvent];
        s.runs = Number(s.runs || 0) - Number(last.runs || 0);
        s.balls = Number(s.balls || 0) - 1;
        if (last.isWicket) s.wickets = Number(s.wickets || 0) - 1;

        // revert batsman stats
        cur.score[bKeyAtEvent].batsmenStats = cur.score[bKeyAtEvent].batsmenStats || {};
        const bstats = cur.score[bKeyAtEvent].batsmenStats[last.batsman] || { runs: 0, balls: 0, out: false };
        bstats.runs = Number(bstats.runs || 0) - Number(last.runs || 0);
        bstats.balls = Number(bstats.balls || 0) - 1;
        if (last.isWicket) bstats.out = false;
        cur.score[bKeyAtEvent].batsmenStats[last.batsman] = bstats;

        // revert bowler stats
        cur.score[bKeyAtEvent].bowlersStats = cur.score[bKeyAtEvent].bowlersStats || {};
        const bowl = cur.score[bKeyAtEvent].bowlersStats[last.bowler] || { balls: 0, runs: 0, wickets: 0 };
        bowl.balls = Math.max(0, Number(bowl.balls || 0) - 1);
        bowl.runs = Math.max(0, Number(bowl.runs || 0) - Number(last.runs || 0));
        if (last.isWicket) bowl.wickets = Math.max(0, Number(bowl.wickets || 0) - 1);
        // recompute overs decimal
        bowl.overs = Math.floor(bowl.balls / 6) + (bowl.balls % 6) / 10;
        cur.score[bKeyAtEvent].bowlersStats[last.bowler] = bowl;

        // pop event
        cur.events = evs.slice(0, evs.length - 1);

        // adjust inning/status if needed: if previously set to in_between_innings because overs reached, recalc
        const oversCompleted = Math.floor(s.balls / 6);
        const isOverComplete = oversCompleted >= Number(oversLimit);
        const isAllOut = s.wickets >= 10;
        if (isOverComplete || isAllOut) {
          cur.status = "in_between_innings";
        } else {
          cur.status = "in_progress";
        }

        tx.update(matchRef, { score: cur.score, events: cur.events, status: cur.status });
      });
    } catch (err) {
      console.error("undo err", err);
      alert("Undo failed: " + (err.message || err));
    }
  }

  // Next Over -> choose bowler (simple prompt)
  async function nextOver() {
    if (!fieldingTeam?.players?.length) {
      alert("No players available for fielding team.");
      return;
    }
    const bowler = prompt("Enter next over bowler name (type exact):", fieldingTeam.players[0] || "");
    if (!bowler) return;
    setCurrentBowler(bowler);
    setMessage(`Current bowler set: ${bowler}`);
  }

  // quick create for selecting striker / non-striker from batting team
  function autoSelectDefaults() {
    if (battingTeam?.players && battingTeam.players.length >= 2) {
      setSelectedStriker(battingTeam.players[0]);
      setSelectedNonStriker(battingTeam.players[1]);
    }
    if (fieldingTeam?.players && fieldingTeam.players.length >= 1) {
      setCurrentBowler(fieldingTeam.players[0]);
    }
  }

  // UI layout
  if (loading)
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading scoring panel...
      </div>
    );

  if (!match)
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Match not found.
      </div>
    );

  // If toss missing, show message and back link
  if (!match.toss) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Navbar />
        <main className="max-w-3xl mx-auto p-6">
          <h2 className="text-2xl font-bold mb-4">Toss Required</h2>
          <p className="mb-4">Please complete toss first (via Continue → Toss) before scoring.</p>
          <div className="flex gap-3">
            <button onClick={() => router.push(`/tournament/${id}/match/${matchId}`)} className="bg-gray-600 px-4 py-2 rounded">Back</button>
          </div>
        </main>
      </div>
    );
  }

  // main scoring UI
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navbar />
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-600 rounded-lg p-4 text-white shadow-md mb-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm opacity-80">{match.tournamentName}</div>
              <div className="text-2xl font-bold">{match.teamA} vs {match.teamB}</div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-extrabold">{score?.runs ?? 0}</div>
              <div className="text-sm opacity-80">{score?.wickets ?? 0} wickets • {oversString(score?.balls ?? 0)} overs</div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="grid md:grid-cols-3 gap-4">
          {/* Left: Batsmen */}
          <div className="col-span-1 bg-slate-800 p-4 rounded">
            <h3 className="font-semibold mb-2">Batsmen</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs opacity-80">Striker</label>
                <select value={selectedStriker} onChange={(e)=>setSelectedStriker(e.target.value)} className="w-full p-2 rounded bg-slate-700">
                  <option value="">Select Striker</option>
                  {battingTeam?.players?.map((p,i)=>(<option key={i} value={p}>{p}</option>))}
                </select>
              </div>

              <div>
                <label className="block text-xs opacity-80">Non-Striker</label>
                <select value={selectedNonStriker} onChange={(e)=>setSelectedNonStriker(e.target.value)} className="w-full p-2 rounded bg-slate-700">
                  <option value="">Select Non-Striker</option>
                  {battingTeam?.players?.map((p,i)=>(<option key={i} value={p}>{p}</option>))}
                </select>
              </div>

              <button onClick={autoSelectDefaults} className="w-full bg-indigo-600 hover:bg-indigo-700 py-2 rounded">Auto select</button>

              <div className="mt-3">
                <h4 className="text-sm font-semibold mb-2">Batsmen Stats</h4>
                <div className="text-xs space-y-2 max-h-40 overflow-auto">
                  {score?.batsmenStats ? (
                    Object.entries(score.batsmenStats).map(([name,st])=>(
                      <div key={name} className="flex justify-between">
                        <div>{name}</div>
                        <div>{st.runs}/{st.balls}{st.out? " (out)": ""}</div>
                      </div>
                    ))
                  ) : <div className="text-gray-400">No stats</div>}
                </div>
              </div>
            </div>
          </div>

          {/* Center: Big Controls */}
          <div className="col-span-1 bg-slate-800 p-4 rounded flex flex-col justify-between">
            <div>
              <h3 className="font-semibold mb-2">Controls</h3>
              <div className="grid grid-cols-4 gap-2">
                {[0,1,2,3,4,6].map(n=>(
                  <button key={n} onClick={()=>recordBall(n,false)} className="py-3 rounded bg-indigo-600 hover:bg-indigo-700">{n}</button>
                ))}
                <button onClick={()=>recordBall(0,true)} className="py-3 rounded bg-red-600 hover:bg-red-700">W</button>
                <button onClick={undoLast} className="py-3 rounded bg-gray-600 hover:bg-gray-700">Undo</button>
                <button onClick={nextOver} className="py-3 rounded bg-amber-600 hover:bg-amber-700">Next Over</button>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="text-sm font-semibold mb-2">Events (latest 10)</h4>
              <div className="text-xs max-h-40 overflow-auto space-y-1">
                {match.events?.slice(-10).reverse().map((ev, idx)=>(
                  <div key={idx} className="flex justify-between">
                    <div>
                      {ev.type === 'ball' ? `${ev.batsman} — ${ev.runs}${ev.isWicket? ' W':''}` : JSON.stringify(ev)}
                    </div>
                    <div className="opacity-70 text-xs">{ev.bowler}</div>
                  </div>
                )) || <div className="text-gray-400">No events</div>}
              </div>
            </div>
          </div>

          {/* Right: Bowler & Match Info */}
          <div className="col-span-1 bg-slate-800 p-4 rounded">
            <h3 className="font-semibold mb-2">Bowler</h3>
            <select value={currentBowler} onChange={(e)=>setCurrentBowler(e.target.value)} className="w-full p-2 rounded bg-slate-700 mb-3">
              <option value="">Select Bowler</option>
              {fieldingTeam?.players?.map((p,i)=>(<option key={i} value={p}>{p}</option>))}
            </select>

            <div className="mb-4">
              <h4 className="text-sm font-semibold">Bowler Stats</h4>
              <div className="text-xs space-y-2 max-h-40 overflow-auto">
                {score?.bowlersStats ? (
                  Object.entries(score.bowlersStats).map(([name,st])=>(
                    <div key={name} className="flex justify-between">
                      <div>{name}</div>
                      <div>{st.overs ? st.overs : (Math.floor(st.balls/6) + "." + (st.balls%6))} / {st.runs} / {st.wickets}</div>
                    </div>
                  ))
                ) : <div className="text-gray-400">No bowlers yet</div>}
              </div>
            </div>

            <div className="mt-4">
              <h4 className="text-sm font-semibold">Match Info</h4>
              <div className="text-xs mt-2">
                <div>Type: {match.matchType}</div>
                <div>Overs limit: {oversLimit}</div>
                <div>Inning: {match.inning || 1}</div>
                <div>Status: {match.status}</div>
              </div>
            </div>

            <div className="mt-4">
              <button onClick={()=>router.push(`/tournament/${id}/match/${matchId}`)} className="w-full bg-gray-600 py-2 rounded mb-2">Back</button>
              <button onClick={()=>{ alert('Scoring saved automatically.'); }} className="w-full bg-green-600 py-2 rounded">Done</button>
            </div>
          </div>
        </div>

        {message && <div className="mt-4 text-sm text-yellow-300">{message}</div>}
      </div>
    </div>
  );
      }
          
