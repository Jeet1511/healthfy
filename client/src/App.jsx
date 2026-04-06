import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AppShell from "./components/AppShell";
import { useEmergencySystemInit } from "@/hooks/useEmergencySystemInit";
import { useServiceWorker, requestPushNotificationPermission } from "@/hooks/useServiceWorker";
import {
  HomePage,
  MapPage,
  SafetyPage,
  DisasterPage,
  EmergencyPage,
  ProfilePage,
} from "./pages/User/General";
import {
  AdminLayout,
  AdminPage,
  UsersPage,
  AIModelsPage,
  SystemPage,
} from "./pages/Admin";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><HomePage /></PageWrapper>} />
        <Route path="/emergency" element={<PageWrapper><EmergencyPage /></PageWrapper>} />
        <Route path="/safety" element={<PageWrapper><SafetyPage /></PageWrapper>} />
        <Route path="/disaster" element={<PageWrapper><DisasterPage /></PageWrapper>} />
        <Route path="/map" element={<PageWrapper><MapPage /></PageWrapper>} />
        <Route path="/profile" element={<PageWrapper><ProfilePage /></PageWrapper>} />
        <Route path="/admin" element={<PageWrapper><AdminLayout /></PageWrapper>}>
          <Route index element={<AdminPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="ai-models" element={<AIModelsPage />} />
          <Route path="system" element={<SystemPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      style={{ width: "100%", height: "100%" }}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  // Initialize emergency system on app startup
  useEmergencySystemInit();

  // Initialize service worker for offline support, caching, and push notifications
  const { isOnline, isUpdateAvailable, updateServiceWorker } = useServiceWorker();

  // Request push notification permission for emergency alerts
  useEffect(() => {
    requestPushNotificationPermission();
  }, []);

  return (
    <AppShell>
      {isUpdateAvailable && (
        <div className="update-banner">
          <span>New version available</span>
          <button onClick={updateServiceWorker}>Update</button>
        </div>
      )}
      <AnimatedRoutes />
    </AppShell>
  );
}
