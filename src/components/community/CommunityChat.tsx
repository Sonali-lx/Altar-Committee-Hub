import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/db';
import { Send, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

export const CommunityChat: React.FC = () => {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const unsub = dbService.subscribeCommunityChat((msgs) => {
      setMessages(msgs);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !text.trim() || isSending) return;
    
    setIsSending(true);
    await dbService.sendCommunityChatMessage(profile.uid, profile.name, text);
    setText('');
    setIsSending(false);
  };

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-140px)] md:h-[calc(100vh-160px)] flex flex-col bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden text-sm relative">
      {/* Pinned Solid Header - Messages cannot scroll above this */}
      <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between shrink-0 z-20 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center border border-indigo-100 shadow-xs">
             <MessageSquare size={20} />
          </div>
          <div>
             <h1 className="text-base font-bold tracking-tight text-slate-900">Community Chat</h1>
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Real-time Global Discussion</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 text-[10px] font-bold uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live Feed</span>
        </div>
      </div>

      {/* Isolated Scrollable Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-slate-50/40">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
            <MessageSquare size={32} className="mb-2 opacity-40 text-slate-300" />
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">No messages yet</p>
            <p className="text-xs text-slate-400 mt-1">Be the first to share a blessing or message in the community!</p>
          </div>
        )}

        {messages.map((msg) => {
          const isMine = msg.authorId === profile?.uid;
          return (
            <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
              <div className={`flex items-end gap-2 max-w-[85%] ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                {!isMine && (
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex justify-center items-center font-bold text-xs shrink-0 text-slate-700 shadow-xs">
                    {msg.authorName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <div className={`px-4 py-3 rounded-2xl ${isMine ? 'bg-slate-900 text-white rounded-br-xs shadow-sm' : 'bg-white border border-slate-200/80 text-slate-800 rounded-bl-xs shadow-xs'}`}>
                  {!isMine && <div className="text-[10px] font-bold text-indigo-600 mb-0.5">{msg.authorName}</div>}
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</div>
                </div>
              </div>
              <div className={`text-[10px] text-slate-400 mt-1 font-medium ${isMine ? 'mr-1' : 'ml-10'}`}>
                {msg.createdAt ? format(new Date(msg.createdAt), 'h:mm a') : ''}
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Pinned Input Form */}
      <div className="p-3 md:p-4 bg-white border-t border-slate-100 shrink-0 z-20">
        <form onSubmit={handleSend} className="flex items-end gap-2 bg-slate-50 border border-slate-200 p-1.5 rounded-2xl focus-within:bg-white focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
          <textarea 
             value={text}
             onChange={e => setText(e.target.value)}
             placeholder="Type a message to the community..."
             className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none resize-none h-10 max-h-28 text-sm px-3 py-2 text-slate-800 placeholder:text-slate-400"
             rows={1}
             onKeyDown={e => {
               if (e.key === 'Enter' && !e.shiftKey) {
                 e.preventDefault();
                 handleSend(e);
               }
             }}
          />
          <button 
            type="submit" 
            disabled={!text.trim() || isSending} 
            className="w-10 h-10 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-900 text-white rounded-xl flex items-center justify-center shrink-0 transition-colors shadow-xs"
            title="Send Message"
          >
             <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};
