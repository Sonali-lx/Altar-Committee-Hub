import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/db';
import { ChevronLeft, Users, MapPin, Globe, Clock, Save, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PrayerCellRegistryProps {
  onBack: () => void;
}

export const PrayerCellRegistry: React.FC<PrayerCellRegistryProps> = ({ onBack }) => {
  const { hasRole, profile } = useAuth();
  const [cells, setCells] = useState<any[]>([]);
  const [selectedCell, setSelectedCell] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [cellMeetings, setCellMeetings] = useState<any[]>([]);
  const [cellUsersMap, setCellUsersMap] = useState<Record<string, any>>({});
  const [expandedMeetingId, setExpandedMeetingId] = useState<string | null>(null);

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const unsub = dbService.subscribePrayerCells((data) => {
      setCells(data);
      setLoading(false);
      // Update selected cell if it changes in the background
      if (selectedCell) {
        const updated = data.find(c => c.id === selectedCell.id);
        if (updated) setSelectedCell(updated);
      }
    });
    return () => unsub();
  }, [selectedCell]);

  useEffect(() => {
    if (selectedCell && !isEditing) {
      dbService.getCellMeetings(selectedCell.id).then(meetings => {
        if (meetings) {
          setCellMeetings(meetings);
          const meetingAttendeeIds = meetings.flatMap((m: any) => Object.keys(m.attendance || {}).filter(k => m.attendance[k]));
          
          const allIds = Array.from(new Set([
            ...(selectedCell.memberIds || []),
            ...(selectedCell.leaderIds || []),
            ...(selectedCell.parentIds || []),
            ...meetingAttendeeIds
          ]));

          if (allIds.length > 0) {
            dbService.getUsers(allIds).then(users => {
              const uMap: Record<string, any> = {};
              users.forEach(u => { uMap[u.id] = u; });
              setCellUsersMap(uMap);
            });
          }
        }
      });
    } else {
      setCellMeetings([]);
      setCellUsersMap({});
      setExpandedMeetingId(null);
    }
  }, [selectedCell, isEditing]);

  const handleCellClick = (cell: any) => {
    setSelectedCell(cell);
    setIsEditing(false);
    setEditForm({});
  };

  const closeDetails = () => {
    setSelectedCell(null);
    setIsEditing(false);
  };

  const startEdit = () => {
    setEditForm({
      name: selectedCell.name || '',
      parentName: selectedCell.parentName || '',
      parentEmail: selectedCell.parentEmail || '',
      leaderName: selectedCell.leaderName || '',
      leaderEmail: selectedCell.leaderEmail || '',
      studyType: selectedCell.studyType || 'Mixed',
      genderType: selectedCell.genderType || 'Mixed',
      isOnline: selectedCell.isOnline || false,
    });
    setIsEditing(true);
  };

  const saveEdit = async () => {
    setIsSaving(true);
    await dbService.updatePrayerCell(selectedCell.id, editForm);
    setIsSaving(false);
    setIsEditing(false);
  };

  // Only PRAYER_CELL_SECRETARY or ADMIN or the parent/leader can edit? 
  // Let's assume PRAYER_CELL_SECRETARY or ADMIN can edit. The prompt says "based on the person accessing it"
  // Let's use `hasRole(['PRAYER_CELL_SECRETARY', 'ADMIN', 'PRESIDENT'])` just to be safe, or if it's the leader.
  const canEdit = hasRole(['PRAYER_CELL_SECRETARY', 'ADMIN', 'SECRETARY', 'SENIOR_ADVISOR']) || 
                  (profile && selectedCell && (profile.email === selectedCell.leaderEmail || profile.email === selectedCell.parentEmail));

  if (loading) {
    return <div className="p-8 text-center text-slate-500 animate-pulse">Loading registry...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-2 border border-slate-200 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Prayer Cell Registry</h2>
          <p className="text-slate-500 text-sm">Official list of all prayer cells and their details.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* List of Prayer Cells */}
        <div className="md:col-span-1 border border-slate-200 rounded-3xl overflow-hidden bg-white flex flex-col max-h-[600px]">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">All Cells ({cells.length})</h3>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-1">
            {cells.map(cell => (
              <button
                key={cell.id}
                onClick={() => handleCellClick(cell)}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all ${selectedCell?.id === cell.id ? 'bg-slate-900 text-white shadow-md' : 'hover:bg-slate-50 text-slate-700'}`}
              >
                <div className="font-bold text-sm truncate">{cell.name || 'Unnamed Cell'}</div>
                <div className={`text-xs mt-1 truncate ${selectedCell?.id === cell.id ? 'text-slate-300' : 'text-slate-500'}`}>
                  {cell.location || (cell.isOnline ? 'Virtual Meeting' : 'No location')}
                </div>
              </button>
            ))}
            {cells.length === 0 && (
              <div className="p-4 text-center text-sm text-slate-400">No prayer cells found.</div>
            )}
          </div>
        </div>

        {/* Details View */}
        <div className="md:col-span-2 relative min-h-[400px]">
          <AnimatePresence mode="wait">
            {selectedCell ? (
              <motion.div 
                key={selectedCell.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm h-full"
              >
                {!isEditing ? (
                  <>
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900">{selectedCell.name || 'Unnamed Cell'}</h2>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${selectedCell.studyType === 'Believers' ? 'bg-indigo-100 text-indigo-700' : selectedCell.studyType === 'Evangelical' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                            {selectedCell.studyType || 'Mixed'} Study
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-bold ${selectedCell.genderType === 'Boys' ? 'bg-blue-100 text-blue-700' : selectedCell.genderType === 'Girls' ? 'bg-pink-100 text-pink-700' : 'bg-purple-100 text-purple-700'}`}>
                            {selectedCell.genderType || 'Mixed'} Group
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 ${selectedCell.isOnline ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                            {selectedCell.isOnline ? <Globe size={12} /> : <MapPin size={12} />}
                            {selectedCell.isOnline ? 'Online' : 'Offline'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {canEdit && (
                          <button onClick={startEdit} className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors">
                            Edit Record
                          </button>
                        )}
                        <button onClick={closeDetails} className="text-slate-400 hover:text-slate-900 transition-colors">
                          <X size={20} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div className="space-y-6 flex-1">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Cell Parent</p>
                          <p className="font-bold text-slate-900">{selectedCell.parentName || 'Not Assigned'}</p>
                          <p className="text-sm text-slate-500">{selectedCell.parentEmail || 'No Email'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Cell Leader</p>
                          <p className="font-bold text-slate-900">{selectedCell.leaderName || 'Not Assigned'}</p>
                          <p className="text-sm text-slate-500">{selectedCell.leaderEmail || 'No Email'}</p>
                        </div>
                      </div>

                      <div className="space-y-6 flex-1">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Member Count</p>
                          <div className="flex items-center gap-2 text-slate-900 font-bold">
                            <Users size={18} className="text-slate-400" />
                            <span>{selectedCell.memberIds?.length || 0} Members</span>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Members List</p>
                          <div className="flex flex-wrap gap-2">
                             {selectedCell.memberIds?.length > 0 ? selectedCell.memberIds.map(uid => {
                               const user = cellUsersMap[uid];
                               return user ? (
                                  <div key={uid} className="bg-slate-50 border border-slate-100 px-2 py-1 rounded text-xs text-slate-700">{user.name}</div>
                               ) : null;
                             }) : <span className="text-xs text-slate-400">No members yet.</span>}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-slate-100">
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4">Meetings Record</h3>
                      {cellMeetings.length === 0 ? (
                        <p className="text-sm text-slate-500">No meetings recorded.</p>
                      ) : (
                        <div className="space-y-3">
                          {cellMeetings.map(m => {
                            const attendeesCount = Object.values(m.attendance || {}).filter(v => v).length;
                            return (
                              <div key={m.id} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col gap-4">
                                <div className="flex flex-wrap gap-4 items-center justify-between cursor-pointer" onClick={() => setExpandedMeetingId(expandedMeetingId === m.id ? null : m.id)}>
                                  <div>
                                    <div className="font-bold text-slate-900 text-sm">{m.topic || 'Untitled Meeting'}</div>
                                    <div className="text-xs text-slate-500 flex items-center gap-3 mt-1">
                                      <span>{new Date(m.date).toLocaleDateString()} at {m.time}</span>
                                      <span>&bull;</span>
                                      <span>{m.isOnline ? 'Online' : m.venue || 'Offline'}</span>
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end">
                                    <span className="text-xl font-bold text-slate-900 leading-none">{attendeesCount}</span>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Participants</span>
                                  </div>
                                </div>
                                {expandedMeetingId === m.id && (
                                  <div className="pt-4 border-t border-slate-200 mt-2">
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Attendees</h4>
                                    {attendeesCount === 0 ? (
                                      <p className="text-xs text-slate-400">No attendees marked yet.</p>
                                    ) : (
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {Object.keys(m.attendance || {}).filter(uid => m.attendance[uid]).map(uid => {
                                          const u = cellUsersMap[uid];
                                          return (
                                            <div key={uid} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-100">
                                              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                                                {u?.photoURL ? <img src={u.photoURL} alt={u?.name} className="w-full h-full object-cover" /> : <span className="text-[9px] font-bold">{u?.name?.[0] || '?'}</span>}
                                              </div>
                                              <span className="text-xs font-bold text-slate-700 truncate">{u?.name || 'Unknown User'}</span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  // Edit Form Mode
                  <div className="space-y-6">
                     <div className="flex justify-between items-center bg-slate-50 -m-6 md:-m-8 p-6 md:p-8 mb-6 border-b border-slate-100 rounded-t-3xl">
                       <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                         Editing {selectedCell.name}
                       </h3>
                       <div className="flex gap-2">
                         <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-xs font-bold rounded-xl text-slate-500 hover:bg-slate-200">Cancel</button>
                         <button onClick={saveEdit} disabled={isSaving} className="px-4 py-2 flex items-center gap-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 disabled:opacity-50">
                           <Save size={14} /> {isSaving ? 'Saving...' : 'Save Changes'}
                         </button>
                       </div>
                     </div>

                     <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Prayer Cell Name</label>
                          <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Parents (Names)</label>
                            <input type="text" placeholder="Separate with commas for multiple" value={editForm.parentName} onChange={e => setEditForm({...editForm, parentName: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Parents (Emails)</label>
                            <input type="text" placeholder="Separate with commas" value={editForm.parentEmail} onChange={e => setEditForm({...editForm, parentEmail: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Leaders (Names)</label>
                            <input type="text" placeholder="Separate with commas for multiple" value={editForm.leaderName} onChange={e => setEditForm({...editForm, leaderName: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Leaders (Emails)</label>
                            <input type="text" placeholder="Separate with commas" value={editForm.leaderEmail} onChange={e => setEditForm({...editForm, leaderEmail: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                          </div>
                       </div>

                       <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-slate-100 pt-6">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Study Type</label>
                            <select value={editForm.studyType} onChange={e => setEditForm({...editForm, studyType: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm">
                              <option value="Believers">Believers</option>
                              <option value="Evangelical">Evangelical</option>
                              <option value="Mixed">Mixed</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Gender Group</label>
                            <select value={editForm.genderType} onChange={e => setEditForm({...editForm, genderType: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm">
                              <option value="Boys">Boys</option>
                              <option value="Girls">Girls</option>
                              <option value="Mixed">Mixed</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Format</label>
                            <select value={editForm.isOnline ? 'true' : 'false'} onChange={e => setEditForm({...editForm, isOnline: e.target.value === 'true'})} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm">
                              <option value="true">Online</option>
                              <option value="false">Offline</option>
                            </select>
                          </div>
                       </div>
                     </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-center p-8 bg-slate-50 border border-slate-200 border-dashed rounded-3xl"
              >
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
                  <Users size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Select a Prayer Cell</h3>
                <p className="text-sm text-slate-500 max-w-[250px]">Choose a prayer cell from the list to view its complete registry details.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
