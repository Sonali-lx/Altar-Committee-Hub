import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/db';
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  Plus,
  Users,
  X,
  Video,
  CheckCircle2,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, parseISO, isPast, isFuture, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';

import { fileToBase64 } from '../../utils/fileUtils';

export const EventList: React.FC = () => {
  const { profile, hasRole } = useAuth();
  // Include SENIOR_ADVISOR, CELL_LEADER, CELL_PARENT
  const canCreate = hasRole(['SECRETARY', 'ADMIN', 'PRESIDENT', 'SENIOR_ADVISOR', 'CELL_LEADER', 'CELL_PARENT']);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [events, setEvents] = useState<any[]>([]);
  const [cellMeetings, setCellMeetings] = useState<any[]>([]);

  // Form State
  const [eventName, setEventName] = useState('');
  const [theme, setTheme] = useState('');
  const [speaker, setSpeaker] = useState('');
  const [isOnline, setIsOnline] = useState(false);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [venue, setVenue] = useState('');
  const [meetLink, setMeetLink] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [extraNote, setExtraNote] = useState('');

  // Calendar State
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarNotes, setCalendarNotes] = useState<any[]>([]);
  const [showDateActionModal, setShowDateActionModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);

  const fetchData = async () => {
    if (profile?.uid) {
      const dbEvents = await dbService.getEvents();
      if (dbEvents) {
        const activeEvents = dbEvents.filter((ev: any) => {
          if (!ev.date) return true;
          const mTime = new Date(`${ev.date}T${ev.time || '00:00'}`).getTime();
          return (Date.now() - mTime) < 24 * 60 * 60 * 1000;
        });
        setEvents(activeEvents);
      }

      const isSuperUser = hasRole(['ADMIN', 'SECRETARY', 'PRESIDENT', 'SENIOR_ADVISOR']);
      const meetings = await dbService.getMyUpcomingMeetings(profile.uid, isSuperUser);
      if (meetings) {
        const activeMeetings = meetings.filter((meeting: any) => {
          if (!meeting.date) return true;
          const mTime = new Date(`${meeting.date}T${meeting.time || '00:00'}`).getTime();
          return (Date.now() - mTime) < 24 * 60 * 60 * 1000;
        });
        setCellMeetings(activeMeetings);
      }

      const notes = await dbService.getCalendarNotes(profile.uid);
      setCalendarNotes(notes);
    }
  };

  useEffect(() => {
    fetchData();
  }, [profile?.uid]);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName || !date || !time) return;

    setIsSubmitting(true);
    await dbService.createEvent({
      eventName,
      theme,
      speaker,
      isOnline,
      date,
      time,
      venue: isOnline ? '' : venue,
      meetLink: isOnline ? meetLink : '',
      posterUrl,
      extraNote,
      attendance: {},
    });
    setIsSubmitting(false);
    setShowCreateModal(false);
    setEventName('');
    setTheme('');
    setSpeaker('');
    setDate('');
    setTime('');
    setVenue('');
    setMeetLink('');
    setPosterUrl('');
    setExtraNote('');
    setIsOnline(false);
    
    fetchData();
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      await dbService.deleteEvent(eventId);
      fetchData();
    }
  };

  const handleMarkAttendanceCell = async (cellId: string, meetingId: string) => {
    if (!profile?.uid) return;
    await dbService.markAttendance(cellId, meetingId, profile.uid);
    fetchData();
  };

  const handleMarkAttendanceEvent = async (eventId: string, currentAttendance: Record<string, boolean>) => {
    if (!profile?.uid) return;
    const newAttendance = { ...currentAttendance, [profile.uid]: true };
    await dbService.updateEvent(eventId, { attendance: newAttendance });
    fetchData();
  };

  const canJoin = (dateStr: string, timeStr: string) => {
    if (!dateStr || !timeStr) return true;
    const dt = new Date(`${dateStr}T${timeStr}`);
    // Allow joining from 30 mins before meeting starts up to any time after
    const joinTime = new Date(dt.getTime() - 30 * 60000);
    return new Date() >= joinTime;
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

  const handleDateClick = (day: Date) => {
    setSelectedDate(day);
    setShowDateActionModal(true);
  };

  const openNoteModal = () => {
    if (!selectedDate) return;
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const existingNote = calendarNotes.find(n => n.date === dateStr);
    setNoteText(existingNote ? existingNote.note : '');
    setShowDateActionModal(false);
    setShowNoteModal(true);
  };

  const openCreateEventModalWithDate = () => {
    if (selectedDate) setDate(format(selectedDate, 'yyyy-MM-dd'));
    setShowDateActionModal(false);
    setShowCreateModal(true);
  };

  const handleSaveNote = async () => {
    if (!selectedDate || !profile?.uid) return;
    setIsSavingNote(true);
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    await dbService.saveCalendarNote(profile.uid, dateStr, noteText);
    await fetchData(); // refresh notes
    setIsSavingNote(false);
    setShowNoteModal(false);
  };

  const handleDeleteNote = async () => {
    if (!selectedDate || !profile?.uid) return;
    setIsSavingNote(true);
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    await dbService.saveCalendarNote(profile.uid, dateStr, ''); // empty string deletes the note
    await fetchData();
    setIsSavingNote(false);
    setShowNoteModal(false);
  };

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    return (
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-slate-900 text-lg">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          <div className="flex gap-2">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
              <ChevronLeft size={20} />
            </button>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(d => (
            <div key={d} className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest py-2">
              {d}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, idx) => {
            const isSelectedMonth = isSameMonth(day, monthStart);
            const isToday = isSameDay(day, new Date());
            const dateStr = format(day, 'yyyy-MM-dd');

            const hasEvent = events.some(e => e.date === dateStr) || cellMeetings.some(c => c.date === dateStr);
            const hasNote = calendarNotes.some(n => n.date === dateStr);

            return (
              <button
                key={idx}
                onClick={() => handleDateClick(day)}
                className={`
                  relative aspect-square flex flex-col justify-center items-center rounded-xl text-sm transition-all
                  ${!isSelectedMonth ? 'text-slate-300' : 'text-slate-700 font-medium hover:bg-slate-50'}
                  ${isToday && !hasEvent ? 'bg-indigo-50 text-indigo-700 font-bold' : ''}
                  ${hasEvent ? 'bg-emerald-500 text-white font-bold hover:bg-emerald-600 shadow-md shadow-emerald-200' : ''}
                `}
              >
                <span>{format(day, 'd')}</span>
                {hasNote && !hasEvent && <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-amber-400"></div>}
                {hasNote && hasEvent && <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-white opacity-80"></div>}
              </button>
            );
          })}
        </div>
        
        <div className="mt-6 space-y-2 border-t border-slate-50 pt-4">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <div className="w-3 h-3 rounded bg-emerald-500"></div> Has Event / Meeting
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <div className="w-3 h-3 rounded-full bg-amber-400"></div> Has Personal Note
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-slate-900">Meetings & Events</h1>
          <p className="text-slate-500 font-medium mt-1">Schedules, cell gatherings, and official events.</p>
        </div>
        
        {canCreate && (
          <button 
            onClick={() => setShowCreateModal(true)}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-3 md:px-6 md:py-3 bg-slate-900 text-white rounded-2xl text-xs md:text-sm font-bold shadow-xl shadow-slate-200 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus size={18} />
            Create New Event
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main List */}
        <div className="lg:col-span-2 space-y-4">
          
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4">Official Events</h2>
          {events.length === 0 ? (
            <p className="text-sm text-slate-400 font-medium">No official events scheduled.</p>
          ) : (
            events.map((ev, idx) => {
              const evDate = new Date(`${ev.date}T${ev.time || '00:00'}`);
              const hasAttended = profile?.uid ? !!ev.attendance?.[profile.uid] : false;
              const joinable = canJoin(ev.date, ev.time);
              const gcalLink = generateGCalLink(ev.eventName, ev.date, ev.time, `Theme: ${ev.theme || ''}\\nSpeaker: ${ev.speaker || ''}`, ev.isOnline ? ev.meetLink : ev.venue);

              return (
                <motion.div 
                  key={ev.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="text-base font-bold text-slate-900 leading-snug break-words flex-1">
                      {ev.eventName}
                    </h4>
                    <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-emerald-50 text-emerald-900 shrink-0">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">{format(evDate, 'MMM')}</span>
                      <span className="text-sm font-bold">{format(evDate, 'dd')}</span>
                    </div>
                  </div>
                  {ev.theme && <p className="text-sm text-slate-600 mb-1 font-medium">Theme: {ev.theme}</p>}
                  {ev.speaker && <p className="text-sm text-slate-500 mb-4">Speaker: {ev.speaker}</p>}

                  {ev.posterUrl && (
                    <div className="mb-4 rounded-xl overflow-hidden shadow-sm border border-slate-100 max-h-48 group relative">
                      <img src={ev.posterUrl} alt="Event Poster" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  {ev.extraNote && (
                    <div className="mb-4 p-3 bg-amber-50/50 border border-amber-100 rounded-xl text-sm text-amber-900 leading-relaxed font-medium">
                      {ev.extraNote}
                    </div>
                  )}

                  <div className="flex flex-col items-start gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                      {hasAttended ? (
                         ev.isOnline && ev.meetLink ? (
                           <a href={ev.meetLink} target="_blank" rel="noreferrer" className="flex justify-center items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors">
                             <Video size={14} /> Rejoin
                           </a>
                         ) : (
                           <button className="flex justify-center items-center gap-2 px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-bold uppercase tracking-widest cursor-default">
                             <CheckCircle2 size={14} /> Present
                           </button>
                         )
                      ) : joinable ? (
                        ev.isOnline && ev.meetLink ? (
                          <a 
                            href={ev.meetLink} 
                            target="_blank" 
                            rel="noreferrer" 
                            onClick={() => handleMarkAttendanceEvent(ev.id, ev.attendance || {})}
                            className="flex justify-center items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-700 shadow-sm transition-all"
                          >
                            <Video size={14} /> Join
                          </a>
                        ) : (
                          <button 
                            onClick={() => handleMarkAttendanceEvent(ev.id, ev.attendance || {})}
                            className="flex justify-center items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-700 shadow-sm transition-all"
                          >
                            <CheckCircle2 size={14} /> Join
                          </button>
                        )
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-xl text-center">
                          Upcoming
                        </span>
                      )}

                      <a href={gcalLink} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1.5 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-colors">
                        <CalendarPlus size={14} /> Add to GCal
                      </a>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 font-medium bg-slate-50/50 px-4 py-3 rounded-2xl w-full">
                      <div className="flex items-center gap-2">
                        <CalendarIcon size={16} className="text-slate-400" />
                        <span>{format(evDate, 'MMM dd, yyyy')} at {format(evDate, 'h:mm a')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {ev.isOnline ? (
                          <Video size={16} className="text-slate-400" />
                        ) : (
                          <MapPin size={16} className="text-slate-400" />
                        )}
                        <span>{ev.isOnline ? "Google Meet" : ev.venue || "TBD"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Users size={14} /> {Object.values(ev.attendance || {}).filter(v => v).length} Attended
                    </span>
                    {canCreate && (
                      <button 
                        onClick={() => handleDeleteEvent(ev.id)}
                        className="text-[10px] font-bold text-red-500 uppercase tracking-widest flex items-center gap-1 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}

          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest mt-8 mb-4">Cell Meetings</h2>
          {cellMeetings.length === 0 ? (
            <p className="text-sm text-slate-400 font-medium">No upcoming cell meetings.</p>
          ) : (
            cellMeetings.map((ev, idx) => {
              const evDate = new Date(`${ev.date}T${ev.time || '00:00'}`);
              const hasAttended = profile?.uid ? !!ev.attendance?.[profile.uid] : false;
              const joinable = canJoin(ev.date, ev.time);
              const gcalLink = generateGCalLink(`${ev.cellName} Cell Meeting: ${ev.topic}`, ev.date, ev.time, '', ev.isOnline ? ev.meetLink : ev.venue);

              return (
                <motion.div 
                  key={ev.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h4 className="text-base font-bold text-slate-900 leading-snug break-words flex-1">
                      {ev.topic}
                    </h4>
                    <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 text-indigo-900 shrink-0">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">{format(evDate, 'MMM')}</span>
                      <span className="text-sm font-bold">{format(evDate, 'dd')}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-start gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                      {hasAttended ? (
                         ev.isOnline && ev.meetLink ? (
                           <a href={ev.meetLink} target="_blank" rel="noreferrer" className="flex justify-center items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors">
                             <Video size={14} /> Rejoin
                           </a>
                         ) : (
                           <button className="flex justify-center items-center gap-2 px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-bold uppercase tracking-widest cursor-default">
                             <CheckCircle2 size={14} /> Present
                           </button>
                         )
                      ) : joinable ? (
                        ev.isOnline && ev.meetLink ? (
                          <a 
                            href={ev.meetLink} 
                            target="_blank" 
                            rel="noreferrer" 
                            onClick={() => handleMarkAttendanceCell(ev.cellId, ev.id)}
                            className="flex justify-center items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-700 shadow-sm transition-all"
                          >
                            <Video size={14} /> Join
                          </a>
                        ) : (
                          <button 
                            onClick={() => handleMarkAttendanceCell(ev.cellId, ev.id)}
                            className="flex justify-center items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-700 shadow-sm transition-all"
                          >
                            <CheckCircle2 size={14} /> Join
                          </button>
                        )
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-xl text-center">
                          Upcoming
                        </span>
                      )}

                      <a href={gcalLink} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1.5 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-colors">
                        <CalendarPlus size={14} /> Add to GCal
                      </a>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 font-medium bg-slate-50/50 px-4 py-3 rounded-2xl w-full">
                      <div className="flex items-center gap-2">
                        <CalendarIcon size={16} className="text-slate-400" />
                        <span>{format(evDate, 'MMM dd, yyyy')} at {format(evDate, 'h:mm a')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {ev.isOnline ? (
                          <Video size={16} className="text-slate-400" />
                        ) : (
                          <MapPin size={16} className="text-slate-400" />
                        )}
                        <span>{ev.isOnline ? "Google Meet" : ev.venue || "TBD"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-50 flex flex-wrap items-center justify-between gap-4">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest bg-blue-50 text-blue-600">
                      {ev.cellName} Cell
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Users size={14} /> {Object.values(ev.attendance || {}).filter(v => v).length} Attended
                    </span>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Sidebar Calendar */}
        <div className="space-y-4">
           {renderCalendar()}
        </div>
      </div>
      
      <AnimatePresence>
        {showDateActionModal && selectedDate && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-900 text-lg">{format(selectedDate, 'MMM dd, yyyy')}</h3>
                <button onClick={() => setShowDateActionModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
              </div>
              <div className="space-y-3">
                {canCreate && (
                  <button onClick={openCreateEventModalWithDate} className="w-full text-left p-4 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition-colors flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center"><CalendarPlus size={18}/></div>
                    <div>
                      <div className="font-bold text-sm text-slate-900">Add Event / Meeting</div>
                      <div className="text-xs text-slate-500">Create an official schedule</div>
                    </div>
                  </button>
                )}
                <button onClick={openNoteModal} className="w-full text-left p-4 rounded-xl border border-slate-100 hover:border-amber-200 hover:bg-amber-50 transition-colors flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center"><CalendarIcon size={18}/></div>
                    <div>
                      <div className="font-bold text-sm text-slate-900">Personal Note</div>
                      <div className="text-xs text-slate-500">Add a private note for this date</div>
                    </div>
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showNoteModal && selectedDate && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-900 text-lg">Note for {format(selectedDate, 'MMM dd')}</h3>
                <button onClick={() => setShowNoteModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
              </div>
              <textarea 
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                placeholder="Write your note here..."
                className="w-full h-32 p-4 rounded-xl border border-slate-200 mb-4 resize-none text-sm"
              ></textarea>
              <div className="flex gap-3">
                <button 
                  onClick={handleDeleteNote}
                  disabled={isSavingNote}
                  className="flex items-center justify-center px-4 py-3 bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 font-bold rounded-xl text-sm transition-colors"
                  title="Delete Note"
                >
                  <Trash2 size={18} />
                </button>
                <button 
                  onClick={handleSaveNote}
                  disabled={isSavingNote}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm transition-colors"
                >
                  {isSavingNote ? 'Saving...' : 'Save Note'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-100 shrink-0">
                <h2 className="text-xl font-bold text-slate-900">Create New Event</h2>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-900 transition-colors bg-slate-50 hover:bg-slate-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                <form id="create-event-form" onSubmit={handleCreateEvent} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Event Name <span className="text-red-500">*</span></label>
                    <input type="text" required value={eventName} onChange={e => setEventName(e.target.value)} placeholder="e.g. Annual Committee Meet" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white" />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Theme / Title</label>
                    <input type="text" value={theme} onChange={e => setTheme(e.target.value)} placeholder="Theme of the event" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Speaker</label>
                    <input type="text" value={speaker} onChange={e => setSpeaker(e.target.value)} placeholder="Guest Speaker Name" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date <span className="text-red-500">*</span></label>
                      <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time <span className="text-red-500">*</span></label>
                      <input type="time" required value={time} onChange={e => setTime(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white" />
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Format</label>
                    <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200 mb-4">
                      <button type="button" onClick={() => setIsOnline(false)} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${!isOnline ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>Offline in-person</button>
                      <button type="button" onClick={() => setIsOnline(true)} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${isOnline ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>Online Session</button>
                    </div>
                  </div>

                  {isOnline ? (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Meeting Link</label>
                      <input type="url" value={meetLink} onChange={e => setMeetLink(e.target.value)} placeholder="https://meet.google.com/..." className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white" />
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Venue / Location</label>
                      <input type="text" value={venue} onChange={e => setVenue(e.target.value)} placeholder="e.g. Main Hall" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white" />
                    </div>
                  )}
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Poster / Picture</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={async (e) => {
                        if (e.target.files && e.target.files[0]) {
                           const base64 = await fileToBase64(e.target.files[0]);
                           setPosterUrl(base64);
                        }
                      }} 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white" 
                    />
                    {posterUrl && <img src={posterUrl} alt="Preview" className="h-20 w-auto rounded mt-2 object-cover" />}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Extra Note</label>
                    <textarea value={extraNote} onChange={e => setExtraNote(e.target.value)} placeholder="Any extra information for this event" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white resize-none" rows={3}></textarea>
                  </div>

                </form>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50 shrink-0">
                 <button 
                    type="submit"
                    form="create-event-form"
                    disabled={isSubmitting || !eventName || !date || !time}
                    className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? 'Creating...' : 'Submit Event'}
                  </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

