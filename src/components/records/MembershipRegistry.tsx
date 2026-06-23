import React, { useState, useEffect } from 'react';
import { ChevronLeft, Plus, Search, Trash2, Edit, Filter, User } from 'lucide-react';
import { dbService } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

export const MembershipRegistry: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { hasRole } = useAuth();
  const canCreate = hasRole(['SECRETARY', 'ADMIN', 'PRESIDENT', 'SENIOR_ADVISOR', 'CELL_LEADER', 'CELL_PARENT']);
  
  const [members, setMembers] = useState<any[]>([]);
  const [cells, setCells] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCellId, setFilterCellId] = useState<string>('');
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ id: '', name: '', status: 'Student', phone: '', email: '', profession: '', place: '', cellId: '' });

  const fetchData = async () => {
    setLoading(true);
    const [memData, activeCells] = await Promise.all([
      dbService.getMembershipRecords(),
      dbService.getPrayerCells()
    ]);
    if (memData) setMembers(memData);
    if (activeCells) setCells(activeCells);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (formData.id) {
      await dbService.updateMembershipRecord(formData.id, {
        name: formData.name,
        status: formData.status,
        phone: formData.phone,
        email: formData.email,
        profession: formData.profession,
        place: formData.place,
        cellId: formData.cellId
      });
    } else {
      await dbService.addMembershipRecord({
        name: formData.name,
        status: formData.status,
        phone: formData.phone,
        email: formData.email,
        profession: formData.profession,
        place: formData.place,
        cellId: formData.cellId,
        createdAt: new Date().toISOString()
      });
    }
    setFormData({ id: '', name: '', status: 'Student', phone: '', email: '', profession: '', place: '', cellId: '' });
    setShowForm(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this member record?")) {
      await dbService.deleteMembershipRecord(id);
      fetchData();
    }
  };

  const filtered = members.filter(m => {
     let match = true;
     if (filterCellId) match = m.cellId === filterCellId;
     if (search && match) {
        match = m.name?.toLowerCase().includes(search.toLowerCase()) || 
                m.place?.toLowerCase().includes(search.toLowerCase()) || 
                m.profession?.toLowerCase().includes(search.toLowerCase());
     }
     return match;
  });

  if (loading) {
     return <div className="p-8 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Membership Registry...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500">
          <ChevronLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-light tracking-tight text-slate-900">Membership Registry</h2>
          <p className="text-slate-500 text-sm">Detailed records of members and their associated cells</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-2 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex-1 flex items-center gap-3 px-4">
          <Search size={20} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Search members..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-none focus:outline-none text-slate-700 placeholder:text-slate-400 text-sm"
          />
        </div>
        <div className="flex items-center gap-2 border-l border-slate-100 pl-4">
           <Filter size={16} className="text-slate-400" />
           <select 
             value={filterCellId} 
             onChange={e => setFilterCellId(e.target.value)}
             className="bg-transparent border-none focus:outline-none text-sm font-bold text-slate-600 cursor-pointer"
           >
             <option value="">All Prayer Cells</option>
             {cells.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
           </select>
        </div>
        {canCreate && (
          <button 
            onClick={() => {
              setFormData({ id: '', name: '', status: 'Student', phone: '', email: '', profession: '', place: '', cellId: '' });
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-indigo-700 transition-colors shrink-0"
          >
            <Plus size={16} /> Add Member
          </button>
        )}
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                <th className="p-4">Name</th>
                <th className="p-4">Prayer Cell</th>
                <th className="p-4">Status</th>
                <th className="p-4">Profession / College</th>
                <th className="p-4">Place / Work Place</th>
                <th className="p-4">Contact</th>
                {canCreate && <th className="p-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="text-sm">
              {cells.map(cell => {
                 const cellMembers = filtered.filter(m => m.cellId === cell.id);
                 if (cellMembers.length === 0) return null;
                 
                 return (
                   <React.Fragment key={cell.id}>
                     <tr className="bg-slate-100/50">
                       <td colSpan={7} className="p-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200">
                         {cell.name}
                       </td>
                     </tr>
                     {cellMembers.map(member => (
                        <tr key={member.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 font-bold text-slate-900">
                            <div className="flex items-center gap-2">
                              <User size={16} className="text-slate-400" />
                              {member.name}
                            </div>
                          </td>
                          <td className="p-4 font-medium text-indigo-600">{cell.name}</td>
                          <td className="p-4"><span className={`px-2.5 py-1 rounded-full text-xs font-bold ${member.status === 'Student' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>{member.status || 'Graduated'}</span></td>
                          <td className="p-4 text-slate-600">{member.profession || '-'}</td>
                          <td className="p-4 text-slate-600">{member.place || '-'}</td>
                          <td className="p-4 text-slate-500">
                            <div>{member.phone}</div>
                            <div className="text-xs text-slate-400">{member.email}</div>
                          </td>
                          {canCreate && (
                            <td className="p-4 text-right space-x-2">
                              <button onClick={() => { setFormData(member); setShowForm(true); }} className="text-slate-400 hover:text-indigo-600 transition-colors"><Edit size={16} /></button>
                              <button onClick={() => handleDelete(member.id)} className="text-slate-400 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                            </td>
                          )}
                        </tr>
                     ))}
                   </React.Fragment>
                 );
              })}

              {/* Unassigned members */}
              {(() => {
                const unassigned = filtered.filter(m => !m.cellId);
                if (unassigned.length === 0) return null;
                return (
                   <React.Fragment key="unassigned">
                     <tr className="bg-slate-100/50">
                       <td colSpan={7} className="p-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200">
                         Unassigned
                       </td>
                     </tr>
                     {unassigned.map(member => (
                        <tr key={member.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 font-bold text-slate-900">
                            <div className="flex items-center gap-2">
                              <User size={16} className="text-slate-400" />
                              {member.name}
                            </div>
                          </td>
                          <td className="p-4 font-medium text-slate-400">Unassigned</td>
                          <td className="p-4"><span className={`px-2.5 py-1 rounded-full text-xs font-bold ${member.status === 'Student' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>{member.status || 'Graduated'}</span></td>
                          <td className="p-4 text-slate-600">{member.profession || '-'}</td>
                          <td className="p-4 text-slate-600">{member.place || '-'}</td>
                          <td className="p-4 text-slate-500">
                            <div>{member.phone}</div>
                            <div className="text-xs text-slate-400">{member.email}</div>
                          </td>
                          {canCreate && (
                            <td className="p-4 text-right space-x-2">
                              <button onClick={() => { setFormData(member); setShowForm(true); }} className="text-slate-400 hover:text-indigo-600 transition-colors"><Edit size={16} /></button>
                              <button onClick={() => handleDelete(member.id)} className="text-slate-400 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                            </td>
                          )}
                        </tr>
                     ))}
                   </React.Fragment>
                );
              })()}

              {filtered.length === 0 && (
                <tr><td colSpan={7} className="p-8 text-center text-slate-400 italic font-medium">No members match your criteria.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <motion.div initial={{opacity:0, scale: 0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale: 0.95}} className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e=>e.stopPropagation()}>
                <div className="p-6 border-b border-slate-100 bg-slate-50 shrink-0">
                  <h2 className="text-xl font-bold text-slate-900">{formData.id ? 'Edit Member Record' : 'Add Member Record'}</h2>
                </div>
                <div className="p-6 overflow-y-auto">
                  <form id="member-form" onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Full Name *</label>
                      <input type="text" required value={formData.name} onChange={e=>setFormData({...formData, name:e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm" placeholder="John Doe" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Status</label>
                      <select value={formData.status} onChange={e=>setFormData({...formData, status:e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm">
                         <option value="Student">Student</option>
                         <option value="Graduate">Graduate</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Phone Number</label>
                      <input type="text" value={formData.phone} onChange={e=>setFormData({...formData, phone:e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm" placeholder="+1 234 567 890" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Email Address</label>
                      <input type="email" value={formData.email} onChange={e=>setFormData({...formData, email:e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm" placeholder="john@example.com" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Profession / Study Course</label>
                      <input type="text" value={formData.profession} onChange={e=>setFormData({...formData, profession:e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm" placeholder="B.Tech CS / Software Engineer" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Place / Work Place / College</label>
                      <input type="text" value={formData.place} onChange={e=>setFormData({...formData, place:e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm" placeholder="City Center / Microsoft" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Prayer Cell Assignment</label>
                      <select value={formData.cellId} onChange={e=>setFormData({...formData, cellId:e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-700">
                         <option value="">-- Unassigned --</option>
                         {cells.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  </form>
                </div>
                <div className="p-6 flex gap-2 justify-end border-t border-slate-100 bg-slate-50 shrink-0">
                  <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 text-slate-500 font-bold uppercase tracking-widest text-[10px] hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
                  <button type="submit" form="member-form" className="px-6 py-3 bg-indigo-600 text-white font-bold uppercase tracking-widest text-[10px] rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">Save Member Record</button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
