import Navbar from '../components/Navbar';
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export default function Home() {
  const [score, setScore] = useState(null);

  useEffect(() => {
    // Firebase se match ka data lena
    const unsub = onSnapshot(doc(db, "matches", "match1"), (doc) => {
      if (doc.exists()) {
        setScore(doc.data());
      }
    });
    return () => unsub();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <main className="container mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-extrabold text-gray-800">Live Match Updates</h2>
          <p className="text-gray-600">Har ball ki update, bina refresh kiye!</p>
        </div>

        {/* Live Score Card */}
        <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border-b-8 border-blue-600">
          <div className="bg-blue-600 p-4 text-white text-center font-bold uppercase tracking-widest">
            {score ? score.matchStatus : "Live Match"}
          </div>
          
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <div className="text-center">
                <p className="text-xl font-bold text-gray-700">{score?.teamA || 'Team A'}</p>
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto my-2 flex items-center justify-center text-2xl">🏏</div>
              </div>
              
              <div className="text-4xl font-black text-blue-700">VS</div>
              
              <div className="text-center">
                <p className="text-xl font-bold text-gray-700">{score?.teamB || 'Team B'}</p>
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto my-2 flex items-center justify-center text-2xl">🏏</div>
              </div>
            </div>

            <div className="text-center border-t border-gray-100 pt-6">
              {score ? (
                <>
                  <div className="text-7xl font-black text-gray-800">
                    {score.runs} / {score.wickets}
                  </div>
                  <div className="text-2xl font-semibold text-gray-500 mt-2">
                    Overs: {score.overs}
                  </div>
                </>
              ) : (
                <div className="animate-pulse text-gray-400 text-xl font-bold">
                  Fetching live score...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-100 p-6 rounded-xl text-center">
            <h3 className="font-bold text-blue-800">Real-time Data</h3>
            <p className="text-sm text-blue-600 mt-2">Firebase Firestore ki power se score turant update hota hai.</p>
          </div>
          <div className="bg-green-100 p-6 rounded-xl text-center">
            <h3 className="font-bold text-green-800">Next.js Optimized</h3>
            <p className="text-sm text-green-600 mt-2">Vercel par deploy hone ke liye tayyar.</p>
          </div>
          <div className="bg-yellow-100 p-6 rounded-xl text-center">
            <h3 className="font-bold text-yellow-800">Responsive</h3>
            <p className="text-sm text-yellow-600 mt-2">Mobile aur Desktop dono par perfectly dikhta hai.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

