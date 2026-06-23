import React, { useEffect, useState } from "react";
import { dbService } from "../../services/db";
import { PrayerCell, CellMeeting, UserRole } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { CellChat } from "./CellChat";
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
  ChevronLeft,
  Trash2,
  CalendarPlus,
} from "lucide-react";
import { ConfirmModal } from '../ui/ConfirmModal';
import { motion, AnimatePresence } from "motion/react";
import { format } from "date-fns";

export const CellDetail: React.FC<{ cellId: string; onBack: () => void }> = ({
  cellId,
  onBack,
}) => {
  const { profile, hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState<"chat" | "meetings" | "people">(
    "chat",
  );
  const [cell, setCell] = useState<PrayerCell | null>(null);
  const [meetings, setMeetings] = useState<CellMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [cellUsersMap, setCellUsersMap] = useState<Record<string, any>>({});
  const [showAddMeeting, setShowAddMeeting] = useState(false);

  const [newMeeting, setNewMeeting] = useState({
    topic: "",
    bibleStudyType: "BBS" as "BBS" | "EBS",
    date: format(new Date(), "yyyy-MM-dd"),
    time: "19:00",
    venue: "",
    meetLink: "",
    isOnline: true,
  });

  const [showAddMember, setShowAddMember] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });
  const shareLink =
    typeof window !== "undefined"
      ? `${window.location.origin}?joinCell=${cellId}`
      : "";

  const fetchData = async () => {
    const cellData = await dbService.getPrayerCell(cellId);
    const meetingsData = await dbService.getCellMeetings(cellId);
    if (cellData) {
      const data = cellData as any;
      setCell(data);
      const allIds = Array.from(
        new Set([
          ...(data.memberIds || []),
          ...(data.leaderIds || []),
          ...(data.parentIds || []),
        ]),
      );
      if (allIds.length > 0) {
        const users = await dbService.getUsers(allIds);
        const uMap: Record<string, any> = {};
        users.forEach((u) => {
          uMap[u.id] = u;
        });
        setCellUsersMap(uMap);
      }
    }
    if (meetingsData) setMeetings(meetingsData as any);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [cellId]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    alert("Invite link copied to clipboard!");
    setShowAddMember(false);
  };

  const handleRemoveMember = async (memberId: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Remove Member",
      message: "Are you sure you want to remove this member from the prayer cell?",
      onConfirm: async () => {
        await dbService.removeCellMember(cellId, memberId);
        await fetchData();
      }
    });
  };

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cell) return;

    await dbService.createCellMeeting(cellId, {
      ...newMeeting,
      attendance: {},
      createdBy: profile?.uid || "unknown",
    });

    setShowAddMeeting(false);

    // Refresh meetings
    const meetingsData = await dbService.getCellMeetings(cellId);
    if (meetingsData) setMeetings(meetingsData as any);
  };

  const canJoinMeeting = (dateStr: string, timeStr: string) => {
    if (!dateStr || !timeStr) return true;
    const meetingTime = new Date(`${dateStr}T${timeStr}`);
    return Date.now() >= meetingTime.getTime();
  };

  const handleDeleteMeeting = async (meetingId: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Meeting",
      message: "Are you sure you want to delete this meeting? This action cannot be undone.",
      onConfirm: async () => {
        await dbService.deleteCellMeeting(cellId, meetingId);
        await fetchData();
      }
    });
  };

  const handleJoin = async (meetingId: string) => {
    if (!profile) return;
    await dbService.markAttendance(cellId, meetingId, profile.uid);
    // Refresh local state
    setMeetings((prev) =>
      prev.map((m) =>
        m.id === meetingId
          ? { ...m, attendance: { ...m.attendance, [profile.uid]: true } }
          : m,
      ),
    );
  };

  const generateGCalLink = (title: string, dateStr: string, timeStr: string, details: string, location: string) => {
    try {
      const dt = new Date(`${dateStr}T${timeStr}`);
      const endDt = new Date(dt.getTime() + 2 * 60 * 60000); // assume 2 hours
      const fmt = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, "");
      return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${fmt(dt)}/${fmt(endDt)}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
    } catch {
      return '#';
    }
  };

  const isCellAdmin =
    cell &&
    (cell.parentIds.includes(profile?.uid || "") ||
      cell.leaderIds.includes(profile?.uid || "") ||
      hasRole([UserRole.ADMIN, UserRole.PRAYER_CELL_SECRETARY]));

  if (loading || !cell)
    return (
      <div className="p-8 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
        Loading cell details...
      </div>
    );

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
          <h1 className="text-3xl font-light tracking-tight text-slate-900 leading-tight">
            {cell.name}
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-slate-100 text-slate-500 border border-slate-200">
              {cell.genderType} &bull; {cell.type}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {cell.memberIds.length} Members
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden flex mb-6 bg-slate-100/50 p-1 rounded-2xl">
        {(["chat", "meetings", "people"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${activeTab === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left/Middle Column: Chat */}
        <div
          className={`lg:col-span-2 ${activeTab !== "chat" ? "hidden lg:block" : ""}`}
        >
          <CellChat cellId={cellId} profile={profile} />
        </div>

        {/* Right Column: Meetings and People */}
        <div
          className={`flex flex-col gap-6 ${activeTab === "chat" ? "hidden lg:flex" : ""}`}
        >
          {/* Section: Meetings */}
          <div
            className={`space-y-4 ${activeTab !== "meetings" ? "hidden lg:block" : ""}`}
          >
            <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
                Meetings
              </h2>
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

            <div className="space-y-3">
              {meetings.filter((meeting) => {
                if (!meeting.date) return true;
                const mTime = new Date(`${meeting.date}T${meeting.time || '00:00'}`).getTime();
                return (Date.now() - mTime) < 24 * 60 * 60 * 1000;
              }).map((meeting, idx) => (
                <motion.div
                  key={meeting.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h4 className="text-base font-bold text-slate-900 leading-snug break-words flex-1">
                      {meeting.topic}
                    </h4>
                    {isCellAdmin && (
                      <button
                        onClick={() => handleDeleteMeeting(meeting.id)}
                        className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all shrink-0"
                        title="Delete meeting"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col items-start gap-4 mb-4">
                    <div className="flex flex-wrap items-center gap-2">
                      {meeting.attendance[profile?.uid || ""] ? (
                        <div className="flex items-center gap-2">
                          {meeting.isOnline && meeting.meetLink ? (
                            <a
                              href={meeting.meetLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex justify-center items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors"
                            >
                              <Video size={14} /> Rejoin
                            </a>
                          ) : (
                            <button className="flex justify-center items-center gap-2 px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-bold uppercase tracking-widest cursor-default">
                              <CheckCircle2 size={14} /> Present
                            </button>
                          )}
                        </div>
                      ) : canJoinMeeting(meeting.date, meeting.time) ? (
                        meeting.isOnline && meeting.meetLink ? (
                          <a
                            href={meeting.meetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => handleJoin(meeting.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-700 shadow-sm transition-all"
                          >
                            <Video size={14} /> Join
                          </a>
                        ) : (
                          <button
                            onClick={() => handleJoin(meeting.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-700 shadow-sm transition-all"
                          >
                            <CheckCircle2 size={14} /> Join
                          </button>
                        )
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-xl text-center">
                          Upcoming
                        </span>
                      )}

                      <a href={generateGCalLink(`${cell.name} Meeting: ${meeting.topic}`, meeting.date, meeting.time, '', meeting.isOnline ? meeting.meetLink : meeting.venue)} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1.5 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-colors">
                        <CalendarPlus size={14} /> Add to GCal
                      </a>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 font-medium bg-slate-50/50 px-4 py-3 rounded-2xl w-full">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-slate-400" />
                        <span>
                          {format(new Date(meeting.date), "MMM dd, yyyy")}
                          {meeting.time ? ` at ${meeting.time}` : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {meeting.isOnline ? (
                          <Video size={16} className="text-slate-400" />
                        ) : (
                          <MapPin size={16} className="text-slate-400" />
                        )}
                        <span>
                          {meeting.venue ||
                            (meeting.isOnline ? "Google Meet" : "TBD")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Attendance Display */}
                  <div className="mt-4 pt-4 border-t border-slate-50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {Object.values(meeting.attendance).filter((v) => v).length} Attended
                      </span>
                      {isCellAdmin && (
                        <button
                          onClick={() => {
                            const newMeetings = [...meetings];
                            const mIndex = newMeetings.findIndex(m => m.id === meeting.id);
                            if (mIndex >= 0) {
                              newMeetings[mIndex] = { ...newMeetings[mIndex], _showAdminAttendance: !newMeetings[mIndex]._showAdminAttendance } as any;
                              setMeetings(newMeetings);
                            }
                          }}
                          className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:underline"
                        >
                          Manage Attendance
                        </button>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                       {Object.keys(meeting.attendance).filter(uid => meeting.attendance[uid]).map(uid => {
                         const user = cellUsersMap[uid];
                         if (!user) return null;
                         return (
                           <div key={uid} className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                             {user.photoURL ? (
                               <img src={user.photoURL} alt={user.name} className="w-4 h-4 rounded-full object-cover" />
                             ) : (
                               <div className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[8px] font-bold">
                                 {user.name.charAt(0)}
                               </div>
                             )}
                             <span className="text-xs font-medium text-slate-700">{user.name.split(' ')[0]}</span>
                           </div>
                         );
                       })}
                    </div>

                    {/* Admin Attendance Management */}
                    {(meeting as any)._showAdminAttendance && (
                      <div className="mt-4 bg-slate-50 rounded-xl p-4 border border-slate-100">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Mark Cell Members Present</div>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                          {cell.memberIds.map(memberId => {
                            const user = cellUsersMap[memberId];
                            const isPresent = !!meeting.attendance[memberId];
                            return (
                              <label key={memberId} className="flex items-center justify-between p-2 hover:bg-white rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-200">
                                <div className="flex items-center gap-2">
                                  {user?.photoURL ? (
                                    <img src={user.photoURL} alt={user?.name} className="w-6 h-6 rounded-full object-cover" />
                                  ) : (
                                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                                      {user?.name?.charAt(0) || '?'}
                                    </div>
                                  )}
                                  <span className="text-xs font-bold text-slate-700">{user?.name || `Member ${memberId.slice(0, 4)}`}</span>
                                </div>
                                <input 
                                  type="checkbox" 
                                  checked={isPresent}
                                  onChange={async (e) => {
                                    const checked = e.target.checked;
                                    const updatedAttendance = { ...meeting.attendance, [memberId]: checked };
                                    
                                    // Update locally
                                    setMeetings(prev => prev.map(m => m.id === meeting.id ? { ...m, attendance: updatedAttendance } : m));
                                    
                                    // Update DB directly
                                    try {
                                      await dbService.updateCellMeeting(cellId, meeting.id, { attendance: updatedAttendance });
                                    } catch (err) {
                                      console.error("Failed to update attendance", err);
                                      // Revert on failure (simple version)
                                      fetchData();
                                    }
                                  }}
                                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                                />
                              </label>
                            );
                          })}
                          {cell.memberIds.length === 0 && (
                            <p className="text-xs text-slate-400 italic">No members in cell.</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {meetings.length === 0 && (
                <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                  <Calendar className="mx-auto text-slate-200 mb-4" size={48} />
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                    No meetings scheduled yet
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Section: People */}
          <div
            className={`bg-white p-6 rounded-3xl border border-slate-100 shadow-sm ${activeTab !== "people" ? "hidden lg:block" : ""}`}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
                Cell People
              </h3>
              {isCellAdmin ? (
                <button
                  onClick={() => setShowAddMember(true)}
                  className="flex flex-col items-center justify-center w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                  title="Add Member"
                >
                  <Plus size={14} />
                </button>
              ) : (
                <Users size={16} className="text-slate-300" />
              )}
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                  Cell Parents
                </h4>
                <div className="space-y-2">
                  {cell.parentIds?.length > 0 ? (
                    cell.parentIds.map((uid) => {
                      const user = cellUsersMap[uid];
                      const name = user?.name || `Parent ${uid.slice(0, 4)}`;
                      const photo = user?.photoURL;
                      return (
                        <div key={uid} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-100 overflow-hidden shrink-0">
                            {photo ? (
                              <img
                                src={photo}
                                alt={name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-[10px] font-bold text-slate-400 uppercase">
                                {name[0] || "?"}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-slate-900 truncate">
                              {name}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-100 overflow-hidden shrink-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          {(cell.parentName || "?")[0]}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {cell.parentName || "Not Assigned"}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                  Cell Leaders
                </h4>
                <div className="space-y-2">
                  {cell.leaderIds?.length > 0 ? (
                    cell.leaderIds.map((uid) => {
                      const user = cellUsersMap[uid];
                      const name = user?.name || `Leader ${uid.slice(0, 4)}`;
                      const photo = user?.photoURL;
                      return (
                        <div key={uid} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-100 overflow-hidden shrink-0">
                            {photo ? (
                              <img
                                src={photo}
                                alt={name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-[10px] font-bold text-slate-400 uppercase">
                                {name[0] || "?"}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-slate-900 truncate">
                              {name}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-100 overflow-hidden shrink-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          {(cell.leaderName || "?")[0]}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {cell.leaderName || "Not Assigned"}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                  Cell Members
                </h4>
                {(!cell.memberIds || cell.memberIds.length === 0) && (
                  <p className="text-xs text-slate-400 italic">
                    No members yet.
                  </p>
                )}
                <div className="space-y-2">
                  {cell.memberIds?.map((uid) => {
                    const user = cellUsersMap[uid];
                    const name = user?.name || `Member ${uid.slice(0, 4)}`;
                    const photo = user?.photoURL;
                    return (
                      <div
                        key={uid}
                        className="flex items-center gap-3 group bg-white hover:bg-slate-50 p-2 -mx-2 rounded-xl transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center overflow-hidden shrink-0">
                          {photo ? (
                            <img
                              src={photo}
                              alt={name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-[10px] font-bold uppercase">
                              {name[0] || "?"}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-slate-900 truncate">
                            {name}
                          </div>
                        </div>
                        {isCellAdmin && (
                          <button
                            onClick={() => handleRemoveMember(uid)}
                            className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 shrink-0"
                            title="Remove member"
                          >
                            <XCircle size={14} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Quick chat removed */}
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
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Schedule Meeting
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Set the topic and location for the next cell gathering.
                </p>
              </div>
              <form onSubmit={handleCreateMeeting} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Topic / Discussion
                  </label>
                  <input
                    type="text"
                    required
                    value={newMeeting.topic}
                    onChange={(e) =>
                      setNewMeeting({ ...newMeeting, topic: e.target.value })
                    }
                    placeholder="e.g. Identity in Christ"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Date
                    </label>
                    <input
                      type="date"
                      required
                      value={newMeeting.date}
                      onChange={(e) =>
                        setNewMeeting({ ...newMeeting, date: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Time
                    </label>
                    <input
                      type="time"
                      required
                      value={newMeeting.time}
                      onChange={(e) =>
                        setNewMeeting({ ...newMeeting, time: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      setNewMeeting({ ...newMeeting, isOnline: true })
                    }
                    className={`flex-1 py-3 rounded-xl border font-bold text-xs uppercase tracking-widest transition-all ${newMeeting.isOnline ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-400 border-slate-100"}`}
                  >
                    Online
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setNewMeeting({ ...newMeeting, isOnline: false })
                    }
                    className={`flex-1 py-3 rounded-xl border font-bold text-xs uppercase tracking-widest transition-all ${!newMeeting.isOnline ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-400 border-slate-100"}`}
                  >
                    Offline
                  </button>
                </div>

                {newMeeting.isOnline ? (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      G-Meet Link
                    </label>
                    <input
                      type="url"
                      required
                      value={newMeeting.meetLink}
                      onChange={(e) =>
                        setNewMeeting({
                          ...newMeeting,
                          meetLink: e.target.value,
                        })
                      }
                      placeholder="https://meet.google.com/..."
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Venue / Place
                    </label>
                    <input
                      type="text"
                      required
                      value={newMeeting.venue}
                      onChange={(e) =>
                        setNewMeeting({ ...newMeeting, venue: e.target.value })
                      }
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
      {/* Add Member Modal */}
      <AnimatePresence>
        {showAddMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddMember(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-sm bg-white rounded-3xl overflow-hidden relative z-10 shadow-2xl"
            >
              <div className="p-8 border-b border-slate-100">
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Invite Members
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Share this invite link with people you want to join this cell.
                </p>
              </div>
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Invite Link
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={shareLink}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 outline-none transition-all text-sm font-medium"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddMember(false)}
                    className="flex-1 py-4 bg-slate-50 text-slate-500 rounded-2xl font-bold transition-all hover:bg-slate-100"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold transition-all hover:bg-slate-800 shadow-lg shadow-slate-200"
                  >
                    Copy Link
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

const ArrowUpRight = ({
  size,
  className,
}: {
  size: number;
  className: string;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M7 17L17 7M17 7H7M17 7V17" />
  </svg>
);
