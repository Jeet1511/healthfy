import cors from "cors";
import express from "express";
import morgan from "morgan";
import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { connectMongo } from "./database/connection.mjs";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";
import apiRoutes from "./routes/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(cors({
  origin: [
    env.clientUrl,
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "https://localhost:5173",
    "https://localhost:5174",
    "https://localhost:3000",
    "http://192.168.29.62:5173",
    "http://192.168.29.62:5174",
    "http://192.168.29.62:3000",
    "https://192.168.29.62:5173",
    "https://192.168.29.62:5174",
    "https://192.168.29.62:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:3000",
    "https://127.0.0.1:5173",
    "https://127.0.0.1:5174",
    "https://127.0.0.1:3000",
    /^https?:\/\/192\.168\..*/,
    /^https?:\/\/127\.0\.0\.1.*/,
    /^https?:\/\/localhost.*/,
  ],
  credentials: true
}));
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Omina API server is running",
    docs: {
      health: "/api/health",
      versionedHealth: "/api/v1/health",
    },
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Omina API is running",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api", apiRoutes);
app.use("/api/v1", apiRoutes);

app.use(notFound);
app.use(errorHandler);

// Self-signed certificate for local HTTPS
const getCertificates = () => {
  const keyPath = path.join(__dirname, "key.pem");
  const certPath = path.join(__dirname, "cert.pem");
  
  if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
    throw new Error("SSL certificates not found. Run: node genCert.mjs");
  }
  
  return {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath)
  };
};

async function start() {
  try {
    await connectMongo(env.mongoUri);
    console.log("MongoDB connected");
  } catch (error) {
    console.warn("MongoDB connection failed. Server will run with limited routes.", error.message);
  }

  const httpsOptions = getCertificates();
  
  https.createServer(httpsOptions, app).listen(env.port, "0.0.0.0", () => {
    console.log(`✅ Omina server running on https://localhost:${env.port}`);
    console.log(`🌐 Local network: https://192.168.29.62:${env.port}`);
  });
}

start().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
