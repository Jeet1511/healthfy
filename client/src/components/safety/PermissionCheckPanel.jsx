/**
 * PermissionCheckPanel.jsx
 * Check and request necessary permissions for emergency functionality
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  CircleSlash,
  ExternalLink,
  Mic,
  Camera,
  MapPin,
  Bell,
  RefreshCw,
  ShieldAlert,
  XCircle,
  X,
} from "lucide-react";
import { useEmergency } from "@/context/EmergencyContext";
import {
  permissionOrchestrator,
  PERMISSION_STATUS,
  PERMISSION_TYPES,
} from "@/services/permissionOrchestrator";
import "./PermissionCheckPanel.css";

const permissionConfig = [
  {
    type: PERMISSION_TYPES.LOCATION,
    label: "Location",
    icon: MapPin,
    criticality: "critical",
  },
  {
    type: PERMISSION_TYPES.MICROPHONE,
    label: "Microphone",
    icon: Mic,
    criticality: "high",
  },
  {
    type: PERMISSION_TYPES.CAMERA,
    label: "Camera",
    icon: Camera,
    criticality: "optional",
  },
  {
    type: PERMISSION_TYPES.NOTIFICATIONS,
    label: "Notifications",
    icon: Bell,
    criticality: "medium",
  },
];

function getStatusText(status) {
  if (status === PERMISSION_STATUS.GRANTED) return "Granted";
  if (status === PERMISSION_STATUS.DENIED) return "Denied";
  if (status === PERMISSION_STATUS.UNAVAILABLE) return "Unavailable";
  return "Needs Access";
}

function getStepContext(permissionType) {
  const map = {
    [PERMISSION_TYPES.LOCATION]: "Allow precise location for emergency routing.",
    [PERMISSION_TYPES.MICROPHONE]: "Allow microphone so emergency audio capture can run.",
    [PERMISSION_TYPES.CAMERA]: "Allow camera for video evidence fallback.",
    [PERMISSION_TYPES.NOTIFICATIONS]: "Allow notifications for emergency status alerts.",
  };

  return map[permissionType] || "Enable permission for full emergency functionality.";
}

export default function PermissionCheckPanel({
  modeOverride = null,
  onCriticalStateChange = null,
}) {
  const { appMode, updatePermission, updateAllPermissions } = useEmergency();
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [requestingType, setRequestingType] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [recoveryInfo, setRecoveryInfo] = useState(null);
  const [stepsModalType, setStepsModalType] = useState(null);

  const emergencyPromptRequestedRef = useRef(false);

  const mode = modeOverride || appMode;
  const isEmergencyMode = mode === "emergency";

  const statusByType = useMemo(() => {
    const result = {};
    permissionConfig.forEach((item) => {
      result[item.type] = permissions[item.type] || PERMISSION_STATUS.PROMPT;
    });
    return result;
  }, [permissions]);

  const blockedCriticalPermissions = useMemo(
    () =>
      [PERMISSION_TYPES.LOCATION, PERMISSION_TYPES.MICROPHONE].filter((type) =>
        [PERMISSION_STATUS.PROMPT, PERMISSION_STATUS.DENIED, PERMISSION_STATUS.UNAVAILABLE].includes(
          statusByType[type]
        )
      ),
    [statusByType]
  );

  const refreshPermissions = useCallback(async () => {
    setError("");
    setSuccessMessage("");
    try {
      const next = await permissionOrchestrator.refreshPermissions();
      setPermissions(next);
      updateAllPermissions(next);
    } catch (err) {
      setError(err?.message || "Failed to load permission state.");
    } finally {
      setLoading(false);
    }
  }, [updateAllPermissions]);

  useEffect(() => {
    refreshPermissions();
  }, [refreshPermissions]);

  useEffect(() => {
    const unsubscribeStatus = permissionOrchestrator.onStatusChange(({ type, status }) => {
      setPermissions((prev) => ({ ...prev, [type]: status }));
      updatePermission(type, status);
    });

    const unsubscribeDenied = permissionOrchestrator.onDenial(({ type }) => {
      setRecoveryInfo(permissionOrchestrator.handleDenied(type));
    });

    return () => {
      if (typeof unsubscribeStatus === "function") unsubscribeStatus();
      if (typeof unsubscribeDenied === "function") unsubscribeDenied();
    };
  }, [updatePermission]);

  useEffect(() => {
    if (typeof onCriticalStateChange !== "function") return;
    onCriticalStateChange(blockedCriticalPermissions);
  }, [blockedCriticalPermissions, onCriticalStateChange]);

  const openRecovery = useCallback((type) => {
    setRecoveryInfo(permissionOrchestrator.handleDenied(type));
  }, []);

  const requestPermission = async (type) => {
    const status = statusByType[type] || PERMISSION_STATUS.PROMPT;

    if (status === PERMISSION_STATUS.DENIED) {
      openRecovery(type);
      return;
    }

    if (status === PERMISSION_STATUS.UNAVAILABLE) {
      setError(`${type} is unavailable on this device/browser.`);
      return;
    }

    setError("");
    setSuccessMessage("");
    setRequestingType(type);

    try {
      const nextStatus = await permissionOrchestrator.requestPermission(type, true);
      setPermissions((prev) => ({ ...prev, [type]: nextStatus }));
      updatePermission(type, nextStatus);

      const label = permissionConfig.find((item) => item.type === type)?.label || type;

      if (nextStatus === PERMISSION_STATUS.GRANTED) {
        setSuccessMessage(`${label} enabled successfully.`);
      } else if (nextStatus === PERMISSION_STATUS.DENIED) {
        openRecovery(type);
      }
    } catch (err) {
      setError(err?.message || `Failed to request ${type} permission.`);
    } finally {
      setRequestingType(null);
    }
  };

  const requestAll = async () => {
    setError("");
    setSuccessMessage("");

    for (const item of permissionConfig) {
      const status = statusByType[item.type];

      if (status === PERMISSION_STATUS.PROMPT) {
        // eslint-disable-next-line no-await-in-loop
        await requestPermission(item.type);
      }

      if (status === PERMISSION_STATUS.DENIED) {
        openRecovery(item.type);
      }
    }

    await refreshPermissions();
  };

  const openBrowserSettings = (type = null) => {
    const info = type
      ? permissionOrchestrator.handleDenied(type)
      : recoveryInfo || permissionOrchestrator.handleDenied(PERMISSION_TYPES.LOCATION);
    const target = info?.browserSettingsLink;
    if (!target) return;
    window.open(target, "_blank", "noopener,noreferrer");
  };

  const getPermissionIcon = (status) => {
    if (status === PERMISSION_STATUS.GRANTED) {
      return <CheckCircle2 size={18} className="granted-icon" />;
    }
    if (status === PERMISSION_STATUS.DENIED) {
      return <XCircle size={18} className="denied-icon" />;
    }
    if (status === PERMISSION_STATUS.UNAVAILABLE) {
      return <CircleSlash size={18} className="unavailable-icon" />;
    }
    return <AlertCircle size={18} className="prompt-icon" />;
  };

  const allSecure = permissionConfig.every((item) => {
    const status = statusByType[item.type];
    return status === PERMISSION_STATUS.GRANTED || status === PERMISSION_STATUS.UNAVAILABLE;
  });

  const deniedTypes = permissionConfig.filter(
    (item) => statusByType[item.type] === PERMISSION_STATUS.DENIED
  );

  useEffect(() => {
    if (!isEmergencyMode) {
      emergencyPromptRequestedRef.current = false;
      return;
    }

    if (loading || emergencyPromptRequestedRef.current) {
      return;
    }

    emergencyPromptRequestedRef.current = true;

    const runEmergencyPrompt = async () => {
      const criticalTypes = [PERMISSION_TYPES.LOCATION, PERMISSION_TYPES.MICROPHONE];
      for (const type of criticalTypes) {
        if (statusByType[type] === PERMISSION_STATUS.PROMPT) {
          // eslint-disable-next-line no-await-in-loop
          await requestPermission(type);
        }
      }
    };

    runEmergencyPrompt();
  }, [isEmergencyMode, loading, requestPermission, statusByType]);

  const getActionLabel = (status, isRequesting) => {
    if (isRequesting) return "Requesting...";
    if (status === PERMISSION_STATUS.DENIED) return "Fix Now";
    return "Enable";
  };

  return (
    <section className={`permission-check-panel card ${isEmergencyMode ? "emergency-mode" : "daily-mode"}`}>
      <h3 className="title" style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem" }}>
        <AlertCircle size={20} />
        {isEmergencyMode ? "Emergency Permission Gate" : "Permissions Status"}
      </h3>

      {isEmergencyMode ? (
        <p className="permission-mode-note emergency">
          Emergency mode requires immediate access to critical permissions. Location and microphone are prioritized.
        </p>
      ) : (
        <p className="permission-mode-note daily">
          Daily mode keeps permission prompts non-intrusive. Enable manually as needed.
        </p>
      )}

      <div className="permission-actions">
        <button
          type="button"
          className="permission-request-btn"
          onClick={requestAll}
          disabled={loading || !!requestingType || allSecure}
        >
          {allSecure ? "All Set" : "Enable Essentials"}
        </button>
        <button
          type="button"
          className="permission-refresh-btn"
          onClick={refreshPermissions}
          disabled={loading}
          aria-label="Refresh permission status"
        >
          <RefreshCw size={16} />
          Refresh Permissions
        </button>
      </div>

      <div className="permissions-list">
        {permissionConfig.map((item) => {
          const status = statusByType[item.type];
          const Icon = item.icon;
          const isRequesting = requestingType === item.type;
          const isBlocked = [PERMISSION_STATUS.DENIED, PERMISSION_STATUS.UNAVAILABLE].includes(status);

          return (
            <div key={item.type} className={`permission-item ${status} ${isEmergencyMode ? "emergency" : "daily"}`}>
            <div className="permission-info">
              <span className="permission-icon">{getPermissionIcon(status)}</span>
              <div>
                <strong className="permission-name">
                  <Icon size={14} />
                  {item.label}
                  {isEmergencyMode && item.criticality === "critical" && (
                    <span className="permission-priority-badge critical">Critical</span>
                  )}
                  {isEmergencyMode && item.criticality === "high" && (
                    <span className="permission-priority-badge high">High</span>
                  )}
                </strong>
                <p className="permission-label">{getStatusText(status)}</p>
                {isBlocked && (
                  <p className="permission-fallback-hint">
                    {item.type === PERMISSION_TYPES.LOCATION && "Fallback: last known/IP-based approximate location."}
                    {item.type === PERMISSION_TYPES.MICROPHONE && "Fallback: continue with video-only evidence stream."}
                    {item.type === PERMISSION_TYPES.CAMERA && "Fallback: continue with audio-only evidence stream."}
                    {item.type === PERMISSION_TYPES.NOTIFICATIONS && "Fallback: use in-app emergency alerts."}
                  </p>
                )}
              </div>
            </div>

            {status !== PERMISSION_STATUS.GRANTED && status !== PERMISSION_STATUS.UNAVAILABLE && (
              <button
                type="button"
                className={`permission-request-btn ${status === PERMISSION_STATUS.DENIED ? "permission-fix-btn" : ""}`}
                onClick={() =>
                  status === PERMISSION_STATUS.DENIED
                    ? openRecovery(item.type)
                    : requestPermission(item.type)
                }
                disabled={isRequesting}
              >
                {getActionLabel(status, isRequesting)}
              </button>
            )}

            {status === PERMISSION_STATUS.UNAVAILABLE && (
              <span className="permission-unavailable-badge">Device Unsupported</span>
            )}
          </div>
          );
        })}
      </div>

      {deniedTypes.length > 0 && (
        <div className="permission-help" role="status" aria-live="polite">
          <div className="permission-help-title">
            <ShieldAlert size={16} />
            Permission blocked in browser settings
          </div>
          <p>
            Browser has blocked access for {deniedTypes.map((item) => item.label.toLowerCase()).join(", ")}. Use manual recovery from browser settings.
          </p>
          <div className="permission-help-actions">
            <button
              type="button"
              className="permission-link-btn"
              onClick={() => openBrowserSettings(deniedTypes[0]?.type)}
            >
              Open Browser Settings
              <ExternalLink size={14} />
            </button>
            <button
              type="button"
              className="permission-link-btn secondary"
              onClick={() => setStepsModalType(deniedTypes[0]?.type || null)}
            >
              Show Steps
            </button>
          </div>
        </div>
      )}

      {successMessage && <p className="permission-success">{successMessage}</p>}
      {error && <p className="permission-error">{error}</p>}

      <p className="permission-note">
        {allSecure
          ? "All essential permissions are ready for emergency operations."
          : "Enable all permissions for full emergency functionality and reliable fallbacks."}
      </p>

      {stepsModalType && (
        <div className="permission-steps-modal-backdrop" role="dialog" aria-modal="true">
          <div className="permission-steps-modal">
            <div className="permission-steps-header">
              <h4>Manual Recovery Steps</h4>
              <button
                type="button"
                className="permission-steps-close"
                onClick={() => setStepsModalType(null)}
                aria-label="Close steps"
              >
                <X size={16} />
              </button>
            </div>

            <p className="permission-steps-context">{getStepContext(stepsModalType)}</p>

            <ol className="permission-steps">
              {(permissionOrchestrator.handleDenied(stepsModalType).steps || []).map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>

            <div className="permission-help-actions">
              <button
                type="button"
                className="permission-link-btn"
                onClick={() => openBrowserSettings(stepsModalType)}
              >
                Open Browser Settings
                <ExternalLink size={14} />
              </button>
              <button
                type="button"
                className="permission-link-btn secondary"
                onClick={async () => {
                  await refreshPermissions();
                  setStepsModalType(null);
                }}
              >
                Refresh Permissions
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
