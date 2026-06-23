import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/db';
import { Camera, X, Edit2, LogOut, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const { profile, refreshProfile, logOut } = useAuth();
  
  const [isEditingMode, setIsEditingMode] = useState(false);
  
  const [name, setName] = useState(profile?.name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [status, setStatus] = useState<'student' | 'graduate'>(profile?.status || 'student');
  const [degree, setDegree] = useState(profile?.degree || '');
  const [branch, setBranch] = useState(profile?.branch || '');
  const [college, setCollege] = useState(profile?.college || '');
  const [profession, setProfession] = useState(profile?.profession || '');
  const [workplace, setWorkplace] = useState(profile?.workplace || '');
  const [district, setDistrict] = useState(profile?.district || '');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsEditingMode(false);
      setName(profile?.name || '');
      setPhone(profile?.phone || '');
      setStatus(profile?.status || 'student');
      setDegree(profile?.degree || '');
      setBranch(profile?.branch || '');
      setCollege(profile?.college || '');
      setProfession(profile?.profession || '');
      setWorkplace(profile?.workplace || '');
      setDistrict(profile?.district || '');
    }
  }, [isOpen, profile]);

  if (!isOpen || !profile) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const updateData: any = {
        name,
        phone,
        status,
      };

      if (status === 'student') {
        updateData.degree = degree;
        updateData.branch = branch;
        updateData.college = college;
        updateData.profession = "";
        updateData.workplace = "";
        updateData.district = "";
      } else {
        updateData.profession = profession;
        updateData.workplace = workplace;
        updateData.district = district;
        updateData.degree = "";
        updateData.branch = "";
        updateData.college = "";
      }

      await dbService.updateUser(profile.uid, updateData);
      await refreshProfile();
      setIsEditingMode(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-lg bg-white rounded-3xl overflow-hidden relative z-10 shadow-2xl flex flex-col max-h-[90vh]"
        >
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
            <div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                {isEditingMode ? 'Edit Profile' : 'My Profile'}
              </h3>
              <p className="text-sm text-slate-500">
                {isEditingMode ? 'Update your personal information' : 'Your personal information'}
              </p>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-200 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="overflow-y-auto p-6">
            {!isEditingMode ? (
               <div className="space-y-6">
                 <div className="flex flex-col items-center mb-6">
                    <div className="relative">
                      {profile.photoURL ? (
                        <img src={profile.photoURL} alt="Profile" className="h-24 w-24 rounded-full object-cover border-4 border-slate-50 shadow-sm" />
                      ) : (
                        <div className="h-24 w-24 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center text-3xl font-bold text-indigo-600 shadow-sm">
                          {profile.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <h4 className="mt-4 text-xl font-bold text-slate-900">{profile.name}</h4>
                    <p className="text-sm text-slate-500">{profile.email}</p>
                    <div className="mt-2 flex gap-2 flex-wrap justify-center">
                       {profile.roles?.map(role => (
                         <span key={role} className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold uppercase tracking-widest">{role.replace('_', ' ')}</span>
                       ))}
                    </div>
                 </div>

                 <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-4">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Contact</p>
                      <p className="text-sm font-medium text-slate-900">{profile.phone || 'Not provided'}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                      <div className="flex items-center gap-2">
                         <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold uppercase tracking-wider">
                           {profile.status || 'Student'}
                         </span>
                      </div>
                    </div>

                    {(profile.status === 'student' || !profile.status) && (
                      <div className="pt-2 border-t border-slate-200/60 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Degree & Branch</p>
                          <p className="text-sm font-medium text-slate-900">{profile.degree || '-'} &bull; {profile.branch || '-'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">College</p>
                          <p className="text-sm font-medium text-slate-900">{profile.college || '-'}</p>
                        </div>
                      </div>
                    )}

                    {profile.status === 'graduate' && (
                      <div className="pt-2 border-t border-slate-200/60 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Profession & Workplace</p>
                          <p className="text-sm font-medium text-slate-900">{profile.profession || '-'} &bull; {profile.workplace || '-'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">District</p>
                          <p className="text-sm font-medium text-slate-900">{profile.district || '-'}</p>
                        </div>
                      </div>
                    )}
                 </div>
               </div>
            ) : (
              <form id="edit-profile-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="flex justify-center mb-2">
                  <div className="relative">
                    {profile.photoURL ? (
                      <img src={profile.photoURL} alt="Profile" className="h-20 w-20 rounded-full object-cover border-4 border-slate-50 shadow-sm" />
                    ) : (
                      <div className="h-20 w-20 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center text-xl font-bold text-indigo-600 shadow-sm">
                        {name.charAt(0)}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Name</label>
                  <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white" placeholder="Your Name" />
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Email (Cannot be changed)</label>
                  <input type="email" readOnly value={profile.email} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed font-medium" />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Phone</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white" placeholder="Phone Number" />
                </div>

                <div className="pt-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Current Status</label>
                  <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200 mb-4">
                    <button type="button" onClick={() => setStatus('student')} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${status === 'student' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>Student</button>
                    <button type="button" onClick={() => setStatus('graduate')} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${status === 'graduate' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>Graduate</button>
                  </div>

                  {status === 'student' ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Degree</label>
                        <input type="text" value={degree} onChange={e => setDegree(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white" placeholder="e.g. B.Tech" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Branch</label>
                        <input type="text" value={branch} onChange={e => setBranch(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white" placeholder="e.g. CSE" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">College</label>
                        <input type="text" value={college} onChange={e => setCollege(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white" placeholder="Your College Name" />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Profession</label>
                        <input type="text" value={profession} onChange={e => setProfession(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white" placeholder="Job Title" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Working Place</label>
                        <input type="text" value={workplace} onChange={e => setWorkplace(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white" placeholder="Company / Location" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">District</label>
                        <input type="text" value={district} onChange={e => setDistrict(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white" placeholder="District" />
                      </div>
                    </div>
                  )}
                </div>
              </form>
            )}
          </div>
          
          <div className="p-6 border-t border-slate-100 bg-slate-50 shrink-0 flex gap-3">
            {!isEditingMode ? (
               <>
                 <button
                   onClick={() => setIsEditingMode(true)}
                   className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all hover:bg-indigo-700 flex items-center justify-center gap-2"
                 >
                   <Edit2 size={14} />
                   Edit Details
                 </button>
                 <button
                   onClick={() => { onClose(); logOut(); }}
                   className="px-6 py-4 bg-white border border-slate-200 text-red-600 rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all hover:bg-red-50 hover:border-red-200 flex items-center justify-center gap-2"
                 >
                   <LogOut size={14} />
                 </button>
               </>
            ) : (
               <>
                 <button
                   onClick={() => setIsEditingMode(false)}
                   className="px-6 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all hover:bg-slate-100"
                 >
                   Cancel
                 </button>
                 <button
                   type="submit"
                   form="edit-profile-form"
                   disabled={isSubmitting || !name.trim()}
                   className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-2"
                 >
                   {isSubmitting ? 'Saving...' : (
                     <>
                        <CheckCircle2 size={14} />
                        Save Changes
                     </>
                   )}
                 </button>
               </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
