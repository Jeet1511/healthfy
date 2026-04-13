import { createContext, useContext, useMemo, useState, useCallback, useEffect } from "react";

const EmergencyContext = createContext(null);

const defaultPermissions = {
  location: "prompt",
  microphone: "prompt",
  camera: "prompt",
  notifications: "prompt",
};

const defaultSOSMetadata = {
  hasAudio: false,
  hasVideo: false,
  contactsNotified: [],
  location: null,
  triggerSource: null,
};

// Default emergency profile structure
const defaultEmergencyProfile = {
  name: "",
  bloodGroup: "O+",
  allergies: [],
  medicalConditions: [],
  emergencyContacts: [],
  phone: "",
  address: "",
};

// SOS status enum
export const SOS_STATUS = {
  INACTIVE: "inactive",
  ARMED: "armed",
  TRIGGERED: "triggered",
  RECORDING: "recording",
  COOLDOWN: "cooldown",
};

export function EmergencyProvider({ children }) {
  const [currentContext, setCurrentContext] = useState("daily");
  const [appMode, setAppMode] = useState("daily");
  const [emergencyActive, setEmergencyActive] = useState(false);

  // Connectivity state
  const [networkStatus, setNetworkStatus] = useState({
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    lastChangedAt: new Date().toISOString(),
  });
  
  // Real-time location tracking
  const [location, setLocation] = useState(null);
  const [locationWatchId, setLocationWatchId] = useState(null);
  
  // SOS system
  const [sosStatus, setSosStatus] = useState(SOS_STATUS.INACTIVE);
  const [sosTriggeredAt, setSosTriggeredAt] = useState(null);
  const [sosMetadata, setSosMetadata] = useState(defaultSOSMetadata);

  // Emergency session state for tracking uploads/alerts
  const [emergencySession, setEmergencySession] = useState({
    id: null,
    startedAt: null,
    triggerSource: null,
    queuedLocationLogs: 0,
    queuedAlerts: 0,
    queuedChunkUploads: 0,
    uploadedChunkCount: 0,
    evidenceSessionId: null,
    evidenceState: null,
    backgroundRecording: false,
    recordingChunkDurationMs: null,
  });
  
  // Recording state
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState(null);
  
  // Emergency profile
  const [emergencyProfile, setEmergencyProfile] = useState(defaultEmergencyProfile);
  
  // Real-time status logs
  const [statusLogs, setStatusLogs] = useState([]);
  
  // Permissions state
  const [permissions, setPermissions] = useState(defaultPermissions);
  
  // Voice command active
  const [voiceCommandActive, setVoiceCommandActive] = useState(true);

  const addStatusLog = useCallback((message, type = "info", data = null) => {
    const log = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      message,
      type, // "info", "success", "warning", "error"
      data,
    };
    setStatusLogs((prev) => [log, ...prev].slice(0, 50)); // Keep last 50 logs
  }, []);

  useEffect(() => {
    const syncNetworkState = () => {
      setNetworkStatus({
        isOnline: navigator.onLine,
        lastChangedAt: new Date().toISOString(),
      });
      addStatusLog(
        navigator.onLine
          ? "Network restored. Pending emergency data will sync."
          : "Network offline. Emergency data will be queued for sync.",
        navigator.onLine ? "success" : "warning"
      );
    };

    window.addEventListener("online", syncNetworkState);
    window.addEventListener("offline", syncNetworkState);

    return () => {
      window.removeEventListener("online", syncNetworkState);
      window.removeEventListener("offline", syncNetworkState);
    };
  }, [addStatusLog]);

  const updateEmergencySession = useCallback((updates) => {
    setEmergencySession((prev) => ({ ...prev, ...updates }));
  }, []);

  const enterEmergencyMode = useCallback((triggerSource = "manual") => {
    setEmergencyActive(true);
    setAppMode("emergency");
    setCurrentContext("emergency");
    setSosStatus((prev) =>
      prev === SOS_STATUS.INACTIVE || prev === SOS_STATUS.COOLDOWN
        ? SOS_STATUS.ARMED
        : prev
    );
    setEmergencySession((prev) => ({
      ...prev,
      id: prev.id || `emg_${Date.now()}`,
      startedAt: prev.startedAt || new Date().toISOString(),
      triggerSource,
    }));
    addStatusLog(`Emergency mode activated (${triggerSource})`, "warning");
  }, [addStatusLog]);

  const enterDailyMode = useCallback(() => {
    setEmergencyActive(false);
    setAppMode("daily");
    setCurrentContext("daily");
    setSosStatus(SOS_STATUS.INACTIVE);
    setSosTriggeredAt(null);
    setIsRecordingAudio(false);
    setIsRecordingVideo(false);
    setSosMetadata(defaultSOSMetadata);
    setEmergencySession({
      id: null,
      startedAt: null,
      triggerSource: null,
      queuedLocationLogs: 0,
      queuedAlerts: 0,
      queuedChunkUploads: 0,
      uploadedChunkCount: 0,
      evidenceSessionId: null,
      evidenceState: null,
      backgroundRecording: false,
      recordingChunkDurationMs: null,
    });
    addStatusLog("Returned to daily mode", "info");
  }, [addStatusLog]);

  const triggerSOS = useCallback((metadata = {}) => {
    setEmergencyActive(true);
    setAppMode("emergency");
    setCurrentContext("emergency");
    setSosStatus(SOS_STATUS.TRIGGERED);
    const triggeredAt = new Date();
    setSosTriggeredAt(triggeredAt);
    setEmergencySession((prev) => ({
      ...prev,
      id: prev.id || `emg_${Date.now()}`,
      startedAt: prev.startedAt || triggeredAt.toISOString(),
      triggerSource: metadata.triggerSource || prev.triggerSource || "manual",
    }));
    setSosMetadata((prev) => ({
      ...prev,
      ...metadata,
      contactsNotified: Array.isArray(metadata.contactsNotified)
        ? metadata.contactsNotified
        : prev.contactsNotified,
      triggerSource: metadata.triggerSource || prev.triggerSource || "manual",
    }));
    addStatusLog("🚨 SOS TRIGGERED", "error");
  }, [addStatusLog]);

  const updateProfile = useCallback((profile) => {
    setEmergencyProfile((prev) => ({ ...prev, ...profile }));
    addStatusLog("Emergency profile updated", "success");
  }, [addStatusLog]);

  const updatePermission = useCallback((permission, status) => {
    setPermissions((prev) => ({
      ...prev,
      [permission]: status || defaultPermissions[permission] || "prompt",
    }));
  }, []);

  const updateAllPermissions = useCallback((nextPermissions = {}) => {
    setPermissions((prev) => ({
      ...prev,
      ...nextPermissions,
    }));
  }, []);

  const cancelSOS = useCallback(() => {
    addStatusLog("SOS canceled by user", "warning");
    enterDailyMode();
  }, [addStatusLog, enterDailyMode]);

  const value = useMemo(
    () => ({
      // Context navigation
      currentContext,
      setCurrentContext,
      appMode,
      setAppMode,
      emergencyActive,
      setEmergencyActive,
      networkStatus,
      setNetworkStatus,
      
      // Location tracking
      location,
      setLocation,
      locationWatchId,
      setLocationWatchId,
      
      // SOS system
      sosStatus,
      setSosStatus,
      sosTriggeredAt,
      sosMetadata,
      setSosMetadata,
      emergencySession,
      updateEmergencySession,
      triggerSOS,
      cancelSOS,
      
      // Recording state
      isRecordingAudio,
      setIsRecordingAudio,
      isRecordingVideo,
      setIsRecordingVideo,
      recordingStartTime,
      setRecordingStartTime,
      
      // Emergency profile
      emergencyProfile,
      updateProfile,
      
      // Status logs
      statusLogs,
      addStatusLog,
      
      // Permissions
      permissions,
      updatePermission,
      updateAllPermissions,
      
      // Voice commands
      voiceCommandActive,
      setVoiceCommandActive,
      
      // Mode switching
      enterEmergencyMode,
      enterDailyMode,
      SOS_STATUS,
    }),
    [
      currentContext,
      appMode,
      emergencyActive,
      networkStatus,
      location,
      locationWatchId,
      sosStatus,
      sosTriggeredAt,
      sosMetadata,
      emergencySession,
      isRecordingAudio,
      isRecordingVideo,
      recordingStartTime,
      emergencyProfile,
      statusLogs,
      permissions,
      voiceCommandActive,
      enterEmergencyMode,
      enterDailyMode,
      triggerSOS,
      cancelSOS,
      updateProfile,
      updatePermission,
      updateAllPermissions,
      updateEmergencySession,
      addStatusLog,
    ]
  );

  return <EmergencyContext.Provider value={value}>{children}</EmergencyContext.Provider>;
}

export function useEmergency() {
  const context = useContext(EmergencyContext);
  if (!context) {
    throw new Error("useEmergency must be used inside EmergencyProvider");
  }

  return context;
}

export const useAppContextState = useEmergency;
