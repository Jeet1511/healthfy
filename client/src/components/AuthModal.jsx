import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export default function AuthModal({ open, onClose }) {
  const { login, signup, continueAsGuest } = useAuth();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (mode === "login") {
        await login({ email, password });
      } else {
        await signup({ email, password });
      }
      onClose();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const guest = async () => {
    continueAsGuest();
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
        >
          <motion.article
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="card auth-modal"
          >
            <h3 className="title">{mode === "login" ? "Login" : "Signup"}</h3>
            <p className="subtle">Access profile history or continue in guest mode.</p>

            <form onSubmit={submit} className="admin-form">
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email"
              />
              <input
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
              />
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? "Please wait..." : mode === "login" ? "Login" : "Signup"}
              </button>
            </form>

            <div className="auth-row" style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "15px" }}>
              <button type="button" className="btn" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
                {mode === "login" ? "Need an account? Signup" : "Already have account? Login"}
              </button>
              <button type="button" className="btn" onClick={guest}>Continue as Guest</button>
              <button type="button" className="btn" onClick={onClose} style={{ background: "transparent", color: "#8a96bc", border: "1px solid #2c3a66" }}>Close</button>
            </div>

            {error ? <p className="sos-error">{error}</p> : null}
          </motion.article>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
