import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Database, 
  MessageSquare, 
  LogOut, 
  ShieldCheck,
  ChevronRight,
  BookOpen,
  SunMoon,
  Clock
} from 'lucide-react';
import { UserRole } from '../../types';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  isActive?: boolean;
  onClick: () => void;
  roles?: UserRole[];
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, isActive, onClick, roles }) => {
  const { hasRole } = useAuth();
  
  if (roles && !hasRole(roles)) return null;

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
        isActive 
          ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <Icon size={18} />
      <span className="text-sm font-medium">{label}</span>
      {isActive && <ChevronRight size={14} className="ml-auto opacity-50" />}
    </button>
  );
};

export const Shell: React.FC<{ children: React.ReactNode, activeTab: string, setActiveTab: (t: string) => void }> = ({ children, activeTab, setActiveTab }) => {
  const { user, profile, logOut, hasRole } = useAuth();

  const isCommittee = hasRole([
    UserRole.SENIOR_ADVISOR, 
    UserRole.PRESIDENT, 
    UserRole.SECRETARY, 
    UserRole.TREASURER, 
    UserRole.PRAYER_SECRETARY, 
    UserRole.PRAYER_CELL_SECRETARY
  ]);

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 z-10">
        <div className="flex items-center gap-8">
          <span className="font-bold text-xl tracking-tight text-slate-800">COMMITTEE.HUB</span>
          <nav className="hidden md:flex gap-6">
            <button 
              onClick={() => setActiveTab('cells')}
              className={`text-sm font-medium transition-colors ${activeTab === 'cells' ? 'text-slate-900 border-b-2 border-slate-900 pb-5 pt-5' : 'text-slate-400 hover:text-slate-600 pb-5 pt-5'}`}
            >
              Prayer Cells
            </button>
            <button 
              onClick={() => setActiveTab('events')}
              className={`text-sm font-medium transition-colors ${activeTab === 'events' ? 'text-slate-900 border-b-2 border-slate-900 pb-5 pt-5' : 'text-slate-400 hover:text-slate-600 pb-5 pt-5'}`}
            >
              Events
            </button>
            {isCommittee && (
              <button 
                onClick={() => setActiveTab('records')}
                className={`text-sm font-medium transition-colors ${activeTab === 'records' ? 'text-slate-900 border-b-2 border-slate-900 pb-5 pt-5' : 'text-slate-400 hover:text-slate-600 pb-5 pt-5'}`}
              >
                Records
              </button>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end mr-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-tighter">{profile?.name}</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest">{profile?.roles?.[0]?.replace('_', ' ')}</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center border border-slate-100 group hover:border-slate-300 transition-all cursor-pointer overflow-hidden">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="font-bold text-slate-400 text-xs">{profile?.name?.charAt(0)}</span>
            )}
          </div>
          <button 
            onClick={logOut}
            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col gap-2 shrink-0 overflow-y-auto">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 px-2">Navigation</h3>
          
          <SidebarItem 
            icon={Users} 
            label="Prayer Cells" 
            isActive={activeTab === 'cells'} 
            onClick={() => setActiveTab('cells')} 
          />
          
          <SidebarItem 
            icon={Calendar} 
            label="Community Events" 
            isActive={activeTab === 'events'} 
            onClick={() => setActiveTab('events')} 
          />

          <SidebarItem 
            icon={BookOpen} 
            label="Quiet Time" 
            isActive={activeTab === 'qt'} 
            onClick={() => setActiveTab('qt')} 
          />

          <div className="my-4 border-t border-slate-100" />
          
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 px-2">Committee Tools</h3>
          
          <SidebarItem 
            icon={DollarSign} 
            label="Treasury" 
            isActive={activeTab === 'treasury'} 
            onClick={() => setActiveTab('treasury')}
            roles={[UserRole.TREASURER, UserRole.SECRETARY, UserRole.ADMIN]}
          />

          <SidebarItem 
            icon={SunMoon} 
            label="Dawn/Dusk Prayers" 
            isActive={activeTab === 'prayers'} 
            onClick={() => setActiveTab('prayers')}
            roles={[UserRole.PRAYER_SECRETARY, UserRole.ADMIN, UserRole.SENIOR_ADVISOR]}
          />

          <SidebarItem 
            icon={Database} 
            label="All Records" 
            isActive={activeTab === 'records'} 
            onClick={() => setActiveTab('records')}
            roles={[UserRole.SECRETARY, UserRole.ADMIN, UserRole.SENIOR_ADVISOR, UserRole.PRESIDENT, UserRole.PRAYER_CELL_SECRETARY]}
          />

          <SidebarItem 
            icon={MessageSquare} 
            label="Committee Chat" 
            isActive={activeTab === 'chat'} 
            onClick={() => setActiveTab('chat')}
            roles={[UserRole.SENIOR_ADVISOR, UserRole.PRESIDENT, UserRole.SECRETARY, UserRole.TREASURER, UserRole.PRAYER_SECRETARY, UserRole.PRAYER_CELL_SECRETARY, UserRole.ADMIN]}
          />

          <div className="mt-auto pt-4 border-t border-slate-100">
            <SidebarItem 
              icon={ShieldCheck} 
              label="Admin Panel" 
              isActive={activeTab === 'admin'} 
              onClick={() => setActiveTab('admin')}
              roles={[UserRole.ADMIN]}
            />
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Footer Info (Minimal) */}
      <footer className="h-8 bg-white border-t border-slate-200 px-8 flex items-center justify-between shrink-0">
        <div className="flex gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Authenticated</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={10} />
            <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
        <span className="text-[10px] text-slate-300 font-medium">DESIGNED BY SONALI STUDIO &bull; 2024</span>
      </footer>
    </div>
  );
};
