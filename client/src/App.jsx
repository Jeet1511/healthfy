import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import AppShell from "@/components/AppShell";
import { useAuth } from "@/context/AuthContext";
import { useEmergency } from "@/context/EmergencyContext";

// ── General Mode Pages ──
import { HomePage } from "@/pages/User/General";
import { EmergencyPage } from "@/pages/User/General";
import { SafetyPage } from "@/pages/User/General";
import { DisasterPage } from "@/pages/User/General";
import { MapPage } from "@/pages/User/General";
import { ProfilePage } from "@/pages/User/General";

// ── Emergency Mode Pages ──
import { HQPage } from "@/pages/User/Emergency";
import { AlertPage } from "@/pages/User/Emergency";
import { ShieldPage } from "@/pages/User/Emergency";
import { ThreatPage } from "@/pages/User/Emergency";
import { ScanPage } from "@/pages/User/Emergency";
import { IdPage } from "@/pages/User/Emergency";

// ── Admin Panel ──
import { AdminPage } from "@/pages/Admin";

function AdminOnly({ children }) {
  const { session } = useAuth();
  if (session.user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }
  return children;
}

function AnimatedRoutes() {
  const location = useLocation();
  const { appMode } = useEmergency();
  const isEmergency = appMode === "emergency";

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Home / HQ */}
        <Route path="/" element={<PageWrapper>{isEmergency ? <HQPage /> : <HomePage />}</PageWrapper>} />

        {/* Emergency / ALERT */}
        <Route path="/emergency" element={<PageWrapper>{isEmergency ? <AlertPage /> : <EmergencyPage />}</PageWrapper>} />

        {/* Safety / SHIELD */}
        <Route path="/safety" element={<PageWrapper>{isEmergency ? <ShieldPage /> : <SafetyPage />}</PageWrapper>} />

        {/* Disaster / THREAT */}
        <Route path="/disaster" element={<PageWrapper>{isEmergency ? <ThreatPage /> : <DisasterPage />}</PageWrapper>} />

        {/* Map / SCAN */}
        <Route path="/map" element={<PageWrapper>{isEmergency ? <ScanPage /> : <MapPage />}</PageWrapper>} />

        {/* Profile / ID — same component in both modes */}
        <Route path="/profile" element={<PageWrapper>{isEmergency ? <IdPage /> : <ProfilePage />}</PageWrapper>} />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <AdminOnly>
              <PageWrapper><AdminPage /></PageWrapper>
            </AdminOnly>
          }
        />
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
  return (
    <AppShell>
      <AnimatedRoutes />
    </AppShell>
  );
}
