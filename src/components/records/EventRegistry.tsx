import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/db';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Calendar, Users, MapPin, Search, Plus, X } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import { fileToBase64 } from '../../utils/fileUtils';

export const EventRegistry: React.FC<{ onBack: () => void, initialCollectionId?: string }> = ({ onBack, initialCollectionId }) => {
  const { profile, hasRole } = useAuth();
  const canCreate = hasRole(['SECRETARY', 'ADMIN', 'PRESIDENT', 'SENIOR_ADVISOR', 'CELL_LEADER', 'CELL_PARENT']);

  const [events, setEvents] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(initialCollectionId || null);
  const [usersMap, setUsersMap] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showManageCollections, setShowManageCollections] = useState(false);
  const [showAddToCollection, setShowAddToCollection] = useState<{eventId: string, currentIds: string[]} | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
  const [selectedEventCollectionIds, setSelectedEventCollectionIds] = useState<string[]>([]);

  const fetchData = async () => {
    const [dbEvents, dbCollections] = await Promise.all([
      dbService.getEvents(),
      dbService.getEventCollections()
    ]);
    if (dbCollections) setCollections(dbCollections);
    if (dbEvents) {
      setEvents(dbEvents);
      
      // Fetch users to map attendance names
      const allUids = new Set<string>();
      dbEvents.forEach((ev: any) => {
        if (ev.attendance) {
          Object.keys(ev.attendance).forEach(uid => {
             if (ev.attendance[uid]) allUids.add(uid);
          });
        }
      });
      
      if (allUids.size > 0) {
        const usersRes = await dbService.getUsers(Array.from(allUids));
        const uMap: Record<string, any> = {};
        usersRes.forEach(u => {
          uMap[u.id] = u;
        });
        setUsersMap(uMap);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

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
      collectionIds: selectedEventCollectionIds,
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
    setSelectedEventCollectionIds(selectedCollectionId ? [selectedCollectionId] : []);
    
    fetchData();
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      await dbService.deleteEvent(eventId);
      fetchData();
    }
  };

  const handleUpdateEventCollections = async (eventId: string, newCollectionIds: string[]) => {
    await dbService.updateEvent(eventId, { collectionIds: newCollectionIds });
    setShowAddToCollection(null);
    fetchData();
  };

  const [editingCollectionId, setEditingCollectionId] = useState<string | null>(null);
  const [collectionName, setCollectionName] = useState('');

  const handleCreateCollection = async () => {
    if (!collectionName.trim()) return;
    setIsSubmitting(true);
    await dbService.createEventCollection(collectionName.trim());
    setCollectionName('');
    setIsSubmitting(false);
    fetchData();
  };

  const handleUpdateCollection = async (id: string) => {
    if (!collectionName.trim()) return;
    setIsSubmitting(true);
    await dbService.updateEventCollection(id, collectionName.trim());
    setEditingCollectionId(null);
    setCollectionName('');
    setIsSubmitting(false);
    fetchData();
  };

  const handleDeleteCollection = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this collection? This will not delete the events inside it.")) {
      await dbService.deleteEventCollection(id);
      if (selectedCollectionId === id) setSelectedCollectionId(null);
      fetchData();
    }
  };

  if (loading) {
     return <div className="p-8 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Event Records...</div>;
  }

  const filteredEvents = events.filter(e => {
     let match = true;
     if (selectedCollectionId) {
        match = e.collectionIds?.includes(selectedCollectionId);
     }
     if (search && match) {
        match = e.eventName?.toLowerCase().includes(search.toLowerCase()) || e.theme?.toLowerCase().includes(search.toLowerCase());
     }
     return match;
  });

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between items-start gap-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-colors">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h2 className="text-2xl font-light tracking-tight text-slate-900">Event Registry</h2>
            <p className="text-sm text-slate-500 font-medium">Historical records of all official events and attendance.</p>
          </div>
        </div>
        {canCreate && (
          <button 
            onClick={() => {
              setSelectedEventCollectionIds(selectedCollectionId ? [selectedCollectionId] : []);
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
          >
            <Plus size={16} /> Add Event Record
          </button>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-100 no-scrollbar">
        <button 
          onClick={() => setSelectedCollectionId(null)}
          className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${!selectedCollectionId ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          All Events
        </button>
        {collections.map(c => (
           <button
             key={c.id}
             onClick={() => setSelectedCollectionId(c.id)}
             className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors flex items-center gap-2 ${selectedCollectionId === c.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
           >
             {c.name}
           </button>
        ))}
        {canCreate && (
          <button 
            onClick={() => setShowManageCollections(true)}
            className="px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors flex items-center gap-1"
          >
            <Plus size={16} /> Add Collection
          </button>
        )}
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-2 flex items-center gap-3">
        <div className="p-3 text-slate-400"><Search size={20} /></div>
        <input 
          type="text" 
          placeholder="Search events by name or theme..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-transparent px-2 py-3 outline-none text-sm font-medium text-slate-900"
        />
      </div>

      <div className="space-y-4">
        {filteredEvents.map((ev, idx) => {
           const evDate = new Date(`${ev.date}T${ev.time || '00:00'}`);
           const attendees = Object.keys(ev.attendance || {}).filter(uid => ev.attendance[uid]);
           return (
             <motion.div 
                key={ev.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col md:flex-row gap-6 shadow-sm"
             >
                <div className="flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-slate-50 text-slate-500 shrink-0 border border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-widest">{format(evDate, 'MMM')}</span>
                  <span className="text-xl font-bold text-slate-900">{format(evDate, 'dd')}</span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-bold text-slate-900 truncate">{ev.eventName}</h3>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">
                      {ev.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  {ev.theme && <p className="text-sm text-slate-600 font-medium truncate mb-1">Theme: {ev.theme}</p>}
                  {ev.extraNote && <div className="text-sm text-amber-800 bg-amber-50 p-2 rounded border border-amber-100 my-2">{ev.extraNote}</div>}
                  {ev.posterUrl && <img src={ev.posterUrl} alt="Poster" className="max-h-32 rounded object-cover my-2 border border-slate-100 shadow-sm" />}
                  
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1.5"><Calendar size={14} /> {format(evDate, 'h:mm a')}</span>
                    <span className="flex items-center gap-1.5"><MapPin size={14} /> {ev.isOnline ? 'Google Meet' : (ev.venue || 'TBD')}</span>
                    <span className="flex items-center gap-1.5"><Users size={14} /> {attendees.length} Attendees</span>
                  </div>

                  {canCreate && (
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                      <button 
                        onClick={() => setShowAddToCollection({eventId: ev.id, currentIds: ev.collectionIds || []})}
                        className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg uppercase tracking-widest hover:bg-indigo-100 transition-colors"
                      >
                        Collections
                      </button>
                      <button 
                        onClick={() => handleDeleteEvent(ev.id)}
                        className="text-[10px] font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg uppercase tracking-widest hover:bg-red-100 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  )}

                  {attendees.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Attendee Roster</p>
                      <div className="flex flex-wrap gap-2">
                        {attendees.map(uid => {
                          const u = usersMap[uid];
                          if (!u) return null;
                          return (
                            <div key={uid} className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
                               {u.photoURL ? (
                                  <img src={u.photoURL} alt={u.name} className="w-4 h-4 rounded-full object-cover" />
                               ) : (
                                  <div className="w-4 h-4 rounded-full bg-slate-200 flex flex-col items-center justify-center text-[8px] font-bold text-slate-600">
                                    {u.name.charAt(0)}
                                  </div>
                               )}
                               <span className="text-xs font-bold text-slate-700">{u.name.split(' ')[0]}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
             </motion.div>
           );
        })}
        {filteredEvents.length === 0 && (
          <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No events found</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-100 shrink-0">
                <h2 className="text-xl font-bold text-slate-900">Add Historical Event Record</h2>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                <form id="record-event-form" onSubmit={handleCreateEvent} className="space-y-4">
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

                  {collections.length > 0 && (
                     <div className="space-y-2 pt-2">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Add to Collections</label>
                       <div className="flex flex-wrap gap-2">
                         {collections.map(c => {
                            const isSelected = selectedEventCollectionIds.includes(c.id);
                            return (
                               <label key={c.id} className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-colors ${isSelected ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                                  <input 
                                     type="checkbox"
                                     checked={isSelected}
                                     onChange={e => {
                                        if (e.target.checked) setSelectedEventCollectionIds([...selectedEventCollectionIds, c.id]);
                                        else setSelectedEventCollectionIds(selectedEventCollectionIds.filter(id => id !== c.id));
                                     }}
                                     className="hidden"
                                  />
                                  {c.name}
                               </label>
                            );
                         })}
                       </div>
                     </div>
                  )}

                </form>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50 shrink-0">
                 <button 
                    type="submit"
                    form="record-event-form"
                    disabled={isSubmitting || !eventName || !date || !time}
                    className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Record'}
                  </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showManageCollections && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-100 shrink-0">
                <h2 className="text-xl font-bold text-slate-900">Manage Collections</h2>
                <button 
                  onClick={() => setShowManageCollections(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto space-y-4">
                <div className="flex items-center gap-2 mb-6">
                  <input 
                    type="text" 
                    value={editingCollectionId ? '' : collectionName} 
                    onChange={e => {
                       if (!editingCollectionId) setCollectionName(e.target.value);
                    }}
                    placeholder="New collection name..." 
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm"
                    disabled={!!editingCollectionId}
                  />
                  <button 
                    onClick={handleCreateCollection}
                    disabled={isSubmitting || !!editingCollectionId || !collectionName.trim()}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm tracking-wide hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
                
                <div className="space-y-2">
                  {collections.map(c => (
                     <div key={c.id} className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                        {editingCollectionId === c.id ? (
                           <input 
                              type="text" 
                              value={collectionName} 
                              onChange={e => setCollectionName(e.target.value)}
                              className="flex-1 px-3 py-2 border border-indigo-200 rounded text-sm bg-white"
                              autoFocus
                           />
                        ) : (
                           <span className="flex-1 font-bold text-slate-700 text-sm">{c.name}</span>
                        )}
                        
                        {editingCollectionId === c.id ? (
                           <div className="flex items-center gap-1">
                              <button onClick={() => handleUpdateCollection(c.id)} className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded text-xs font-bold uppercase tracking-widest hover:bg-emerald-200 transition-colors">Save</button>
                              <button onClick={() => {setEditingCollectionId(null); setCollectionName('');}} className="px-3 py-1.5 bg-slate-200 text-slate-600 rounded text-xs font-bold uppercase tracking-widest hover:bg-slate-300 transition-colors">Cancel</button>
                           </div>
                        ) : (
                           <div className="flex items-center gap-1">
                              <button onClick={() => {setEditingCollectionId(c.id); setCollectionName(c.name);}} className="px-3 py-1.5 bg-slate-200 text-slate-600 rounded text-xs font-bold uppercase tracking-widest hover:bg-slate-300 transition-colors">Edit</button>
                              <button onClick={() => handleDeleteCollection(c.id)} className="px-3 py-1.5 bg-red-100 text-red-600 rounded text-xs font-bold uppercase tracking-widest hover:bg-red-200 transition-colors">Delete</button>
                           </div>
                        )}
                     </div>
                  ))}
                  {collections.length === 0 && <p className="text-center text-sm font-medium text-slate-400 py-4">No collections exist yet.</p>}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddToCollection && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-sm shadow-2xl flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-100 shrink-0">
                <h2 className="text-lg font-bold text-slate-900">Add to Collections</h2>
                <button 
                  onClick={() => setShowAddToCollection(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto space-y-3">
                {collections.length === 0 ? (
                  <p className="text-sm text-slate-500 font-medium">No collections available to add.</p>
                ) : collections.map(c => {
                   const isSelected = showAddToCollection.currentIds.includes(c.id);
                   return (
                     <label key={c.id} className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                        <input 
                           type="checkbox"
                           checked={isSelected}
                           onChange={(e) => {
                              const newIds = e.target.checked 
                                 ? [...showAddToCollection.currentIds, c.id]
                                 : showAddToCollection.currentIds.filter((id) => id !== c.id);
                              setShowAddToCollection({...showAddToCollection, currentIds: newIds});
                           }}
                           className="w-5 h-5 border-slate-300 text-indigo-600 focus:ring-indigo-600 rounded"
                        />
                        <span className="font-bold text-sm text-slate-700">{c.name}</span>
                     </label>
                   )
                })}
              </div>
              <div className="p-6 border-t border-slate-100 bg-slate-50 shrink-0">
                 <button 
                    onClick={() => handleUpdateEventCollections(showAddToCollection.eventId, showAddToCollection.currentIds)}
                    className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-indigo-700 transition-all"
                  >
                    Save Changes
                  </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
