import mongoose from "mongoose";

export async function connectMongo(uri) {
  if (!uri) {
    throw new Error("MONGO_URI is missing. Add it to your environment variables.");
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 3000,
  });
  return mongoose.connection;
}
