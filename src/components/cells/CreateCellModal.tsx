import React, { useState } from 'react';
import { dbService } from '../../services/db';
import { X, Users, MapPin, Loader2 } from 'lucide-react';

interface CreateCellModalProps {
  onClose: () => void;
  onCreated: (cellId: string) => void;
}

export const CreateCellModal: React.FC<CreateCellModalProps> = ({ onClose, onCreated }) => {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [isOnline, setIsOnline] = useState(false);
  const [location, setLocation] = useState('');
  const [studyType, setStudyType] = useState('Mixed');
  const [genderType, setGenderType] = useState('Mixed');
  const [meetingDay, setMeetingDay] = useState('Sunday');
  const [meetingTime, setMeetingTime] = useState('18:00');
  const [leaderName, setLeaderName] = useState('');
  const [leaderEmail, setLeaderEmail] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  const generateInvite = () => {
    // Generates a mock invite link for this prayer cell
    // In a real scenario, this code would be saved alongside the cell in the DB
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    setInviteCode(code);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const cellId = await dbService.createPrayerCell({
        name: name || null,
        startDate: startDate || null,
        isOnline,
        location: isOnline ? null : location || null,
        studyType: studyType || null,
        genderType: genderType || null,
        meetingDay: meetingDay || null,
        meetingTime: meetingTime || null,
        leaderName: leaderName || null,
        leaderEmail: leaderEmail || null,
        parentName: parentName || null,
        parentEmail: parentEmail || null,
        inviteCode: inviteCode || null,
        memberIds: [],
        leaderIds: [], 
        parentIds: [] 
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

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date of Starting</label>
              <input 
                type="date" 
                required
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all font-medium text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Format</label>
                <div className="flex bg-slate-100 rounded-xl p-1">
                  <button 
                    type="button"
                    onClick={() => setIsOnline(true)}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${isOnline ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    Online
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsOnline(false)}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${!isOnline ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    Offline
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Study Type</label>
                <select 
                  value={studyType}
                  onChange={e => setStudyType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-slate-900 bg-white"
                >
                  <option value="Believers">Believers</option>
                  <option value="Evangelical">Evangelical</option>
                  <option value="Mixed">Mixed</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gender</label>
                <select 
                  value={genderType}
                  onChange={e => setGenderType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-slate-900 bg-white"
                >
                  <option value="Boys">Boys</option>
                  <option value="Girls">Girls</option>
                  <option value="Mixed">Mixed</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Meeting Day</label>
                <select 
                  value={meetingDay}
                  onChange={e => setMeetingDay(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-slate-900 bg-white"
                >
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                  <option value="Saturday">Saturday</option>
                  <option value="Sunday">Sunday</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time</label>
                <input 
                  type="time" 
                  value={meetingTime}
                  onChange={e => setMeetingTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-slate-900 transition-all font-medium text-slate-900"
                />
              </div>
            </div>

            {!isOnline && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    required={!isOnline}
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="e.g. 123 Main St, Springfield"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all font-medium text-slate-900"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block border-b border-slate-100 pb-2">Cell Leader</label>
                <div className="space-y-3">
                  <input 
                    type="text" 
                    required
                    value={leaderName}
                    onChange={e => setLeaderName(e.target.value)}
                    placeholder="Name"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all font-medium text-slate-900 text-sm"
                  />
                  <input 
                    type="email" 
                    required
                    value={leaderEmail}
                    onChange={e => setLeaderEmail(e.target.value)}
                    placeholder="Email Address"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all font-medium text-slate-900 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block border-b border-slate-100 pb-2">Cell Parent</label>
                <div className="space-y-3">
                  <input 
                    type="text" 
                    required
                    value={parentName}
                    onChange={e => setParentName(e.target.value)}
                    placeholder="Name"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all font-medium text-slate-900 text-sm"
                  />
                  <input 
                    type="email" 
                    required
                    value={parentEmail}
                    onChange={e => setParentEmail(e.target.value)}
                    placeholder="Email Address"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all font-medium text-slate-900 text-sm"
                  />
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate-100">
               {!inviteCode ? (
                 <button 
                   type="button" 
                   onClick={generateInvite}
                   className="w-full py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-all border-dashed"
                 >
                    ✨ Generate Cell Invite Link
                 </button>
               ) : (
                 <div className="w-full p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="block text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Invite Code Generated</span>
                      <span className="text-sm font-mono font-bold text-emerald-900">{inviteCode}</span>
                    </div>
                    <button type="button" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}?invite=${inviteCode}`); alert("Link copied!"); }} className="text-[10px] font-bold text-emerald-700 uppercase hover:text-emerald-900 transition-colors bg-white px-2 py-1 rounded shadow-sm border border-emerald-200">
                       Copy Link
                    </button>
                 </div>
               )}
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
