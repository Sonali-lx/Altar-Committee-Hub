import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PrayerCellRegistry } from './PrayerCellRegistry';
import { EventRegistry } from './EventRegistry';
import { MembershipRegistry } from './MembershipRegistry';
import { CollegeRegistry } from './CollegeRegistry';
import { 
  ChevronRight,
  Users as UsersIcon,
  Building
} from 'lucide-react';
import { motion } from 'motion/react';

export const RecordsManager: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const baseSections = [
    { title: 'Prayer Cell Registry', icon: Users, desc: 'Formal list of all cell leaders and parents.', items: 'Live' },
    { title: 'Membership Registry', icon: UsersIcon, desc: 'Detailed records of members and their associated cells.', items: 'Live' },
    { title: 'College Registry', icon: Building, desc: 'Keep track of colleges in our region and related prayer cells.', items: 'Live' },
    { title: 'Event Registry', icon: CalendarIconCustom, desc: 'Official event archives, categories (EvaCa, MEET, HSS, etc.), and attendance.', items: 'Live' }
  ];

  if (activeSection === 'Prayer Cell Registry') {
    return <PrayerCellRegistry onBack={() => setActiveSection(null)} />;
  }
  if (activeSection === 'Membership Registry') {
    return <MembershipRegistry onBack={() => setActiveSection(null)} />;
  }
  if (activeSection === 'College Registry') {
    return <CollegeRegistry onBack={() => setActiveSection(null)} />;
  }
  if (activeSection === 'Event Registry') {
    return <EventRegistry onBack={() => setActiveSection(null)} />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-light tracking-tight text-slate-900">Archives & Records</h1>
        <p className="text-slate-500 font-medium mt-1">Official repository for committee documentation and regional data.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {baseSections.map((section, idx) => (
          <motion.div 
            key={section.title}
            onClick={() => setActiveSection(section.title)}
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

const CalendarIconCustom = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
