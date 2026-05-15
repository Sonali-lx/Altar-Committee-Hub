import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Calendar, 
  MapPin, 
  Plus,
  Users
} from 'lucide-react';
import { motion } from 'motion/react';
import { format } from 'date-fns';

export const EventList: React.FC = () => {
  const { hasRole } = useAuth();
  const canCreate = hasRole(['SECRETARY', 'ADMIN', 'PRESIDENT']);

  const dummyEvents = [
    { id: '1', title: 'Annual Committee Meeting', date: new Date().toISOString(), location: 'Main Hall', attendees: 45, type: 'Official' },
    { id: '2', title: 'Youth Retreat Preparation', date: new Date(Date.now() + 86400000 * 3).toISOString(), location: 'Room 2B', attendees: 12, type: 'Planning' },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-slate-900">Community Events</h1>
          <p className="text-slate-500 font-medium mt-1">Schedules, gatherings, and official committee meetings.</p>
        </div>
        
        {canCreate && (
          <button 
            className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold shadow-xl shadow-slate-200 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus size={18} />
            New Event
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main List */}
        <div className="lg:col-span-2 space-y-4">
          {dummyEvents.map((ev, idx) => (
            <motion.div 
              key={ev.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center gap-6 group cursor-pointer hover:shadow-xl hover:shadow-slate-200/50 transition-all"
            >
              <div className="flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-slate-50 text-slate-900 shrink-0">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{format(new Date(ev.date), 'MMM')}</span>
                <span className="text-xl font-bold">{format(new Date(ev.date), 'dd')}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest bg-emerald-50 text-emerald-600">
                    {ev.type}
                  </span>
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                    <Calendar size={12} />
                    {format(new Date(ev.date), 'h:mm a')}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">{ev.title}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                  <span className="flex items-center gap-1"><MapPin size={14} /> {ev.location}</span>
                  <span className="flex items-center gap-1"><Users size={14} /> {ev.attendees} Attending</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Sidebar Mini Calendar Placeholder */}
        <div className="bg-slate-50 p-6 rounded-3xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-center h-64">
           <Calendar className="text-slate-300 mb-4" size={32} />
           <span className="text-sm font-bold text-slate-400">Calendar Sync</span>
           <p className="text-xs text-slate-500 mt-2 max-w-[200px]">Coming soon: Sync official events directly to your Google Calendar.</p>
        </div>
      </div>
    </div>
  );
};
