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
  ArrowRight,
  ShieldCheck,
  TrendingDown,
  Percent
} from 'lucide-react';
import Link from 'next/link';

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
      {/* 1. ULTRA-SMOOTH GLOWING FLOATING TRIGGER BUTTON         */}
      {/* ======================================================== */}
      <div className="fixed bottom-5 right-5 z-50">
        <motion.div
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="relative"
        >
          {/* Ambient Glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#E51B24] via-rose-500 to-[#0B2B5C] rounded-full blur-md opacity-70 group-hover:opacity-100 transition duration-300" />

          <motion.button
            whileHover={{ scale: 1.06, y: -2 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => setIsOpen(!isOpen)}
            className="relative px-4 sm:px-5 py-3 rounded-full bg-[#0B2B5C] hover:bg-slate-900 text-white font-black text-xs uppercase tracking-wider shadow-2xl flex items-center gap-2.5 border border-white/20 cursor-pointer overflow-hidden backdrop-blur-xl transition-all"
          >
            {/* Shimmer sweep effect */}
            <motion.div 
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none"
            />

            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#E51B24] to-rose-400 flex items-center justify-center shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>

            <span className="font-extrabold tracking-wide drop-shadow-sm">
              {isOpen ? 'Close Saver' : 'Ask AI Saver'}
            </span>

            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          </motion.button>
        </motion.div>
      </div>

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
            className="fixed bottom-20 right-3 sm:right-6 z-50 w-[calc(100vw-24px)] sm:w-[425px] h-[580px] max-h-[85vh] bg-white/95 backdrop-blur-2xl border border-slate-200/80 rounded-[32px] shadow-[0_25px_70px_rgba(11,43,92,0.22)] flex flex-col overflow-hidden text-slate-900"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-[#0B2B5C] via-[#14428B] to-[#0B2B5C] p-4 text-white flex items-center justify-between border-b border-white/10 overflow-hidden shadow-sm">
              
              {/* Background ambient lighting in header */}
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