import React, { useEffect, useState } from 'react';
import { dbService } from '../../services/db';
import { PrayerCell, CellMeeting, UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { 
  Calendar, 
  MapPin, 
  Globe, 
  Plus, 
  Video, 
  CheckCircle2, 
  XCircle, 
  Users,
  ExternalLink,
  MessageCircle,
  ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

export const CellDetail: React.FC<{ cellId: string, onBack: () => void }> = ({ cellId, onBack }) => {
  const { profile, hasRole } = useAuth();
  const [cell, setCell] = useState<PrayerCell | null>(null);
  const [meetings, setMeetings] = useState<CellMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddMeeting, setShowAddMeeting] = useState(false);
  
  const [newMeeting, setNewMeeting] = useState({
    topic: '',
    bibleStudyType: 'BBS' as 'BBS'|'EBS',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '19:00',
    venue: '',
    meetLink: '',
    isOnline: true
  });

  useEffect(() => {
    const fetchData = async () => {
      const cellData = await dbService.getPrayerCell(cellId);
      const meetingsData = await dbService.getCellMeetings(cellId);
      if (cellData) setCell(cellData as any);
      if (meetingsData) setMeetings(meetingsData as any);
      setLoading(false);
    };
    fetchData();
  }, [cellId]);

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cell) return;
    
    // Add logic to save to firestore via dbService
    // For now I'll just close modal
    setShowAddMeeting(false);
  };

  const handleJoin = async (meetingId: string) => {
    if (!profile) return;
    await dbService.markAttendance(cellId, meetingId, profile.uid);
    // Refresh local state
    setMeetings(prev => prev.map(m => m.id === meetingId ? { ...m, attendance: { ...m.attendance, [profile.uid]: true } } : m));
  };

  const isCellAdmin = cell && (cell.parentIds.includes(profile?.uid || '') || cell.leaderIds.includes(profile?.uid || '') || hasRole([UserRole.ADMIN, UserRole.PRAYER_CELL_SECRETARY]));

  if (loading || !cell) return <div className="p-8 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">Loading cell details...</div>;

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-light tracking-tight text-slate-900 leading-tight">{cell.name}</h1>
          <div className="flex items-center gap-3 mt-1">
             <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-slate-100 text-slate-500 border border-slate-200">
               {cell.genderType} &bull; {cell.type}
             </span>
             <span className="text-xs text-slate-400 font-medium">{cell.memberIds.length} Members</span>
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Meetings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Meetings & Attendance</h2>
            {isCellAdmin && (
              <button 
                onClick={() => setShowAddMeeting(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all"
              >
                <Plus size={14} />
                Schedule
              </button>
            )}
          </div>

          <div className="space-y-4">
            {meetings.map((meeting, idx) => (
              <motion.div
                key={meeting.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded ${meeting.bibleStudyType === 'EBS' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {meeting.bibleStudyType}
                      </span>
                      <h4 className="text-base font-bold text-slate-900">{meeting.topic}</h4>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        <span>{format(new Date(meeting.date), 'MMM dd, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {meeting.isOnline ? <Video size={12} /> : <MapPin size={12} />}
                        <span>{meeting.venue || (meeting.isOnline ? 'Google Meet' : 'TBD')}</span>
                      </div>
                    </div>
                  </div>
                  
                  {meeting.attendance[profile?.uid || ''] ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-emerald-100 animate-in fade-in zoom-in duration-300">
                      <CheckCircle2 size={14} />
                      Present
                    </div>
                  ) : meeting.isOnline && meeting.meetLink ? (
                    <a
                      href={meeting.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleJoin(meeting.id)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
                    >
                      <Video size={14} />
                      Join & Mark
                    </a>
                  ) : isCellAdmin ? (
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Awaiting Member Join</span>
                  ) : null}
                </div>

                {/* Progress bar for attendance */}
                <div className="mt-6 pt-4 border-t border-slate-50 flex items-center gap-4">
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-slate-900 rounded-full transition-all duration-1000" 
                      style={{ width: `${(Object.values(meeting.attendance).filter(v => v).length / cell.memberIds.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter shrink-0">
                    {Object.values(meeting.attendance).filter(v => v).length} / {cell.memberIds.length} ATTENDED
                  </span>
                </div>
              </motion.div>
            ))}

            {meetings.length === 0 && (
              <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                <Calendar className="mx-auto text-slate-200 mb-4" size={48} />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No meetings scheduled yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: People & Actions */}
        <div className="space-y-6">
           {/* Section 1: Members */}
           <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Cell Members</h3>
               <Users size={16} className="text-slate-300" />
             </div>
             <div className="space-y-3">
               {cell.memberIds.map(memId => (
                 <div key={memId} className="flex items-center gap-3 group">
                   <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-100">
                     <span className="text-[10px] font-bold text-slate-400">?</span>
                   </div>
                   <div className="flex-1">
                     <div className="text-xs font-bold text-slate-900">Member {memId.slice(0, 4)}</div>
                     <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Joined Recently</div>
                   </div>
                 </div>
               ))}
             </div>
           </div>

           {/* Section 2: Quick Chat */}
           <div className="bg-slate-900 p-6 rounded-3xl shadow-xl shadow-slate-200 text-white group cursor-pointer hover:scale-[1.02] transition-all">
             <div className="flex justify-between items-start mb-6">
               <MessageCircle size={24} className="text-slate-400" />
               <ArrowUpRight size={16} className="text-slate-400 group-hover:text-white" />
             </div>
             <h3 className="text-lg font-bold tracking-tight mb-1">Cell Chat</h3>
             <p className="text-xs text-slate-400 leading-relaxed">
               Share quiet times, meeting links, and updates with everyone in the group.
             </p>
           </div>
        </div>
      </div>

      {/* Add Meeting Modal */}
      <AnimatePresence>
        {showAddMeeting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddMeeting(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-white rounded-3xl overflow-hidden relative z-10 shadow-2xl"
            >
              <div className="p-8 border-b border-slate-100">
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Schedule Meeting</h3>
                <p className="text-sm text-slate-500 mt-1">Set the topic and location for the next cell gathering.</p>
              </div>
              <form onSubmit={handleCreateMeeting} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Topic / Discussion</label>
                  <input 
                    type="text" 
                    required
                    value={newMeeting.topic}
                    onChange={e => setNewMeeting({...newMeeting, topic: e.target.value})}
                    placeholder="e.g. Identity in Christ"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</label>
                    <input 
                      type="date"
                      required
                      value={newMeeting.date}
                      onChange={e => setNewMeeting({...newMeeting, date: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time</label>
                    <input 
                      type="time" 
                      required
                      value={newMeeting.time}
                      onChange={e => setNewMeeting({...newMeeting, time: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setNewMeeting({...newMeeting, isOnline: true})}
                    className={`flex-1 py-3 rounded-xl border font-bold text-xs uppercase tracking-widest transition-all ${newMeeting.isOnline ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-100'}`}
                  >
                    Online
                  </button>
                  <button 
                    type="button"
                    onClick={() => setNewMeeting({...newMeeting, isOnline: false})}
                    className={`flex-1 py-3 rounded-xl border font-bold text-xs uppercase tracking-widest transition-all ${!newMeeting.isOnline ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-100'}`}
                  >
                    Offline
                  </button>
                </div>

                {newMeeting.isOnline ? (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">G-Meet Link</label>
                    <input 
                      type="url" 
                      required
                      value={newMeeting.meetLink}
                      onChange={e => setNewMeeting({...newMeeting, meetLink: e.target.value})}
                      placeholder="https://meet.google.com/..."
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Venue / Place</label>
                    <input 
                      type="text" 
                      required
                      value={newMeeting.venue}
                      onChange={e => setNewMeeting({...newMeeting, venue: e.target.value})}
                      placeholder="e.g. Student Center Room 4"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none"
                    />
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setShowAddMeeting(false)}
                    className="flex-1 py-4 bg-slate-50 text-slate-500 rounded-2xl font-bold transition-all hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold transition-all hover:bg-slate-800 shadow-lg shadow-slate-200"
                  >
                    Schedule Meeting
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ArrowUpRight = ({ size, className }: { size: number, className: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M7 17L17 7M17 7H7M17 7V17" />
  </svg>
);
