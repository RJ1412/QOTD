import { useEffect, useState } from "react";
import { useQotdStore } from "../store/useQotdStore";
import { useAuthStore } from "../store/useAuthStore";
import { Link } from "react-router-dom";
import EditorialModal from "../components/EditorialModal";
const { checkAuth } = useAuthStore.getState(); // or use hook

import {
  LogOut,
  UserCircle2,
  ListOrdered,
  ClipboardList,
  TerminalSquare,
  Code2,
  ShieldCheck,
  Link2,
  Pencil,
  X,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import LeaderboardModal from "../components/LeaderboardModal";

export default function DashboardPage() {
  const [isEditorialOpen, setIsEditorialOpen] = useState(false);
 const [handle, setHandle] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedEmail, setEditedEmail] = useState("");
  const [editedImage, setEditedImage] = useState("");
  const {
    todaysQuestion,
    leaderboard,
    allQuestions,
    fetchTodaysQuestion,
    fetchLeaderboard,
    fetchAllQuestions,
    verifyAndAward,
    linkHandle,
    fetchSubmissions,
    submissions,
    fetchLinkedHandle,
    fetchEditorialIfAllowed,
  } = useQotdStore();

  const { authUser, logout, setAuthUser } = useAuthStore();
  const [showEditorial, setShowEditorial] = useState(false);

  useEffect(() => {
    fetchTodaysQuestion();
  }, []);

  

  useEffect(() => {
    fetchTodaysQuestion();
    fetchLeaderboard();
    fetchAllQuestions();
    fetchSubmissions();

    if (authUser) {
      console.log(authUser);
      
      setEditedName(authUser.name || "");
      setEditedEmail(authUser.email || "");
      setEditedImage(authUser.profileImage || "");
    }

    if (!authUser.codeforcesHandle) {
      fetchLinkedHandle().then((res) => {
        if (res?.cfHandle) {
          setAuthUser({ ...authUser, codeforcesHandle: res.cfHandle });
        }
      });
    }
  }, []);
const [showModal, setShowModal] = useState(false);
  const handleLink = async () => {
    if (!handle) return;
    try {
      const res = await linkHandle(handle);
      if (res?.success && res.updatedUser) {
        setAuthUser(res.updatedUser);
        setHandle("");
        toast.success("Codeforces handle linked!");
      } else {
        toast.error("Failed to link Codeforces handle.");
      }
    } catch (err) {
      console.error("Error linking handle", err);
      toast.error("Something went wrong while linking.");
    }
  };

  const handleUpdateStatus = async (title) => {
    if (!authUser?.codeforcesHandle) {
      toast.error("⚠️ Link your Codeforces handle first");
      return;
    }

    const res = await verifyAndAward(title, authUser.codeforcesHandle);

    if (res?.status === "ACCEPTED") {
      toast.success("✅ Solved!");
    } else if (res?.status === "REJECTED") {
      toast.error("❌ Not solved yet on Codeforces");
    }
    else if (res?.status === "EXPIRED") {
      toast.error("❌ This question has expired");
    }

    await fetchLeaderboard();
    await fetchSubmissions();
await checkAuth();
  };
const [hasAccess, setHasAccess] = useState(false);
const handleOpenEditorial = async (title) => {
    await fetchEditorialIfAllowed(title, authUser.codeforcesHandle);
    setShowEditorial(true);
  };

  
  const getStatusColor = (questionTitle) => {
    if (!Array.isArray(submissions)) return "bg-gray-200";
    const sub = submissions.find((s) => s.problemTitle === questionTitle);
    if (!sub) return "bg-gray-200";
    return sub.verdict === "OK" ? "bg-green-500 text-white" : "bg-red-500 text-white";
  };

  const displayCount = leaderboard?.length >= 3 ? 3 : leaderboard?.length || 0;

  const handleSaveChanges = async () => {
    try {
      const response = await axios.put("/api/user/update-profile", {
        name: editedName,
        email: editedEmail,
        profileImage: editedImage,
      });

      if (response.data.success) {
        setAuthUser(response.data.updatedUser);
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error("Failed to update profile", err);
    }
  };

  const latestQuestions = allQuestions?.slice(0, 4) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white p-6 md:p-8 font-mono relative">
      {isQuestionModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-center">
          <div className="bg-gray-900 p-6 rounded-xl w-[90%] max-w-5xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-yellow-400">All Questions</h2>
              <button onClick={() => setIsQuestionModalOpen(false)}>
                <X className="text-red-500 hover:text-red-600" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-600">
                    <th className="py-2">Title</th>
                    <th>Rating</th>
                    <th>Date</th>
                    <th>Actions</th>
                    <th>Editorial</th>
                  </tr>
                </thead>
                <tbody>
                  {allQuestions.map((q, idx) => (
                    <tr key={idx} className="border-b border-gray-700 hover:bg-gray-700/20">
                      <td className="py-2 text-white">{q.title}</td>
                      <td className="text-cyan-300">{q.rating}</td>
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
                          onClick={() => handleUpdateStatus(q.title)}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md transition"
                        >
                          Check Submission
                        </button>
                      </td>
                      <td>
                      <button
                        onClick={() => handleOpenEditorial(q.title)}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md transition"
                      >
                       View Editorial
                      </button>
                      <EditorialModal isOpen={showEditorial} onClose={() => setShowEditorial(false)} />
                    </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

            <div className="mb-4 text-xl font-bold text-cyan-300">
              
              
        User: {authUser?.srn} | Score: {authUser.score || 0}
      </div>
      {/* Edit Profile Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-gray-900 p-6 rounded-2xl shadow-2xl w-[90%] max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="text-red-500 hover:text-red-600" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              />
              <input
                type="email"
                placeholder="Email"
                value={editedEmail}
                onChange={(e) => setEditedEmail(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              />
              <input
                type="text"
                placeholder="Profile Image URL"
                value={editedImage}
                onChange={(e) => setEditedImage(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              />
              <button
                onClick={handleSaveChanges}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl md:text-4xl font-extrabold text-cyan-400 flex items-center gap-2">
            <TerminalSquare className="text-cyan-500" />
            Welcome, {authUser?.srn || authUser?.email || "Coder"}!
          </h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-yellow-400 hover:text-yellow-300 transition"
          >
            <Pencil size={20} />
          </button>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 transition text-white rounded-lg font-bold"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>

      {/* Codeforces Handle Linking */}
      <div className="mb-8 bg-gray-900 p-4 rounded-xl shadow-lg flex flex-col md:flex-row md:items-center gap-4">
        <Link2 className="text-pink-400" size={20} />
        {authUser?.codeforcesHandle ? (
          <p className="text-green-400 font-semibold">
            Linked Handle: <span className="text-white">{authUser.codeforcesHandle}</span>
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
        {authUser?.codeforcesHandle && (
          <p className="text-xs text-gray-400 italic">Once linked, it cannot be changed.</p>
        )}
      </div>

      {/* Icons */}
      <div className="flex gap-6 text-cyan-300 text-xl mb-6 animate-pulse">
        <UserCircle2 />
        <ListOrdered />
        <ClipboardList />
        <Code2 />
        <ShieldCheck />
      </div>

      {/* Grid: QOTD + Leaderboard */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* QOTD */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-2xl">
          <h2 className="text-2xl font-bold text-purple-400 mb-4">Question of the Day</h2>
          {todaysQuestion ? (
            <>
              <p className="text-xl font-semibold mb-2 text-white">{todaysQuestion.title}</p>
              <p className="text-sm text-gray-400 mb-1">Rating: {todaysQuestion.rating || "N/A"}</p>
              <p className="text-sm text-gray-400 mb-4">
                Tags: {todaysQuestion.tags?.join(", ") || "None"}
              </p>
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
                  onClick={() => handleUpdateStatus(todaysQuestion.title)}
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
        
        {/* Leaderboard */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-2xl">
          <h2 className="text-2xl font-bold text-orange-400 mb-4">
            Top {displayCount} Leader{displayCount === 1 ? "" : "s"}
          </h2>
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
                <button
        onClick={() => setShowModal(true)}
        className="mt-4 text-sm text-cyan-400 underline hover:text-white"
      >
        View Full Leaderboard
      </button>
     
              )}
            </>
          ) : (
            <p className="text-gray-400 italic">Loading leaderboard...</p>
          )}
        </div>
      </div>
 
      <LeaderboardModal isOpen={showModal} onClose={() => setShowModal(false)} />
      {/* All Questions */}
      <div className="mt-10 bg-gray-800 p-6 rounded-xl shadow-2xl">
        <h2 className="text-2xl font-bold text-yellow-400 mb-4">Latest Questions</h2>
        {latestQuestions.length > 0 ? (
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
                {latestQuestions.map((q, idx) => (
                  <tr key={idx} className="border-b border-gray-700 hover:bg-gray-700/20">
                    <td className="py-2 text-white">{q.title}</td>
                    <td className="text-cyan-300">{q.rating}</td>
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
                        onClick={() => handleUpdateStatus(q.title)}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md transition"
                      >
                        Check Submission
                      </button>
                    </td>
                    <td>
                      <button
                        onClick={() => handleOpenEditorial(q.title)}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md transition"
                      >
                       View Editorial
                      </button>
                      <EditorialModal isOpen={showEditorial} onClose={() => setShowEditorial(false)} />
                    </td>
                    
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 text-right">
              <button
                onClick={() => setIsQuestionModalOpen(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white"
              >
                Show More
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-400 italic">Loading latest questions...</p>
        )}
      </div>
    </div>
  );
}
