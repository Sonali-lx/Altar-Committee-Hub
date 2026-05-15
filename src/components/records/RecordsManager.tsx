import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Database, 
  MapPin, 
  Calendar, 
  ChevronRight,
  BookOpen,
  ArrowUpRight,
  Plus
} from 'lucide-react';
import { motion } from 'motion/react';

export const RecordsManager: React.FC = () => {
  const { profile } = useAuth();

  const sections = [
    { title: 'College Directory', icon: MapPin, desc: 'Contacts and details of regional colleges.', items: 12 },
    { title: 'Annual Plan 2024', icon: Calendar, desc: 'Strategic goals and committee roadmap.', items: 1 },
    { title: 'Committee Minutes', icon: Database, desc: 'Formal records of all board meetings.', items: 24 },
    { title: 'Event History', icon: ArrowUpRight, desc: 'Archives of past community events.', items: 45 },
    { title: 'Prayer Cell Registry', icon: Users, desc: 'Formal list of all cell leaders and parents.', items: 14 }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-light tracking-tight text-slate-900">Archives & Records</h1>
        <p className="text-slate-500 font-medium mt-1">Official repository for committee documentation and regional data.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section, idx) => (
          <motion.div 
            key={section.title}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm group cursor-pointer hover:shadow-xl hover:shadow-slate-200/50 transition-all flex items-start gap-6"
          >
            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-900 shrink-0 group-hover:bg-slate-900 group-hover:text-white transition-colors">
              <section.icon size={24} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-lg font-bold text-slate-900">{section.title}</h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{section.items} Entries</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">{section.desc}</p>
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-900 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Access Repository</span>
                <ChevronRight size={10} />
              </div>
            </div>
          </motion.div>
        ))}

        <div className="bg-slate-50 p-6 rounded-3xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-slate-400 transition-colors">
          <div className="w-10 h-10 rounded-full border border-dashed border-slate-300 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Plus size={16} className="text-slate-400" />
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Add New Collection</span>
        </div>
      </div>
    </div>
  );
};

const Users = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
