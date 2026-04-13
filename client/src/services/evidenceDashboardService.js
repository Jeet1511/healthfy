import { apiClient } from "@/api/apiClient";

export function getStoredAuthToken() {
  try {
    const session = JSON.parse(localStorage.getItem("omina_session") || "null");
    if (session?.token) {
      return session.token;
    }
  } catch {
    // Ignore malformed localStorage session values.
  }

  return "";
}

function getAuthHeaders() {
  const token = getStoredAuthToken();
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

function authConfig(extra = {}) {
  return {
    ...extra,
    headers: {
      ...getAuthHeaders(),
      ...(extra.headers || {}),
    },
  };
}

export const evidenceDashboardService = {
  hasAuthToken() {
    return Boolean(getStoredAuthToken());
  },

  async startSession(payload) {
    const response = await apiClient.post("/evidence/start", payload, authConfig());
    return response.data?.data;
  },

  async completeSession(sessionId, payload = {}) {
    const response = await apiClient.post(
      `/evidence/complete/${sessionId}`,
      payload,
      authConfig()
    );
    return response.data?.data;
  },

  async listSessions(filters = {}) {
    const response = await apiClient.get("/evidence/sessions", authConfig({ params: filters }));
    return response.data?.data;
  },

  async getSessionDetail(sessionId) {
    const response = await apiClient.get(`/evidence/sessions/${sessionId}`, authConfig());
    return response.data?.data;
  },

  async logSessionEvent(sessionId, eventPayload) {
    const response = await apiClient.post(
      `/evidence/sessions/${sessionId}/events`,
      eventPayload,
      authConfig()
    );
    return response.data?.data;
  },

  async appendLocationLog(payload) {
    const response = await apiClient.post("/evidence/location-log", payload, authConfig());
    return response.data?.data;
  },

  async saveIncidentNote(sessionId, payload) {
    const response = await apiClient.post(
      `/evidence/sessions/${sessionId}/incident-note`,
      payload,
      authConfig()
    );
    return response.data?.data;
  },

  async uploadVOI(sessionId, payload) {
    const formData = new FormData();
    formData.append("incidentDescription", payload.incidentDescription || "");
    formData.append("noteText", payload.noteText || "");

    if (payload.voiceFile) {
      formData.append("voiceProof", payload.voiceFile, payload.voiceFile.name);
    }

    (payload.attachments || []).forEach((file) => {
      formData.append("attachments", file, file.name);
    });

    const response = await apiClient.post(
      `/evidence/sessions/${sessionId}/voi`,
      formData,
      authConfig({
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
    );

    return response.data?.data;
  },

  async generateShareLink(sessionId, payload = {}) {
    const response = await apiClient.post(
      `/evidence/sessions/${sessionId}/share-link`,
      payload,
      authConfig()
    );
    return response.data?.data;
  },

  async downloadMediaBlob(sessionId, mediaId) {
    const response = await apiClient.get(
      `/evidence/sessions/${sessionId}/media/${mediaId}/download`,
      authConfig({ responseType: "blob" })
    );
    return response.data;
  },

  async getSharedSession(token) {
    const response = await apiClient.get(`/evidence/shared/${token}`);
    return response.data?.data;
  },

  async downloadSharedMediaBlob(token, mediaId) {
    const response = await apiClient.get(
      `/evidence/shared/${token}/media/${mediaId}/download`,
      { responseType: "blob" }
    );
    return response.data;
  },
};
