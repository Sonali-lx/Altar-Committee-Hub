import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/db';
import { 
  Heart, 
  Send,
  Sparkles,
  List,
  CheckCircle2,
  Clock,
  Filter
} from 'lucide-react';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { Prayer as PrayerType } from '../../types';

export const PrayerPage: React.FC = () => {
  const { profile } = useAuth();
  
  const [activeViewTab, setActiveViewTab] = useState<'ENTRY' | 'HISTORY'>('ENTRY');
  const [activeFormat, setActiveFormat] = useState<'ACTS' | 'Freeform'>('ACTS');
  
  const [content, setContent] = useState('');
  const [acts, setActs] = useState({
    adoration: '',
    confession: '',
    thanksgiving: '',
    supplication: ''
  });
  const [selectedStatus, setSelectedStatus] = useState<PrayerType['status']>('waiting');
  
  const [history, setHistory] = useState<PrayerType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<PrayerType['status'] | 'ALL'>('ALL');

  useEffect(() => {
    fetchHistory();
  }, [profile?.uid]);

  const fetchHistory = async () => {
    if (!profile) return;
    const records = await dbService.getPrayers(profile.uid);
    if (records) {
      setHistory(records as PrayerType[]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsSubmitting(true);
    
    try {
      await dbService.addPrayer({
        userId: profile.uid,
        userName: profile.name,
        date: new Date().toISOString().split('T')[0],
        type: activeFormat,
        content: activeFormat === 'Freeform' ? content : undefined,
        acts: activeFormat === 'ACTS' ? acts : undefined,
        status: selectedStatus,
        isShared: false
      });
      
      // Reset form
      setContent('');
      setActs({
        adoration: '', confession: '', thanksgiving: '', supplication: ''
      });
      setSelectedStatus('waiting');
      fetchHistory();
      setActiveViewTab('HISTORY');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const markAsAnswered = async (prayerId: string) => {
    await dbService.updatePrayerStatus(prayerId, 'answered');
    fetchHistory();
  };

  const statuses = [
    { value: 'waiting', label: 'Waiting' },
    { value: 'answered', label: 'Answered' },
    { value: 'confession', label: 'Confession' },
    { value: 'conviction', label: 'Conviction' },
    { value: 'thanksgiving', label: 'Thanksgiving' },
    { value: 'supplication', label: 'Supplication' },
    { value: 'general', label: 'General' },
  ];

  const filteredHistory = historyFilter === 'ALL' 
    ? history 
    : history.filter(h => h.status === historyFilter);

  return (
    <div className="max-w-4xl mx-auto min-h-[calc(100vh-80px)] overflow-y-auto px-4 py-8 flex flex-col">
      <div className="text-center mb-8 shrink-0">
        <h1 className="text-3xl font-light tracking-tight text-slate-900 leading-tight">Personal Prayer</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Submit your prayers to God and watch how He answers.</p>
      </div>

      <div className="flex bg-slate-100 p-1 rounded-xl mb-8 max-w-sm mx-auto">
        <button
          onClick={() => setActiveViewTab('ENTRY')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${activeViewTab === 'ENTRY' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          New Prayer
        </button>
        <button
          onClick={() => setActiveViewTab('HISTORY')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${activeViewTab === 'HISTORY' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          My History
        </button>
      </div>

      <div className="flex-1">
        {activeViewTab === 'ENTRY' && (
          <div className="bg-white p-6 md:p-10 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
              <Heart size={160} />
            </div>
            
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <h3 className="text-lg font-bold text-slate-900">What is on your heart today?</h3>
                <div className="flex bg-slate-50 p-1 rounded-xl w-full sm:w-auto">
                  <button
                    onClick={() => setActiveFormat('ACTS')}
                    className={`flex-1 sm:flex-none px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${activeFormat === 'ACTS' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    ACTS Format
                  </button>
                  <button
                    onClick={() => setActiveFormat('Freeform')}
                    className={`flex-1 sm:flex-none px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${activeFormat === 'Freeform' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Freeform
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {activeFormat === 'Freeform' ? (
                  <div>
                    <textarea 
                      required
                      value={content}
                      onChange={e => setContent(e.target.value)}
                      placeholder="Pour out your heart to God..."
                      className="w-full h-48 p-4 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all resize-none text-sm font-medium"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { key: 'adoration', label: 'Adoration', placeholder: 'Praise God for who He is...' },
                      { key: 'confession', label: 'Confession', placeholder: 'Confess your sins to Him...' },
                      { key: 'thanksgiving', label: 'Thanksgiving', placeholder: 'Thank Him for His blessings...' },
                      { key: 'supplication', label: 'Supplication', placeholder: 'Ask for your needs and others...' },
                    ].map(field => (
                      <div key={field.key}>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">{field.label}</label>
                        <textarea 
                          value={acts[field.key as keyof typeof acts]}
                          onChange={e => setActs(prev => ({ ...prev, [field.key]: e.target.value }))}
                          placeholder={field.placeholder}
                          className="w-full h-32 p-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-slate-900 transition-all resize-none text-sm placeholder:text-slate-400"
                        />
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pt-6 border-t border-slate-100">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Category</label>
                    <div className="flex flex-wrap gap-2">
                      {statuses.map(s => (
                        <button
                          key={s.value}
                          type="button"
                          onClick={() => setSelectedStatus(s.value as any)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${selectedStatus === s.value ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-transparent'}`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto mt-4 sm:mt-0 bg-slate-900 text-white px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors disabled:opacity-50 shrink-0"
                  >
                    <Send size={16} />
                    {isSubmitting ? 'Saving...' : 'Save Prayer'}
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
                All Prayers
              </button>
              {statuses.map(s => (
                <button
                  key={s.value}
                  onClick={() => setHistoryFilter(s.value as any)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${historyFilter === s.value ? 'bg-slate-800 text-white' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {filteredHistory.map(entry => (
              <motion.div 
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-6 rounded-3xl border shadow-sm relative overflow-hidden ${entry.status === 'answered' ? 'bg-emerald-50/50 border-emerald-100' : 'bg-white border-slate-100'}`}
              >
                {entry.status === 'answered' && (
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <CheckCircle2 size={80} className="text-emerald-500" />
                  </div>
                )}
                
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      {format(new Date(entry.date || entry.createdAt), 'MMMM dd, yyyy')}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                       <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest ${
                         entry.status === 'answered' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                       }`}>
                         {entry.status}
                       </span>
                    </div>
                  </div>
                  
                  {entry.status !== 'answered' && (
                    <button 
                      onClick={() => markAsAnswered(entry.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 transition-colors"
                    >
                      <CheckCircle2 size={14} /> Mark Answered
                    </button>
                  )}
                </div>

                <div className="relative z-10">
                  {entry.type === 'Freeform' ? (
                    <p className="text-sm text-slate-700 leading-relaxed font-medium">
                      {entry.content}
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Object.entries(entry.acts || {}).filter(([_, val]) => val).map(([key, value]) => (
                        <div key={key} className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                          <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">{key}</div>
                          <div className="text-sm text-slate-700 font-medium">{value as string}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            {filteredHistory.length === 0 && (
              <div className="text-center py-16">
                <Heart size={40} className="mx-auto text-slate-200 mb-4" />
                <p className="text-slate-500 text-sm font-bold">No prayers found in this category.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
