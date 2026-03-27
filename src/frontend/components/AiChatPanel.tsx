"use client";

import { FormEvent, useState } from "react";
import { GlassCard } from "@/frontend/ui/GlassCard";
import { PrimaryButton } from "@/frontend/ui/PrimaryButton";
import { EmergencyResponse } from "@/backend/types";

type AiChatPanelProps = {
  onResponse?: (response: EmergencyResponse) => void;
};

export function AiChatPanel({ onResponse }: AiChatPanelProps) {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async (event: FormEvent) => {
    event.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput("");
    setMessages((prev) => [...prev, `You: ${text}`]);
    setLoading(true);

    try {
      const response = await fetch("/api/ai/emergency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: text }),
      });
      const data = (await response.json()) as { result?: EmergencyResponse };
      const result = data.result;
      if (result) {
        setMessages((prev) => [...prev, `AI: ${result.message}`]);
        onResponse?.(result);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard className="p-5">
      <h3 className="text-lg font-bold text-slate-900">AI Assistant</h3>
      <p className="mt-1 text-sm text-slate-500">Describe symptoms and get urgency guidance.</p>

      <div className="mt-4 max-h-72 space-y-2 overflow-y-auto rounded-2xl border border-slate-200 bg-white/70 p-3">
        {messages.length === 0 ? <p className="text-sm text-slate-400">No messages yet.</p> : null}
        {messages.map((message) => (
          <p key={message} className="text-sm text-slate-700">{message}</p>
        ))}
      </div>

      <form onSubmit={send} className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Type your emergency details..."
          className="h-11 flex-1 rounded-2xl border border-slate-200 bg-white/80 px-3 text-sm text-slate-800 outline-none"
        />
        <PrimaryButton type="submit" disabled={loading}>{loading ? "..." : "Send"}</PrimaryButton>
      </form>
    </GlassCard>
  );
}
