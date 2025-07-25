import { create } from "zustand";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const useQotdStore = create((set, get) => ({
  loading: false,
  error: null,
  todaysQuestion: null,
  allQuestions: [],
  leaderboard: [],
  submissions: [],
  linkedHandle: null,

  // ✅ Link Codeforces handle
  linkHandle: async (handle) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post(
        `${BASE_URL}/api/v1/qotd/link-cf`,
        { handle },
        { withCredentials: true }
      );
      return res.data;
    } catch (error) {
      set({
        error:
          error.response?.data?.error || "Failed to link Codeforces handle",
      });
    } finally {
      set({ loading: false });
    }
  },

  // ✅ Get today's question
  fetchTodaysQuestion: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`${BASE_URL}/api/v1/qotd/today`, {
        withCredentials: true,
      });
      set({ todaysQuestion: res.data.question });
    } catch (error) {
      set({
        error:
          error.response?.data?.error || "Failed to fetch today's question",
      });
    } finally {
      set({ loading: false });
    }
  },

  // ✅ Fetch all QOTD questions
  fetchAllQuestions: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`${BASE_URL}/api/v1/qotd/all`, {
        withCredentials: true,
      });
      console.log("Fetched questions raw:", res.data);
      set({ allQuestions: res.data.questions });
    } catch (error) {
      set({
        error:
          error.response?.data?.error || "Failed to fetch all questions",
      });
    } finally {
      set({ loading: false });
    }
  },

  // ✅ Fetch leaderboard
  fetchLeaderboard: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`${BASE_URL}/api/v1/qotd/leaderboard`, {
        withCredentials: true,
      });
      set({ leaderboard: res.data.leaderboard });
    } catch (error) {
      set({
        error:
          error.response?.data?.error || "Failed to fetch leaderboard",
      });
    } finally {
      set({ loading: false });
    }
  },

  // ✅ Fetch Codeforces submissions
  fetchSubmissions: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`${BASE_URL}/api/v1/qotd/submission`, {
        withCredentials: true,
      });
      set({ submissions: res.data.submissions });
    } catch (error) {
      set({
        error:
          error.response?.data?.error || "Failed to fetch submissions",
      });
    } finally {
      set({ loading: false });
    }
  },

  // ✅ Verify solution + award points
verifyAndAward: async (questionTitle, codeforcesHandle) => {
  set({ loading: true, error: null });
  try {
    const res = await axios.post(
      `${BASE_URL}/api/v1/qotd/update-status`,
      { questionTitle, codeforcesHandle },
      { withCredentials: true }
    );
    return res.data;
  } catch (error) {
    set({
      error:
        error.response?.data?.message ||
        "Failed to verify Codeforces submission",
    });
    return null;
  } finally {
    set({ loading: false });
  }
}
,


  // ✅ Fetch linked Codeforces handle
  fetchLinkedHandle: async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/v1/qotd/cf-handle`, {
        withCredentials: true,
      });
      set({ linkedHandle: res.data.cfHandle });
    } catch (err) {
      set({ error: "Failed to fetch linked handle" });
    }
  },
}));
