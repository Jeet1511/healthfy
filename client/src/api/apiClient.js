import axios from "axios";

// Auto-detect API URL based on current hostname
const getAPIBaseURL = () => {
  // Use environment variable if set
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // Get current hostname from browser
  const hostname = typeof window !== "undefined" ? window.location.hostname : "localhost";
  
  // Always use HTTPS for API calls (backend is always HTTPS)
  // Use same hostname as frontend for network requests
  if (hostname !== "localhost" && hostname !== "127.0.0.1") {
    // Running on network IP - use HTTPS with detected IP
    return `https://${hostname}:5000/api/v1`;
  }

  // Default to localhost with HTTPS for local development
  return "https://localhost:5000/api/v1";
};

export const apiClient = axios.create({
  baseURL: getAPIBaseURL(),
  timeout: 20000,
});

// Handle SSL certificate errors for self-signed certs in dev
apiClient.interceptors.response.use(
  response => response,
  error => {
    // Log API errors with details
    if (error.response) {
      console.error("API Error:", error.response.status, error.response.data);
    } else if (error.code === "ERR_TLS_CERT_ALTNAME_INVALID" || error.code === "CERT_HAS_EXPIRED") {
      console.warn("SSL Certificate issue (development):", error.message);
    } else if (error.message) {
      console.error("API Request Error:", error.message);
    }
    return Promise.reject(error);
  }
);

// Add request interceptor to log outgoing requests
apiClient.interceptors.request.use(
  config => {
    console.log(`🔄 API Call: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  error => Promise.reject(error)
);
