import { createContext, useContext, useMemo, useState, useCallback } from "react";

const EmergencyContext = createContext(null);

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
  
  // Real-time location tracking
  const [location, setLocation] = useState(null);
  const [locationWatchId, setLocationWatchId] = useState(null);
  
  // SOS system
  const [sosStatus, setSosStatus] = useState(SOS_STATUS.INACTIVE);
  const [sosTriggeredAt, setSosTriggeredAt] = useState(null);
  const [sosMetadata, setSosMetadata] = useState({
    hasAudio: false,
    hasVideo: false,
    contactsNotified: [],
    location: null,
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
  const [permissions, setPermissions] = useState({
    location: null,
    microphone: null,
    camera: null,
    notifications: null,
  });
  
  // Voice command active
  const [voiceCommandActive, setVoiceCommandActive] = useState(false);

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

  const enterEmergencyMode = useCallback(() => {
    setEmergencyActive(true);
    setAppMode("emergency");
    setCurrentContext("emergency");
    setSosStatus(SOS_STATUS.ARMED);
    addStatusLog("Emergency mode activated", "warning");
  }, [addStatusLog]);

  const enterDailyMode = useCallback(() => {
    setEmergencyActive(false);
    setAppMode("daily");
    setCurrentContext("daily");
    setSosStatus(SOS_STATUS.INACTIVE);
    setIsRecordingAudio(false);
    setIsRecordingVideo(false);
    addStatusLog("Returned to daily mode", "info");
  }, [addStatusLog]);

  const triggerSOS = useCallback(() => {
    setSosStatus(SOS_STATUS.TRIGGERED);
    setSosTriggeredAt(new Date());
    addStatusLog("🚨 SOS TRIGGERED", "error");
  }, [addStatusLog]);

  const updateProfile = useCallback((profile) => {
    setEmergencyProfile((prev) => ({ ...prev, ...profile }));
    addStatusLog("Emergency profile updated", "success");
  }, [addStatusLog]);

  const updatePermission = useCallback((permission, status) => {
    setPermissions((prev) => ({ ...prev, [permission]: status }));
  }, []);

  const value = useMemo(
    () => ({
      // Context navigation
      currentContext,
      setCurrentContext,
      appMode,
      setAppMode,
      emergencyActive,
      setEmergencyActive,
      
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
      triggerSOS,
      
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
      
      // Voice commands
      voiceCommandActive,
      setVoiceCommandActive,
      
      // Mode switching
      enterEmergencyMode,
      enterDailyMode,
    }),
    [
      currentContext,
      appMode,
      emergencyActive,
      location,
      locationWatchId,
      sosStatus,
      sosTriggeredAt,
      sosMetadata,
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
      updateProfile,
      updatePermission,
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
