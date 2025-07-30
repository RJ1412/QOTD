// components/LeaderboardModal.jsx
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useQotdStore } from "../store/useQotdStore";

export default function LeaderboardModal({ isOpen, onClose }) {
  const { leaderboard, fetchLeaderboard, loading } = useQotdStore();
  const [search, setSearch] = useState("");

  const [ranked, setRanked] = useState([]);

  // Fetch once when modal opens
  useEffect(() => {
    if (isOpen) fetchLeaderboard();
  }, [isOpen]);

  // Compute global ranks when leaderboard changes
  useEffect(() => {
    const rankedData = [...leaderboard]
      .sort((a, b) => b.points - a.points)
      .map((user, index) => ({ ...user, rank: index + 1 }));

    setRanked(rankedData);
  }, [leaderboard]);

  // Filter by SRN, name, or handle
  const filtered = ranked.filter((user) =>
    user.srn?.toLowerCase().includes(search.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0e0e1b] w-full max-w-3xl p-6 rounded-xl border border-cyan-500 relative shadow-xl"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-cyan-400 hover:text-white"
        >
          <X />
        </button>

        <h2 className="text-2xl text-center font-bold text-cyan-400 mb-4 glow">
          🚀 CodeClub Leaderboard
        </h2>

        <input
          type="text"
          placeholder="Search by name, handle, or SRN..."
          className="w-full px-4 py-2 mb-4 rounded-md bg-[#1a1a2e] text-white placeholder-gray-400 border border-gray-600 focus:outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {loading ? (
          <p className="text-white text-center">Loading leaderboard...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-pink-400">No results found.</p>
        ) : (
          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            <table className="w-full table-auto text-white text-sm">
              <thead className="bg-gradient-to-r from-cyan-700 to-cyan-500 text-black">
                <tr>
                  <th className="py-2 px-4">🏅 Rank</th>
                  <th className="py-2 px-4">🧑 Name</th>
                  <th className="py-2 px-4">⭐ Score</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id} className="bg-zinc-900 text-white rounded-lg">
                    <td className="px-4 py-3">{user.rank}</td>
                    <td className="px-4 py-3 font-mono">{user.srn}</td>
                    <td className="px-4 py-3 font-semibold">{user.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
