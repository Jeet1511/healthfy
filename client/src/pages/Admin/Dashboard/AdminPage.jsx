import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useOutletContext } from "react-router-dom";
import { apiClient } from "@/api/apiClient";

export default function AdminDashboard() {
  const { token, tokenConfig } = useOutletContext();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAdmins: 0,
    totalRegularUsers: 0,
    dbStatus: "unknown",
    recentUsers: [],
  });
  const [overview, setOverview] = useState({ totalRequests: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [s, o] = await Promise.all([
          apiClient.get("/admin/stats", tokenConfig(token)),
          apiClient.get("/admin", tokenConfig(token)),
        ]);

        if (!active) return;
        setStats(s.data?.data || {});
        setOverview(o.data?.data || {});
      } catch (err) {
        if (!active) return;
        setError(err.response?.data?.message || "Failed to load dashboard metrics.");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [token]);

  if (loading) {
    return (
      <div className="admin-loading-state">
        <div className="admin-loading-spinner" />
        <p>Loading command metrics...</p>
      </div>
    );
  }

  return (
    <motion.section
      className="admin-page-grid"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
    >
      <div className="admin-page-header">
        <h2 className="admin-page-title">Operations Dashboard</h2>
        <p>Real-time overview of platform users, requests, and infrastructure health.</p>
      </div>

      {error && <div className="admin-alert admin-alert-error">{error}</div>}

      <div className="admin-stats-row">
        <motion.article className="admin-stat-card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04, duration: 0.2 }}>
          <p className="label">Total Users</p>
          <p className="value">{stats.totalUsers || 0}</p>
        </motion.article>

        <motion.article className="admin-stat-card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07, duration: 0.2 }}>
          <p className="label">Admins</p>
          <p className="value">{stats.totalAdmins || 0}</p>
        </motion.article>

        <motion.article className="admin-stat-card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.2 }}>
          <p className="label">Requests</p>
          <p className="value">{overview.totalRequests || 0}</p>
        </motion.article>

        <motion.article className="admin-stat-card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.13, duration: 0.2 }}>
          <p className="label">Database</p>
          <p className={`value admin-status-text ${stats.dbStatus === "connected" ? "is-online" : "is-offline"}`}>
            {stats.dbStatus || "unknown"}
          </p>
        </motion.article>
      </div>

      <motion.div
        className="admin-table-container"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.14, duration: 0.22 }}
      >
        <div className="admin-table-header">
          <h3>Recent Users</h3>
        </div>

        <table className="admin-tbl">
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
            </tr>
          </thead>

          <tbody>
            {stats.recentUsers?.length ? (
              stats.recentUsers.map((u) => (
                <tr key={u.id}>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge ${u.role === "admin" ? "badge-blue" : "badge-green"}`}>
                      {u.role === "admin" ? "Admin" : "User"}
                    </span>
                  </td>
                  <td>{new Date(u.createdAt).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="admin-empty-row">No recent users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </motion.div>
    </motion.section>
  );
}
