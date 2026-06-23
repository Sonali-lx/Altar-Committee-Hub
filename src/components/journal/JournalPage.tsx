import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/db';
import { 
  BookOpen, 
  Send,
  Calendar,
  Sparkles,
  Filter
} from 'lucide-react';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { JournalEntry } from '../../types';

export const JournalPage: React.FC = () => {
  const { profile } = useAuth();
  
  const [activeViewTab, setActiveViewTab] = useState<'ENTRY' | 'HISTORY'>('ENTRY');
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [mood, setMood] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [time, setTime] = useState(format(new Date(), 'HH:mm'));
  const [day, setDay] = useState(format(new Date(), 'EEEE'));
  const [linkedPrayerId, setLinkedPrayerId] = useState('');

  const [prayers, setPrayers] = useState<any[]>([]);
  const [history, setHistory] = useState<JournalEntry[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [historyFilter, setHistoryFilter] = useState('ALL');

  useEffect(() => {
    fetchHistory();
    fetchPrayers();
  }, [profile?.uid]);

  const fetchHistory = async () => {
    if (!profile) return;
    const records = await dbService.getJournals(profile.uid);
    if (records) {
      setHistory(records as JournalEntry[]);
    }
  };

  const fetchPrayers = async () => {
    if (!profile) return;
    const records = await dbService.getPrayers(profile.uid);
    if (records) {
      setPrayers(records);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsSubmitting(true);
    
    try {
      const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);

      await dbService.addJournal({
        userId: profile.uid,
        date: date || new Date().toISOString().split('T')[0],
        time,
        day,
        title,
        content,
        tags: tagList,
        mood,
        prayerId: linkedPrayerId
      });
      
      setTitle('');
      setContent('');
      setTags('');
      setMood('');
      setLinkedPrayerId('');
      setDate(format(new Date(), 'yyyy-MM-dd'));
      setTime(format(new Date(), 'HH:mm'));
      setDay(format(new Date(), 'EEEE'));
      fetchHistory();
      setActiveViewTab('HISTORY');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const allTags = Array.from(new Set(history.flatMap(entry => entry.tags || [])));
  
  const filteredHistory = historyFilter === 'ALL' 
    ? history 
    : history.filter(h => h.tags?.includes(historyFilter));

  return (
    <div className="max-w-4xl mx-auto min-h-[calc(100vh-80px)] overflow-y-auto px-4 py-8 flex flex-col">
      <div className="text-center mb-8 shrink-0">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-fuchsia-50 rounded-2xl border border-fuchsia-100">
            <BookOpen className="h-8 w-8 text-fuchsia-600" />
          </div>
        </div>
        <h1 className="text-3xl font-light tracking-tight text-slate-900 leading-tight">Personal Journal</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Document your walk, thoughts, and reflections.</p>
      </div>

      <div className="flex bg-slate-100 p-1 rounded-xl mb-8 max-w-sm mx-auto">
        <button
          onClick={() => setActiveViewTab('ENTRY')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${activeViewTab === 'ENTRY' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          New Entry
        </button>
        <button
          onClick={() => setActiveViewTab('HISTORY')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${activeViewTab === 'HISTORY' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          My Journal
        </button>
      </div>

      <div className="flex-1">
        {activeViewTab === 'ENTRY' && (
          <div className="bg-white p-6 md:p-10 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
              <BookOpen size={160} />
            </div>
            
            <div className="relative z-10">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Date</label>
                    <input 
                      type="date"
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Time</label>
                    <input 
                      type="time"
                      value={time}
                      onChange={e => setTime(e.target.value)}
                      className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Day</label>
                    <input 
                      type="text"
                      value={day}
                      onChange={e => setDay(e.target.value)}
                      className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all text-sm font-medium"
                      placeholder="e.g. Monday"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Link to a Prayer (Optional)</label>
                  <select
                    value={linkedPrayerId}
                    onChange={e => setLinkedPrayerId(e.target.value)}
                    className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all text-sm font-medium"
                  >
                    <option value="">-- No linked prayer --</option>
                    {prayers.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Title</label>
                  <input 
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Give your entry a title..."
                    className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all text-lg font-serif"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Entry</label>
                  <textarea 
                    required
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder="Write your thoughts..."
                    className="w-full h-64 p-4 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all resize-none text-sm font-medium"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Tags (Comma-separated)</label>
                    <input 
                      value={tags}
                      onChange={e => setTags(e.target.value)}
                      placeholder="e.g. gratitude, struggle, sermon"
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Current Mood</label>
                    <input 
                      value={mood}
                      onChange={e => setMood(e.target.value)}
                      placeholder="e.g. Joyful, Peaceful, Anxious"
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all text-sm font-medium"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-slate-100">
                  <button 
                    type="submit"
                    disabled={isSubmitting || !title || !content}
                    className="w-full sm:w-auto bg-slate-900 text-white px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors disabled:opacity-50 shrink-0"
                  >
                    <Send size={16} />
                    {isSubmitting ? 'Saving...' : 'Save Entry'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeViewTab === 'HISTORY' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <Filter size={14} className="text-slate-400 mr-2 shrink-0" />
              <button
                onClick={() => setHistoryFilter('ALL')}
                className={`shrink-0 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${historyFilter === 'ALL' ? 'bg-slate-800 text-white' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
              >
                All Entries
              </button>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setHistoryFilter(tag as string)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${historyFilter === tag ? 'bg-slate-800 text-white' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
                >
                  {tag}
                </button>
              ))}
            </div>

            {filteredHistory.map(entry => (
              <motion.div 
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 md:p-8 rounded-3xl border bg-white border-slate-100 shadow-sm relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
                  <div>
                     <h3 className="text-xl font-serif text-slate-900 mb-1">{entry.title}</h3>
                     <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex-wrap">
                       <Calendar size={12} />
                       {entry.day && <span className="text-slate-600">{entry.day},</span>}
                       {format(new Date(entry.date || entry.createdAt), 'MMMM dd, yyyy')}
                       {entry.time && <span>at {entry.time}</span>}
                       {entry.mood && (
                         <>
                           <span className="px-2 block">•</span>
                           <span>Mood: <span className="text-slate-600">{entry.mood}</span></span>
                         </>
                       )}
                       {entry.prayerId && (
                         <>
                           <span className="px-2 block">•</span>
                           <span className="text-indigo-500">Linked to Prayer</span>
                         </>
                       )}
                     </div>
                  </div>
                </div>

                <div className="relative z-10 mb-6">
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                    {entry.content}
                  </p>
                </div>
                
                {entry.tags && entry.tags.length > 0 && (
                   <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-50">
                     {entry.tags.map(t => (
                       <span key={t} className="px-2 py-1 rounded-md bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                         {t}
                       </span>
                     ))}
                   </div>
                )}
              </motion.div>
            ))}
            {filteredHistory.length === 0 && (
              <div className="text-center py-16">
                <BookOpen size={40} className="mx-auto text-slate-200 mb-4" />
                <p className="text-slate-500 text-sm font-bold">No journal entries found.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
