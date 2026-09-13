'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  Zap, 
  TrendingDown, 
  ExternalLink,
  ShoppingBag,
  RotateCcw
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
      content: "Namaste! Main AllInOneVouchers ka Smart AI Saver hu. Mujhe batao aaj kya order karna hai, main lowest rate nikaal kar dunga! 🔥"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: query }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      });

      const data = await res.json();
      if (data.reply) {
        setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
      } else {
        setMessages([...newMessages, { role: 'assistant', content: "Oops! Kuch issue hua, please try again." }]);
      }
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: "Server thoda slow hai. Ek baar dobara try karein!" }]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    "Swiggy par sabse sasta kaise padega?",
    "Amazon balance voucher discount?",
    "Aaj ki top loot deals dikhao",
    "3X Savings Stacking kaise kaam karta hai?"
  ];

  return (
    <>
      {/* 1. FLOATING TRIGGER BUTTON */}
      <div className="fixed bottom-5 right-5 z-50">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="relative px-4 py-3 rounded-full bg-gradient-to-r from-[#E51B24] via-red-600 to-[#0B2B5C] text-white font-black text-xs uppercase tracking-wider shadow-[0_10px_30px_rgba(229,27,36,0.4)] flex items-center gap-2 border border-white/20 cursor-pointer"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <Bot className="w-4 h-4" />
          <span className="hidden sm:inline">Ask AI Saver</span>
        </motion.button>
      </div>

      {/* 2. SLIDE-IN CHAT WINDOW */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="fixed bottom-20 right-4 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-[420px] h-[550px] bg-white/98 backdrop-blur-2xl border border-slate-200 rounded-[32px] shadow-[0_25px_60px_rgba(11,43,92,0.25)] flex flex-col overflow-hidden text-slate-900"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#0B2B5C] to-[#14428B] p-4 text-white flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-[#E51B24]">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-white flex items-center gap-1.5 leading-none">
                    <span>AIO Smart Saver</span>
                    <span className="text-[9px] bg-[#E51B24] px-1.5 py-0.5 rounded font-bold">24/7 AI</span>
                  </h3>
                  <span className="text-[10px] text-slate-300 font-medium">Real-time Arbitrage Stacker</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setMessages([messages[0]])}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition"
                  title="Reset Chat"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-[#E51B24] text-white font-semibold rounded-br-none shadow-sm'
                        : 'bg-slate-50 border border-slate-200/90 text-slate-800 font-medium rounded-bl-none shadow-sm space-y-1'
                    }`}
                  >
                    <div className="whitespace-pre-line">{m.content}</div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 rounded-2xl px-4 py-2.5 flex items-center gap-1.5 text-slate-500 font-bold text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E51B24] animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E51B24] animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E51B24] animate-bounce [animation-delay:0.4s]" />
                    <span>Finding best savings...</span>
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Quick Suggestions Chips */}
            {messages.length <= 2 && (
              <div className="px-3 py-1.5 border-t border-slate-100 flex gap-1.5 overflow-x-auto scrollbar-none bg-slate-50/50">
                {quickPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(prompt)}
                    className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-[10px] font-bold text-slate-600 hover:border-[#E51B24] hover:text-[#E51B24] transition shrink-0 cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <div className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask e.g. Amazon ₹2000 cart savings..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-[#E51B24] transition"
              />
              <button
                type="button"
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                className="w-9 h-9 rounded-xl bg-[#E51B24] hover:bg-[#CC141D] text-white flex items-center justify-center transition disabled:opacity-50 active:scale-95 cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}