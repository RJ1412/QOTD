// DashboardPage.jsx
import { useEffect } from "react";
import { useQotdStore } from "../store/useQotdStore";
import { useAuthStore } from "../store/useAuthStore";
import { Link } from "react-router-dom";

export default function DashboardPage() {
  const {
    question,
    topThree,
    leaderboard,
    allQuestions,
    fetchTodayQuestion,
    updateStatus,
    fetchLeaderboard,
    fetchAllQuestions,
  } = useQotdStore();

  const { user } = useAuthStore();

  useEffect(() => {
    fetchTodayQuestion();
    fetchLeaderboard();
    fetchAllQuestions();
  }, []);

  const handleUpdateStatus = async () => {
    await updateStatus();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e0f2fe] via-[#fdfdea] to-[#fff1f5] dark:from-[#1a1a1a] dark:via-[#2a2a2a] dark:to-[#1c1c1c] transition-colors duration-500 p-8">
      <h1 className="text-3xl md:text-4xl font-bold text-[#5b2c6f] dark:text-white mb-8">
        Welcome back, {user?.srn || user?.email}!
      </h1>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white/70 dark:bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-xl">
          <h2 className="text-xl font-semibold text-[#0077b6] dark:text-white mb-4">Question of the Day</h2>
          {question ? (
            <>
              <p className="text-[#1a1a1a] dark:text-white font-medium mb-2">{question.title}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Rating: {question.rating}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Tags: {question.tags?.join(", ")}</p>
              <div className="flex gap-4">
                <a
                  href={question.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#90e0ef] dark:bg-[#0077b6] text-[#1a1a1a] dark:text-white rounded-lg font-semibold"
                >
                  Solve Now
                </a>
                <button
                  onClick={handleUpdateStatus}
                  className="px-4 py-2 bg-green-300 dark:bg-green-600 text-[#1a1a1a] dark:text-white rounded-lg font-semibold"
                >
                  Update Status
                </button>
              </div>
            </>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No question available for today.</p>
          )}
        </div>

        <div className="bg-white/70 dark:bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-xl">
          <h2 className="text-xl font-semibold text-[#0077b6] dark:text-white mb-4">Top 3 Leaderboard</h2>
          <ul className="text-[#1a1a1a] dark:text-white space-y-2">
            {Array.isArray(topThree) && topThree.length > 0 ? (
              topThree.map((user, idx) => (
                <li key={idx} className="flex justify-between border-b border-gray-300 dark:border-gray-600 pb-2">
                  <span>{user.srn || user.email}</span>
                  <span>{user.points} pts</span>
                </li>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No leaderboard data</p>
            )}
          </ul>
          <Link
            to="/leaderboard"
            className="mt-4 inline-block text-sm text-blue-600 dark:text-blue-400 underline"
          >
            View Full Leaderboard
          </Link>
        </div>
      </div>

      <div className="mt-10 bg-white/70 dark:bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-xl">
        <h2 className="text-xl font-semibold text-[#0077b6] dark:text-white mb-4">All Questions (Datewise)</h2>
        <ul className="text-[#1a1a1a] dark:text-white space-y-2">
          {Array.isArray(allQuestions) && allQuestions.length > 0 ? (
            allQuestions.map((q, idx) => (
              <li key={idx} className="flex justify-between border-b border-gray-300 dark:border-gray-600 pb-2">
                <span>{q.title}</span>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {new Date(q.date).toLocaleDateString()}
                </span>
              </li>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No questions available yet.</p>
          )}
        </ul>
      </div>
    </div>
  );
}
