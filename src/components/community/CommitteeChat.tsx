import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/db';
import { Send, Shield, Lock, Users } from 'lucide-react';
import { format } from 'date-fns';
import { UserRole } from '../../types';

export const CommitteeChat: React.FC = () => {
  const { profile, hasRole } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [isSending, setIsSending] = useState(false);

  const isAuthorized = hasRole([
    UserRole.SENIOR_ADVISOR,
    UserRole.PRESIDENT,
    UserRole.SECRETARY,
    UserRole.TREASURER,
    UserRole.PRAYER_SECRETARY,
    UserRole.PRAYER_CELL_SECRETARY,
    UserRole.ADMIN
  ]);

  useEffect(() => {
    if (!isAuthorized) return;
    const unsub = dbService.subscribeCommitteeChat((msgs) => {
      setMessages(msgs);
    });
    return () => unsub();
  }, [isAuthorized]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !text.trim() || isSending) return;
    
    setIsSending(true);
    const roleName = profile.roles?.[0]?.replace('_', ' ') || 'Committee Member';
    await dbService.sendCommitteeChatMessage(profile.uid, profile.name, text, roleName);
    setText('');
    setIsSending(false);
  };

  if (!isAuthorized) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200/80 text-center shadow-sm">
        <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-100">
          <Lock size={24} />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Restricted Access</h2>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          The Committee Channel is strictly reserved for designated committee members and executive administrators.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-140px)] md:h-[calc(100vh-160px)] flex flex-col bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden text-sm relative">
      {/* Pinned Solid Header - Messages cannot scroll above this */}
      <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between shrink-0 z-20 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-50 text-amber-700 rounded-2xl flex items-center justify-center border border-amber-200/70 shadow-xs">
             <Shield size={20} />
          </div>
          <div>
             <div className="flex items-center gap-2">
               <h1 className="text-base font-bold tracking-tight text-slate-900">Committee Hub Chat</h1>
               <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-amber-100 text-amber-800 border border-amber-200">
                 Confidential
               </span>
             </div>
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-0.5">Official Executive Channel</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 rounded-full border border-slate-200 text-[10px] font-bold uppercase tracking-wider">
          <Users size={12} className="text-slate-500" />
          <span>Members Only</span>
        </div>
      </div>

      {/* Isolated Scrollable Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-slate-50/40">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
            <Shield size={32} className="mb-2 opacity-40 text-slate-300" />
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">No committee messages yet</p>
            <p className="text-xs text-slate-400 mt-1">Start the first official discussion or coordination note.</p>
          </div>
        )}

        {messages.map((msg) => {
          const isMine = msg.authorId === profile?.uid;
          return (
            <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
              <div className={`flex items-end gap-2 max-w-[85%] ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                {!isMine && (
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 border border-amber-200 flex justify-center items-center font-bold text-xs shrink-0 shadow-xs">
                    {msg.authorName?.charAt(0).toUpperCase() || 'C'}
                  </div>
                )}
                <div className={`px-4 py-3 rounded-2xl ${isMine ? 'bg-slate-900 text-white rounded-br-xs shadow-sm' : 'bg-white border border-slate-200/80 text-slate-800 rounded-bl-xs shadow-xs'}`}>
                  {!isMine && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold text-slate-900">{msg.authorName}</span>
                      <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                        {msg.authorRole || 'Committee'}
                      </span>
                    </div>
                  )}
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
        <form onSubmit={handleSend} className="flex items-end gap-2 bg-slate-50 border border-slate-200 p-1.5 rounded-2xl focus-within:bg-white focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-100 transition-all">
          <textarea 
             value={text}
             onChange={e => setText(e.target.value)}
             placeholder="Post an update to the committee..."
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
