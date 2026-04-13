import axios from "axios";

function getAPIBaseURL() {
  const configured = (import.meta.env.VITE_API_BASE_URL || "").trim();
  if (configured) {
    return configured;
  }

  // In development, prefer Vite proxy to avoid local TLS/certificate friction.
  if (import.meta.env.DEV) {
    return "/api/v1";
  }

  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}/api/v1`;
  }

  return "https://localhost:5000/api/v1";
}

export const apiClient = axios.create({
  baseURL: getAPIBaseURL(),
  timeout: 20000,
});

// Handle SSL certificate errors for self-signed certs in dev
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log API errors with details
    if (error.response) {
      console.error("API Error:", error.response.status, error.response.data);
    } else if (
      error.code === "ERR_TLS_CERT_ALTNAME_INVALID" ||
      error.code === "CERT_HAS_EXPIRED"
    ) {
      console.warn("SSL Certificate issue (development):", error.message);
    } else if (error.code === "ERR_NETWORK") {
      console.error(
        "API network error. Verify backend is running and reachable at:",
        apiClient.defaults.baseURL
      );
    } else if (error.message) {
      console.error("API Request Error:", error.message);
    }
    return Promise.reject(error);
  }
);

// Add request interceptor to log outgoing requests
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Call: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);
