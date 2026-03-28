import mongoose from "mongoose";
import { User } from "./models/User.js";
import dotenv from "dotenv";

dotenv.config();

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/omina");
    console.log("Connected to MongoDB");

    const email = "admin@omina.com";
    const password = "adminPassword123";

    const existing = await User.findOne({ email });
    if (existing) {
      console.log("Admin user already exists");
      process.exit(0);
    }

    await User.create({
      email,
      password,
      role: "admin",
    });

    console.log("Admin user created successfully!");
    console.log("Email: " + email);
    console.log("Password: " + password);
    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin:", error);
    process.exit(1);
  }
}

seedAdmin();
