import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { apiClient } from "@/api/apiClient";
import "./Admin.css";

function tokenConfig(token) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

export default function AdminLayout() {
  const [token, setToken] = useState(() => localStorage.getItem("lap_admin_token") || "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isAuthed = Boolean(token);
  const sectionTitle = useMemo(() => {
    if (location.pathname.includes("/admin/users")) return "User Control";
    if (location.pathname.includes("/admin/ai-models")) return "AI Model Matrix";
    if (location.pathname.includes("/admin/system")) return "System Diagnostics";
    return "Overview";
  }, [location.pathname]);

  useEffect(() => {
    let active = true;

    async function verifyAdminSession() {
      if (!token) {
        if (active) setCheckingAuth(false);
        return;
      }

      try {
        const r = await apiClient.get("/auth/me", tokenConfig(token));
        if (!active) return;

        if (r.data?.data?.role !== "admin") {
          handleLogout("Admin access is required.");
          return;
        }

        setAdminEmail(r.data?.data?.email || "admin@omina.local");
      } catch {
        if (!active) return;
        handleLogout("Session expired. Please sign in again.");
      } finally {
        if (active) setCheckingAuth(false);
      }
    }

    verifyAdminSession();

    return () => {
      active = false;
    };
  }, [token]);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const r = await apiClient.post("/auth/login", { email, password });
      if (r.data?.data?.role !== "admin") {
        setError("Admin access required.");
        setLoading(false);
        return;
      }

      const t = r.data.token;
      setToken(t);
      setAdminEmail(r.data?.data?.email || "admin@omina.local");
      localStorage.setItem("lap_admin_token", t);
      setCheckingAuth(false);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout(message = "") {
    setToken("");
    setAdminEmail("");
    setPassword("");
    localStorage.removeItem("lap_admin_token");
    setCheckingAuth(false);
    if (message) setError(message);
    navigate("/admin");
  }

  if (checkingAuth) {
    return (
      <div className="admin-auth-wrap">
        <motion.div
          className="admin-auth-card admin-auth-card-loading"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <div className="admin-loading-spinner" />
          <p>Verifying secure admin session...</p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthed) {
    return (
      <div className="admin-auth-wrap">
        <motion.div
          className="admin-auth-card"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
        >
          <div className="admin-auth-kicker">OMINA COMMAND CENTER</div>
          <h2>Admin Access</h2>
          <p>Authenticate to unlock diagnostics, AI controls, and user operations.</p>
          {error && <div className="admin-alert admin-alert-error">{error}</div>}
          <form className="admin-auth-form" onSubmit={handleLogin}>
            <label>
              Email
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="admin@omina.ai"
                required
              />
            </label>

            <label>
              Password
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="••••••••••"
                required
              />
            </label>

            <button className="admin-btn admin-btn-primary admin-auth-submit" type="submit" disabled={loading}>
              {loading ? "Authenticating..." : "Enter Command Center"}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <span className="admin-brand-dot" />
          <div>
            <strong>OMINA</strong>
            <small>Admin Matrix</small>
          </div>
        </div>
        <nav className="admin-sidebar-nav">
          <NavLink to="/admin" end className={({ isActive }) => `admin-nav-item ${isActive ? "active" : ""}`}>
            Dashboard
          </NavLink>
          <NavLink to="/admin/users" className={({ isActive }) => `admin-nav-item ${isActive ? "active" : ""}`}>
            Users
          </NavLink>
          <NavLink to="/admin/ai-models" className={({ isActive }) => `admin-nav-item ${isActive ? "active" : ""}`}>
            AI Models
          </NavLink>
          <NavLink to="/admin/system" className={({ isActive }) => `admin-nav-item ${isActive ? "active" : ""}`}>
            System
          </NavLink>
        </nav>
        <div className="admin-sidebar-footer">
          <p>{adminEmail || "admin@omina.local"}</p>
          <button className="admin-logout-btn" onClick={() => handleLogout()}>Log Out</button>
        </div>
      </aside>

      <motion.div
        className="admin-content-wrap"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        <header className="admin-topbar">
          <div>
            <h1>OMINA Command Center</h1>
            <p>{sectionTitle}</p>
          </div>
          <span className="admin-system-pill">Secure Session</span>
        </header>

        <div className="admin-content">
          <Outlet context={{ token, tokenConfig }} />
        </div>
      </motion.div>
    </div>
  );
}
