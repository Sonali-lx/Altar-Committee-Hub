import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/db';
import { Sunrise, Sunset, Calendar, Edit2, Check, Video, Plus, MessagesSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const DawnDuskPrayers: React.FC = () => {
  const { profile, hasRole } = useAuth();
  const canManage = hasRole(['PRAYER_SECRETARY', 'ADMIN', 'PRESIDENT']);
  
  const [links, setLinks] = useState({ dawn: '', dusk: '', fasting: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [prayers, setPrayers] = useState<any[]>([]);
  const [newPrayer, setNewPrayer] = useState('');

  useEffect(() => {
    fetchLinks();
    fetchPrayers();
  }, []);

  const fetchLinks = async () => {
    const data = await dbService.getPrayerLinks();
    if (data) setLinks({ dawn: data.dawn || '', dusk: data.dusk || '', fasting: data.fasting || '' });
  };

  const fetchPrayers = async () => {
    const data = await dbService.getDawnDuskPrayers();
    setPrayers(data);
  };

  const handleSaveLinks = async () => {
    await dbService.updatePrayerLinks(links);
    setIsEditing(false);
    fetchLinks();
  };

  const handlePostPrayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !newPrayer.trim()) return;
    await dbService.createDawnDuskPrayer(profile.uid, profile.name, newPrayer);
    setNewPrayer('');
    fetchPrayers();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-slate-900">Corporate Prayers</h1>
          <p className="text-slate-500 mt-1">Join the community in daily morning and evening prayers.</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Calendar size={120} />
        </div>
        
        <div className="flex justify-between items-center mb-6 relative z-10">
           <h2 className="text-lg font-bold text-slate-900">Online Prayer Meets</h2>
           {canManage && (
             <button onClick={() => isEditing ? handleSaveLinks() : setIsEditing(true)} className="flex items-center gap-2 text-sm font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors">
               {isEditing ? <><Check size={16}/> Save Links</> : <><Edit2 size={16}/> Edit Links</>}
             </button>
           )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          {[
            { id: 'dawn', title: 'Dawn Prayer', icon: Sunrise, time: 'Morning', color: 'text-amber-500', bg: 'bg-amber-50', link: links.dawn },
            { id: 'dusk', title: 'Dusk Prayer', icon: Sunset, time: 'Evening', color: 'text-indigo-500', bg: 'bg-indigo-50', link: links.dusk },
            { id: 'fasting', title: 'Monthly Fasting', icon: Plus, time: '1st Sunday', color: 'text-emerald-500', bg: 'bg-emerald-50', link: links.fasting }
          ].map(p => (
            <div key={p.id} className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
               <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${p.bg} ${p.color}`}>
                 <p.icon size={24} />
               </div>
               <h3 className="font-bold text-slate-900">{p.title}</h3>
               <p className="text-sm text-slate-500 mb-4">{p.time}</p>
               
               {isEditing ? (
                 <input 
                   type="url" 
                   value={links[p.id as keyof typeof links]} 
                   onChange={e => setLinks({...links, [p.id]: e.target.value})}
                   placeholder="Meeting link..."
                   className="w-full text-sm px-3 py-2 rounded border border-slate-200"
                 />
               ) : (
                 p.link ? (
                   <a href={p.link} target="_blank" rel="noreferrer" className="inline-flex w-full items-center justify-center gap-2 py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition-colors">
                     <Video size={16} /> Join Meet
                   </a>
                 ) : (
                   <div className="text-sm font-medium text-slate-400 py-2 text-center bg-slate-100 rounded-xl">No link yet</div>
                 )
               )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
         <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <MessagesSquare size={20} className="text-slate-400" />
            Prayer Requests & Updates
         </h2>
         
         <form onSubmit={handlePostPrayer} className="mb-8">
           <textarea 
              value={newPrayer}
              onChange={e => setNewPrayer(e.target.value)}
              placeholder="Share a prayer request or testimony..."
              className="w-full border border-slate-200 rounded-xl p-4 resize-none h-24 mb-3"
           />
           <button type="submit" disabled={!newPrayer.trim()} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-colors">
             Post Prayer
           </button>
         </form>

         <div className="space-y-4">
           {prayers.map(prayer => (
             <motion.div key={prayer.id} initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
               <div className="font-bold text-sm text-slate-900 mb-1">{prayer.authorName}</div>
               <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{prayer.text}</div>
               <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-3">
                 {new Date(prayer.createdAt).toLocaleDateString()}
               </div>
             </motion.div>
           ))}
           {prayers.length === 0 && <p className="text-slate-500 text-center py-4">No prayer requests yet.</p>}
         </div>
      </div>
    </div>
  );
};
