import React, { useState, useEffect, useRef } from "react";
import { Send, Paperclip, Image as ImageIcon, SmilePlus, MoreHorizontal, Trash2, Edit2, X, Download } from "lucide-react";
import { dbService } from "../../services/db";
import { format } from "date-fns";
import { ConfirmModal } from "../ui/ConfirmModal";

interface CellChatProps {
  cellId: string;
  profile: any;
}

export const CellChat: React.FC<CellChatProps> = ({ cellId, profile }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = dbService.listenToCellMessages(cellId, (msgs) => {
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, [cellId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !profile) return;
    
    if (editingMsgId) {
      await dbService.updateCellMessage(cellId, editingMsgId, { text: newMessage.trim(), isEdited: true });
      setEditingMsgId(null);
      setNewMessage("");
      return;
    }

    const msgData = {
      text: newMessage.trim(),
      senderId: profile.uid,
      senderName: profile.name,
      senderPhoto: profile.photoURL || null,
      type: "text"
    };

    setNewMessage("");
    await dbService.sendCellMessage(cellId, msgData);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fileType: "image" | "document") => {
    if (!e.target.files || !e.target.files[0] || !profile) return;
    const file = e.target.files[0];
    e.target.value = ''; // reset
    setIsUploading(true);
    
    try {
      const ext = file.name.split('.').pop();
      const path = `chat/${cellId}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${ext}`;
      const url = await dbService.uploadMessageFile(file, path);
      
      const msgData: any = {
        text: fileType === "image" ? "Sent an image" : `Sent a document: ${file.name}`,
        senderId: profile.uid,
        senderName: profile.name,
        senderPhoto: profile.photoURL || null,
        type: fileType,
        fileUrl: url,
        fileName: file.name
      };
      
      await dbService.sendCellMessage(cellId, msgData);
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload file. Check permissions.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (msgId: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Message",
      message: "Are you sure you want to delete this message?",
      onConfirm: async () => {
        await dbService.deleteCellMessage(cellId, msgId);
      }
    });
  };

  const handleEdit = (msg: any) => {
    if (msg.type !== 'text') return;
    setEditingMsgId(msg.id);
    setNewMessage(msg.text);
  };

  const handleReact = async (msg: any, emoji: string) => {
    const reaction = { emoji, userId: profile.uid, userName: profile.name };
    await dbService.addReactionToMessage(cellId, msg.id, reaction);
  };

  const renderReactions = (msg: any) => {
    if (!msg.reactions || msg.reactions.length === 0) return null;
    
    // Group reactions
    const grouped = msg.reactions.reduce((acc: any, r: any) => {
      if (!acc[r.emoji]) acc[r.emoji] = [];
      if (!acc[r.emoji].includes(r.userName)) acc[r.emoji].push(r.userName);
      return acc;
    }, {});

    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {Object.keys(grouped).map(emoji => (
          <div key={emoji} className="bg-white border border-slate-100 rounded-full px-2 py-0.5 text-[10px] flex items-center shadow-sm" title={grouped[emoji].join(', ')}>
            <span>{emoji}</span>
            <span className="ml-1 text-slate-500 font-bold">{grouped[emoji].length}</span>
          </div>
        ))}
      </div>
    );
  };

  const reactionEmojis = ["👍", "❤️", "🙏", "😂", "😮", "😢"];

  return (
    <div className="flex flex-col h-[500px] lg:h-[700px] bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <h3 className="font-bold text-slate-900">Cell Chat</h3>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {messages.length} messages
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-xs uppercase tracking-widest font-bold">
            No messages yet. Say hello!
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.senderId === profile?.uid;
            const showHeader =
              i === 0 ||
              messages[i - 1].senderId !== msg.senderId ||
              msg.timestamp - messages[i - 1].timestamp > 5 * 60000;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"} group relative`}
              >
                {showHeader && (
                  <div
                    className={`flex items-center gap-2 mb-1 mt-2 ${isMe ? "flex-row-reverse" : ""}`}
                  >
                    <div className="w-5 h-5 rounded-full bg-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                      {msg.senderPhoto ? (
                        <img
                          src={msg.senderPhoto}
                          alt={msg.senderName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-[8px] font-bold text-slate-500 uppercase">
                          {msg.senderName ? msg.senderName[0] : "?"}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold">
                      {msg.senderName}
                    </span>
                    <span className="text-[9px] text-slate-400">
                      {format(new Date(msg.timestamp), "h:mm a")}
                      {msg.isEdited && " (edited)"}
                    </span>
                  </div>
                )}
                
                <div className={`flex items-center gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
                  <div
                    className={`px-4 py-2.5 rounded-2xl max-w-xs sm:max-w-md text-sm ${
                      isMe
                        ? "bg-slate-900 text-white rounded-tr-none"
                        : "bg-white border border-slate-100 text-slate-900 rounded-tl-none shadow-sm"
                    }`}
                  >
                    {msg.type === 'text' || !msg.type ? (
                      msg.text
                    ) : msg.type === 'image' ? (
                      <div className="space-y-2">
                        <img src={msg.fileUrl} alt="Uploaded" className="rounded-xl max-w-full max-h-48 object-cover cursor-pointer" onClick={() => window.open(msg.fileUrl)} />
                      </div>
                    ) : (
                      <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-white/20 p-2 rounded-xl hover:bg-white/30 transition-colors">
                        <Download size={16} />
                        <span className="truncate max-w-[150px] font-medium text-xs">{msg.fileName}</span>
                      </a>
                    )}
                  </div>
                  
                  {/* Action Menu (Hover) */}
                  <div className={`opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 ${isMe ? "bg-white shadow-sm p-1 rounded-xl border border-slate-100" : ""}`}>
                    {/* Emoji Reaction */}
                    <div className="relative group/emoji">
                       <button className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50">
                         <SmilePlus size={14} />
                       </button>
                       <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white shadow-xl shadow-slate-200 border border-slate-100 rounded-2xl p-1.5 hidden group-hover/emoji:flex items-center gap-1 z-10 w-max">
                         {reactionEmojis.map(e => (
                           <button key={e} onClick={() => handleReact(msg, e)} className="hover:scale-125 transition-transform p-1">{e}</button>
                         ))}
                       </div>
                    </div>
                    {isMe && msg.type === 'text' && (
                      <button onClick={() => handleEdit(msg)} className="text-slate-400 hover:text-blue-500 p-1 rounded-lg hover:bg-slate-50">
                        <Edit2 size={14} />
                      </button>
                    )}
                    {isMe && (
                      <button onClick={() => handleDelete(msg.id)} className="text-slate-400 hover:text-red-500 p-1 rounded-lg hover:bg-slate-50">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
                {renderReactions(msg)}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {editingMsgId && (
        <div className="px-4 py-2 bg-blue-50 border-t border-blue-100 flex items-center justify-between">
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Editing Message</span>
          <button onClick={() => { setEditingMsgId(null); setNewMessage(""); }} className="text-blue-400 hover:text-blue-600">
            <X size={14} />
          </button>
        </div>
      )}

      <form
        onSubmit={handleSend}
        className="p-4 bg-white border-t border-slate-100"
      >
        <div className="flex items-center gap-2">
          {/* File Inputs */}
          <input type="file" ref={imageInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, "image")} />
          <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx,.txt" onChange={(e) => handleFileUpload(e, "document")} />
          
          <div className="flex gap-1 shrink-0">
            <button type="button" disabled={isUploading} onClick={() => imageInputRef.current?.click()} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all disabled:opacity-50">
              <ImageIcon size={18} />
            </button>
            <button type="button" disabled={isUploading} onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all disabled:opacity-50">
              <Paperclip size={18} />
            </button>
          </div>

          <div className="relative flex-1">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={isUploading ? "Uploading..." : "Type a message..."}
              disabled={isUploading}
              className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none text-sm transition-all"
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || isUploading}
              className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-slate-900 text-white rounded-lg disabled:opacity-50 disabled:bg-slate-200 disabled:text-slate-400 transition-all hover:scale-105 active:scale-95"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </form>
      
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
