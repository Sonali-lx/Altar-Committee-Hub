import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PrayerCellRegistry } from './PrayerCellRegistry';
import { EventRegistry } from './EventRegistry';
import { MembershipRegistry } from './MembershipRegistry';
import { CollegeRegistry } from './CollegeRegistry';
import { dbService } from '../../services/db';
import { 
  Database, 
  MapPin, 
  Calendar, 
  ChevronRight,
  BookOpen,
  ArrowUpRight,
  Plus,
  Users as UsersIcon,
  Building
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const RecordsManager: React.FC = () => {
  const { profile, hasRole } = useAuth();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [collections, setCollections] = useState<any[]>([]);

  const canCreate = hasRole(['SECRETARY', 'ADMIN', 'PRESIDENT', 'SENIOR_ADVISOR', 'CELL_LEADER', 'CELL_PARENT']);

  const [showAddCollectionModal, setShowAddCollectionModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    const data = await dbService.getEventCollections();
    if (data) setCollections(data);
  };

  const handleAddCollection = async () => {
    if (newCollectionName && newCollectionName.trim()) {
      await dbService.createEventCollection(newCollectionName.trim());
      setNewCollectionName('');
      setShowAddCollectionModal(false);
      fetchCollections();
    }
  };

  const baseSections = [
    { title: 'Prayer Cell Registry', icon: Users, desc: 'Formal list of all cell leaders and parents.', items: 'Live' },
    { title: 'Membership Registry', icon: UsersIcon, desc: 'Detailed records of members and their associated cells.', items: 'Live' },
    { title: 'College Registry', icon: Building, desc: 'Keep track of colleges in our region and related prayer cells.', items: 'Live' },
    { title: 'Event Registry', icon: CalendarIconCustom, desc: 'Historical records of official events and attendances.', items: 'Live' }
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
  
  if (activeSection && activeSection.startsWith('col_')) {
    const colId = activeSection.replace('col_', '');
    return <EventRegistry onBack={() => setActiveSection(null)} initialCollectionId={colId} />;
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

        {collections.map((col, idx) => (
          <motion.div 
            key={col.id}
            onClick={() => setActiveSection('col_' + col.id)}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: (baseSections.length + idx) * 0.05 }}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm group cursor-pointer hover:shadow-xl hover:shadow-slate-200/50 transition-all flex items-start gap-6"
          >
            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-900 shrink-0 group-hover:bg-slate-900 group-hover:text-white transition-colors">
              <BookOpen size={24} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-lg font-bold text-slate-900">{col.name}</h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Custom</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">User-defined archive collection.</p>
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-900 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Access Repository</span>
                <ChevronRight size={10} />
              </div>
            </div>
          </motion.div>
        ))}

        {canCreate && (
          <div onClick={() => setShowAddCollectionModal(true)} className="bg-slate-50 p-6 rounded-3xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-slate-400 transition-colors">
            <div className="w-10 h-10 rounded-full border border-dashed border-slate-300 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Plus size={16} className="text-slate-400" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Add New Collection</span>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showAddCollectionModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-slate-900 mb-4">Add Event Collection</h3>
              <input
                type="text"
                placeholder="Collection Name"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white mb-4"
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowAddCollectionModal(false)}
                  className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-colors text-sm uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCollection}
                  disabled={!newCollectionName.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white font-bold hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-50 text-sm uppercase tracking-widest"
                >
                  Create
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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
