import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOutletContext } from "react-router-dom";
import { apiClient } from "@/api/apiClient";

export default function UsersPage() {
  const { token, tokenConfig } = useOutletContext();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyDeleteId, setBusyDeleteId] = useState("");
  const [confirmUser, setConfirmUser] = useState(null);
  const [toast, setToast] = useState({ type: "", message: "" });

  function pushToast(type, message) {
    setToast({ type, message });
    window.clearTimeout(window.__omina_admin_toast_timer__);
    window.__omina_admin_toast_timer__ = window.setTimeout(() => {
      setToast({ type: "", message: "" });
    }, 2800);
  }

  async function fetchUsers() {
    try {
      const r = await apiClient.get("/admin/users", tokenConfig(token));
      setUsers(r.data.data || []);
    } catch {
      pushToast("error", "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, [token]);

  async function handleDelete() {
    if (!confirmUser) return;

    setBusyDeleteId(confirmUser.id);
    try {
      await apiClient.delete(`/admin/users/${confirmUser.id}`, tokenConfig(token));
      pushToast("success", `User ${confirmUser.email} deleted.`);
      setConfirmUser(null);
      await fetchUsers();
    } catch (e) {
      pushToast("error", e.response?.data?.message || "Failed to delete user.");
    } finally {
      setBusyDeleteId("");
    }
  }

  if (loading) {
    return (
      <div className="admin-loading-state">
        <div className="admin-loading-spinner" />
        <p>Loading user directory...</p>
      </div>
    );
  }

  const adminCount = users.filter((u) => u.role === "admin").length;
  const userCount = users.length - adminCount;

  return (
    <motion.section
      className="admin-page-grid"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
    >
      <div className="admin-page-header">
        <h2 className="admin-page-title">User Management</h2>
        <p>Monitor account behavior and remove suspicious or inactive users instantly.</p>
      </div>

      {toast.message && (
        <div className={`admin-alert ${toast.type === "error" ? "admin-alert-error" : "admin-alert-success"}`}>
          {toast.message}
        </div>
      )}

      <div className="admin-stats-row">
        <article className="admin-stat-card">
          <p className="label">Total</p>
          <p className="value">{users.length}</p>
        </article>

        <article className="admin-stat-card">
          <p className="label">Admins</p>
          <p className="value">{adminCount}</p>
        </article>

        <article className="admin-stat-card">
          <p className="label">Users</p>
          <p className="value">{userCount}</p>
        </article>
      </div>

      <motion.div
        className="admin-table-container"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.22 }}
      >
        <div className="admin-table-header">
          <h3>All Accounts</h3>
        </div>

        <table className="admin-tbl">
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Activity</th>
              <th>Emergencies</th>
              <th>Searches</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.length ? (
              users.map((u) => (
                <tr key={u.id}>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge ${u.role === "admin" ? "badge-blue" : "badge-green"}`}>
                      {u.role === "admin" ? "Admin" : "User"}
                    </span>
                  </td>
                  <td>{u.activityCount}</td>
                  <td>{u.emergencyCount}</td>
                  <td>{u.searchCount}</td>
                  <td>{new Date(u.createdAt).toLocaleString()}</td>
                  <td>
                    <div className="admin-actions-cell">
                      <button
                        className="admin-btn admin-btn-danger"
                        onClick={() => setConfirmUser({ id: u.id, email: u.email })}
                        disabled={busyDeleteId === u.id}
                      >
                        {busyDeleteId === u.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="admin-empty-row">No users available.</td>
              </tr>
            )}
          </tbody>
        </table>
      </motion.div>

      <AnimatePresence>
      {confirmUser && (
        <motion.div
          className="admin-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <motion.div
            className="admin-modal"
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ duration: 0.2 }}
          >
            <h4>Delete User</h4>
            <p>
              Permanently remove <strong>{confirmUser.email}</strong>? This action cannot be undone.
            </p>
            <div className="admin-modal-actions">
              <button className="admin-btn admin-btn-ghost" onClick={() => setConfirmUser(null)}>
                Cancel
              </button>
              <button
                className="admin-btn admin-btn-danger"
                onClick={handleDelete}
                disabled={busyDeleteId === confirmUser.id}
              >
                {busyDeleteId === confirmUser.id ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </motion.section>
  );
}
