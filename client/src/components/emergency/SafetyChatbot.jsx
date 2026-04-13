/**
 * AI Safety Chatbot Component
 * Provides real-time safety guidance, first aid advice, emergency procedures
 * Integrates with Claude API (production) or mock responses (development)
 */

import React, { useState, useRef, useEffect } from "react";
import { Send, X, Loader, Zap } from "lucide-react";
import "./SafetyChatbot.css";
import { useEmergency } from "@/context/EmergencyContext";

// Mock safety knowledge base - replace with Claude API in production
const SAFETY_KNOWLEDGE_BASE = {
  "first aid": {
    keywords: ["first aid", "injury", "bleeding", "fracture", "unconscious"],
    responses: [
      "For bleeding: Apply direct pressure with clean cloth for 10-15 minutes. If severe, call emergency services.",
      "For fractures: Immobilize the area and apply ice. Avoid moving the injured limb.",
      "For unconscious person: Check breathing, place in recovery position, call 911.",
    ],
  },
  "active shooter": {
    keywords: ["shooter", "gun", "shooting", "active shooter"],
    responses: [
      "RUN: Evacuate if there's an accessible escape path. Leave belongings behind.",
      "HIDE: If evacuation isn't possible, hide behind large objects and silence your phone.",
      "FIGHT: As a last resort, be aggressive and commit to your actions. Only use improvised weapons.",
      "Call 911 when safe. Provide location and description of shooter.",
    ],
  },
  "natural disaster": {
    keywords: ["earthquake", "tornado", "hurricane", "flood", "disaster"],
    responses: [
      "EARTHQUAKE: Drop, cover, and hold on under a sturdy table. Stay away from windows.",
      "TORNADO: Move to a basement or interior room away from windows.",
      "HURRICANE: Secure loose objects, board windows, and move to a safe room.",
      "FLOOD: Move to higher ground. Never drive through flooded areas.",
    ],
  },
  "panic attack": {
    keywords: ["panic", "anxiety", "hyperventilate", "anxiety attack"],
    responses: [
      "Breathe slowly: Inhale for 4 counts, hold for 4, exhale for 4.",
      "Find a safe space and remind yourself the panic will pass.",
      "Touch something cold to ground yourself.",
      "If symptoms persist, seek medical help immediately.",
    ],
  },
  "poisoning": {
    keywords: ["poison", "toxic", "ingestion", "overdose"],
    responses: [
      "Call Poison Control: 1-800-222-1222 (US)",
      "If unconscious, place in recovery position and call 911.",
      "If ingested recently, don't induce vomiting unless advised by Poison Control.",
      "Have bottle/container information ready when calling.",
    ],
  },
  "choking": {
    keywords: ["choking", "can't breathe", "airway blockage"],
    responses: [
      "If person can cough/speak, encourage coughing.",
      "Heimlich maneuver: Place hands above navel, quick upward thrusts.",
      "For infants: Back blows and chest thrusts.",
      "Call 911 if object doesn't dislodge.",
    ],
  },
  "default": {
    keywords: [],
    responses: [
      "I'm a safety chatbot. Ask me about:\n• First aid\n• Natural disasters\n• Active shooter protocols\n• Panic attacks\n• Poisoning\n• Choking\n• General emergency procedures",
    ],
  },
};

export function SafetyChatbot({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      content: "Welcome to the Safety Chatbot. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const messagesEndRef = useRef(null);
  const { emergencyState } = useEmergency();

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /**
   * Find best matching response from knowledge base
   */
  const findBestResponse = (userInput) => {
    const lowerInput = userInput.toLowerCase();

    // Check each knowledge base entry
    for (const [topic, data] of Object.entries(SAFETY_KNOWLEDGE_BASE)) {
      if (topic === "default") continue;

      for (const keyword of data.keywords) {
        if (lowerInput.includes(keyword)) {
          return data.responses[Math.floor(Math.random() * data.responses.length)];
        }
      }
    }

    // Return default response if no match
    return SAFETY_KNOWLEDGE_BASE.default.responses[0];
  };

  /**
   * Handle user message submission
   */
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      type: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Get bot response
    const botResponse = findBestResponse(input);

    const botMessage = {
      id: messages.length + 2,
      type: "bot",
      content: botResponse,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, botMessage]);
    setIsLoading(false);
  };

  /**
   * Handle voice input
   */
  const handleVoiceInput = async () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Voice input not supported in your browser");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.onstart = () => {
      setIsVoiceActive(true);
    };

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }

      if (event.results[event.results.length - 1].isFinal) {
        setInput(transcript);
        setIsVoiceActive(false);
      }
    };

    recognition.onerror = (event) => {
      console.error("Voice recognition error:", event.error);
      setIsVoiceActive(false);
    };

    recognition.onend = () => {
      setIsVoiceActive(false);
    };

    recognition.start();
  };

  /**
   * Quick action buttons for common emergencies
   */
  const quickActions = [
    { label: "First Aid", topic: "What should I do for first aid?" },
    { label: "Panic Attack", topic: "How do I handle a panic attack?" },
    { label: "Choking", topic: "Someone is choking, what do I do?" },
    { label: "Disaster", topic: "What should I do in a natural disaster?" },
  ];

  if (!isOpen) return null;

  return (
    <div className="safety-chatbot-container">
      <div className="chatbot-header">
        <div className="header-content">
          <Zap size={20} />
          <h3>Safety Assistant</h3>
          {emergencyState.isInEmergencyMode && (
            <span className="emergency-badge">EMERGENCY MODE</span>
          )}
        </div>
        <button className="close-btn" onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      <div className="chatbot-messages">
        {messages.length === 1 && (
          <div className="quick-actions">
            <p>Quick questions:</p>
            {quickActions.map((action) => (
              <button
                key={action.label}
                className="quick-action-btn"
                onClick={() => {
                  setInput(action.topic);
                  setTimeout(() => {
                    handleSendMessage({ preventDefault: () => {} });
                  }, 0);
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className={`message message-${message.type}`}>
            <div className="message-content">
              <p>{message.content}</p>
              <span className="message-time">
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message message-bot">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form className="chatbot-input" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isVoiceActive ? "Listening..." : "Ask for emergency help..."}
          disabled={isLoading || isVoiceActive}
        />

        <button
          type="button"
          className={`voice-btn ${isVoiceActive ? "active" : ""}`}
          onClick={handleVoiceInput}
          disabled={isLoading}
          title="Voice input"
        >
          🎤
        </button>

        <button
          type="submit"
          className="send-btn"
          disabled={!input.trim() || isLoading}
        >
          {isLoading ? (
            <Loader size={18} className="spinner" />
          ) : (
            <Send size={18} />
          )}
        </button>
      </form>
    </div>
  );
}

export default SafetyChatbot;
