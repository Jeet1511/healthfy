import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import AppShell from "./components/AppShell";
import HomePage from "./pages/HomePage";
import MapPage from "./pages/MapPage";
import SafetyPage from "./pages/SafetyPage";
import DisasterPage from "./pages/DisasterPage";
import AdminPage from "./pages/AdminPage";
import EmergencyPage from "./pages/EmergencyPage";
import ProfilePage from "./pages/ProfilePage";
import { useAuth } from "./context/AuthContext";

function AdminOnly({ children }) {
  const { session } = useAuth();
  if (session.user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }
  return children;
}

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
