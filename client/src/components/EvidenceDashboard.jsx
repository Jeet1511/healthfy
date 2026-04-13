import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  Clock3,
  Download,
  FileAudio2,
  FileText,
  FileVideo2,
  Link2,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  Siren,
  UploadCloud,
} from "lucide-react";
import { useEmergency } from "@/context/EmergencyContext";
import { useAuth } from "@/context/AuthContext";
import { evidenceDashboardService } from "@/services/evidenceDashboardService";
import "./EvidenceDashboard.css";

const STATUS_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Syncing", value: "syncing" },
  { label: "Completed", value: "completed" },
  { label: "Failed Partial", value: "failed_partial" },
];

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

function formatDuration(totalSeconds = 0) {
  const seconds = Math.max(0, Math.round(totalSeconds));
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs}h ${mins}m ${secs}s`;
  }
  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }
  return `${secs}s`;
}

function getStateLabel(state) {
  if (state === "active") return "Recording Active";
  if (state === "syncing") return "Uploading";
  if (state === "completed") return "Synced Securely";
  if (state === "failed_partial") return "Failed Partial";
  return state;
}

function resolveDashboardError(error, fallbackMessage) {
  const status = Number(error?.response?.status || 0);

  if (status === 401) {
    return "Sign in to access secure emergency sessions.";
  }

  if (status === 403) {
    return "You are not allowed to view this evidence resource.";
  }

  if (!navigator.onLine) {
    return "You are offline. Evidence sessions will sync once connection is restored.";
  }

  if (error?.code === "ERR_NETWORK") {
    return "Unable to reach the backend service. Verify server is running and API connection is trusted.";
  }

  return error?.response?.data?.message || error?.message || fallbackMessage;
}

function normalizePoints(logs) {
  if (!Array.isArray(logs) || logs.length < 2) {
    return [];
  }

  const latitudes = logs.map((item) => item.latitude);
  const longitudes = logs.map((item) => item.longitude);
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);

  const latSpread = maxLat - minLat || 0.001;
  const lngSpread = maxLng - minLng || 0.001;

  return logs.map((item) => {
    const x = ((item.longitude - minLng) / lngSpread) * 280 + 10;
    const y = 130 - ((item.latitude - minLat) / latSpread) * 110 + 10;
    return { x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) };
  });
}

export default function EvidenceDashboard({ sharedToken = null }) {
  const { appMode, emergencySession, networkStatus } = useEmergency();
  const { session } = useAuth();
  const isEmergencyMode = appMode === "emergency";
  const hasAuthToken = Boolean(session?.token);
  const requiresAuth = !sharedToken && !hasAuthToken;

  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [details, setDetails] = useState(null);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState("");
  const [syncing, setSyncing] = useState(false);

  const [filters, setFilters] = useState({
    status: "all",
    from: "",
    to: "",
    search: "",
  });
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [totalSessions, setTotalSessions] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [shareConfig, setShareConfig] = useState({
    expiresInHours: 24,
    label: "Trusted contact",
  });
  const [generatedLink, setGeneratedLink] = useState("");

  const [voiForm, setVoiForm] = useState({
    incidentDescription: "",
    noteText: "",
  });
  const [voiceFile, setVoiceFile] = useState(null);
  const [attachments, setAttachments] = useState([]);

  const [videoUrl, setVideoUrl] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [loadingMediaId, setLoadingMediaId] = useState("");

  const activeEvidenceSessionId = emergencySession?.evidenceSessionId || null;

  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [videoUrl, audioUrl]);

  useEffect(() => {
    const syncFromDetails = details?.session?.incident;
    if (!syncFromDetails) return;

    setVoiForm({
      incidentDescription: syncFromDetails.incidentDescription || "",
      noteText: syncFromDetails.noteText || "",
    });
  }, [details]);

  const loadSessions = async () => {
    if (sharedToken) return;

    if (requiresAuth) {
      setSessions([]);
      setSelectedSessionId(null);
      setDetails(null);
      setTotalSessions(0);
      setTotalPages(1);
      setError("");
      setLoadingSessions(false);
      return;
    }

    try {
      setLoadingSessions(true);
      setError("");

      const response = await evidenceDashboardService.listSessions({
        status: filters.status,
        from: filters.from || undefined,
        to: filters.to || undefined,
        search: filters.search || undefined,
        page,
        excludeActive: isEmergencyMode ? "false" : "true",
        limit: pageSize,
      });

      const list = response?.sessions || [];
      const pagination = response?.pagination || null;

      const nextTotal = pagination?.total ?? response?.total ?? list.length;
      const nextTotalPages = pagination?.totalPages ?? Math.max(1, Math.ceil(nextTotal / pageSize));

      setTotalSessions(nextTotal);
      setTotalPages(nextTotalPages);

      if (page > nextTotalPages) {
        setPage(nextTotalPages);
        return;
      }

      setSessions(list);

      const selectedExists = list.some((session) => session.sessionId === selectedSessionId);
      const preferredSessionId =
        activeEvidenceSessionId ||
        (selectedExists ? selectedSessionId : null) ||
        (isEmergencyMode ? list.find((session) => session.state === "active")?.sessionId : null) ||
        list[0]?.sessionId ||
        null;

      setSelectedSessionId(preferredSessionId);
    } catch (err) {
      setError(resolveDashboardError(err, "Failed to load emergency sessions."));
    } finally {
      setLoadingSessions(false);
    }
  };

  const loadDetails = async (sessionId) => {
    if (!sessionId && !sharedToken) {
      setDetails(null);
      return;
    }

    try {
      setLoadingDetails(true);
      setError("");

      const response = sharedToken
        ? await evidenceDashboardService.getSharedSession(sharedToken)
        : await evidenceDashboardService.getSessionDetail(sessionId);

      setDetails(response || null);
    } catch (err) {
      setError(resolveDashboardError(err, "Failed to load session details."));
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    if (sharedToken) {
      loadDetails(null);
      return;
    }

    loadSessions();
  }, [
    filters.status,
    filters.from,
    filters.to,
    filters.search,
    page,
    pageSize,
    isEmergencyMode,
    activeEvidenceSessionId,
    sharedToken,
    requiresAuth,
  ]);

  useEffect(() => {
    if (sharedToken || requiresAuth) return;
    if (!selectedSessionId) {
      setDetails(null);
      return;
    }
    loadDetails(selectedSessionId);
  }, [selectedSessionId, sharedToken, requiresAuth]);

  useEffect(() => {
    const intervalMs = isEmergencyMode ? 4500 : 30000;
    const timer = setInterval(() => {
      if (requiresAuth) {
        return;
      }

      if (sharedToken) {
        loadDetails(null);
        return;
      }

      loadSessions();
      if (selectedSessionId) {
        loadDetails(selectedSessionId);
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isEmergencyMode, selectedSessionId, sharedToken, requiresAuth]);

  const selectedSession = useMemo(() => {
    if (requiresAuth) {
      return null;
    }

    if (sharedToken) {
      return details?.session || null;
    }

    return sessions.find((item) => item.sessionId === selectedSessionId) || details?.session || null;
  }, [requiresAuth, sharedToken, details, sessions, selectedSessionId]);

  const timeline = details?.session?.timeline || [];
  const mediaFiles = details?.media || [];
  const locationLogs = details?.locationLogs || [];

  const videoFiles = mediaFiles.filter((file) => file.fileType === "video");
  const audioFiles = mediaFiles.filter(
    (file) => file.fileType === "audio" || file.fileType === "voice-proof"
  );

  const routePoints = normalizePoints(locationLogs);
  const polyline = routePoints.map((point) => `${point.x},${point.y}`).join(" ");

  const statusFlags = [
    {
      icon: Siren,
      label: "Recording Active",
      active: selectedSession?.state === "active",
      tone: "danger",
    },
    {
      icon: UploadCloud,
      label: "Uploading",
      active:
        (selectedSession?.stats?.pendingChunks || 0) > 0 ||
        selectedSession?.state === "syncing",
      tone: "warning",
    },
    {
      icon: ShieldCheck,
      label: "Synced Securely",
      active:
        selectedSession?.state === "completed" &&
        (selectedSession?.stats?.failedChunks || 0) === 0,
      tone: "success",
    },
    {
      icon: AlertTriangle,
      label: "Offline Mode",
      active: networkStatus?.isOnline === false,
      tone: "neutral",
    },
  ];

  const loadMediaPreview = async (mediaFile, target) => {
    if (!mediaFile) return;

    setLoadingMediaId(mediaFile.id);

    try {
      const blob = sharedToken
        ? await evidenceDashboardService.downloadSharedMediaBlob(sharedToken, mediaFile.id)
        : await evidenceDashboardService.downloadMediaBlob(
            selectedSession.sessionId,
            mediaFile.id
          );

      const url = URL.createObjectURL(blob);

      if (target === "video") {
        if (videoUrl) URL.revokeObjectURL(videoUrl);
        setVideoUrl(url);
      } else {
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl(url);
      }
    } catch (err) {
      setError(resolveDashboardError(err, "Unable to load media preview."));
    } finally {
      setLoadingMediaId("");
    }
  };

  const downloadMedia = async (mediaFile) => {
    if (!mediaFile || !selectedSession) return;

    setLoadingMediaId(mediaFile.id);
    try {
      const blob = sharedToken
        ? await evidenceDashboardService.downloadSharedMediaBlob(sharedToken, mediaFile.id)
        : await evidenceDashboardService.downloadMediaBlob(
            selectedSession.sessionId,
            mediaFile.id
          );

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = mediaFile.displayName || `${mediaFile.fileType}-${mediaFile.id}.bin`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(resolveDashboardError(err, "Failed to download media file."));
    } finally {
      setLoadingMediaId("");
    }
  };

  const saveIncidentNote = async () => {
    if (!selectedSession || sharedToken) return;

    try {
      setSyncing(true);
      await evidenceDashboardService.saveIncidentNote(selectedSession.sessionId, voiForm);
      await loadDetails(selectedSession.sessionId);
    } catch (err) {
      setError(resolveDashboardError(err, "Failed to save incident note."));
    } finally {
      setSyncing(false);
    }
  };

  const uploadVOI = async () => {
    if (!selectedSession || sharedToken) return;

    try {
      setSyncing(true);
      await evidenceDashboardService.uploadVOI(selectedSession.sessionId, {
        ...voiForm,
        voiceFile,
        attachments,
      });

      setVoiceFile(null);
      setAttachments([]);

      await loadDetails(selectedSession.sessionId);
    } catch (err) {
      setError(resolveDashboardError(err, "Failed to upload Voice of Incident files."));
    } finally {
      setSyncing(false);
    }
  };

  const generateShareLink = async () => {
    if (!selectedSession || sharedToken) return;

    try {
      setSyncing(true);
      const response = await evidenceDashboardService.generateShareLink(
        selectedSession.sessionId,
        {
          expiresInHours: Number(shareConfig.expiresInHours || 24),
          label: shareConfig.label || "Trusted contact",
        }
      );
      setGeneratedLink(response?.accessLink || "");
      await loadDetails(selectedSession.sessionId);
    } catch (err) {
      setError(resolveDashboardError(err, "Failed to create trusted access link."));
    } finally {
      setSyncing(false);
    }
  };

  const hasActiveFilters = Boolean(
    filters.status !== "all" || filters.from || filters.to || filters.search
  );

  const resetFilters = () => {
    setFilters({
      status: "all",
      from: "",
      to: "",
      search: "",
    });
    setPage(1);
  };

  const retryCurrentView = () => {
    if (sharedToken) {
      loadDetails(null);
      return;
    }

    loadSessions();
    if (selectedSessionId) {
      loadDetails(selectedSessionId);
    }
  };

  return (
    <section
      className={`evidence-dashboard-shell ${isEmergencyMode ? "emergency" : "daily"} ${
        sharedToken ? "shared" : ""
      }`}
    >
      <header className="evidence-dashboard-header">
        <div>
          <h3 className="title" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
            <FileText size={20} />
            Evidence Dashboard
          </h3>
          <p className="subtle">
            {isEmergencyMode
              ? "Emergency mode focuses on live session reliability and secure sync."
              : "Daily mode shows past sessions and post-incident evidence management."}
          </p>
        </div>

        {!sharedToken && (
          <button
            type="button"
            className="permission-refresh-btn"
            onClick={retryCurrentView}
            disabled={loadingSessions || loadingDetails}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        )}
      </header>

      {requiresAuth ? (
        <div className="evidence-info-banner" role="status">
          <p className="subtle">Sign in from Profile to access secure evidence sessions.</p>
        </div>
      ) : null}

      {!requiresAuth && error ? (
        <div className="evidence-error-banner" role="alert">
          <p className="evidence-error">{error}</p>
          <button
            type="button"
            className="permission-refresh-btn"
            onClick={retryCurrentView}
            disabled={loadingSessions || loadingDetails}
          >
            <RefreshCw size={14} />
            Retry
          </button>
        </div>
      ) : null}

      <div className="evidence-dashboard-grid">
        <aside className="evidence-sidebar card" aria-label="Emergency sessions list">
          {!sharedToken && !requiresAuth && (
            <>
              <div className="evidence-filter-row">
                <label>
                  Status
                  <select
                    value={filters.status}
                    onChange={(event) => {
                      setPage(1);
                      setFilters((prev) => ({ ...prev, status: event.target.value }));
                    }}
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  From
                  <input
                    type="date"
                    value={filters.from}
                    onChange={(event) => {
                      setPage(1);
                      setFilters((prev) => ({ ...prev, from: event.target.value }));
                    }}
                  />
                </label>
                <label>
                  To
                  <input
                    type="date"
                    value={filters.to}
                    onChange={(event) => {
                      setPage(1);
                      setFilters((prev) => ({ ...prev, to: event.target.value }));
                    }}
                  />
                </label>
                <label>
                  Search Session
                  <div className="evidence-search-input-wrap">
                    <Search size={15} />
                    <input
                      type="search"
                      placeholder="Session ID or trigger"
                      value={filters.search}
                      onChange={(event) => {
                        setPage(1);
                        setFilters((prev) => ({ ...prev, search: event.target.value }));
                      }}
                    />
                  </div>
                </label>
              </div>

              <p className="subtle evidence-results-meta">
                Showing {sessions.length} of {totalSessions} sessions
              </p>

              {loadingSessions ? (
                <div className="evidence-loading-inline">
                  <Loader2 size={18} className="spin" />
                  Loading sessions...
                </div>
              ) : sessions.length === 0 ? (
                <div className="evidence-empty-state">
                  <p className="subtle">No sessions found.</p>
                  {hasActiveFilters && (
                    <button type="button" className="mini-btn" onClick={resetFilters}>
                      Clear Filters
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="evidence-session-list">
                    {sessions.map((session) => (
                      <button
                        type="button"
                        key={session.sessionId}
                        className={`evidence-session-item ${
                          selectedSessionId === session.sessionId ? "active" : ""
                        } ${session.state}`}
                        onClick={() => setSelectedSessionId(session.sessionId)}
                      >
                        <div className="evidence-session-top">
                          <strong>{getStateLabel(session.state)}</strong>
                          <span className={`state-pill ${session.state}`}>{session.state}</span>
                        </div>
                        <p className="evidence-session-meta">
                          <CalendarDays size={14} />
                          {formatDate(session.startedAt)}
                        </p>
                        <p className="evidence-session-meta">
                          <Clock3 size={14} />
                          {formatDuration(session.durationSeconds || 0)}
                        </p>
                        <p className="evidence-session-meta">
                          <UploadCloud size={14} />
                          {session.stats?.uploadedChunks || 0}/{session.stats?.totalChunks || 0} chunks
                        </p>
                      </button>
                    ))}
                  </div>

                  <div className="evidence-pagination-row">
                    <button
                      type="button"
                      className="mini-btn"
                      disabled={page <= 1 || loadingSessions}
                      onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    >
                      Previous
                    </button>
                    <span>
                      Page {page} of {totalPages}
                    </span>
                    <button
                      type="button"
                      className="mini-btn"
                      disabled={page >= totalPages || loadingSessions}
                      onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                    >
                      Next
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          {!sharedToken && requiresAuth && (
            <div className="shared-access-panel">
              <strong>Authentication Required</strong>
              <p className="subtle">Sign in to view your secure evidence sessions and media.</p>
            </div>
          )}

          {sharedToken && (
            <div className="shared-access-panel">
              <strong>Trusted Read-Only Access</strong>
              <p className="subtle">
                This evidence view was opened from a secure shared token link.
              </p>
            </div>
          )}
        </aside>

        <main className="evidence-main card" aria-live="polite">
          {loadingDetails ? (
            <div className="evidence-loading-inline">
              <Loader2 size={18} className="spin" />
              Loading session details...
            </div>
          ) : requiresAuth ? (
            <p className="subtle">Sign in to unlock secure evidence details and playback.</p>
          ) : !selectedSession ? (
            <p className="subtle">Select a session to view evidence details.</p>
          ) : (
            <>
              <div className="evidence-main-header">
                <div>
                  <h4>{selectedSession.sessionId}</h4>
                  <p className="subtle">
                    Started: {formatDate(selectedSession.startedAt)}
                    {selectedSession.endedAt ? ` • Ended: ${formatDate(selectedSession.endedAt)}` : ""}
                  </p>
                </div>
                <span className={`state-pill ${selectedSession.state}`}>{selectedSession.state}</span>
              </div>

              <div className="evidence-status-strip">
                {statusFlags.map((flag) => {
                  const Icon = flag.icon;
                  return (
                    <div
                      key={flag.label}
                      className={`status-flag ${flag.active ? "active" : "idle"} ${flag.tone}`}
                    >
                      <Icon size={15} />
                      {flag.label}
                    </div>
                  );
                })}
              </div>

              <div className="evidence-content-grid">
                <section className="evidence-card">
                  <h5>Media</h5>
                  <div className="media-panels">
                    <div className="media-block">
                      <div className="media-title-row">
                        <FileVideo2 size={16} />
                        Video Evidence
                      </div>
                      {videoUrl ? (
                        <video controls preload="metadata" className="evidence-player" src={videoUrl} />
                      ) : (
                        <p className="subtle">Select a video chunk to preview.</p>
                      )}
                      <div className="media-list">
                        {videoFiles.slice(0, 8).map((media) => (
                          <div key={media.id} className="media-item-row">
                            <span>{media.displayName || `Video ${media.chunkIndex ?? "file"}`}</span>
                            <div>
                              <button
                                type="button"
                                className="mini-btn"
                                disabled={loadingMediaId === media.id}
                                onClick={() => loadMediaPreview(media, "video")}
                              >
                                {loadingMediaId === media.id ? "Loading" : "Preview"}
                              </button>
                              <button
                                type="button"
                                className="mini-btn"
                                disabled={loadingMediaId === media.id}
                                onClick={() => downloadMedia(media)}
                              >
                                <Download size={13} />
                                Download
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="media-block">
                      <div className="media-title-row">
                        <FileAudio2 size={16} />
                        Audio Evidence
                      </div>
                      {audioUrl ? (
                        <audio controls preload="metadata" className="evidence-player" src={audioUrl} />
                      ) : (
                        <p className="subtle">Select an audio file to preview.</p>
                      )}
                      <div className="media-list">
                        {audioFiles.slice(0, 8).map((media) => (
                          <div key={media.id} className="media-item-row">
                            <span>{media.displayName || "Audio file"}</span>
                            <div>
                              <button
                                type="button"
                                className="mini-btn"
                                disabled={loadingMediaId === media.id}
                                onClick={() => loadMediaPreview(media, "audio")}
                              >
                                {loadingMediaId === media.id ? "Loading" : "Preview"}
                              </button>
                              <button
                                type="button"
                                className="mini-btn"
                                disabled={loadingMediaId === media.id}
                                onClick={() => downloadMedia(media)}
                              >
                                <Download size={13} />
                                Download
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                <section className="evidence-card">
                  <h5>Location Route</h5>
                  {routePoints.length > 1 ? (
                    <div className="mini-map-wrap">
                      <svg viewBox="0 0 300 150" className="mini-map" role="img" aria-label="Location path">
                        <rect x="1" y="1" width="298" height="148" rx="12" />
                        <polyline points={polyline} className="path-line" />
                        <circle cx={routePoints[0].x} cy={routePoints[0].y} r="4" className="path-start" />
                        <circle
                          cx={routePoints[routePoints.length - 1].x}
                          cy={routePoints[routePoints.length - 1].y}
                          r="4"
                          className="path-end"
                        />
                      </svg>
                      <p className="subtle" style={{ marginTop: "0.45rem" }}>
                        <MapPin size={14} />
                        {locationLogs.length} checkpoints captured.
                      </p>
                    </div>
                  ) : (
                    <p className="subtle">No route path available for this session.</p>
                  )}
                </section>
              </div>

              <section className="evidence-card">
                <h5>Incident Timeline</h5>
                {timeline.length === 0 ? (
                  <p className="subtle">No timeline events recorded yet.</p>
                ) : (
                  <ol className="timeline-list">
                    {timeline.slice(-40).map((event, index) => (
                      <li key={`${event.type}-${event.timestamp}-${index}`} className={`timeline-item ${event.severity || "info"}`}>
                        <div className="timeline-dot" />
                        <div>
                          <strong>{event.label}</strong>
                          <p>{event.type}</p>
                          <small>{formatDate(event.timestamp)}</small>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </section>

              {!sharedToken && (
                <section className="evidence-card voi-card">
                  <h5>Voice of Incident (VOI)</h5>

                  <label>
                    Incident Description
                    <textarea
                      value={voiForm.incidentDescription}
                      onChange={(event) =>
                        setVoiForm((prev) => ({ ...prev, incidentDescription: event.target.value }))
                      }
                      rows={3}
                    />
                  </label>

                  <label>
                    Additional Notes
                    <textarea
                      value={voiForm.noteText}
                      onChange={(event) =>
                        setVoiForm((prev) => ({ ...prev, noteText: event.target.value }))
                      }
                      rows={3}
                    />
                  </label>

                  <div className="voi-upload-row">
                    <label>
                      Voice Proof (audio)
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={(event) => setVoiceFile(event.target.files?.[0] || null)}
                      />
                    </label>
                    <label>
                      Attachments (image/docs)
                      <input
                        type="file"
                        accept="image/*,.pdf,.doc,.docx,.txt"
                        multiple
                        onChange={(event) => setAttachments(Array.from(event.target.files || []))}
                      />
                    </label>
                  </div>

                  <div className="action-row">
                    <button type="button" className="permission-request-btn" onClick={saveIncidentNote} disabled={syncing}>
                      Save Note
                    </button>
                    <button
                      type="button"
                      className="permission-request-btn"
                      onClick={uploadVOI}
                      disabled={syncing || (!voiceFile && attachments.length === 0)}
                    >
                      {syncing ? "Uploading..." : "Upload VOI Files"}
                    </button>
                  </div>

                  <div className="share-box">
                    <label>
                      Share Link Label
                      <input
                        type="text"
                        value={shareConfig.label}
                        onChange={(event) =>
                          setShareConfig((prev) => ({ ...prev, label: event.target.value }))
                        }
                      />
                    </label>
                    <label>
                      Expires In (hours)
                      <input
                        type="number"
                        min={1}
                        max={168}
                        value={shareConfig.expiresInHours}
                        onChange={(event) =>
                          setShareConfig((prev) => ({
                            ...prev,
                            expiresInHours: Number(event.target.value || 24),
                          }))
                        }
                      />
                    </label>
                    <button
                      type="button"
                      className="permission-refresh-btn"
                      onClick={generateShareLink}
                      disabled={syncing}
                    >
                      <Link2 size={15} />
                      Generate Trusted Link
                    </button>
                  </div>

                  {generatedLink && (
                    <div className="generated-link-box">
                      <strong>Trusted Link</strong>
                      <input
                        value={generatedLink}
                        readOnly
                        onFocus={(event) => event.target.select()}
                      />
                    </div>
                  )}
                </section>
              )}
            </>
          )}
        </main>
      </div>
    </section>
  );
}
