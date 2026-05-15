import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  BookOpen, 
  Share2, 
  Image as ImageIcon, 
  Send,
  Calendar,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';
import { format } from 'date-fns';

export const QuietTime: React.FC = () => {
  const { profile } = useAuth();
  const [content, setContent] = useState('');
  const [isShared, setIsShared] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save logic
    setContent('');
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-light tracking-tight text-slate-900 leading-tight">Quiet Time</h1>
        <p className="text-slate-500 font-medium mt-1">Reflect on the word and share your heart with the community.</p>
      </div>

      {/* Write Entry */}
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="text-slate-900" size={20} />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Today's Reflection</h3>
          <span className="ml-auto text-[10px] font-bold text-slate-400 uppercase tracking-widest">{format(new Date(), 'EEEE, MMMM dd')}</span>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <textarea 
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="What is God speaking to you today?"
            className="w-full h-40 p-6 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all resize-none text-slate-800 placeholder:text-slate-300 font-medium"
          />
          
          <div className="flex items-center justify-between pt-2">
            <div className="flex gap-4">
              <button type="button" className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                <ImageIcon size={20} />
              </button>
              <button 
                type="button" 
                onClick={() => setIsShared(!isShared)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${isShared ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}
              >
                <Share2 size={12} />
                {isShared ? 'Shared with Group' : 'Keep Private'}
              </button>
            </div>
            
            <button 
              type="submit"
              className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-slate-200"
            >
              <Send size={16} />
              Save Entry
            </button>
          </div>
        </form>
      </div>

      {/* History Feed */}
      <div className="space-y-6">
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 text-center">Historical Feed</h3>
        
        {[1].map(i => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[10px] font-bold text-blue-600">SJ</div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Sarah Jenkins</div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">October 11, 2023</div>
                </div>
              </div>
              <Sparkles size={16} className="text-amber-400" />
            </div>
            <p className="text-sm text-slate-600 leading-relaxed italic">
              "Today I was reading Psalm 23. The reminder that God is our shepherd even in the darkest valleys brought so much peace to my soul..."
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
