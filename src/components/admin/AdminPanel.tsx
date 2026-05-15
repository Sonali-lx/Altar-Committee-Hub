import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { dbService } from '../../services/db';
import { 
  Shield, 
  UserPlus, 
  Link, 
  Copy, 
  Trash2, 
  AlertCircle,
  Check,
  Clock
} from 'lucide-react';
import { nanoid } from 'nanoid';
import { format } from 'date-fns';

export const AdminPanel: React.FC = () => {
  const { hasRole } = useAuth();
  const [invites, setInvites] = useState<any[]>([]);
  const [newInviteEmail, setNewInviteEmail] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([UserRole.CELL_MEMBER]);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const rolesList = Object.values(UserRole);

  useEffect(() => {
    const unsub = dbService.subscribeInvites(setInvites);
    return () => unsub();
  }, []);

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreating) return;
    setIsCreating(true);
    
    try {
      const token = nanoid(10);
      const invite = {
        token,
        email: newInviteEmail,
        assignedRoles: selectedRoles,
        status: 'pending',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };
      
      await dbService.createInvite(invite);
      setNewInviteEmail('');
      setSelectedRoles([UserRole.CELL_MEMBER]);
    } catch (error) {
      console.error(error);
      alert('Failed to create invite. Check your permissions.');
    } finally {
      setIsCreating(false);
    }
  };

  const copyLink = (token: string) => {
    const link = `${window.location.origin}/join?token=${token}`;
    navigator.clipboard.writeText(link);
    setCopySuccess(token);
    setTimeout(() => setCopySuccess(null), 2000);
  };

  if (!hasRole([UserRole.ADMIN])) return <div>Access Denied</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-light tracking-tight text-slate-900">Admin Control</h1>
        <p className="text-slate-500 font-medium mt-1">Manage invites, roles, and platform permissions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Invite Creator */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <UserPlus className="text-slate-900" size={20} />
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Generate Secure Invite</h3>
          </div>
          
          <form onSubmit={handleCreateInvite} className="space-y-6 flex-1 flex flex-col">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recipient Email</label>
              <input 
                type="email" 
                required
                value={newInviteEmail}
                onChange={e => setNewInviteEmail(e.target.value)}
                placeholder="colleague@committee.org"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all"
              />
            </div>

            <div className="space-y-2 flex-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assign Roles</label>
              <div className="flex flex-wrap gap-2">
                {rolesList.map(role => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => {
                      if (selectedRoles.includes(role)) {
                        setSelectedRoles(selectedRoles.filter(r => r !== role));
                      } else {
                        setSelectedRoles([...selectedRoles, role]);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-tight transition-all border ${
                      selectedRoles.includes(role) 
                      ? 'bg-slate-900 text-white border-slate-900' 
                      : 'bg-slate-50 text-slate-400 border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    {role.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <button 
              type="submit"
              disabled={isCreating}
              className="mt-auto w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 disabled:opacity-50 transition-all"
            >
              <Link size={18} />
              {isCreating ? 'Creating...' : 'Create Invite Link'}
            </button>
          </form>
        </div>

        {/* Existing Invites */}
        <div className="flex flex-col gap-6">
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/50 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-md shadow-slate-200 mb-4">
                <Shield className="text-slate-900" size={24} />
              </div>
              <h3 className="text-[15px] font-bold text-slate-900 mb-1">Role Protection Policy</h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
                Tokens expire automatically after 7 days.
              </p>
          </div>
          
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex-1 flex flex-col max-h-[400px]">
            <h3 className="text-sm font-bold text-slate-900 mb-4 tracking-tight">Active Invites</h3>
            <div className="overflow-y-auto pr-2 space-y-3 flex-1 custom-scrollbar">
              {invites.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-sm">No active invites found.</div>
              )}
              {invites.map((inv) => (
                <div key={inv.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 relative group">
                  <div className="flex justify-between items-start mb-2 pr-8">
                    <span className="text-sm font-bold text-slate-900">{inv.email}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${inv.status === 'pending' ? 'text-amber-500' : 'text-emerald-500'}`}>
                      {inv.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {inv.assignedRoles.map((r: string) => (
                      <span key={r} className="px-2 py-0.5 rounded flex items-center justify-center bg-slate-200 text-slate-600 text-[9px] font-bold uppercase tracking-widest">{r.replace('_', ' ')}</span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-200">
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                      <Clock size={12} />
                      {inv.createdAt ? format(new Date(inv.createdAt), 'MMM d, h:mm a') : 'Unknown'}
                    </div>
                    {inv.status === 'pending' && (
                      <button
                        onClick={() => copyLink(inv.token)}
                        className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:text-slate-900 transition-colors bg-white px-2 py-1 rounded shadow-sm border border-slate-200"
                      >
                        {copySuccess === inv.token ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                        {copySuccess === inv.token ? 'Copied' : 'Copy Link'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
