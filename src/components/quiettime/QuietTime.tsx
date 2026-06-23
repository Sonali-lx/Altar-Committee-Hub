import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/db';
import { 
  BookOpen, 
  Share2, 
  Send,
  Sparkles,
  List,
  Search
} from 'lucide-react';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { QuietTime as QuietTimeType } from '../../types';

export const QuietTime: React.FC = () => {
  const { profile } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'ASPECT' | 'Freeform'>('ASPECT');
  const [passage, setPassage] = useState('');
  const [content, setContent] = useState('');
  const [aspect, setAspect] = useState({
    aboutGod: '',
    sinsToAvoid: '',
    promisesToClaim: '',
    examplesToFollow: '',
    commandsToObey: '',
    theme: ''
  });
  const [isShared, setIsShared] = useState(true);
  const [history, setHistory] = useState<QuietTimeType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [activeViewTab, setActiveViewTab] = useState<'ENTRY' | 'HISTORY' | 'FORUM'>('ENTRY');

  // Bible API states
  const [bibleQuery, setBibleQuery] = useState('');
  const [bibleText, setBibleText] = useState('');
  const [bibleReference, setBibleReference] = useState('');
  const [isFetchingBible, setIsFetchingBible] = useState(false);
  const [bibleError, setBibleError] = useState('');

  useEffect(() => {
    fetchHistory();
  }, [profile?.uid]);

  const fetchHistory = async () => {
    const records = await dbService.getQuietTimes();
    if (records) {
      setHistory(records as QuietTimeType[]);
    }
  };

  const fetchBiblePassage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!bibleQuery.trim()) return;
    
    setIsFetchingBible(true);
    setBibleError('');
    try {
      const response = await fetch(`https://bible-api.com/${encodeURIComponent(bibleQuery)}`);
      if (!response.ok) {
        throw new Error('Not found');
      }
      const data = await response.json();
      setBibleText(data.text);
      setBibleReference(data.reference);
      setPassage(data.reference);
    } catch (err) {
      setBibleError('Could not find passage. Please try a valid reference like "John 3:16".');
      setBibleText('');
      setBibleReference('');
    } finally {
      setIsFetchingBible(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsSubmitting(true);
    
    try {
      await dbService.addQuietTime({
        userId: profile.uid,
        userName: profile.name,
        date: new Date().toISOString().split('T')[0],
        passage,
        type: activeTab,
        content: activeTab === 'Freeform' ? content : undefined,
        aspect: activeTab === 'ASPECT' ? aspect : undefined,
        isShared
      });
      
      // Reset form
      setPassage('');
      setContent('');
      setBibleQuery('');
      setBibleText('');
      setBibleReference('');
      setAspect({
        aboutGod: '', sinsToAvoid: '', promisesToClaim: '', 
        examplesToFollow: '', commandsToObey: '', theme: ''
      });
      fetchHistory();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto min-h-[calc(100vh-80px)] lg:h-[calc(100vh-80px)] flex flex-col">
      <div className="text-center mb-6 shrink-0 mt-4 px-4">
        <h1 className="text-3xl font-light tracking-tight text-slate-900 leading-tight">Quiet Time</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Reflect on the word and share your heart with the community.</p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 pb-6 px-4 lg:min-h-0">
          
        {/* Left Column: Bible Reading */}
        <div className="flex-1 bg-slate-50 rounded-3xl border border-slate-200 shadow-inner flex flex-col min-h-[400px] overflow-hidden lg:h-full">
          <div className="p-4 border-b border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-2">
              <BookOpen size={18} className="text-slate-700" />
              <h3 className="text-sm font-bold text-slate-900">Bible Reader</h3>
            </div>
            <form onSubmit={fetchBiblePassage} className="flex items-center gap-2">
              <div className="relative">
                <input 
                  value={bibleQuery}
                  onChange={e => setBibleQuery(e.target.value)}
                  placeholder="e.g. John 3:16"
                  className="w-full sm:w-64 text-sm py-2 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 transition-all font-medium"
                />
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
              <button 
                type="submit"
                disabled={isFetchingBible || !bibleQuery.trim()}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold disabled:opacity-50 hover:bg-slate-800 transition-colors shrink-0"
              >
                Read
              </button>
            </form>
          </div>
          
          <div className="p-6 md:p-10 flex-1 overflow-y-auto relative">
            {isFetchingBible ? (
              <div className="text-center mt-20">
                <div className="w-8 h-8 md:w-10 md:h-10 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="font-sans font-medium text-slate-400 text-sm">Fetching passage...</p>
              </div>
            ) : bibleText ? (
              <div className="max-w-2xl mx-auto">
                <h2 className="text-xl md:text-2xl font-serif mb-6 text-slate-900 border-b border-slate-200 pb-4">{bibleReference}</h2>
                <div className="text-base md:text-lg text-slate-700 font-serif leading-loose whitespace-pre-wrap">
                  {bibleText}
                </div>
              </div>
            ) : bibleError ? (
              <div className="text-center mt-20">
                <div className="text-red-500 font-medium mb-2">{bibleError}</div>
              </div>
            ) : (
              <div className="text-center mt-20">
                <BookOpen size={48} className="mx-auto text-slate-300 md:text-slate-200 mb-4" />
                <p className="font-sans text-sm md:text-base text-slate-400 font-medium px-4">Search for a passage above to read it here.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Journal Entry & History */}
        <div className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col min-h-[600px] overflow-hidden lg:h-full">
          <div className="p-4 md:p-8 flex-1 overflow-y-auto">
            <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
              <button
                onClick={() => setActiveViewTab('ENTRY')}
                className={`flex-1 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${activeViewTab === 'ENTRY' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                New Entry
              </button>
              <button
                onClick={() => setActiveViewTab('HISTORY')}
                className={`flex-1 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${activeViewTab === 'HISTORY' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                My History
              </button>
              <button
                onClick={() => setActiveViewTab('FORUM')}
                className={`flex-1 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${activeViewTab === 'FORUM' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Forum
              </button>
            </div>

            {activeViewTab === 'ENTRY' && (
              <>
                <div className="flex bg-slate-50 p-1 rounded-xl mb-6 max-w-sm">
                  <button
                    onClick={() => setActiveTab('ASPECT')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${activeTab === 'ASPECT' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <List size={14} /> ASPECT format
                  </button>
                  <button
                    onClick={() => setActiveTab('Freeform')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${activeTab === 'Freeform' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <Sparkles size={14} /> Freeform
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Bible Passage Ref.</label>
                    <input 
                      required
                      value={passage}
                      onChange={e => setPassage(e.target.value)}
                      placeholder="e.g. Psalm 23"
                      className="w-full sm:w-1/2 p-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all text-sm font-medium"
                    />
                  </div>

                  {activeTab === 'Freeform' ? (
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">What did God speak to me today?</label>
                      <textarea 
                        required
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        placeholder="Write your reflections..."
                        className="w-full h-40 p-4 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all resize-none text-sm font-medium"
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { key: 'aboutGod', label: 'A - About God' },
                        { key: 'sinsToAvoid', label: 'S - Sins to avoid' },
                        { key: 'promisesToClaim', label: 'P - Promises to claim' },
                        { key: 'examplesToFollow', label: 'E - Examples to follow' },
                        { key: 'commandsToObey', label: 'C - Commands to obey' },
                        { key: 'theme', label: 'T - Theme of the passage' },
                      ].map(field => (
                        <div key={field.key}>
                          <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-widest mb-1.5">{field.label}</label>
                          <textarea 
                            value={aspect[field.key as keyof typeof aspect]}
                            onChange={e => setAspect(prev => ({ ...prev, [field.key]: e.target.value }))}
                            className="w-full h-24 p-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-slate-900 transition-all resize-none text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
                    <button 
                      type="button" 
                      onClick={() => setIsShared(!isShared)}
                      className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all ${isShared ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}
                    >
                      <Share2 size={14} />
                      {isShared ? 'Shared on Forum' : 'Keep Private'}
                    </button>
                    
                    <button 
                      type="submit"
                      disabled={isSubmitting || !passage}
                      className="w-full sm:w-auto bg-slate-900 text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors disabled:opacity-50"
                    >
                      <Send size={16} />
                      {isSubmitting ? 'Saving...' : 'Save Entry'}
                    </button>
                  </div>
                </form>
              </>
            )}

            {activeViewTab === 'HISTORY' && (
              <div className="space-y-6">
                {history.filter(h => h.userId === profile?.uid).map(entry => (
                  <motion.div 
                    key={entry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-50 p-4 sm:p-6 rounded-3xl border border-slate-100 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="text-xs font-bold text-slate-900">
                          {format(new Date(entry.date || entry.createdAt), 'EEEE, MMMM dd, yyyy')}
                        </div>
                        {!entry.isShared && <div className="text-[10px] font-bold text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full">Private</div>}
                      </div>
                      <div className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100">
                        {entry.passage}
                      </div>
                    </div>

                    {entry.type === 'Freeform' ? (
                      <p className="text-sm text-slate-600 leading-relaxed italic border-l-2 border-slate-300 pl-4 py-1">
                        "{entry.content}"
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                        {Object.entries(entry.aspect || {}).filter(([_, val]) => val).map(([key, value]) => {
                          const labels: Record<string, string> = {
                            aboutGod: 'About God', sinsToAvoid: 'Sins to avoid', promisesToClaim: 'Promises',
                            examplesToFollow: 'Examples', commandsToObey: 'Commands', theme: 'Theme'
                          };
                          return (
                            <div key={key} className="bg-white p-3 rounded-xl border border-slate-100">
                              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{labels[key]}</div>
                              <div className="text-sm text-slate-700">{value as string}</div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                ))}
                {history.filter(h => h.userId === profile?.uid).length === 0 && (
                  <div className="text-center py-10 text-slate-400 text-sm font-medium">You haven't written any reflections yet.</div>
                )}
              </div>
            )}

            {activeViewTab === 'FORUM' && (
              <div className="space-y-6">
                {history.filter(h => h.isShared).map(entry => (
                  <motion.div 
                    key={entry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-50 p-4 sm:p-6 rounded-3xl border border-slate-100 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 shrink-0">
                          {(entry as any).userName?.slice(0,2).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">
                            {(entry as any).userName || 'Unknown User'} 
                            {entry.userId === profile?.uid && ' (You)'}
                          </div>
                          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                            {format(new Date(entry.date || entry.createdAt), 'MMM dd, yyyy')} • {entry.passage}
                          </div>
                        </div>
                      </div>
                    </div>

                    {entry.type === 'Freeform' ? (
                      <p className="text-sm text-slate-600 leading-relaxed italic border-l-2 border-slate-300 pl-4 py-1">
                        "{entry.content}"
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                        {Object.entries(entry.aspect || {}).filter(([_, val]) => val).map(([key, value]) => {
                          const labels: Record<string, string> = {
                            aboutGod: 'About God', sinsToAvoid: 'Sins to avoid', promisesToClaim: 'Promises',
                            examplesToFollow: 'Examples', commandsToObey: 'Commands', theme: 'Theme'
                          };
                          return (
                            <div key={key} className="bg-white p-3 rounded-xl border border-slate-100">
                              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{labels[key]}</div>
                              <div className="text-sm text-slate-700">{value as string}</div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                ))}
                {history.filter(h => h.isShared).length === 0 && (
                  <div className="text-center py-10 text-slate-400 text-sm font-medium">No reflections shared today.</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


