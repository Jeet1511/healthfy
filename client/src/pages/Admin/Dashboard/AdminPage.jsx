import { useEffect, useMemo, useState } from "react";
import { apiClient } from "@/api/apiClient";

const MODEL_OPTIONS = ["gpt-4o-mini", "gpt-4.1-mini", "claude-3-5-sonnet", "llama-3.1-70b-versatile"];

function tokenConfig(token) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

export default function AdminPage() {
  const [token, setToken] = useState(() => localStorage.getItem("lap_admin_token") || "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState(MODEL_OPTIONS[0]);
  const [temperature, setTemperature] = useState(0.7);
  const [providers, setProviders] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const isAuthed = useMemo(() => Boolean(token), [token]);

  async function fetchProviders(authToken = token) {
    if (!authToken) return;
    const response = await apiClient.get("/admin/providers", tokenConfig(authToken));
    setProviders(response.data.data || []);
  }

  useEffect(() => {
    if (token) { fetchProviders(token).catch(() => setError("Unable to load providers.")); }
  }, [token]);

  async function handleLogin(event) {
    event.preventDefault();
    setLoading(true); setError(""); setMessage("");
    try {
      const response = await apiClient.post("/auth/login", { email, password });
      if (response.data?.data?.role !== "admin") { setError("Admin access required."); return; }
      const nextToken = response.data.token;
      setToken(nextToken);
      localStorage.setItem("lap_admin_token", nextToken);
      setMessage("Admin authenticated.");
      await fetchProviders(nextToken);
    } catch (requestError) { setError(requestError.response?.data?.message || "Login failed."); }
    finally { setLoading(false); }
  }

  async function handleCreateProvider(event) {
    event.preventDefault();
    setLoading(true); setError(""); setMessage("");
    try {
      await apiClient.post("/admin/provider", { name, apiKey, model, temperature: Number(temperature), isEnabled: true }, tokenConfig(token));
      setApiKey(""); setName(""); setTemperature(0.7);
      setMessage("Provider created.");
      await fetchProviders();
    } catch (requestError) { setError(requestError.response?.data?.message || "Unable to create provider."); }
    finally { setLoading(false); }
  }

  async function activateProvider(providerId) {
    setLoading(true); setError(""); setMessage("");
    try { await apiClient.post("/admin/activate", { providerId }, tokenConfig(token)); setMessage("Provider activated."); await fetchProviders(); }
    catch (requestError) { setError(requestError.response?.data?.message || "Unable to activate provider."); }
    finally { setLoading(false); }
  }

  async function toggleProvider(providerId, isEnabled) {
    setLoading(true); setError(""); setMessage("");
    try { await apiClient.post("/admin/toggle-enabled", { providerId, isEnabled }, tokenConfig(token)); setMessage(`Provider ${isEnabled ? "enabled" : "disabled"}.`); await fetchProviders(); }
    catch (requestError) { setError(requestError.response?.data?.message || "Unable to update provider."); }
    finally { setLoading(false); }
  }

  function handleLogout() { setToken(""); setProviders([]); localStorage.removeItem("lap_admin_token"); setMessage("Logged out."); }

  return (
    <section className="grid single-column">
      <article className="card">
        <h2 className="title">Admin Dashboard</h2>
        <p className="subtle">Manage AI providers with secure key handling and activation controls.</p>
      </article>

      {!isAuthed ? (
        <article className="card">
          <h3 className="title">Admin Login</h3>
          <form onSubmit={handleLogin} className="admin-form">
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Admin email" required />
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" required />
            <button type="submit" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</button>
          </form>
        </article>
      ) : (
        <>
          <article className="card">
            <div className="admin-header-row">
              <h3 className="title">Add Provider</h3>
              <button type="button" className="admin-logout-btn" onClick={handleLogout}>Logout</button>
            </div>
            <form onSubmit={handleCreateProvider} className="admin-form">
              <input value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder="Provider name" required />
              <select value={model} onChange={(e) => setModel(e.target.value)}>{MODEL_OPTIONS.map((item) => (<option key={item} value={item}>{item}</option>))}</select>
              <input value={temperature} onChange={(e) => setTemperature(e.target.value)} type="number" min="0" max="2" step="0.1" required />
              <input value={apiKey} onChange={(e) => setApiKey(e.target.value)} type="password" placeholder="Provider API key" required />
              <button type="submit" disabled={loading}>{loading ? "Saving..." : "Create Provider"}</button>
            </form>
          </article>
          <article className="card">
            <h3 className="title">Providers</h3>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>Name</th><th>Model</th><th>Key</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {providers.map((provider) => (
                    <tr key={provider.id}>
                      <td>{provider.name}</td><td>{provider.model}</td><td>{provider.maskedApiKey}</td>
                      <td>
                        <span className={provider.isActive ? "type-chip tone-safe" : "type-chip tone-warning"}>{provider.isActive ? "Active" : "Inactive"}</span>
                        <span className={provider.isEnabled ? "type-chip tone-safe" : "type-chip tone-danger"}>{provider.isEnabled ? "Enabled" : "Disabled"}</span>
                      </td>
                      <td className="admin-actions">
                        <button type="button" onClick={() => activateProvider(provider.id)} disabled={loading || !provider.isEnabled}>Activate</button>
                        <button type="button" onClick={() => toggleProvider(provider.id, !provider.isEnabled)} disabled={loading}>{provider.isEnabled ? "Disable" : "Enable"}</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </>
      )}

      {message ? <article className="alert-banner">{message}</article> : null}
      {error ? <article className="alert-banner">{error}</article> : null}
    </section>
  );
}
