import React, { useEffect, useState } from 'react';
import { dbService } from '../../services/db';
import { PrayerCell, UserProfile } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, 
  MapPin, 
  Globe, 
  Clock, 
  ChevronRight, 
  MessageCircle,
  Plus
} from 'lucide-react';
import { motion } from 'motion/react';

export const CellList: React.FC<{ onSelectCell: (id: string) => void, onNewCell?: () => void }> = ({ onSelectCell, onNewCell }) => {
  const { profile, hasRole } = useAuth();
  const [cells, setCells] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCells = async () => {
      const allCells = await dbService.getPrayerCells();
      if (allCells) {
        // Filter based on role: Admin see all, others see their own cells
        const filtered = hasRole(['PRAYER_CELL_SECRETARY', 'ADMIN', 'SENIOR_ADVISOR']) 
          ? allCells 
          : allCells.filter((c: any) => c.memberIds?.includes(profile?.uid));
        setCells(filtered);
      }
      setLoading(false);
    };
    fetchCells();
  }, [profile, hasRole]);

  if (loading) return <div className="p-8 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Prayer Cells...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-slate-900">Prayer Cells</h1>
          <p className="text-slate-500 font-medium mt-1">Nurturing small groups for fellowship and prayer.</p>
        </div>
        {hasRole(['PRAYER_CELL_SECRETARY']) && (
          <button 
            onClick={onNewCell}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-all"
          >
            <Plus size={14} />
            Create New
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cells.map((cell, idx) => (
          <motion.div
            key={cell.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => onSelectCell(cell.id)}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-6">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold italic text-white shadow-lg ${
                cell.genderType === 'Boys' ? 'bg-blue-500' : cell.genderType === 'Girls' ? 'bg-rose-500' : 'bg-slate-900'
              }`}>
                {cell.name.charAt(0)}
              </div>
              <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-lg border ${
                cell.category === 'Online' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
              }`}>
                {cell.category}
              </span>
            </div>
            
            <h3 className="text-lg font-bold text-slate-900 mb-1">{cell.name}</h3>
            <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">
              <div className="flex items-center gap-1">
                <Users size={12} />
                <span>{cell.memberIds?.length || 0} Members</span>
              </div>
              <div className="flex items-center gap-1">
                {cell.category === 'Online' ? <Globe size={12} /> : <MapPin size={12} />}
                <span>{cell.place || 'General'}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200" />
                ))}
                {(cell.memberIds?.length > 3) && (
                  <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-400">
                    +{cell.memberIds.length - 3}
                  </div>
                )}
              </div>
              <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-900 transform group-hover:translate-x-1 transition-all" />
            </div>
          </motion.div>
        ))}

        {cells.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
            <Users className="mx-auto text-slate-200 mb-4" size={48} />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No Prayer Cells found</p>
          </div>
        )}
      </div>
    </div>
  );
};
