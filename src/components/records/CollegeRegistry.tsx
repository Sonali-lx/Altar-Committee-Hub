import React, { useState, useEffect } from 'react';
import { ChevronLeft, Plus, Building, Search, Phone, Trash2, Edit } from 'lucide-react';
import { dbService } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

export const CollegeRegistry: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { hasRole } = useAuth();
  const canCreate = hasRole(['SECRETARY', 'ADMIN', 'PRESIDENT', 'SENIOR_ADVISOR', 'CELL_LEADER', 'CELL_PARENT']);
  
  const [colleges, setColleges] = useState<any[]>([]);
  const [cells, setCells] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ id: '', name: '', contact: '', cellNames: '' });

  const fetchData = async () => {
    setLoading(true);
    const [cols, activeCells] = await Promise.all([
      dbService.getColleges(),
      dbService.getPrayerCells()
    ]);
    if (cols) setColleges(cols);
    if (activeCells) setCells(activeCells);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (formData.id) {
      await dbService.updateCollege(formData.id, {
        name: formData.name,
        contact: formData.contact,
        cellNames: formData.cellNames
      });
    } else {
      await dbService.addCollege({
        name: formData.name,
        contact: formData.contact,
        cellNames: formData.cellNames,
        createdAt: new Date().toISOString()
      });
    }
    setFormData({ id: '', name: '', contact: '', cellNames: '' });
    setShowForm(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this college record?")) {
      await dbService.deleteCollege(id);
      fetchData();
    }
  };

  const filtered = colleges.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()) || c.cellNames?.toLowerCase().includes(search.toLowerCase()));

  if (loading) {
     return <div className="p-8 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Colleges...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500">
          <ChevronLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-light tracking-tight text-slate-900">College Registry</h2>
          <p className="text-slate-500 text-sm">Colleges in our region</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-2 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex-1 flex items-center gap-3 px-4">
          <Search size={20} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Search colleges..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-none focus:outline-none text-slate-700 placeholder:text-slate-400 text-sm"
          />
        </div>
        {canCreate && (
          <button 
            onClick={() => {
              setFormData({ id: '', name: '', contact: '', cellNames: '' });
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-colors shrink-0"
          >
            <Plus size={16} /> Add College
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(col => (
          <motion.div key={col.id} initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 relative group overflow-hidden">
             <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none text-indigo-900"><Building size={80} /></div>
             <div className="relative z-10">
               <h3 className="text-lg font-bold text-slate-900 mb-1 leading-tight">{col.name}</h3>
               {col.contact && <p className="text-sm text-slate-500 flex items-center gap-1 mb-3"><Phone size={14}/> {col.contact}</p>}
               
               <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Prayer Cells</p>
                  <p className="text-sm font-medium text-slate-700">{col.cellNames || 'None defined'}</p>
               </div>

               {canCreate && (
                 <div className="mt-4 flex gap-2">
                   <button onClick={() => { setFormData(col); setShowForm(true); }} className="text-indigo-600 hover:text-indigo-800 bg-indigo-50 p-2 rounded-lg transition-colors"><Edit size={14} /></button>
                   <button onClick={() => handleDelete(col.id)} className="text-red-600 hover:text-red-800 bg-red-50 p-2 rounded-lg transition-colors"><Trash2 size={14} /></button>
                 </div>
               )}
             </div>
          </motion.div>
        ))}
        {filtered.length === 0 && <p className="text-slate-400 text-sm italic py-8 col-span-full text-center">No colleges found.</p>}
      </div>

      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <motion.div initial={{opacity:0, scale: 0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale: 0.95}} className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-8" onClick={e=>e.stopPropagation()}>
                <h2 className="text-xl font-bold text-slate-900 mb-6">{formData.id ? 'Edit College' : 'Add College'}</h2>
                <form onSubmit={handleSave} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">College Name *</label>
                    <input type="text" required value={formData.name} onChange={e=>setFormData({...formData, name:e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm" placeholder="e.g. Regional Engineering College" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Contact Available</label>
                    <input type="text" value={formData.contact} onChange={e=>setFormData({...formData, contact:e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm" placeholder="e.g. John Doe (555-0192)" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Prayer Cells Present</label>
                    <input type="text" value={formData.cellNames} onChange={e=>setFormData({...formData, cellNames:e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm" placeholder="e.g. Alpha Cell, Beta Cell" />
                    <p className="text-xs text-slate-500 mt-1">Available active cells: {cells.map(c=>c.name).join(', ')}</p>
                  </div>
                  <div className="flex gap-2 justify-end pt-4 border-t border-slate-100">
                    <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 text-slate-500 font-bold uppercase tracking-widest text-[10px] hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
                    <button type="submit" className="px-6 py-3 bg-slate-900 text-white font-bold uppercase tracking-widest text-[10px] rounded-xl hover:bg-slate-800 transition-colors">Save Details</button>
                  </div>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
