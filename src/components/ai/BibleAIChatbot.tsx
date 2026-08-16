import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot, User, RefreshCw, BookOpen } from 'lucide-react';
import { askBibleAI, ChatMessage } from '../../services/ai';
import { motion, AnimatePresence } from 'motion/react';

export const BibleAIChatbot: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Peace be with you! I am your Altar Bible Assistant. How can I help you in your quiet time, Bible study, or prayer journey today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const responseText = await askBibleAI(userMessage.content, messages);
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${err?.message || 'Failed to communicate with Bible AI Assistant.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    "Guide me in Quiet Time for Psalm 23",
    "Explain the ASPECT Bible study method",
    "Give me an ACTS prayer prompt for today",
    "What does Proverbs 16:3 teach us?"
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white w-full max-w-2xl h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200"
        >
          {/* Header */}
          <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="font-bold text-base tracking-tight flex items-center gap-2">
                  Altar Bible AI Assistant
                  <span className="text-[10px] bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded-full font-mono uppercase tracking-widest">Gemini 2.5</span>
                </h3>
                <p className="text-xs text-slate-400">Guiding your Quiet Time, Scripture study & Prayer</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-indigo-900 text-indigo-200 flex items-center justify-center text-xs shrink-0 mt-1">
                    <Bot size={16} />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-slate-900 text-white rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <span className={`text-[10px] block mt-1 text-right ${msg.role === 'user' ? 'text-slate-400' : 'text-slate-400'}`}>
                    {msg.timestamp}
                  </span>
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs shrink-0 mt-1">
                    <User size={16} />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-indigo-900 text-indigo-200 flex items-center justify-center text-xs shrink-0">
                  <Bot size={16} />
                </div>
                <div className="bg-white border border-slate-200/80 rounded-2xl rounded-bl-none p-4 shadow-sm flex items-center gap-2">
                  <RefreshCw size={16} className="animate-spin text-indigo-600" />
                  <span className="text-xs text-slate-500 font-medium">Searching Scriptures & generating reflection...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          {messages.length <= 2 && (
            <div className="px-4 py-2 bg-slate-100/70 border-t border-slate-200/60 flex gap-2 overflow-x-auto">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => { setInput(prompt); }}
                  className="text-xs bg-white text-slate-700 border border-slate-200 hover:border-indigo-400 hover:text-indigo-600 px-3 py-1.5 rounded-full whitespace-nowrap transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <BookOpen size={12} />
                  <span>{prompt}</span>
                </button>
              ))}
            </div>
          )}

          {/* Input form */}
          <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-200 flex gap-3 items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about the Bible, Quiet Time, or Prayer..."
              className="flex-1 px-4 py-3 bg-slate-100 rounded-2xl text-sm border border-transparent focus:border-slate-300 focus:bg-white focus:outline-none transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-12 h-12 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-2xl flex items-center justify-center transition-colors shrink-0"
            >
              <Send size={18} />
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
