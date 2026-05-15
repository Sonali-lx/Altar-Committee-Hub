import React, { useState } from 'react';
import { dbService } from '../../services/db';
import { X, Users, MapPin, Loader2 } from 'lucide-react';

interface CreateCellModalProps {
  onClose: () => void;
  onCreated: (cellId: string) => void;
}

export const CreateCellModal: React.FC<CreateCellModalProps> = ({ onClose, onCreated }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('Adult');
  const [genderType, setGenderType] = useState('Mixed');
  const [category, setCategory] = useState('General');
  const [place, setPlace] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const cellId = await dbService.createPrayerCell({
        name,
        type,
        genderType,
        category,
        place,
        members: []
      });
      if (cellId) {
        onCreated(cellId);
      } else {
        alert('Failed to create prayer cell (no ID returned)');
      }
    } catch (e) {
      console.error(e);
      alert('Error creating prayer cell');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">Create New Prayer Cell</h2>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-900 transition-colors bg-slate-50 hover:bg-slate-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="create-cell-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cell Name</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Hope Valley Cell"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all font-medium text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Demographic Focus</label>
                <select 
                  value={type}
                  onChange={e => setType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-slate-900 bg-white"
                >
                  <option value="Adult">Adult</option>
                  <option value="Youth">Youth</option>
                  <option value="Senior">Senior</option>
                  <option value="Children">Children</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gender Setting</label>
                <select 
                  value={genderType}
                  onChange={e => setGenderType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-slate-900 bg-white"
                >
                  <option value="Mixed">Mixed</option>
                  <option value="Mens">Men Only</option>
                  <option value="Womens">Women Only</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Meeting Category</label>
              <select 
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-slate-900 bg-white"
              >
                <option value="General">General</option>
                <option value="Professional">Professional / Corporate</option>
                <option value="Campus">Campus / Student</option>
                <option value="Online">Online / Virtual</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Location / Place</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  required
                  value={place}
                  onChange={e => setPlace(e.target.value)}
                  placeholder="e.g. 123 Main St, Springfield"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all font-medium text-slate-900"
                />
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-slate-100 flex gap-4">
          <button 
            type="button"
            onClick={onClose}
            className="flex-1 py-4 font-bold text-slate-500 hover:text-slate-900 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            form="create-cell-form"
            disabled={isSubmitting}
            className="flex-[2] py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Users size={18} />}
            {isSubmitting ? 'Creating...' : 'Create Cell'}
          </button>
        </div>
      </div>
    </div>
  );
};
