import { AssistanceRequest } from "../models/AssistanceRequest.js";
import mongoose from "mongoose";
import crypto from "node:crypto";

const inMemoryRequests = [];

export async function createAssistanceRequest(payload) {
  if (mongoose.connection.readyState === 1) {
    return AssistanceRequest.create(payload);
  }

  const request = {
    _id: crypto.randomUUID(),
    ...payload,
    status: "Open",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  inMemoryRequests.unshift(request);
  return request;
}

export async function getAssistanceRequests() {
  if (mongoose.connection.readyState === 1) {
    return AssistanceRequest.find().sort({ createdAt: -1 });
  }

  return inMemoryRequests;
}

export async function getRequestCount() {
  if (mongoose.connection.readyState === 1) {
    return AssistanceRequest.countDocuments();
  }

  return inMemoryRequests.length;
}
