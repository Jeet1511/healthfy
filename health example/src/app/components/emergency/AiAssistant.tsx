import { motion } from "motion/react";
import { Bot, Send, ShieldAlert, Sparkles } from "lucide-react";
import { useState } from "react";

const messages = [
  { id: 1, type: "system", text: "AI Triage System is active. How can I help you today?" },
  { id: 2, type: "user", text: "I'm having sudden sharp chest pain." },
  { id: 3, type: "ai", text: "I'm analyzing your symptoms. This could be a severe emergency.", alert: true },
];

export function AiAssistant() {
  const [inputValue, setInputValue] = useState("");

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-white to-blue-50/30 rounded-2xl overflow-hidden shadow-inner border border-slate-100 flex-1">
      {/* Header */}
      <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between shadow-sm relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center relative">
            <Bot className="w-5 h-5 text-blue-600" />
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 leading-none">LifeLine AI</h3>
            <p className="text-xs text-slate-500 mt-1">Medical Assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-lg border border-green-100">
          <Sparkles className="w-3 h-3" /> Online
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 flex flex-col justify-end min-h-[250px]">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] rounded-2xl p-3 text-sm font-medium leading-relaxed ${
              msg.type === 'user' 
                ? 'bg-blue-600 text-white rounded-br-sm shadow-md' 
                : msg.type === 'system'
                  ? 'bg-slate-100 text-slate-600 rounded-bl-sm'
                  : 'bg-white text-slate-800 rounded-bl-sm border border-slate-100 shadow-sm'
            }`}>
              {msg.alert && (
                <div className="flex items-center gap-1.5 text-red-600 mb-2 pb-2 border-b border-red-100 font-bold text-xs">
                  <ShieldAlert className="w-3.5 h-3.5" /> High Urgency Detected
                </div>
              )}
              {msg.text}
              
              {msg.alert && (
                <div className="mt-3 flex gap-2">
                  <button className="flex-1 bg-red-500 text-white py-1.5 rounded-lg text-xs font-bold shadow-sm hover:bg-red-600 transition-colors">
                    Call 911
                  </button>
                  <button className="flex-1 bg-slate-100 text-slate-700 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors">
                    Find ER
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ))}
        <div className="flex gap-2">
           <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
            className="w-1.5 h-1.5 bg-blue-400 rounded-full"
           />
           <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
            className="w-1.5 h-1.5 bg-blue-400 rounded-full"
           />
           <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
            className="w-1.5 h-1.5 bg-blue-400 rounded-full"
           />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white border-t border-slate-100">
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Describe your symptoms..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-900 placeholder:text-slate-400"
          />
          <button className="absolute right-2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
