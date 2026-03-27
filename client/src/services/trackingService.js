import { apiClient } from "../api/apiClient";

const GUEST_LOG_KEY = "omina_guest_logs";

function readGuestLogs() {
  try {
    return JSON.parse(localStorage.getItem(GUEST_LOG_KEY) || "{\"activity\":[],\"emergency\":[],\"search\":[]}");
  } catch {
    return { activity: [], emergency: [], search: [] };
  }
}

function writeGuestLogs(next) {
  localStorage.setItem(GUEST_LOG_KEY, JSON.stringify(next));
}

export function getGuestLogs() {
  return readGuestLogs();
}

export async function trackUserActivity(token, type, payload) {
  await apiClient.post(
    "/auth/activity",
    { type, payload },
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

export function trackGuestActivity(type, payload) {
  const logs = readGuestLogs();
  const entry = { ...payload, createdAt: new Date().toISOString() };
  const bucket = logs[type] || [];
  logs[type] = [entry, ...bucket].slice(0, 100);
  writeGuestLogs(logs);
  return entry;
}

export function clearGuestLogs() {
  localStorage.removeItem(GUEST_LOG_KEY);
}
