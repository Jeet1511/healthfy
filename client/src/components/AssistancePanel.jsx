import { useState, useRef, useEffect } from "react";
import { useAppContextState } from "../context/EmergencyContext";
import { BrainCircuit } from "lucide-react";
import { apiClient } from "../api/apiClient";
import { detectIntent } from "../utils/intentClassifier";
import "./AssistancePanel.css";

const EMERGENCY_FALLBACK_GUIDANCE = [
  "Move to a populated, well-lit area immediately.",
  "Call local emergency services and share your live location.",
];

const DANGER_STATUSES = new Set(["CRITICAL", "MODERATE"]);
const GREETING_PATTERNS = [
  /^hi+\b/i,
  /^hello\b/i,
  /^hey\b/i,
  /^hii+\b/i,
  /^good\s+(morning|afternoon|evening)\b/i,
  /^yo\b/i,
  /^sup\b/i,
  /^namaste\b/i,
];

function isGreetingMessage(input) {
  const text = String(input || "").trim();
  if (!text) return false;
  return GREETING_PATTERNS.some((pattern) => pattern.test(text));
}

function buildHumanReply({ status, instructions, note, userPrompt }) {
  const normalizedStatus = String(status || "SAFE").toUpperCase();
  const topInstructions = Array.isArray(instructions)
    ? instructions.filter((item) => typeof item === "string" && item.trim()).slice(0, 2)
    : [];

  if (DANGER_STATUSES.has(normalizedStatus)) {
    const opening =
      normalizedStatus === "CRITICAL"
        ? "I’m taking this seriously and I just switched you to Emergency mode."
        : "I noticed possible risk and switched you to Emergency mode so you can react quickly.";

    const steps = topInstructions.length
      ? topInstructions.map((item, idx) => `${idx + 1}. ${item}`).join("\n")
      : `1. ${EMERGENCY_FALLBACK_GUIDANCE[0]}\n2. ${EMERGENCY_FALLBACK_GUIDANCE[1]}`;

    return `${opening}\n\nHere’s what to do right now:\n${steps}${note ? `\n\nNote: ${note}` : ""}`;
  }

  if (isGreetingMessage(userPrompt)) {
    return "Hey 👋 I’m here with you. If you need help, just tell me what’s going on in plain language and I’ll guide you step by step.";
  }

  const safeTip =
    topInstructions[0] ||
    "You seem okay right now. If anything feels unsafe, tell me immediately and I’ll move you into Emergency mode.";
  return `Thanks for sharing that. From what you described, there doesn’t seem to be immediate danger right now.\n\n${safeTip}`;
}

export default function AssistancePanel() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "system",
      content: "Hey, I’m here with you. Tell me what’s happening, and I’ll help you step by step.",
    },
  ]);
  const [inputStr, setInputStr] = useState("");
  const { enterEmergencyMode } = useAppContextState();
  const endRef = useRef(null);

  const [isTyping, setIsTyping] = useState(false);

  const togglePanel = () => setOpen(!open);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputStr.trim()) return;
    const userMsg = { role: "user", content: inputStr };
    setMessages((prev) => [...prev, userMsg]);
    const prompt = inputStr;
    setInputStr("");
    setIsTyping(true);

    try {
      const response = await apiClient.post("/ai/assistant-chat", { input: prompt });
      const data = response.data || {};
      const status = String(data.status || "SAFE").toUpperCase();
      const aiReply = typeof data.reply === "string" ? data.reply.trim() : "";

      if (DANGER_STATUSES.has(status)) {
        enterEmergencyMode();
      }

      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          role: "system",
          content:
            aiReply ||
            buildHumanReply({
              status,
              instructions: data.instructions,
              note: data.note,
              userPrompt: prompt,
            }),
        },
      ]);
    } catch {
      const intent = detectIntent(prompt);
      const isEmergency = intent.mode === "emergency";

      if (isEmergency) {
        enterEmergencyMode();
      }

      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          role: "system",
          content: isEmergency
            ? `I may not be fully online right now, but I still detected danger and switched you to Emergency mode.\n\nHere’s what to do now:\n1. ${EMERGENCY_FALLBACK_GUIDANCE[0]}\n2. ${EMERGENCY_FALLBACK_GUIDANCE[1]}`
            : "I’m having trouble reaching live AI right now, but I’m still here with you. Share a few more details (what happened, where you are, and if anyone is hurt), and I’ll guide you step by step.",
        },
      ]);
    }
  };

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  return (
    <>
      {/* Floating Toggle Button */}
      {!open && (
        <button className="assistance-toggle" onClick={togglePanel}>
           Live Guidance
        </button>
      )}

      {/* The Sliding Panel */}
      <div className={`assistance-panel ${open ? "panel-open" : ""}`}>
        <header className="panel-header">
          <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
             <BrainCircuit size={20} /> Intelligence Assistant
          </h3>
          <button className="close-btn" onClick={togglePanel}>
            &times;
          </button>
        </header>
        
        <div className="panel-body">
          {messages.map((m, idx) => (
            <div key={idx} className={`message-bubble ${m.role}`}>
              <span className="bubble-label">{m.role === "system" ? "OMINA" : "You"}</span>
              <p>{m.content}</p>
            </div>
          ))}
          {isTyping && (
            <div className="message-bubble system" style={{ width: "70%" }}>
              <span className="bubble-label">OMINA</span>
              <div className="skeleton" style={{ height: "1.2rem", width: "100%", marginBottom: "8px", borderRadius: "4px" }} />
              <div className="skeleton" style={{ height: "1.2rem", width: "80%", borderRadius: "4px" }} />
            </div>
          )}
          <div ref={endRef} />
        </div>

        <form className="panel-footer" onSubmit={handleSubmit}>
          <input
            type="text"
            className="panel-input"
            placeholder="Type your situation or question..."
            value={inputStr}
            onChange={(e) => setInputStr(e.target.value)}
          />
          <button type="submit" className="panel-submit">
            Send
          </button>
        </form>
      </div>
    </>
  );
}
