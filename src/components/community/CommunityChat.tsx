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
    <div className="max-w-2xl mx-auto h-[calc(100vh-120px)] flex flex-col relative px-4 text-sm">
      <div className="flex-none py-4 border-b border-slate-100 flex items-center gap-2 mb-4 bg-white sticky top-0 z-10">
        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
           <MessageSquare size={20} />
        </div>
        <div>
           <h1 className="text-lg font-bold tracking-tight text-slate-900">Community Chat</h1>
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Real-time Global Discussion</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto w-full space-y-4 pb-32 no-scrollbar">
        {messages.map((msg, i) => {
          const isMine = msg.authorId === profile?.uid;
          const showTime = true;
          return (
            <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
              <div className={`flex items-end gap-2 max-w-[85%] ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                {!isMine && (
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex justify-center items-center font-bold text-xs shrink-0 text-slate-600">
                    {msg.authorName?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className={`px-4 py-3 rounded-2xl ${isMine ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white border border-slate-100 text-slate-800 rounded-bl-sm shadow-sm'}`}>
                  {!isMine && <div className="text-[10px] font-bold text-indigo-500 mb-0.5">{msg.authorName}</div>}
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</div>
                </div>
              </div>
              <div className={`text-[10px] text-slate-400 mt-1 font-medium ${isMine ? 'mr-10' : 'ml-10'}`}>
                {format(new Date(msg.createdAt), 'h:mm a')}
              </div>
            </div>
          )
        })}
        <div ref={chatEndRef} />
      </div>

      <div className="absolute bottom-6 left-0 right-0 px-4">
        <form onSubmit={handleSend} className="max-w-2xl mx-auto flex items-end gap-2 bg-white border border-slate-200 p-2 rounded-3xl shadow-lg">
          <textarea 
             value={text}
             onChange={e => setText(e.target.value)}
             placeholder="Type a message..."
             className="flex-1 bg-transparent border-none focus:ring-0 resize-none h-12 max-h-32 text-sm p-3"
             onKeyDown={e => {
               if (e.key === 'Enter' && !e.shiftKey) {
                 e.preventDefault();
                 handleSend(e);
               }
             }}
          />
          <button type="submit" disabled={!text.trim() || isSending} className="w-12 h-12 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl flex items-center justify-center shrink-0 transition-colors shadow-sm">
             <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};
