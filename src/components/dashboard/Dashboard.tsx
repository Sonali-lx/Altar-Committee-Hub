import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Clock, 
  ArrowUpRight,
  Plus
} from 'lucide-react';
import { motion } from 'motion/react';
import { dbService } from '../../services/db';

export const Dashboard: React.FC<{ onNewCell: () => void }> = ({ onNewCell }) => {
  const { profile, hasRole } = useAuth();
  const [stats, setStats] = useState({
    cells: 0,
    members: 0,
    balance: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      const cells = await dbService.getPrayerCells();
      setStats({
        cells: cells?.length || 0,
        members: cells?.reduce((acc, c: any) => acc + (c.memberIds?.length || 0), 0) || 0,
        balance: 4280.00 // Placeholder for now
      });
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex justify-between items-end">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-4xl font-light tracking-tight text-slate-900 leading-tight">
            Hello, <span className="font-bold">{profile?.name}</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1">Here is what's happening in the committee today.</p>
        </motion.div>
        
        {hasRole(['PRAYER_CELL_SECRETARY']) && (
          <button 
            onClick={onNewCell}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold shadow-xl shadow-slate-200 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus size={18} />
            New Prayer Cell
          </button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4 border border-blue-100">
            <Users size={24} />
          </div>
          <div className="text-4xl font-light text-slate-900">{stats.cells}</div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Active Prayer Cells</div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4 border border-emerald-100">
            <Users size={24} />
          </div>
          <div className="text-4xl font-light text-slate-900">{stats.members}</div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Total Members</div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 mb-4 border border-amber-100">
            <DollarSign size={24} />
          </div>
          <div className="text-4xl font-light text-slate-900">${stats.balance.toLocaleString()}</div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Social Fund Balance</div>
        </motion.div>
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Events */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Upcoming Events</h3>
            <button className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">See All</button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 group cursor-pointer hover:bg-slate-100 transition-all">
              <div className="w-12 h-12 rounded-xl bg-white flex flex-col items-center justify-center shadow-sm shrink-0 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Oct</span>
                <span className="text-lg font-bold text-slate-900 leading-none">12</span>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-900">Annual Gala Meeting</h4>
                <p className="text-xs text-slate-500 mt-0.5">Central Hall, 6:00 PM</p>
              </div>
              <ArrowUpRight size={16} className="text-slate-300 group-hover:text-slate-900 transition-colors" />
            </div>
            {/* Empty States logic can be added here */}
          </div>
        </div>

        {/* Recent Activity / Announcements */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Recent Activity</h3>
            <Clock size={18} className="text-slate-300" />
          </div>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
              <div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  <span className="font-bold text-slate-900">Sarah Jenkins</span> created 2 new records for the <span className="font-bold text-slate-900 underline decoration-blue-200">Bible Seminar</span>.
                </p>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">2 hours ago</span>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  <span className="font-bold text-slate-900">Prayer Secretary</span> posted the dawn prayer link for tomorrow.
                </p>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">5 hours ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
