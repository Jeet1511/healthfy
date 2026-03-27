import { motion } from "motion/react";
import { Bot, ArrowRight, Sparkles, Activity, MessageSquare } from "lucide-react";
import { Link } from "react-router";
import { ImageWithFallback } from "../figma/ImageWithFallback";

export function AiAssistantSection() {
  return (
    <section className="py-24 relative z-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 rounded-[3rem] p-8 sm:p-12 lg:p-16 relative shadow-[0_30px_60px_-15px_rgba(30,58,138,0.5)] flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          {/* Background Effects */}
          <div className="absolute inset-0 overflow-hidden rounded-[3rem]">
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
              className="absolute -top-[50%] -right-[20%] w-[120%] h-[150%] bg-[radial-gradient(circle,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:30px_30px] opacity-40 mix-blend-overlay"
            />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px]" />
          </div>

          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:w-1/2 relative z-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-blue-200 text-sm font-bold mb-8">
              <Sparkles className="w-4 h-4 text-blue-400" />
              LifeLine AI Assistant
            </div>
            
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-6 leading-tight">
              Instant medical guidance at your fingertips.
            </h2>
            
            <p className="text-xl text-blue-100/80 mb-10 font-medium leading-relaxed max-w-lg">
              Not sure if it's an emergency? Describe your symptoms and our AI will triage your condition, suggest immediate actions, and connect you to the right specialist.
            </p>

            <Link to="/emergency">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-3 px-8 py-4 bg-white text-blue-900 rounded-2xl font-bold shadow-[0_10px_30px_rgba(255,255,255,0.2)] hover:shadow-[0_15px_40px_rgba(255,255,255,0.3)] transition-all group"
              >
                Start Free Consultation <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>

            <div className="mt-10 flex items-center gap-6 text-blue-200 text-sm font-semibold">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-400" /> Responses in &lt;3s
              </div>
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-blue-400" /> Clinically Trained
              </div>
            </div>
          </motion.div>

          {/* Floating Chat Interface Mockup */}
          <motion.div 
            initial={{ opacity: 0, y: 30, rotateY: 10 }}
            whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -5, rotateY: -5 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="lg:w-1/2 relative z-10 transform-gpu perspective-[1000px] w-full max-w-md"
          >
            <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] p-6 shadow-2xl overflow-hidden">
              <div className="flex items-center gap-4 border-b border-white/10 pb-4 mb-6">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-inner relative">
                  <Bot className="w-6 h-6 text-white" />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-transparent rounded-full shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg leading-none">LifeLine Assistant</h3>
                  <p className="text-blue-200 text-sm font-medium">Online & Ready</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* User Message */}
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="flex justify-end"
                >
                  <div className="bg-blue-600 text-white px-5 py-3 rounded-2xl rounded-tr-sm max-w-[85%] shadow-md">
                    <p className="text-sm font-medium">My father is experiencing sudden chest tightness and shortness of breath.</p>
                  </div>
                </motion.div>

                {/* Loading Indicator */}
                <motion.div 
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0 }}
                  transition={{ delay: 1.5, duration: 0.2 }}
                  className="flex justify-start absolute"
                >
                  <div className="bg-white/10 text-white px-5 py-4 rounded-2xl rounded-tl-sm flex gap-1.5">
                    <span className="w-2 h-2 bg-blue-300 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-blue-300 rounded-full animate-bounce delay-75" />
                    <span className="w-2 h-2 bg-blue-300 rounded-full animate-bounce delay-150" />
                  </div>
                </motion.div>

                {/* AI Response */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.7, type: "spring" }}
                  className="flex justify-start pt-4"
                >
                  <div className="bg-white/90 backdrop-blur-md text-slate-800 px-5 py-4 rounded-2xl rounded-tl-sm max-w-[90%] shadow-lg border border-white/50">
                    <div className="flex items-center gap-2 text-red-600 font-bold mb-2 text-sm bg-red-50 w-fit px-2 py-1 rounded-lg">
                      <Activity className="w-4 h-4" /> High Priority
                    </div>
                    <p className="text-sm font-medium mb-3">This could be a cardiac event. Please do the following immediately:</p>
                    <ul className="text-sm space-y-2 mb-3 font-semibold text-slate-600">
                      <li className="flex gap-2"><span className="text-blue-500">1.</span> Have him sit down and rest.</li>
                      <li className="flex gap-2"><span className="text-blue-500">2.</span> Call local emergency (911) or tap below to dispatch nearest ambulance.</li>
                    </ul>
                    <button className="w-full bg-red-500 text-white py-2 rounded-xl text-sm font-bold shadow-md hover:bg-red-600 transition-colors">
                      Dispatch Ambulance
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>
            
            {/* Decorative Floating Icon */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -right-6 bg-white p-4 rounded-2xl shadow-xl border border-white/50 backdrop-blur-md"
            >
              <MessageSquare className="w-8 h-8 text-blue-500" />
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
