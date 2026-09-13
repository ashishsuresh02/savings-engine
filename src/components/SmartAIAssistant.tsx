'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  RotateCcw,
  ShoppingBag,
  ExternalLink
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
      content: "Bhai main AllInOneVouchers ka Smart AI hu! 🛒\n\nAaj kya order karna hai? Amazon, Swiggy, Zomato ya Myntra? Mujhe batao, main live vouchers aur coupons stack karke sabse sasta rate bana ke deta hu!"
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
        setMessages([...newChat, { role: 'assistant', content: "Bhai abhi response nahi ban paya, dubara koshish karein." }]);
      }
    } catch {
      setMessages([...newChat, { role: 'assistant', content: "Network issue lag raha hai bhai, ek baar refresh karke try karo!" }]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    "Swiggy par ₹1500 ka khana sasta kaise hoga?",
    "Amazon balance voucher par kitna discount hai?",
    "Aaj ki sabse sasti loot deal dikhao"
  ];

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-5 right-5 z-50">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="px-4 py-3 rounded-full bg-gradient-to-r from-[#E51B24] via-red-600 to-[#0B2B5C] text-white font-black text-xs uppercase tracking-wider shadow-[0_8px_25px_rgba(229,27,36,0.35)] flex items-center gap-2 border border-white/20 cursor-pointer"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <Bot className="w-4 h-4" />
          <span>Ask AI Saver</span>
        </motion.button>
      </div>

      {/* Interactive Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 25, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-3 sm:right-6 z-50 w-[calc(100vw-24px)] sm:w-[410px] h-[540px] bg-white/95 backdrop-blur-2xl border border-slate-200 rounded-[30px] shadow-[0_20px_50px_rgba(11,43,92,0.2)] flex flex-col overflow-hidden text-slate-900"
          >
            {/* Header */}
            <div className="bg-[#0B2B5C] p-4 text-white flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-[#E51B24]">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-xs sm:text-sm text-white flex items-center gap-1.5 leading-none">
                    <span>AIO Smart Saver</span>
                    <span className="text-[9px] bg-[#E51B24] px-1.5 py-0.5 rounded font-bold">LIVE AI</span>
                  </h3>
                  <span className="text-[10px] text-slate-300">Live Inventory & Arbitrage Math</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setMessages([messages[0]])}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
                  title="Clear Chat"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-3.5 overflow-y-auto space-y-3 text-xs">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-[#E51B24] text-white font-semibold rounded-br-none shadow-sm'
                        : 'bg-slate-100 border border-slate-200 text-slate-800 font-medium rounded-bl-none shadow-sm'
                    }`}
                  >
                    <div className="whitespace-pre-line">{m.content}</div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 rounded-2xl px-3.5 py-2 flex items-center gap-1.5 text-slate-500 font-bold text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E51B24] animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E51B24] animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E51B24] animate-bounce [animation-delay:0.4s]" />
                    <span>Live data calculate ho raha hai...</span>
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Quick Suggestions */}
            {messages.length <= 2 && (
              <div className="px-3 py-1.5 border-t border-slate-100 flex gap-1.5 overflow-x-auto scrollbar-none bg-slate-50">
                {quickPrompts.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(p)}
                    className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-[10px] font-bold text-slate-700 hover:border-[#E51B24] transition shrink-0 cursor-pointer"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <div className="p-2.5 border-t border-slate-200 bg-white flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Pucho: Amazon ₹2000 cart sasta kaise karein?"
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