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
  const [viewMode, setViewMode] = useState<'my' | 'discover'>('my');
  const [joinRequests, setJoinRequests] = useState<any[]>([]);

  useEffect(() => {
    const fetchCells = async () => {
      const allCells = await dbService.getPrayerCells();
      if (allCells) {
        setCells(allCells);
      }
      
      if (profile?.uid) {
         const requests = await dbService.getJoinRequests(profile.uid);
         setJoinRequests(requests);
      }
      setLoading(false);
    };
    fetchCells();
  }, [profile]);

  const handleRequestJoin = async (cellId: string) => {
    if (!profile) return;
    await dbService.createJoinRequest(cellId, profile);
    alert("Request sent!");
    // Refresh requests
    const requests = await dbService.getJoinRequests(profile.uid);
    setJoinRequests(requests);
  };

  if (loading) return <div className="p-8 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Prayer Cells...</div>;

  const myCells = cells.filter((c: any) => c.memberIds?.includes(profile?.uid) || c.leaderIds?.includes(profile?.uid) || c.parentIds?.includes(profile?.uid));
  const discoverCells = cells.filter((c: any) => !myCells.find(mc => mc.id === c.id));
  const displayCells = hasRole(['PRAYER_CELL_SECRETARY', 'ADMIN', 'SENIOR_ADVISOR']) ? cells : (viewMode === 'my' ? myCells : discoverCells);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-slate-900">Prayer Cells</h1>
          <p className="text-slate-500 font-medium mt-1">Nurturing small groups for fellowship and prayer.</p>
        </div>
        <div className="flex items-center gap-2">
          {!hasRole(['PRAYER_CELL_SECRETARY', 'ADMIN', 'SENIOR_ADVISOR']) && (
            <div className="flex bg-slate-100 rounded-xl p-1">
               <button 
                 onClick={() => setViewMode('my')}
                 className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${viewMode === 'my' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 My Cells
               </button>
               <button 
                 onClick={() => setViewMode('discover')}
                 className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${viewMode === 'discover' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 Discover
               </button>
            </div>
          )}
          {hasRole(['PRAYER_CELL_SECRETARY']) && (
            <button 
              onClick={onNewCell}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-all bg-white"
            >
              <Plus size={14} />
              Create New
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayCells.map((cell, idx) => {
          const isPending = (joinRequests || []).some(r => r.cellId === cell.id && r.status === 'pending');
          return (
          <motion.div
            key={cell.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => {
              if (viewMode === 'my' || hasRole(['PRAYER_CELL_SECRETARY', 'ADMIN', 'SENIOR_ADVISOR'])) {
                onSelectCell(cell.id);
              }
            }}
            className={`bg-white p-6 rounded-3xl border border-slate-100 shadow-sm transition-all group ${viewMode === 'my' || hasRole(['PRAYER_CELL_SECRETARY', 'ADMIN', 'SENIOR_ADVISOR']) ? 'hover:shadow-xl hover:shadow-slate-200/50 cursor-pointer' : ''}`}
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
            <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 flex-wrap">
              <div className="flex items-center gap-1">
                <Users size={12} />
                <span>{cell.memberIds?.length || 0} Members</span>
              </div>
              <div className="flex items-center gap-1">
                {cell.category === 'Online' ? <Globe size={12} /> : <MapPin size={12} />}
                <span>{cell.place || 'General'}</span>
              </div>
              {cell.region && (
                <div className="flex items-center gap-1">
                  <MapPin size={12} />
                  <span>{cell.region}</span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
              {viewMode === 'discover' && !hasRole(['PRAYER_CELL_SECRETARY', 'ADMIN', 'SENIOR_ADVISOR']) ? (
                <button
                  disabled={isPending}
                  onClick={(e) => { e.stopPropagation(); handleRequestJoin(cell.id); }}
                  className="w-full py-2 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-slate-800 disabled:opacity-50 transition-all"
                >
                  {isPending ? 'Request Pending' : 'Request to Join'}
                </button>
              ) : (
                <>
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
                </>
              )}
            </div>
          </motion.div>
        )})}

        {displayCells.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
            <Users className="mx-auto text-slate-200 mb-4" size={48} />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No Prayer Cells found</p>
          </div>
        )}
      </div>
    </div>
  );
};
