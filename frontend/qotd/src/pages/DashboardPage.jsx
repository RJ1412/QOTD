import { useEffect, useState } from "react";
import { useQotdStore } from "../store/useQotdStore";
import { useAuthStore } from "../store/useAuthStore";
import { Link } from "react-router-dom";
import {
  LogOut,
  UserCircle2,
  ListOrdered,
  ClipboardList,
  TerminalSquare,
  Code2,
  ShieldCheck,
  Link2,
} from "lucide-react";

export default function DashboardPage() {
  const [handle, setHandle] = useState("");

  const {
    todaysQuestion,
    leaderboard,
    allQuestions,
    fetchTodaysQuestion,
    fetchLeaderboard,
    fetchAllQuestions,
    verifyAndAward,
    linkHandle,
    fetchLinkedHandle,
    loading,
    error,
    fetchSubmissions,
    submissions,
    linkedHandle,
  } = useQotdStore();

  const { authUser, logout } = useAuthStore();

  useEffect(() => {
    fetchTodaysQuestion();
    fetchLeaderboard();
    fetchAllQuestions();
    fetchSubmissions();
    fetchLinkedHandle();
  }, []);

  const handleUpdateStatus = async () => {
    await verifyAndAward();
    fetchLeaderboard();
    fetchSubmissions();
  };

  const handleLink = async () => {
    if (!handle) return;
    const res = await linkHandle(handle);
    if (res?.success) {
      setHandle("");
      fetchLinkedHandle();
    }
  };

  const getStatusColor = (questionTitle) => {
    if (!Array.isArray(submissions)) return "bg-gray-200";
    const sub = submissions.find((s) => s.problemTitle === questionTitle);
    if (!sub) return "bg-gray-200";
    return sub.verdict === "OK" ? "bg-green-500 text-white" : "bg-red-500 text-white";
  };

  const displayCount = leaderboard?.length >= 3 ? 3 : leaderboard?.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white p-6 md:p-8 font-mono">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-cyan-400 flex items-center gap-2">
          <TerminalSquare className="text-cyan-500" />
          Welcome, {authUser?.srn || authUser?.email || "Coder"}!
        </h1>
        <button onClick={logout} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 transition text-white rounded-lg font-bold">
          <LogOut size={18} /> Logout
        </button>
      </div>

      {/* CF Handle Section */}
      <div className="mb-8 bg-gray-900 p-4 rounded-xl shadow-lg flex flex-col md:flex-row md:items-center gap-4">
        <Link2 className="text-pink-400" size={20} />
        {linkedHandle ? (
          <p className="text-green-400 font-semibold">
            Linked Handle: <span className="text-white">{linkedHandle}</span>
          </p>
        ) : (
          <>
            <input
              type="text"
              placeholder="Enter Codeforces Handle"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-600 bg-gray-800 text-white w-full md:w-auto"
            />
            <button
              onClick={handleLink}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 transition text-white rounded-lg font-semibold"
            >
              Link Handle
            </button>
          </>
        )}
        {linkedHandle && (
          <p className="text-xs text-gray-400 italic">Once linked, it cannot be changed.</p>
        )}
      </div>

      {/* Dashboard Icons */}
      <div className="flex gap-6 text-cyan-300 text-xl mb-6 animate-pulse">
        <UserCircle2 />
        <ListOrdered />
        <ClipboardList />
        <Code2 />
        <ShieldCheck />
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* QOTD Section */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-2xl">
          <h2 className="text-2xl font-bold text-purple-400 mb-4">Question of the Day</h2>
          {todaysQuestion ? (
            <>
              <p className="text-xl font-semibold mb-2 text-white">{todaysQuestion.title}</p>
              <p className="text-sm text-gray-400 mb-1">Rating: {todaysQuestion.rating || "N/A"}</p>
              <p className="text-sm text-gray-400 mb-4">Tags: {todaysQuestion.tags?.join(", ") || "None"}</p>
              <div className="flex gap-4">
                <a
                  href={todaysQuestion.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-semibold transition"
                >
                  Solve Now
                </a>
                <button
                  onClick={handleUpdateStatus}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
                >
                  Update Status
                </button>
              </div>
            </>
          ) : (
            <p className="text-gray-400 italic">Loading question...</p>
          )}
        </div>

        {/* Leaderboard Section */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-2xl">
          <h2 className="text-2xl font-bold text-orange-400 mb-4">Top {displayCount} Leader{displayCount === 1 ? "" : "s"}</h2>
          {displayCount > 0 ? (
            <>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-600">
                    <th className="py-2">User</th>
                    <th>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.slice(0, displayCount).map((u, idx) => (
                    <tr key={idx} className="border-b border-gray-700 hover:bg-gray-700/20">
                      <td className="py-2 text-white">{u.srn || u.email}</td>
                      <td className="text-cyan-300 font-bold">{u.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {leaderboard.length > displayCount && (
                <Link
                  to="/leaderboard"
                  className="mt-4 inline-block text-sm text-blue-400 underline"
                >
                  View Full Leaderboard
                </Link>
              )}
            </>
          ) : (
            <p className="text-gray-400 italic">Loading leaderboard...</p>
          )}
        </div>
      </div>

      {/* All Questions Table */}
      <div className="mt-10 bg-gray-800 p-6 rounded-xl shadow-2xl">
        <h2 className="text-2xl font-bold text-yellow-400 mb-4">All Questions</h2>
        {allQuestions && allQuestions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-600">
                  <th className="py-2">Title</th>
                  <th>Rating</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allQuestions.map((q, idx) => (
                  <tr key={idx} className="border-b border-gray-700 hover:bg-gray-700/20">
                    <td className="py-2 text-white">{q.title}</td>
                    <td className="text-cyan-300">{q.rating || "N/A"}</td>
                    <td className="text-gray-400">{new Date(q.date).toLocaleDateString()}</td>
                    <td className="flex gap-2 py-2">
                      <a
                        href={q.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition"
                      >
                        Visit
                      </a>
                      <button
                        onClick={handleUpdateStatus}
                        className={`px-3 py-1 rounded-md transition ${getStatusColor(q.title)}`}
                      >
                        Check
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400 italic">Loading all questions...</p>
        )}
      </div>
    </div>
  );
}
