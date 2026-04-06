import React, { useState, useEffect } from "react";
import axios from "axios";
import "./EvidenceDashboard.css";

/**
 * Evidence Dashboard Component
 * Display and manage recorded evidence sessions
 */
function EvidenceDashboard() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(0);
  const limit = 10;

  useEffect(() => {
    fetchSessions();
  }, [filter, page]);

  /**
   * Fetch evidence sessions from server
   */
  const fetchSessions = async () => {
    try {
      setLoading(true);
      const query = filter !== "all" ? `?status=${filter}&limit=${limit}&skip=${page * limit}` : `?limit=${limit}&skip=${page * limit}`;

      const response = await axios.get(`/api/evidence${query}`);
      setSessions(response.data.data.evidence);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
      setError("Failed to load evidence sessions");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Download chunk
   */
  const downloadChunk = async (sessionId, chunkIndex) => {
    try {
      const response = await axios.get(`/api/evidence/${sessionId}/chunks/${chunkIndex}/download`);
      const downloadUrl = response.data.data.downloadUrl;

      // Create download link
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.target = "_blank";
      a.click();
    } catch (err) {
      console.error("Download failed:", err);
      alert("Failed to download chunk");
    }
  };

  /**
   * Delete session
   */
  const deleteSession = async (sessionId) => {
    if (!window.confirm("Are you sure you want to delete this evidence session?")) {
      return;
    }

    try {
      await axios.delete(`/api/evidence/${sessionId}`);
      setSessions(sessions.filter((s) => s._id !== sessionId));
      setSelectedSession(null);
      alert("Evidence session deleted");
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete session");
    }
  };

  /**
   * Format date
   */
  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  /**
   * Format duration
   */
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  return (
    <div className="evidence-dashboard">
      <div className="dashboard-header">
        <h1>📹 Evidence Dashboard</h1>
        <p>View and manage your emergency evidence recordings</p>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <button
          className={`filter-btn ${filter === "all" ? "active" : ""}`}
          onClick={() => {
            setFilter("all");
            setPage(0);
          }}
        >
          All Sessions
        </button>
        <button
          className={`filter-btn ${filter === "recording" ? "active" : ""}`}
          onClick={() => {
            setFilter("recording");
            setPage(0);
          }}
        >
          Recording
        </button>
        <button
          className={`filter-btn ${filter === "completed" ? "active" : ""}`}
          onClick={() => {
            setFilter("completed");
            setPage(0);
          }}
        >
          Completed
        </button>
        <button
          className={`filter-btn ${filter === "failed" ? "active" : ""}`}
          onClick={() => {
            setFilter("failed");
            setPage(0);
          }}
        >
          Failed
        </button>
      </div>

      {/* Error Message */}
      {error && <div className="error-message">⚠️ {error}</div>}

      {/* Loading State */}
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading evidence sessions...</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="empty-state">
          <p>🔒 No evidence sessions found</p>
        </div>
      ) : (
        <>
          {/* Sessions Grid */}
          <div className="sessions-grid">
            {sessions.map((session) => (
              <div
                key={session._id}
                className={`session-card ${session.status}`}
                onClick={() => setSelectedSession(session)}
              >
                <div className="session-header">
                  <div className="session-status">
                    {session.status === "recording" && <span className="status-badge recording">🔴 Recording</span>}
                    {session.status === "completed" && <span className="status-badge completed">✅ Completed</span>}
                    {session.status === "failed" && <span className="status-badge failed">❌ Failed</span>}
                  </div>
                  <span className="session-type">{session.recordingType}</span>
                </div>

                <div className="session-info">
                  <div className="info-item">
                    <span className="label">Started:</span>
                    <span className="value">{formatDate(session.startTime)}</span>
                  </div>
                  {session.duration && (
                    <div className="info-item">
                      <span className="label">Duration:</span>
                      <span className="value">{formatDuration(Math.round(session.duration / 1000))}</span>
                    </div>
                  )}
                  <div className="info-item">
                    <span className="label">Chunks:</span>
                    <span className="value">
                      {session.uploadedChunks}/{session.totalChunks || 0}
                    </span>
                  </div>
                </div>

                {session.location?.startLatitude && (
                  <div className="session-location">
                    📍 {session.location.startLatitude.toFixed(4)}, {session.location.startLongitude.toFixed(4)}
                  </div>
                )}

                <div className="session-actions">
                  <button className="btn-preview" onClick={() => setSelectedSession(session)}>
                    Preview
                  </button>
                  <button className="btn-delete" onClick={() => deleteSession(session._id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="pagination">
            <button onClick={() => setPage(page - 1)} disabled={page === 0}>
              ← Previous
            </button>
            <span>Page {page + 1}</span>
            <button onClick={() => setPage(page + 1)}>
              Next →
            </button>
          </div>
        </>
      )}

      {/* Detailed View Modal */}
      {selectedSession && (
        <div className="modal-overlay" onClick={() => setSelectedSession(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Evidence Session Details</h2>
              <button className="modal-close" onClick={() => setSelectedSession(null)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-section">
                <h3>Session Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Session ID:</span>
                    <code>{selectedSession.sessionId}</code>
                  </div>
                  <div className="detail-item">
                    <span className="label">Status:</span>
                    <span className={`status ${selectedSession.status}`}>{selectedSession.status}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Recording Type:</span>
                    <span>{selectedSession.recordingType}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Started:</span>
                    <span>{formatDate(selectedSession.startTime)}</span>
                  </div>
                  {selectedSession.endTime && (
                    <div className="detail-item">
                      <span className="label">Ended:</span>
                      <span>{formatDate(selectedSession.endTime)}</span>
                    </div>
                  )}
                  {selectedSession.duration && (
                    <div className="detail-item">
                      <span className="label">Duration:</span>
                      <span>{formatDuration(Math.round(selectedSession.duration / 1000))}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Chunks List */}
              {selectedSession.chunks && selectedSession.chunks.length > 0 && (
                <div className="detail-section">
                  <h3>Recording Chunks ({selectedSession.chunks.length})</h3>
                  <div className="chunks-list">
                    {selectedSession.chunks.map((chunk) => (
                      <div key={chunk.chunkIndex} className={`chunk-item ${chunk.uploadStatus}`}>
                        <div className="chunk-info">
                          <span className="chunk-number">Chunk #{chunk.chunkIndex}</span>
                          <span className={`chunk-status ${chunk.uploadStatus}`}>
                            {chunk.uploadStatus === "success" && "✓"}
                            {chunk.uploadStatus === "failed" && "✗"}
                            {chunk.uploadStatus === "pending" && "⟳"}
                          </span>
                        </div>
                        <div className="chunk-meta">
                          <span>{formatDate(chunk.timestamp)}</span>
                          {chunk.duration && <span>{chunk.duration}ms</span>}
                        </div>
                        {chunk.cloudPath && chunk.uploadStatus === "success" && (
                          <button
                            className="btn-download"
                            onClick={() => downloadChunk(selectedSession.sessionId, chunk.chunkIndex)}
                          >
                            Download
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Location */}
              {selectedSession.location && (
                <div className="detail-section">
                  <h3>📍 Location</h3>
                  <div className="location-info">
                    <p>
                      Start: {selectedSession.location.startLatitude?.toFixed(6)}, {selectedSession.location.startLongitude?.toFixed(6)}
                    </p>
                    {selectedSession.location.endLatitude && (
                      <p>
                        End: {selectedSession.location.endLatitude?.toFixed(6)}, {selectedSession.location.endLongitude?.toFixed(6)}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedSession.metadata?.notes && (
                <div className="detail-section">
                  <h3>📝 Notes</h3>
                  <p>{selectedSession.metadata.notes}</p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setSelectedSession(null)}>
                Close
              </button>
              <button className="btn-danger" onClick={() => deleteSession(selectedSession._id)}>
                Delete Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EvidenceDashboard;
