import { createContext, useContext, useMemo, useState } from "react";
import { apiClient } from "../api/apiClient";
import {
  clearGuestLogs,
  getGuestLogs,
  trackGuestActivity,
  trackUserActivity,
} from "../services/trackingService";
import {
  addBooking as addUserBooking,
  cancelBooking as cancelUserBooking,
  getUserData,
  removePlace,
  savePlace as saveUserPlace,
} from "../services/userDataService";

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

  const getIdentity = (state = session) => {
    if (state.mode === "guest") return "guest";
    if (state.mode === "user") return state.user?.email || "user";
    return "";
  };

  const buildEnhancedProfile = (baseProfile, state = session) => {
    const identity = getIdentity(state);
    const extra = getUserData(identity);
    return {
      ...baseProfile,
      savedPlaces: extra.savedPlaces || [],
      bookings: extra.bookings || [],
    };
  };

  const signup = async ({ email, password, adminSetupKey }) => {
    const response = await apiClient.post("/auth/register", { 
      email, 
      password, 
      role: adminSetupKey ? "admin" : "user",
      adminSetupKey 
    });
    const next = {
      mode: "user",
      token: response.data.token,
      user: response.data.data,
    };
    setAndPersist(next);
    await fetchProfile(next.token, next);
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
    await fetchProfile(next.token, next);
    return next;
  };

  const continueAsGuest = () => {
    const logs = getGuestLogs();
    const next = { mode: "guest", token: "", user: { email: "Guest", role: "guest" } };
    setAndPersist(next);
    setProfile(buildEnhancedProfile({
      id: "guest",
      email: "Guest",
      role: "guest",
      createdAt: new Date().toISOString(),
      activityHistory: logs.activity,
      emergencyLogs: logs.emergency,
      searchLogs: logs.search,
    }, next));
  };

  const logout = () => {
    setAndPersist({ mode: "none", token: "", user: null });
    setProfile(null);
    clearGuestLogs();
  };

  const fetchProfile = async (tokenOverride, stateOverride = null) => {
    const state = stateOverride || session;
    const token = tokenOverride || state.token;
    const identity = getIdentity(state);

    if (state.mode === "guest") {
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
      const nextGuest = buildEnhancedProfile(guestProfile, state);
      setProfile(nextGuest);
      return nextGuest;
    }

    if (!token) return null;

    const response = await apiClient.get("/auth/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const merged = {
      ...response.data.data,
      id: response.data.data?.id || identity,
    };
    const nextProfile = buildEnhancedProfile(merged, state);
    setProfile(nextProfile);
    return nextProfile;
  };

  const savePlace = async (place) => {
    const identity = getIdentity();
    if (!identity) return null;
    saveUserPlace(identity, place);
    await track("activity", {
      label: `Saved place: ${place.name}`,
      category: "saved_place",
    }).catch(() => undefined);
    await fetchProfile();
    return place;
  };

  const removeSavedPlace = async (placeId) => {
    const identity = getIdentity();
    if (!identity) return [];
    const next = removePlace(identity, placeId);
    await fetchProfile();
    return next;
  };

  const addBooking = async (booking) => {
    const identity = getIdentity();
    if (!identity) return null;
    const created = addUserBooking(identity, booking);
    await track("activity", {
      label: `Booked ${booking.providerName || "appointment"}`,
      category: "booking",
    }).catch(() => undefined);
    await fetchProfile();
    return created;
  };

  const cancelBooking = async (bookingId) => {
    const identity = getIdentity();
    if (!identity) return [];
    const next = cancelUserBooking(identity, bookingId);
    await fetchProfile();
    return next;
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
      savePlace,
      removeSavedPlace,
      addBooking,
      cancelBooking,
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
