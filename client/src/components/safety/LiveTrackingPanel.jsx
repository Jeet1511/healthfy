import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, Loader, MapPin, RefreshCw } from "lucide-react";
import { useEmergency } from "@/context/EmergencyContext";
import { apiClient } from "@/api/apiClient";

const LOCATION_QUEUE_KEY = "omina_location_queue";
const LAST_LOCATION_KEY = "omina_last_location";
const EMERGENCY_SEND_INTERVAL_MS = 4000;
const DAILY_REFRESH_INTERVAL_MS = 60000;
const GEO_TIMEOUT_MS = 5000;

function readQueue() {
  try {
    return JSON.parse(localStorage.getItem(LOCATION_QUEUE_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeQueue(queue) {
  localStorage.setItem(LOCATION_QUEUE_KEY, JSON.stringify(queue.slice(-120)));
}

function readLastLocation() {
  try {
    return JSON.parse(localStorage.getItem(LAST_LOCATION_KEY) || "null");
  } catch {
    return null;
  }
}

function writeLastLocation(location) {
  localStorage.setItem(LAST_LOCATION_KEY, JSON.stringify(location));
}

function getAuthHeaders() {
  try {
    const raw = JSON.parse(localStorage.getItem("omina_session") || "null");
    if (raw?.token) {
      return { Authorization: `Bearer ${raw.token}` };
    }
  } catch {
    // Ignore parse errors and continue without auth headers.
  }
  return {};
}

async function getIpFallbackLocation() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);

  try {
    const response = await fetch("https://ipapi.co/json/", {
      signal: controller.signal,
    });
    const data = await response.json();

    if (!Number.isFinite(Number(data.latitude)) || !Number.isFinite(Number(data.longitude))) {
      return null;
    }

    return {
      latitude: Number(data.latitude),
      longitude: Number(data.longitude),
      accuracy: 5000,
      source: "ip",
      timestamp: Date.now(),
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export default function LiveTrackingPanel() {
  const {
    location,
    setLocation,
    appMode,
    addStatusLog,
    emergencySession,
    updateEmergencySession,
  } = useEmergency();

  const [status, setStatus] = useState(location ? "success" : "idle");
  const [error, setError] = useState("");
  const [dailyAutoUpdates, setDailyAutoUpdates] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);

  const watchIdRef = useRef(null);
  const dailyIntervalRef = useRef(null);
  const lastSentRef = useRef(0);

  const isEmergency = appMode === "emergency";

  const enqueueLocationLog = useCallback(
    (record) => {
      const queue = readQueue();
      queue.push(record);
      writeQueue(queue);
      updateEmergencySession({ queuedLocationLogs: queue.length });
    },
    [updateEmergencySession]
  );

  const sendLocationLog = useCallback(
    async (record) => {
      const targetSessionId = emergencySession.evidenceSessionId || emergencySession.id;
      const payload = {
        sessionId: targetSessionId,
        ...record,
      };

      if (!navigator.onLine) {
        enqueueLocationLog(payload);
        return;
      }

      try {
        await apiClient.post(
          "/evidence/location-log",
          payload,
          {
            headers: getAuthHeaders(),
            timeout: 5000,
          }
        );
        setLastSyncedAt(new Date().toISOString());
      } catch {
        enqueueLocationLog(payload);
      }
    },
    [emergencySession.evidenceSessionId, emergencySession.id, enqueueLocationLog]
  );

  const syncQueuedLogs = useCallback(async () => {
    if (!navigator.onLine) {
      return;
    }

    const queue = readQueue();
    if (queue.length === 0) {
      updateEmergencySession({ queuedLocationLogs: 0 });
      return;
    }

    const remaining = [];

    for (const item of queue) {
      try {
        await apiClient.post(
          "/evidence/location-log",
          {
            sessionId: item.sessionId || emergencySession.evidenceSessionId || emergencySession.id,
            ...item,
          },
          {
            headers: getAuthHeaders(),
            timeout: 5000,
          }
        );
      } catch {
        remaining.push(item);
      }
    }

    writeQueue(remaining);
    updateEmergencySession({ queuedLocationLogs: remaining.length });
    setLastSyncedAt(new Date().toISOString());
  }, [emergencySession.evidenceSessionId, emergencySession.id, updateEmergencySession]);

  useEffect(() => {
    const handleOnline = () => {
      syncQueuedLogs();
    };

    window.addEventListener("online", handleOnline);
    syncQueuedLogs();

    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, [syncQueuedLogs]);

  const persistAndSetLocation = useCallback(
    (nextLocation) => {
      setLocation(nextLocation);
      writeLastLocation(nextLocation);
      setStatus("success");
      setError("");
    },
    [setLocation]
  );

  const applyFallbackLocation = useCallback(async () => {
    const cached = readLastLocation();
    if (cached?.latitude && cached?.longitude) {
      persistAndSetLocation({
        ...cached,
        source: "cached",
        timestamp: Date.now(),
      });
      addStatusLog("Using last known location fallback", "warning");
      return true;
    }

    const ipFallback = await getIpFallbackLocation();
    if (ipFallback) {
      persistAndSetLocation(ipFallback);
      addStatusLog("Using approximate IP-based location fallback", "warning");
      return true;
    }

    return false;
  }, [addStatusLog, persistAndSetLocation]);

  const requestSingleLocation = useCallback(
    async (reason = "manual") => {
      setStatus("loading");
      setError("");

      if (!navigator.geolocation) {
        setStatus("error");
        setError("Geolocation is unavailable on this device.");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const nextLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            heading: position.coords.heading,
            speed: position.coords.speed,
            timestamp: position.timestamp,
            source: "gps",
          };

          persistAndSetLocation(nextLocation);

          if (isEmergency) {
            await sendLocationLog({
              ...nextLocation,
              mode: "emergency",
              reason,
            });
          }
        },
        async (geoError) => {
          if (geoError.code === geoError.TIMEOUT) {
            setStatus("timeout");
            setError("Location timed out after 5 seconds.");
          } else {
            setStatus("error");
            setError("Unable to get GPS location.");
          }

          const fallbackApplied = await applyFallbackLocation();
          if (!fallbackApplied) {
            addStatusLog("Location unavailable and no fallback source found", "error");
          }
        },
        {
          enableHighAccuracy: isEmergency,
          timeout: GEO_TIMEOUT_MS,
          maximumAge: isEmergency ? 0 : 15000,
        }
      );
    },
    [addStatusLog, applyFallbackLocation, isEmergency, persistAndSetLocation, sendLocationLog]
  );

  const stopEmergencyWatch = useCallback(() => {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  const startEmergencyWatch = useCallback(() => {
    if (!navigator.geolocation || watchIdRef.current !== null) {
      return;
    }

    setStatus("loading");

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const nextLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: position.timestamp,
          source: "gps",
        };

        persistAndSetLocation(nextLocation);

        const now = Date.now();
        if (now - lastSentRef.current >= EMERGENCY_SEND_INTERVAL_MS) {
          lastSentRef.current = now;
          await sendLocationLog({
            ...nextLocation,
            mode: "emergency",
            reason: "watch",
          });
        }
      },
      async (geoError) => {
        if (geoError.code === geoError.TIMEOUT) {
          setStatus("timeout");
          setError("Continuous tracking timed out.");
        } else {
          setStatus("error");
          setError("Emergency tracking encountered an error.");
        }

        await applyFallbackLocation();
      },
      {
        enableHighAccuracy: true,
        timeout: GEO_TIMEOUT_MS,
        maximumAge: 0,
      }
    );
  }, [applyFallbackLocation, persistAndSetLocation, sendLocationLog]);

  useEffect(() => {
    if (isEmergency) {
      startEmergencyWatch();
      return () => {
        stopEmergencyWatch();
      };
    }

    stopEmergencyWatch();
    if (status === "loading") {
      setStatus(location ? "success" : "idle");
    }
  }, [isEmergency, location, startEmergencyWatch, status, stopEmergencyWatch]);

  useEffect(() => {
    if (!dailyAutoUpdates || isEmergency) {
      if (dailyIntervalRef.current) {
        clearInterval(dailyIntervalRef.current);
        dailyIntervalRef.current = null;
      }
      return;
    }

    dailyIntervalRef.current = setInterval(() => {
      requestSingleLocation("daily-refresh");
    }, DAILY_REFRESH_INTERVAL_MS);

    return () => {
      if (dailyIntervalRef.current) {
        clearInterval(dailyIntervalRef.current);
        dailyIntervalRef.current = null;
      }
    };
  }, [dailyAutoUpdates, isEmergency, requestSingleLocation]);

  useEffect(() => {
    return () => {
      stopEmergencyWatch();
      if (dailyIntervalRef.current) {
        clearInterval(dailyIntervalRef.current);
      }
    };
  }, [stopEmergencyWatch]);

  const queuedCount = emergencySession.queuedLocationLogs || 0;

  if (status === "error" && !location) {
    return (
      <section className="card">
        <h3 className="title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <AlertCircle size={20} style={{ color: "#ef4444" }} />
          Location Error
        </h3>
        <p className="subtle">{error}</p>
        <button type="button" className="permission-request-btn" onClick={() => requestSingleLocation("retry")}>Retry</button>
      </section>
    );
  }

  const isLoading = status === "loading";

  const getStatusText = () => {
    if (status === "timeout") {
      return "Location request timed out after 5 seconds. Retry to continue.";
    }
    if (isEmergency) {
      return "Emergency mode: high-frequency GPS tracking is active.";
    }
    if (dailyAutoUpdates) {
      return "Daily mode: low-frequency tracking runs every 60 seconds.";
    }
    return "Daily mode: location is fetched only when requested.";
  };

  return (
    <section className="card">
      <h3 className="title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <MapPin size={20} />
        Live Location Tracking
      </h3>
      <p className="subtle">{getStatusText()}</p>

      <div className="location-controls">
        <button
          type="button"
          className="permission-request-btn"
          onClick={() => requestSingleLocation(isEmergency ? "emergency-retry" : "manual")}
          disabled={isLoading}
        >
          {isLoading ? "Acquiring..." : isEmergency ? "Retry GPS" : "Get Current Location"}
        </button>

        {!isEmergency && (
          <button
            type="button"
            className="permission-refresh-btn"
            onClick={() => setDailyAutoUpdates((prev) => !prev)}
          >
            <RefreshCw size={16} />
            {dailyAutoUpdates ? "Stop Auto Updates" : "Start Low-Frequency Updates"}
          </button>
        )}
      </div>

      {isLoading ? (
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <Loader size={24} className="spin" style={{ margin: "0 auto", animation: "spin 1s linear infinite" }} />
          <p style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: "#666" }}>Acquiring location...</p>
        </div>
      ) : location ? (
        <div className="tracking-grid">
          <div>
            <small style={{ fontWeight: "600", color: "#666" }}>Latitude</small>
            <p style={{ fontSize: "1.2rem", fontFamily: "monospace", fontWeight: "bold" }}>
              {location.latitude.toFixed(6)}
            </p>
          </div>
          <div>
            <small style={{ fontWeight: "600", color: "#666" }}>Longitude</small>
            <p style={{ fontSize: "1.2rem", fontFamily: "monospace", fontWeight: "bold" }}>
              {location.longitude.toFixed(6)}
            </p>
          </div>
          <div>
            <small style={{ fontWeight: "600", color: "#666" }}>Accuracy</small>
            <p style={{ fontSize: "1rem" }}>±{location.accuracy?.toFixed(1) || "?"}m</p>
          </div>
          <div>
            <small style={{ fontWeight: "600", color: "#666" }}>Source</small>
            <p style={{ color: location.source === "gps" ? "#10b981" : "#f59e0b", fontWeight: "bold" }}>
              {location.source === "gps" ? "GPS" : location.source === "cached" ? "Last Known" : "Approximate"}
            </p>
          </div>
        </div>
      ) : (
        <div style={{ padding: "1rem", color: "#666", textAlign: "center" }}>
          <p>Location is idle. Tap Get Current Location to start.</p>
        </div>
      )}

      {(status === "timeout" || error) && (
        <p className="permission-error" style={{ marginTop: "0.75rem" }}>
          {error || "Location request timed out."}
        </p>
      )}

      {isEmergency && (
        <p className="subtle" style={{ marginTop: "0.6rem", fontSize: "0.82rem" }}>
          Queued location logs: {queuedCount}
          {lastSyncedAt ? ` • Last synced ${new Date(lastSyncedAt).toLocaleTimeString()}` : ""}
        </p>
      )}
    </section>
  );
}
