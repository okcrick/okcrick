"use client";
import { useState } from "react";
import { db, auth } from "../../lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";

export default function CreateTournament() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    location: "",
    organiser: "",
    mobile: "",
    startDate: "",
    overs: 20,
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCancel = () => {
    router.push("/"); // Back to home
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) {
      alert("Please login first");
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "tournaments"), {
        name: form.name,
        location: form.location,
        organiser: form.organiser,
        mobile: form.mobile,
        startDate: form.startDate,
        oversLimit: Number(form.overs),
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        teams: [],
        matches: [],
        status: "not_started",
      });

      alert("✅ Tournament Created Successfully!");
      router.push(`/tournament/${docRef.id}`); // Redirect to details page
    } catch (error) {
      console.error("Error creating tournament:", error);
      alert("❌ Failed to create tournament!");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main className="max-w-md mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Create Tournament</h1>

        <form onSubmit={handleCreate} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Tournament Name"
            value={form.name}
            onChange={handleChange}
            className="w-full p-2 rounded bg-slate-800 focus:ring-2 focus:ring-indigo-500"
            required
          />

          <input
            type="text"
            name="location"
            placeholder="Location"
            value={form.location}
            onChange={handleChange}
            className="w-full p-2 rounded bg-slate-800 focus:ring-2 focus:ring-indigo-500"
            required
          />

          <input
            type="text"
            name="organiser"
            placeholder="Organiser Name"
            value={form.organiser}
            onChange={handleChange}
            className="w-full p-2 rounded bg-slate-800 focus:ring-2 focus:ring-indigo-500"
            required
          />

          <input
            type="tel"
            name="mobile"
            placeholder="Mobile Number"
            value={form.mobile}
            onChange={handleChange}
            pattern="[0-9]{10}"
            maxLength="10"
            className="w-full p-2 rounded bg-slate-800 focus:ring-2 focus:ring-indigo-500"
            required
          />

          <input
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={handleChange}
            className="w-full p-2 rounded bg-slate-800 focus:ring-2 focus:ring-indigo-500"
            required
          />

          <input
            type="number"
            name="overs"
            placeholder="Overs Limit"
            value={form.overs}
            onChange={handleChange}
            min={1}
            max={50}
            className="w-full p-2 rounded bg-slate-800 focus:ring-2 focus:ring-indigo-500"
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
                
