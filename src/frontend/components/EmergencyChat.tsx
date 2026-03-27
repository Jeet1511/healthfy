"use client";

import { FormEvent, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EmergencyResponse } from "@/backend/types";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  response?: EmergencyResponse;
};

type EmergencyChatProps = {
  onResponse: (response: EmergencyResponse) => void;
  onAction: (action: string) => void;
};

const urgencyClasses: Record<EmergencyResponse["urgency"], string> = {
  Critical: "urgency-critical",
  Moderate: "urgency-moderate",
  Safe: "urgency-safe",
};

export function EmergencyChat({ onResponse, onAction }: EmergencyChatProps) {
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "seed-assistant",
      role: "assistant",
      content:
        "Describe your situation and I will classify urgency, suggest immediate steps, and route emergency actions.",
    },
  ]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const text = input.trim();
    if (!text) {
      return;
    }

    setInput("");
    const userMessage: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
    };

    setMessages((previous) => [...previous, userMessage]);
    setIsTyping(true);

    try {
      const response = await fetch("/api/ai/emergency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: text }),
      });
      const data = (await response.json()) as { result?: EmergencyResponse };

      const payload = data.result;
      if (!payload) {
        return;
      }

      const assistantMessage: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: payload.message,
        response: payload,
      };

      setMessages((previous) => [...previous, assistantMessage]);
      onResponse(payload);
    } finally {
      setTimeout(() => setIsTyping(false), 550);
    }
  };

  return (
    <section className="panel-shell flex h-[calc(100vh-12.5rem)] min-h-155 flex-col">
      <div className="border-b border-white/10 pb-4">
        <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Primary Action</p>
        <h2 className="mt-1 text-xl font-semibold text-slate-100">Emergency AI Assistant</h2>
      </div>

      <div className="mt-4 flex-1 space-y-3 overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className={message.role === "user" ? "chat-message-user" : "chat-message-assistant"}
            >
              <p className="text-sm leading-relaxed text-slate-100">{message.content}</p>

              {message.response ? (
                <div className="mt-3 space-y-2">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${urgencyClasses[message.response.urgency]}`}>
                    {message.response.urgency === "Critical" ? "⚠️" : "•"} {message.response.urgency}
                  </span>

                  <ul className="space-y-1 text-sm text-slate-200">
                    {message.response.steps.map((step) => (
                      <li key={step}>• {step}</li>
                    ))}
                  </ul>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {message.response.actions.map((action) => (
                      <button
                        key={action}
                        type="button"
                        onClick={() => onAction(action)}
                        className="quick-action-btn"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping ? (
          <div className="chat-message-assistant">
            <p className="typing-dots" aria-label="AI typing">
              <span />
              <span />
              <span />
            </p>
          </div>
        ) : null}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3 border-t border-white/10 pt-4">
        <div className="input-shell">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Describe your situation…"
            className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-400"
          />
          <motion.button whileTap={{ scale: 0.95 }} type="submit" className="primary-btn">
            Analyze
          </motion.button>
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setInput("I have chest pain")}
            className="quick-pill">I have chest pain</button>
          <button type="button" onClick={() => onAction("Need Blood")}
            className="quick-pill">Need Blood</button>
          <button type="button" onClick={() => onAction("Find Hospital")}
            className="quick-pill">Find Hospital</button>
        </div>
      </form>
    </section>
  );
}
