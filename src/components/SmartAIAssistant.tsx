'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  RotateCcw,
  Zap,
  ShieldCheck
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function SmartAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Arrey hello! Main AllInOneVouchers ka **Smart AI Saver** hu. ⚡\n\nAaj kahan se shopping ya khana mangwane ka plan hai? (Amazon, Swiggy, Zomato ya Myntra?)\n\nMujhe apna order value batao, main **3X Stacking** laga ke direct sabse sasta bill bana dunga!"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (queryText?: string) => {
    const text = queryText || input;
    if (!text.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: text };
    const newChat = [...messages, userMessage];
    setMessages(newChat);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newChat })
      });

      const data = await res.json();
      if (data.reply) {
        setMessages([...newChat, { role: 'assistant', content: data.reply }]);
      } else {
        setMessages([...newChat, { role: 'assistant', content: "Bhai lagta hai network slow hai. Ek baar wapas likho!" }]);
      }
    } catch {
      setMessages([...newChat, { role: 'assistant', content: "Server connection thoda unstable hai. Ek baar retry karein!" }]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    "🍔 Swiggy ₹1200 order pe kitna bachega?",
    "📦 Amazon ₹2000 cart savings calculation",
    "🔥 Aaj ki hottest loot deals dikhao",
    "💳 3X Stacking kaise kaam karta hai?"
  ];

  // Markdown Formatter: Bold & Bullets highlight helper
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-');
      const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

      return (
        <div 
          key={idx} 
          className={`${isBullet ? 'pl-2 py-0.5 border-l-2 border-[#E51B24]/40 my-0.5' : 'my-1'}`}
          dangerouslySetInnerHTML={{ __html: formattedLine }} 
        />
      );
    });
  };

  return (
    <>
      {/* ======================================================== */}
      {/* 1. MOVABLE 3D ROBO HOLDING VOUCHER (DRAGGABLE ANYWHERE) */}
      {/* ======================================================== */}
      <motion.div
        drag
        dragMomentum={false}
        onDragStart={() => {
          isDraggingRef.current = true;
        }}
        onDragEnd={() => {
          setTimeout(() => {
            isDraggingRef.current = false;
          }, 120);
        }}
        onClick={() => {
          if (!isDraggingRef.current) {
            setIsOpen((prev) => !prev);
          }
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className="fixed bottom-6 right-6 z-50 cursor-grab active:cursor-grabbing select-none"
        title="Drag me anywhere or tap to calculate!"
      >
        <div className="relative flex items-center justify-center">
          
          {/* Ambient Glow Aura */}
          <div className="absolute inset-0 bg-red-500/25 rounded-full blur-xl animate-pulse pointer-events-none" />

          {/* Micro Helper Speech Tag */}
          {!isOpen && (
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className="absolute -top-10 right-0 bg-slate-950 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-xl shadow-xl border border-red-500/40 whitespace-nowrap flex items-center gap-1.5 pointer-events-none"
            >
              <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span>Ask AI Saver • Drag Me</span>
            </motion.div>
          )}

          {/* 3D GLOSSY ROBO VECTOR WITH GOLD VOUCHER */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 relative flex items-center justify-center filter drop-shadow-[0_12px_24px_rgba(229,27,36,0.35)]">
            <svg viewBox="0 0 120 120" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="aiRoboBody" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="50%" stopColor="#E2E8F0" />
                  <stop offset="100%" stopColor="#94A3B8" />
                </linearGradient>

                <linearGradient id="aiRoboVisor" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#0B2B5C" />
                  <stop offset="100%" stopColor="#020617" />
                </linearGradient>

                <linearGradient id="aiVoucherFoil" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF4D4D" />
                  <stop offset="50%" stopColor="#E51B24" />
                  <stop offset="100%" stopColor="#990007" />
                </linearGradient>

                <linearGradient id="aiGoldTrim" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FDE047" />
                  <stop offset="100%" stopColor="#CA8A04" />
                </linearGradient>
              </defs>

              {/* Antenna with Pulsing Beacon */}
              <line x1="60" y1="28" x2="60" y2="14" stroke="#94A3B8" strokeWidth="4" strokeLinecap="round" />
              <circle cx="60" cy="12" r="5" fill="#E51B24" className="animate-ping" />
              <circle cx="60" cy="12" r="5" fill="#E51B24" />

              {/* Ears / Sensors */}
              <rect x="22" y="44" width="8" height="18" rx="4" fill="#64748B" />
              <rect x="90" y="44" width="8" height="18" rx="4" fill="#64748B" />

              {/* Robo Head Capsule */}
              <rect x="28" y="24" width="64" height="54" rx="24" fill="url(#aiRoboBody)" stroke="#CBD5E1" strokeWidth="2.5" />

              {/* Visor Screen */}
              <rect x="36" y="34" width="48" height="32" rx="14" fill="url(#aiRoboVisor)" stroke="#334155" strokeWidth="1.5" />

              {/* Glowing Eyes */}
              <circle cx="48" cy="50" r="5" fill="#38BDF8" className="animate-pulse" />
              <circle cx="72" cy="50" r="5" fill="#38BDF8" className="animate-pulse" />
              <circle cx="50" cy="48" r="1.5" fill="#FFFFFF" />
              <circle cx="74" cy="48" r="1.5" fill="#FFFFFF" />

              {/* Smile Line */}
              <path d="M 54 58 Q 60 62 66 58" fill="none" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" opacity="0.8" />

              {/* Torso */}
              <path d="M 40 80 Q 60 76 80 80 L 84 102 Q 60 106 36 102 Z" fill="url(#aiRoboBody)" stroke="#CBD5E1" strokeWidth="2" />
              <circle cx="60" cy="92" r="4.5" fill="#E51B24" className="animate-pulse" />

              {/* Left Arm Idle */}
              <path d="M 36 84 Q 24 90 28 102" fill="none" stroke="#94A3B8" strokeWidth="6" strokeLinecap="round" />

              {/* Right Arm Holding Voucher Up */}
              <path d="M 82 84 Q 96 82 92 68" fill="none" stroke="#94A3B8" strokeWidth="6" strokeLinecap="round" />

              {/* PHYSICAL FLOATING VOUCHER CARD */}
              <g transform="translate(76, 44) rotate(14)">
                <rect x="1" y="1" width="38" height="24" rx="4" fill="#000000" opacity="0.25" />
                <rect x="0" y="0" width="38" height="24" rx="4" fill="url(#aiVoucherFoil)" stroke="url(#aiGoldTrim)" strokeWidth="1.5" />
                <line x1="26" y1="0" x2="26" y2="24" stroke="#FFFFFF" strokeWidth="1.2" strokeDasharray="2,2" opacity="0.7" />
                <circle cx="26" cy="0" r="2.5" fill="#E2E8F0" />
                <circle cx="26" cy="24" r="2.5" fill="#E2E8F0" />
                <text x="4" y="10" fill="#FDE047" fontSize="5.5" fontWeight="900" fontFamily="sans-serif">LOOT</text>
                <text x="4" y="18" fill="#FFFFFF" fontSize="6.5" fontWeight="900" fontFamily="sans-serif">₹500</text>
                <text x="29" y="14" fill="#FFFFFF" fontSize="5" fontWeight="900" fontFamily="sans-serif">%</text>
              </g>

              {/* Stars */}
              <circle cx="114" cy="40" r="1.5" fill="#FDE047" className="animate-ping" />
              <circle cx="82" cy="38" r="1.2" fill="#FDE047" />
            </svg>
          </div>

        </div>
      </motion.div>

      {/* ======================================================== */}
      {/* 2. MODERN GLASSMORPHIC CHAT PANEL                        */}
      {/* ======================================================== */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 35, scale: 0.9, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className="fixed bottom-24 right-3 sm:right-6 z-50 w-[calc(100vw-24px)] sm:w-[425px] h-[580px] max-h-[85vh] bg-white/95 backdrop-blur-2xl border border-slate-200/80 rounded-[32px] shadow-[0_25px_70px_rgba(11,43,92,0.22)] flex flex-col overflow-hidden text-slate-900"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-[#0B2B5C] via-[#14428B] to-[#0B2B5C] p-4 text-white flex items-center justify-between border-b border-white/10 overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 w-36 h-36 bg-rose-500/20 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center gap-3 relative z-10">
                <div className="relative">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 p-1.5 flex items-center justify-center backdrop-blur-md shadow-inner">
                    <Bot className="w-6 h-6 text-rose-300" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0B2B5C]" />
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-black text-sm tracking-tight text-white leading-none">
                      AIO Smart Saver
                    </h3>
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-gradient-to-r from-[#E51B24] to-red-600 text-white tracking-wider shadow-sm">
                      3.6 LIVE
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-300 font-medium mt-0.5 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400 inline" />
                    <span>Real-Time Arbitrage Engine</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 relative z-10">
                <motion.button
                  whileHover={{ rotate: -180 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => setMessages([messages[0]])}
                  className="p-2 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
                  title="Reset conversation"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </motion.button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs bg-gradient-to-b from-slate-50/50 via-white to-slate-50/30 scrollbar-thin scrollbar-thumb-slate-200">
              {messages.map((m, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 12, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[86%] rounded-2xl p-3.5 leading-relaxed text-xs shadow-sm transition-all ${
                      m.role === 'user'
                        ? 'bg-gradient-to-br from-[#E51B24] to-red-600 text-white font-semibold rounded-br-none shadow-red-500/10'
                        : 'bg-white border border-slate-200 text-slate-800 font-medium rounded-bl-none shadow-slate-200/50'
                    }`}
                  >
                    {m.role === 'user' ? (
                      <div className="whitespace-pre-line">{m.content}</div>
                    ) : (
                      <div className="space-y-1">
                        {renderFormattedText(m.content)}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Animated AI Typing Indicator */}
              {loading && (
                <motion.div 
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-4 py-2.5 flex items-center gap-2 text-slate-600 font-bold text-[11px] shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-[#E51B24] animate-pulse" />
                    <span className="w-2 h-2 rounded-full bg-[#E51B24] animate-pulse [animation-delay:0.2s]" />
                    <span className="w-2 h-2 rounded-full bg-[#E51B24] animate-pulse [animation-delay:0.4s]" />
                    <span className="text-slate-500 text-[10px] uppercase tracking-wider font-extrabold ml-1">
                      Calculating Stack...
                    </span>
                  </div>
                </motion.div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Quick Interactive Prompt Chips */}
            {messages.length <= 3 && (
              <div className="px-3 py-2 border-t border-slate-100 bg-slate-50/80 backdrop-blur-md">
                <div className="flex items-center gap-1 mb-1.5 px-1">
                  <Zap className="w-3 h-3 text-[#E51B24]" />
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                    Quick Calculations
                  </span>
                </div>
                <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1">
                  {quickPrompts.map((p, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSend(p)}
                      className="px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-[#E51B24] text-slate-700 hover:text-[#E51B24] text-[10px] font-bold transition shadow-2xs shrink-0 cursor-pointer active:scale-95"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Input Field */}
            <div className="p-3 border-t border-slate-200/80 bg-white flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask e.g. Zomato ₹1500 order best price..."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#E51B24] focus:bg-white rounded-xl pl-3.5 pr-2 py-2.5 text-xs font-semibold text-slate-900 outline-none transition shadow-inner placeholder:text-slate-400"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#E51B24] to-red-600 hover:from-[#CC141D] hover:to-red-700 text-white flex items-center justify-center transition disabled:opacity-40 disabled:cursor-not-allowed shadow-md cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}