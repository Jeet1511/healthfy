/**
 * PermissionCheckPanel.jsx
 * Check and request necessary permissions for emergency functionality
 */

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import "./PermissionCheckPanel.css";

export default function PermissionCheckPanel() {
  const [permissions, setPermissions] = useState({
    location: null,
    microphone: null,
    notifications: null,
  });

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    const perms = { location: null, microphone: null, notifications: null };

    // Check Location Permission
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
          perms.location = "granted";
          updatePermissions(perms);
        },
        (error) => {
          perms.location = error.code === 1 ? "denied" : "prompt";
          updatePermissions(perms);
        }
      );
    }

    // Check Microphone Permission
    if ("permissions" in navigator) {
      try {
        const micPermission = await navigator.permissions.query({ name: "microphone" });
        perms.microphone = micPermission.state;
      } catch (e) {
        perms.microphone = "unknown";
      }
    }

    // Check Notification Permission
    if ("Notification" in window) {
      perms.notifications = Notification.permission;
    }

    updatePermissions(perms);
  };

  const updatePermissions = (perms) => {
    setPermissions(perms);
  };

  const requestPermission = async (type) => {
    try {
      if (type === "location") {
        navigator.geolocation.getCurrentPosition(
          () => {
            setPermissions((prev) => ({ ...prev, location: "granted" }));
          },
          () => {
            setPermissions((prev) => ({ ...prev, location: "denied" }));
          }
        );
      } else if (type === "microphone") {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
        setPermissions((prev) => ({ ...prev, microphone: "granted" }));
      } else if (type === "notifications") {
        const permission = await Notification.requestPermission();
        setPermissions((prev) => ({ ...prev, notifications: permission }));
      }
    } catch (error) {
      console.error(`Failed to request ${type} permission:`, error);
    }
  };

  const getPermissionIcon = (status) => {
    if (status === "granted") return <CheckCircle size={18} style={{ color: "#10b981" }} />;
    if (status === "denied") return <XCircle size={18} style={{ color: "#dc2626" }} />;
    return <AlertCircle size={18} style={{ color: "#f59e0b" }} />;
  };

  const getPermissionText = (status) => {
    if (status === "granted") return "Granted ✓";
    if (status === "denied") return "Denied ✕";
    if (status === "prompt") return "Request";
    return "Unknown";
  };

  return (
    <section className="permission-check-panel card">
      <h3 className="title" style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem" }}>
        <AlertCircle size={20} />
        Permissions Status
      </h3>

      <div className="permissions-list">
        {Object.entries(permissions).map(([type, status]) => (
          <div key={type} className={`permission-item ${status}`}>
            <div className="permission-info">
              <span className="permission-icon">{getPermissionIcon(status)}</span>
              <div>
                <strong>{type.charAt(0).toUpperCase() + type.slice(1)}</strong>
                <p className="permission-label">{getPermissionText(status)}</p>
              </div>
            </div>

            {status !== "granted" && (
              <button
                className="permission-request-btn"
                onClick={() => requestPermission(type)}
              >
                Enable
              </button>
            )}
          </div>
        ))}
      </div>

      <p className="permission-note">
        ⚠️ Enable all permissions for full emergency functionality
      </p>
    </section>
  );
}
