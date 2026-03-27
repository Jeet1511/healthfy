import { createContext, useContext, useMemo, useState } from "react";

const EmergencyContext = createContext(null);

export function EmergencyProvider({ children }) {
  const [currentContext, setCurrentContext] = useState("safety");
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [location, setLocation] = useState(null);

  const value = useMemo(
    () => ({
      currentContext,
      setCurrentContext,
      emergencyActive,
      setEmergencyActive,
      location,
      setLocation,
    }),
    [currentContext, emergencyActive, location]
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
