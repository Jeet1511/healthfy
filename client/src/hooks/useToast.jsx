/**
 * useToast Hook
 * Simple toast notification system with auto-dismiss
 */

import { useState, useCallback } from "react";

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "info", duration = 3000) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast = { id, message, type };

    setToasts((prev) => [...prev, toast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, showToast, removeToast };
}

export function Toast({ message, type = "info", onClose }) {
  const typeStyles = {
    success: { bg: "bg-green-500", icon: "✓" },
    error: { bg: "bg-red-500", icon: "✕" },
    warning: { bg: "bg-yellow-500", icon: "⚠" },
    info: { bg: "bg-blue-500", icon: "ℹ" },
  };

  const style = typeStyles[type] || typeStyles.info;

  return (
    <div className={`toast toast-${type} ${style.bg}`} onClick={onClose}>
      <span className="toast-icon">{style.icon}</span>
      <span className="toast-message">{message}</span>
    </div>
  );
}
