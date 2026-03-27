import { useState, useRef, useEffect } from "react";
import { useAppContextState } from "../context/EmergencyContext";
import { BrainCircuit } from "lucide-react";
import "./AssistancePanel.css";

export default function AssistancePanel() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "system",
      content: "System Guidance Active. How can I assist you with your current situation?",
    },
  ]);
  const [inputStr, setInputStr] = useState("");
  const { currentContext } = useAppContextState();
  const endRef = useRef(null);

  const [isTyping, setIsTyping] = useState(false);

  const togglePanel = () => setOpen(!open);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputStr.trim()) return;
    const userMsg = { role: "user", content: inputStr };
    setMessages((prev) => [...prev, userMsg]);
    setInputStr("");
    setIsTyping(true);
    
    // Simulate AI thinking and response
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          role: "system",
          content: `Analyzing ${currentContext} situation... Please stand by while I retrieve local mapping data and standard protocols.`,
        },
      ]);
    }, 1500);
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
