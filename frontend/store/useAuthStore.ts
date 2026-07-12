import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "../services/api";

export interface UserPreferences {
  theme: string;
  default_optimize_whitespace: boolean;
  default_optimize_margins: boolean;
  default_optimize_spacing: boolean;
  default_optimize_images: boolean;
  notifications_enabled: boolean;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  preferences: UserPreferences;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;

  login: (credentials: { email: string; password: string }) => Promise<User>;
  register: (data: { email: string; password: string; full_name: string }) => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (updatedUser: User) => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      login: async (credentials) => {
        set({ loading: true, error: null });
        try {
          const res = await api.post("/auth/login", credentials);
          const { access_token, refresh_token, user } = res.data;

          set({
            user,
            token: access_token,
            refreshToken: refresh_token,
            isAuthenticated: true,
            loading: false,
          });
          return user;
        } catch (e: any) {
          const errMsg = e.response?.data?.detail || "Invalid email or password.";
          set({ error: errMsg, loading: false });
          throw new Error(errMsg);
        }
      },

      register: async (data) => {
        set({ loading: true, error: null });
        try {
          const res = await api.post("/auth/register", data);
          set({ loading: false });
          return res.data;
        } catch (e: any) {
          const errMsg = e.response?.data?.detail || "Registration failed. Try again.";
          set({ error: errMsg, loading: false });
          throw new Error(errMsg);
        }
      },

      logout: async () => {
        try {
          // Best-effort backend logout
          await api.post("/auth/logout");
        } catch (e) {
          console.warn("Backend logout error (can be ignored)", e);
        } finally {
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            error: null,
          });
          if (typeof window !== "undefined") {
            localStorage.removeItem("optiprint-auth");
          }
        }
      },

      updateUser: (updatedUser) => {
        set({ user: updatedUser });
      },

      setError: (error) => {
        set({ error });
      }
    }),
    {
      name: "optiprint-auth", // unique name for local storage
    }
  )
);
