import cors from "cors";
import express from "express";
import morgan from "morgan";
import { connectMongo } from "../database/connection.mjs";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";
import apiRoutes from "./routes/index.js";

const app = express();

app.use(cors({ origin: env.clientUrl }));
app.use(express.json());
app.use(morgan("dev"));

app.use("/api", apiRoutes);
app.use("/api/v1", apiRoutes);

app.use(notFound);
app.use(errorHandler);

async function start() {
  try {
    await connectMongo(env.mongoUri);
    console.log("MongoDB connected");
  } catch (error) {
    console.warn("MongoDB connection failed. Server will run with limited routes.", error.message);
  }

  app.listen(env.port, () => {
    console.log(`Omina server running on http://localhost:${env.port}`);
  });
}

start().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
