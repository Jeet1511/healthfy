import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useOutletContext } from "react-router-dom";
import { apiClient } from "@/api/apiClient";

export default function SystemPage() {
  const { token, tokenConfig } = useOutletContext();
  const [health, setHealth] = useState({ status: "error" });
  const [stats, setStats] = useState({ dbStatus: "unknown", totalUsers: 0, totalAdmins: 0 });
  const [verifying, setVerifying] = useState(false);
  const [verifiedAt, setVerifiedAt] = useState("");
  const [verifyResults, setVerifyResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function checkStep(name, request, validator) {
    try {
      const response = await request();
      const isOk = validator ? validator(response) : true;

      if (!isOk) {
        return {
          name,
          ok: false,
          detail: "Unexpected response shape or value.",
        };
      }

      return {
        name,
        ok: true,
        detail: "Working",
      };
    } catch (requestError) {
      return {
        name,
        ok: false,
        detail: requestError.response?.data?.message || requestError.message || "Request failed",
      };
    }
  }

  async function runVerifier() {
    setVerifying(true);

    const checks = await Promise.all([
      checkStep("Public Health API", () => apiClient.get("/health"), (res) => res?.data?.status === "success"),
      checkStep("Admin Token Access", () => apiClient.get("/auth/me", tokenConfig(token)), (res) => res?.data?.data?.role === "admin"),
      checkStep("Admin Stats Endpoint", () => apiClient.get("/admin/stats", tokenConfig(token)), (res) => typeof res?.data?.data?.totalUsers === "number"),
      checkStep("Admin Users Endpoint", () => apiClient.get("/admin/users", tokenConfig(token)), (res) => Array.isArray(res?.data?.data)),
      checkStep("Admin Providers Endpoint", () => apiClient.get("/admin/providers", tokenConfig(token)), (res) => Array.isArray(res?.data?.data)),
    ]);

    setVerifyResults(checks);
    setVerifiedAt(new Date().toLocaleString());
    setVerifying(false);
  }

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [h, r] = await Promise.all([
          apiClient.get("/health").catch(() => ({ data: { status: "error" } })),
          apiClient.get("/admin/stats", tokenConfig(token)),
        ]);

        if (!active) return;
        setHealth(h.data || { status: "error" });
        setStats(r.data?.data || {});
      } catch (err) {
        if (!active) return;
        setError(err.response?.data?.message || "Failed to load diagnostics.");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [token]);

  useEffect(() => {
    if (!loading && token) {
      runVerifier();
    }
  }, [loading, token]);

  if (loading) {
    return (
      <div className="admin-loading-state">
        <div className="admin-loading-spinner" />
        <p>Scanning infrastructure health...</p>
      </div>
    );
  }

  const envVars = [
    { key: "NODE_ENV", val: "prod***" },
    { key: "PORT", val: "5***" },
    { key: "MONGO_URI", val: "mongodb+srv://***:***@cluster***/omina" },
    { key: "CLIENT_URL", val: "https://***" },
    { key: "JWT_SECRET", val: "••••••••" },
    { key: "JWT_EXPIRES_IN", val: "*d" },
    { key: "ENCRYPTION_SECRET", val: "••••••••" },
  ];

  const apiRoutes = [
    { method: "GET", path: "/api/health", auth: "Public" },
    { method: "POST", path: "/api/auth/login", auth: "Public" },
    { method: "GET", path: "/api/auth/me", auth: "JWT" },
    { method: "GET", path: "/api/admin", auth: "Admin JWT" },
    { method: "GET", path: "/api/admin/stats", auth: "Admin JWT" },
    { method: "GET", path: "/api/admin/users", auth: "Admin JWT" },
    { method: "GET", path: "/api/admin/providers", auth: "Admin JWT" },
    { method: "POST", path: "/api/admin/provider", auth: "Admin JWT" },
    { method: "POST", path: "/api/admin/activate", auth: "Admin JWT" },
    { method: "POST", path: "/api/admin/toggle-enabled", auth: "Admin JWT" },
  ];

  return (
    <motion.section
      className="admin-page-grid"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
    >
      <div className="admin-page-header">
        <h2 className="admin-page-title">System Diagnostics</h2>
        <p>Track service health, infrastructure state, and operational endpoint exposure.</p>
      </div>

      {error && <div className="admin-alert admin-alert-error">{error}</div>}

      <div className="admin-stats-row">
        <article className="admin-stat-card">
          <p className="label">Server</p>
          <p className={`value admin-status-text ${health?.status === "success" ? "is-online" : "is-offline"}`}>
            {health?.status === "error" ? "Offline" : "Online"}
          </p>
        </article>

        <article className="admin-stat-card">
          <p className="label">Database</p>
          <p className={`value admin-status-text ${stats.dbStatus === "connected" ? "is-online" : "is-offline"}`}>
            {stats.dbStatus || "unknown"}
          </p>
        </article>

        <article className="admin-stat-card">
          <p className="label">Admin Accounts</p>
          <p className="value">{stats.totalAdmins || 0}</p>
        </article>

        <article className="admin-stat-card">
          <p className="label">User Accounts</p>
          <p className="value">{stats.totalUsers || 0}</p>
        </article>
      </div>

      <div className="admin-form-card">
        <div className="admin-verifier-head">
          <h3>System Verifier</h3>
          <button className="admin-btn admin-btn-primary" onClick={runVerifier} disabled={verifying}>
            {verifying ? "Running..." : "Run Verifier"}
          </button>
        </div>

        <p className="admin-field-note">
          Verifies critical APIs and admin authorization. Failed checks show exactly what is not working.
        </p>

        <ul className="admin-verifier-list">
          {verifyResults.map((result) => (
            <li key={result.name} className="admin-verifier-item">
              <div>
                <p className="admin-verifier-name">{result.name}</p>
                <p className={`admin-verifier-detail ${result.ok ? "is-pass" : "is-fail"}`}>
                  {result.ok ? "OK" : "Failed"}: {result.detail}
                </p>
              </div>
              <span className={`badge ${result.ok ? "badge-green" : "badge-red"}`}>
                {result.ok ? "PASS" : "FAIL"}
              </span>
            </li>
          ))}
          {!verifyResults.length && (
            <li className="admin-empty-row">No verification has been run yet.</li>
          )}
        </ul>

        {verifiedAt && <p className="admin-field-note">Last check: {verifiedAt}</p>}
      </div>

      <motion.div className="admin-split-grid" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.22 }}>
        <div className="admin-form-card">
          <h3>Masked Environment Variables</h3>
          <ul className="admin-env-list">
            {envVars.map((e) => (
              <li key={e.key}>
                <span className="env-key">{e.key}</span>
                <span className="env-val">{e.val}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="admin-form-card">
          <h3>Active API Routes</h3>
          <ul className="admin-env-list">
            {apiRoutes.map((route) => (
              <li key={route.path}>
                <span className="env-key">{route.method} {route.path}</span>
                <span className="env-val">{route.auth}</span>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </motion.section>
  );
}
