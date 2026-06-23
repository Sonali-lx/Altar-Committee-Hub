import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/db';
import { UserRole } from '../../types';
import { motion } from 'motion/react';
import { LogOut, ArrowRight, Camera } from 'lucide-react';
import { User } from 'firebase/auth';

export const SetupProfile: React.FC<{ user: User }> = ({ user }) => {
  const { logOut, refreshProfile } = useAuth();
  
  const [name, setName] = useState(user.displayName || '');
  const [photoURL, setPhotoURL] = useState(user.photoURL || '');
  const [status, setStatus] = useState<'student' | 'graduate'>('student');
  const [usage, setUsage] = useState<'personal' | 'community' | 'committee'>('personal');
  const [phone, setPhone] = useState('');
  const [degree, setDegree] = useState('');
  const [branch, setBranch] = useState('');
  const [college, setCollege] = useState('');
  const [profession, setProfession] = useState('');
  const [workplace, setWorkplace] = useState('');
  const [district, setDistrict] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const roles: UserRole[] = [UserRole.CELL_MEMBER];
      
      if (user.email === 'sonalisjs37@gmail.com') {
        roles.push(UserRole.ADMIN);
      }
      
      await dbService.createUser(user.uid, {
        uid: user.uid,
        name: name.trim() || 'New User',
        email: user.email || '',
        photoURL,
        roles,
        status,
        usage,
        phone,
        ...(status === 'student' ? { degree, branch, college } : { profession, workplace, district }),
        prayerCellIds: [],
        createdAt: new Date().toISOString()
      });
      
      await refreshProfile();
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1507692049790-de58290a4334?q=80&w=2070&auto=format&fit=crop")' }}>
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <h2 className="mt-6 text-center text-3xl font-serif italic text-white">Your Sanctuary Profile</h2>
        <p className="mt-2 text-center text-sm text-slate-300">
          Welcome! Please set up your Altar profile.
        </p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="bg-white/10 backdrop-blur-xl py-8 px-4 shadow-2xl sm:rounded-3xl sm:px-10 border border-white/20">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="flex justify-center mb-6">
              <div className="relative">
                {photoURL ? (
                  <img src={photoURL} alt="Profile" className="h-20 w-20 rounded-3xl object-cover border-2 border-white/20" />
                ) : (
                  <div className="h-20 w-20 bg-white/5 border border-white/20 rounded-3xl flex items-center justify-center backdrop-blur-md">
                    <Camera className="h-8 w-8 text-white/50" />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-2">
                User ID (Email)
              </label>
              <input
                type="email"
                readOnly
                value={user.email || ''}
                className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-white/5 text-slate-400 outline-none font-medium cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-2">
                Display Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-500 font-medium"
                placeholder="What should we call you?"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-500 font-medium"
                placeholder="Your contact number"
              />
            </div>

            <div className="pt-2">
              <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-3">
                Current Status
              </label>
              <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 mb-4">
                <button
                  type="button"
                  onClick={() => setStatus('student')}
                  className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${status === 'student' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('graduate')}
                  className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${status === 'graduate' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                  Graduate
                </button>
              </div>

              {status === 'student' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-2">Degree</label>
                    <input type="text" placeholder="e.g. B.Tech, B.Sc" value={degree} onChange={e => setDegree(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-2">Branch</label>
                    <input type="text" placeholder="e.g. CSE, Chemistry" value={branch} onChange={e => setBranch(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-2">College</label>
                    <input type="text" placeholder="Your College Name" value={college} onChange={e => setCollege(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none" />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-2">Profession</label>
                    <input type="text" placeholder="Your Job Title" value={profession} onChange={e => setProfession(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-2">Working Place</label>
                    <input type="text" placeholder="Company Name / Location" value={workplace} onChange={e => setWorkplace(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-2">District</label>
                    <input type="text" placeholder="e.g. Chennai, Madurai" value={district} onChange={e => setDistrict(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none" />
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2">
              <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-3">
                Intended Use
              </label>
              <div className="space-y-2">
                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${usage === 'personal' ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                  <input type="radio" value="personal" checked={usage === 'personal'} onChange={() => setUsage('personal')} className="hidden" />
                  <div>
                    <div className="text-sm font-bold text-white">Personal Utilities</div>
                    <div className="text-xs text-slate-400 mt-1">Quiet times, journals, and devotionals.</div>
                  </div>
                </label>
                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${usage === 'community' ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                  <input type="radio" value="community" checked={usage === 'community'} onChange={() => setUsage('community')} className="hidden" />
                  <div>
                    <div className="text-sm font-bold text-white">Community & Fellowship</div>
                    <div className="text-xs text-slate-400 mt-1">Join prayer cells and upcoming events.</div>
                  </div>
                </label>
                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${usage === 'committee' ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                  <input type="radio" value="committee" checked={usage === 'committee'} onChange={() => setUsage('committee')} className="hidden" />
                  <div>
                     <div className="text-sm font-bold text-white">Committee Use</div>
                     <div className="text-xs text-slate-400 mt-1">Manage finances, cells, and organization.</div>
                  </div>
                </label>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting || !name.trim()}
                className="w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-2xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-50 tracking-widest uppercase"
              >
                {isSubmitting ? 'Creating Profile...' : 'Complete Profile'}
                <ArrowRight size={18} />
              </button>
            </div>
            
            <div className="pt-2 text-center">
              <button 
                type="button"
                onClick={logOut}
                className="text-[10px] uppercase tracking-widest text-slate-400 hover:text-white flex items-center justify-center gap-2 mx-auto font-bold transition-colors"
                disabled={isSubmitting}
              >
                <LogOut size={14} /> Switch Account
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
