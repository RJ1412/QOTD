import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const useAuthStore = create((set) => ({
  authUser: null,
  isCheckingAuth: true,

  checkAuth: async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/v1/auth/me`, {
        withCredentials: true,
      });
      set({ authUser: res.data.user, isCheckingAuth: false });
    } catch (err) {
      set({ authUser: null, isCheckingAuth: false });
    }
  },

  login: async ({ srn, email, password }) => {
  try {
    const res = await axios.post(
      `${BASE_URL}/api/v1/auth/login`,
      { srn, email, password },
      { withCredentials: true }
    );
    set({ authUser: res.data.user });
    toast.success(res.data.message || "Login successful");
    return { success: true }; // ✅ Add this
  } catch (err) {
    toast.error(err.response?.data?.error || "Login failed");
    return { success: false }; // ✅ Add this
  }
},

  signup: async ({ srn, email, password }) => {
    try {
      const res = await axios.post(`${BASE_URL}/api/v1/auth/register`, {
        srn,
        email,
        password,
      });
      toast.success(res.data.message || "OTP sent to your email");
    } catch (err) {
      toast.error(err.response?.data?.error || "Signup failed");
    }
  },

  verifyOtp: async (email, otp) => {
    try {
      const res = await axios.post(`${BASE_URL}/api/v1/auth/verify`, {
        email,
        otp,
      });
      set({ authUser: res.data.user });
      toast.success(res.data.message || "Account verified");
    } catch (err) {
      toast.error(err.response?.data?.error || "OTP verification failed");
    }
  },

  logout: async () => {
    try {
      await axios.post(`${BASE_URL}/api/v1/auth/logout`, {}, { withCredentials: true });
      set({ authUser: null });
      toast.success("Logged out successfully");
    } catch (err) {
      toast.error("Logout failed");
    }
  },

  forgotPassword: async (email) => {
    try {
      const res = await axios.post(`${BASE_URL}/api/v1/auth/forgot-password`, { email });
      toast.success(res.data.message || "OTP sent to your email");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to send reset OTP");
    }
  },

  resetPassword: async (email, otp, newPassword) => {
    try {
      const res = await axios.post(`${BASE_URL}/api/v1/auth/forgot-password`, {
        email,
        otp,
        newPassword,
      });
      toast.success(res.data.message || "Password reset successful");
    } catch (err) {
      toast.error(err.response?.data?.error || "Reset failed");
    }
  },

}));
