// qotdStore.js
import { create } from 'zustand';
import axios from 'axios';

export const useQotdStore = create((set, get) => ({
  question: null,
  allQuestions: [],
  leaderboard: [],
  topThree: [],
  loading: false,
  error: null,

  fetchTodayQuestion: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get('/api/qotd/today');
      set({ question: res.data.question, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to fetch today\'s question', loading: false });
    }
  },

  updateStatus: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post('/api/qotd/update-status');
      if (res.data?.submission?.status === 'ACCEPTED') {
        await get().fetchLeaderboard();
      }
      return res.data;
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to update status', loading: false });
    } finally {
      set({ loading: false });
    }
  },

  fetchLeaderboard: async () => {
    try {
      const res = await axios.get('/api/qotd/leaderboard');
      const leaderboardData = res.data.leaderboard || [];
      set({
        leaderboard: leaderboardData,
        topThree: leaderboardData.slice(0, 3),
      });
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to load leaderboard' });
    }
  },

  fetchAllQuestions: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get('/api/qotd/all');
      set({ allQuestions: res.data.questions, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to fetch all questions', loading: false });
    }
  },

  fetchDailyUniqueQuestion: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get('/api/qotd/get-questions');
      set({ question: res.data.question, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to fetch new question', loading: false });
    }
  },
}));
