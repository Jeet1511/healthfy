import { createContext, useContext, useMemo, useState } from "react";

const EmergencyContext = createContext(null);

export function EmergencyProvider({ children }) {
  const [currentContext, setCurrentContext] = useState("daily");
  const [appMode, setAppMode] = useState("daily");
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [location, setLocation] = useState(null);

  const enterEmergencyMode = () => {
    setEmergencyActive(true);
    setAppMode("emergency");
    setCurrentContext("emergency");
  };

  const enterDailyMode = () => {
    setEmergencyActive(false);
    setAppMode("daily");
    setCurrentContext("daily");
  };

  const value = useMemo(
    () => ({
      currentContext,
      setCurrentContext,
      appMode,
      setAppMode,
      emergencyActive,
      setEmergencyActive,
      location,
      setLocation,
      enterEmergencyMode,
      enterDailyMode,
    }),
    [currentContext, appMode, emergencyActive, location]
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
