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
  Check
} from 'lucide-react';
import { nanoid } from 'nanoid';

export const AdminPanel: React.FC = () => {
  const { hasRole } = useAuth();
  const [invites, setInvites] = useState<any[]>([]);
  const [newInviteEmail, setNewInviteEmail] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([UserRole.CELL_MEMBER]);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const rolesList = Object.values(UserRole);

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
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
    // Refresh logic would go here
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
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <UserPlus className="text-slate-900" size={20} />
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Generate Secure Invite</h3>
          </div>
          
          <form onSubmit={handleCreateInvite} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recipient Email</label>
              <input 
                type="email" 
                required
                value={newInviteEmail}
                onChange={e => setNewInviteEmail(e.target.value)}
                placeholder="colleague@committee.org"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none"
              />
            </div>

            <div className="space-y-2">
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
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2"
            >
              <Link size={18} />
              Create Invite Link
            </button>
          </form>
        </div>

        {/* Info/Protection */}
        <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200/50 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-xl shadow-slate-200 mb-6">
              <Shield className="text-slate-900" size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Role Protection Policy</h3>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
              Every invite token is cryptographically secure and bound to a specific email address. Tokens expire automatically after 7 days.
            </p>
            <div className="mt-8 flex gap-2">
               <AlertCircle size={14} className="text-amber-500" />
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Audit logs are active</span>
            </div>
        </div>
      </div>
    </div>
  );
};
