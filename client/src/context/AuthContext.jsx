import { createContext, useContext, useMemo, useState } from "react";
import { apiClient } from "../api/apiClient";
import {
  clearGuestLogs,
  getGuestLogs,
  trackGuestActivity,
  trackUserActivity,
} from "../services/trackingService";

const STORAGE_KEY = "omina_session";
const AuthContext = createContext(null);

function loadSession() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    return parsed || { mode: "none", token: "", user: null };
  } catch {
    return { mode: "none", token: "", user: null };
  }
}

function persistSession(session) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => loadSession());
  const [profile, setProfile] = useState(null);

  const isAuthenticated = session.mode === "user" && Boolean(session.token);
  const isGuest = session.mode === "guest";

  const setAndPersist = (next) => {
    setSession(next);
    persistSession(next);
  };

  const signup = async ({ email, password }) => {
    const response = await apiClient.post("/auth/register", { email, password, role: "user" });
    const next = {
      mode: "user",
      token: response.data.token,
      user: response.data.data,
    };
    setAndPersist(next);
    await fetchProfile(next.token);
    return next;
  };

  const login = async ({ email, password }) => {
    const response = await apiClient.post("/auth/login", { email, password });
    const next = {
      mode: "user",
      token: response.data.token,
      user: response.data.data,
    };
    setAndPersist(next);
    await fetchProfile(next.token);
    return next;
  };

  const continueAsGuest = () => {
    const logs = getGuestLogs();
    const next = { mode: "guest", token: "", user: { email: "Guest", role: "guest" } };
    setAndPersist(next);
    setProfile({
      id: "guest",
      email: "Guest",
      role: "guest",
      createdAt: new Date().toISOString(),
      activityHistory: logs.activity,
      emergencyLogs: logs.emergency,
      searchLogs: logs.search,
    });
  };

  const logout = () => {
    setAndPersist({ mode: "none", token: "", user: null });
    setProfile(null);
    clearGuestLogs();
  };

  const fetchProfile = async (tokenOverride) => {
    const token = tokenOverride || session.token;

    if (isGuest) {
      const logs = getGuestLogs();
      const guestProfile = {
        id: "guest",
        email: "Guest",
        role: "guest",
        createdAt: new Date().toISOString(),
        activityHistory: logs.activity,
        emergencyLogs: logs.emergency,
        searchLogs: logs.search,
      };
      setProfile(guestProfile);
      return guestProfile;
    }

    if (!token) return null;

    const response = await apiClient.get("/auth/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setProfile(response.data.data);
    return response.data.data;
  };

  const track = async (type, payload) => {
    if (isAuthenticated && session.token) {
      await trackUserActivity(session.token, type, payload);
      await fetchProfile();
      return;
    }

    if (isGuest) {
      trackGuestActivity(type, payload);
      await fetchProfile();
    }
  };

  const value = useMemo(
    () => ({
      session,
      profile,
      isAuthenticated,
      isGuest,
      signup,
      login,
      continueAsGuest,
      logout,
      fetchProfile,
      track,
    }),
    [session, profile, isAuthenticated, isGuest]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
