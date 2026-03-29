import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useOutletContext } from "react-router-dom";
import { apiClient } from "@/api/apiClient";

export default function AIModelsPage() {
  const { token, tokenConfig } = useOutletContext();
  const [providers, setProviders] = useState([]);
  const [name, setName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("");
  const [temperature, setTemperature] = useState(0.7);
  const [toast, setToast] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);

  function pushToast(type, message) {
    setToast({ type, message });
    window.clearTimeout(window.__omina_admin_toast_timer__);
    window.__omina_admin_toast_timer__ = window.setTimeout(() => {
      setToast({ type: "", message: "" });
    }, 2800);
  }

  async function fetchProviders() {
    setTableLoading(true);
    try {
      const r = await apiClient.get("/admin/providers", tokenConfig(token));
      setProviders(r.data.data || []);
    } catch {
      pushToast("error", "Failed to load providers.");
    } finally {
      setTableLoading(false);
    }
  }

  useEffect(() => {
    fetchProviders();
  }, [token]);

  async function handleCreate(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.post(
        "/admin/provider",
        { name, apiKey, model, temperature: Number(temperature), isEnabled: true },
        tokenConfig(token)
      );

      setName("");
      setApiKey("");
      setModel("");
      setTemperature(0.7);
      pushToast("success", "Provider created successfully.");
      await fetchProviders();
    } catch (e) {
      pushToast("error", e.response?.data?.message || "Failed to create provider.");
    } finally {
      setLoading(false);
    }
  }

  async function activate(id) {
    try {
      await apiClient.post("/admin/activate", { providerId: id }, tokenConfig(token));
      pushToast("success", "Provider activated.");
      await fetchProviders();
    } catch (e) {
      pushToast("error", e.response?.data?.message || "Failed to activate provider.");
    }
  }

  async function toggle(id, isEnabled) {
    try {
      await apiClient.post("/admin/toggle-enabled", { providerId: id, isEnabled }, tokenConfig(token));
      pushToast("success", `Provider ${isEnabled ? "enabled" : "disabled"}.`);
      await fetchProviders();
    } catch (e) {
      pushToast("error", e.response?.data?.message || "Failed to update provider state.");
    }
  }

  async function remove(id) {
    try {
      await apiClient.delete(`/admin/provider/${id}`, tokenConfig(token));
      pushToast("success", "Provider removed.");
      await fetchProviders();
    } catch (e) {
      pushToast("error", e.response?.data?.message || "Failed to remove provider.");
    }
  }

  const activeProviders = providers.filter((provider) => provider.isActive);
  const inactiveProviders = providers.filter((provider) => !provider.isActive);

  return (
    <motion.section
      className="admin-page-grid"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
    >
      <div className="admin-page-header">
        <h2 className="admin-page-title">AI Model Control</h2>
        <p>Configure provider credentials, switch active models, and enforce enablement policy.</p>
      </div>

      {toast.message && (
        <div className={`admin-alert ${toast.type === "error" ? "admin-alert-error" : "admin-alert-success"}`}>
          {toast.message}
        </div>
      )}

      <motion.div className="admin-form-card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.2 }}>
        <h3>Add Provider</h3>
        <form onSubmit={handleCreate}>
          <div className="admin-form-grid">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="AI name" required />
            <input value={apiKey} onChange={(e) => setApiKey(e.target.value)} type="password" placeholder="API key" required />
            <input value={model} onChange={(e) => setModel(e.target.value)} placeholder="Model ID" required />
            <input
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              type="number"
              min="0"
              max="2"
              step="0.1"
              placeholder="Temperature Control (0-2)"
              required
            />
          </div>
          <p className="admin-field-note">
            Model ID is the exact provider model identifier. Temperature Control adjusts response randomness: lower values are more consistent, higher values are more creative.
          </p>

          <button className="admin-btn admin-btn-primary" type="submit" disabled={loading} style={{ marginTop: "1rem" }}>
            {loading ? "Creating..." : "Create Provider"}
          </button>
        </form>
      </motion.div>

      {tableLoading ? (
        <div className="admin-loading-state">
          <div className="admin-loading-spinner" />
          <p>Loading provider matrix...</p>
        </div>
      ) : (
        <motion.div className="admin-split-grid" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.22 }}>
          <div className="admin-table-container admin-scroll-table">
            <div className="admin-table-header">
              <h3>Active Providers</h3>
            </div>

            <table className="admin-tbl">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Model</th>
                  <th>Key</th>
                  <th>Temp</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {activeProviders.length ? (
                  activeProviders.map((p) => (
                    <tr key={p.id}>
                      <td>{p.name}</td>
                      <td>{p.model}</td>
                      <td>{p.maskedApiKey}</td>
                      <td>{p.temperature}</td>
                      <td>
                        <span className="badge badge-green">Active</span>{" "}
                        <span className={`badge ${p.isEnabled ? "badge-blue" : "badge-red"}`}>
                          {p.isEnabled ? "Enabled" : "Disabled"}
                        </span>
                      </td>
                      <td>
                        <div className="admin-actions-cell">
                          <button className="admin-btn admin-btn-ghost" onClick={() => toggle(p.id, !p.isEnabled)}>
                            {p.isEnabled ? "Disable" : "Enable"}
                          </button>
                          <button className="admin-btn admin-btn-danger" onClick={() => remove(p.id)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="admin-empty-row">No active providers.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="admin-table-container admin-scroll-table">
            <div className="admin-table-header">
              <h3>Inactive Providers</h3>
            </div>

            <table className="admin-tbl">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Model</th>
                  <th>Key</th>
                  <th>Temp</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {inactiveProviders.length ? (
                  inactiveProviders.map((p) => (
                    <tr key={p.id}>
                      <td>{p.name}</td>
                      <td>{p.model}</td>
                      <td>{p.maskedApiKey}</td>
                      <td>{p.temperature}</td>
                      <td>
                        <span className="badge badge-yellow">Inactive</span>{" "}
                        <span className={`badge ${p.isEnabled ? "badge-blue" : "badge-red"}`}>
                          {p.isEnabled ? "Enabled" : "Disabled"}
                        </span>
                      </td>
                      <td>
                        <div className="admin-actions-cell">
                          <button className="admin-btn admin-btn-success" onClick={() => activate(p.id)} disabled={!p.isEnabled}>
                            Activate
                          </button>
                          <button className="admin-btn admin-btn-ghost" onClick={() => toggle(p.id, !p.isEnabled)}>
                            {p.isEnabled ? "Disable" : "Enable"}
                          </button>
                          <button className="admin-btn admin-btn-danger" onClick={() => remove(p.id)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="admin-empty-row">No inactive providers.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </motion.section>
  );
}
