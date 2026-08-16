import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { EditProfileModal } from '../profile/EditProfileModal';
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
  Clock,
  Menu,
  X,
  Sparkles
} from 'lucide-react';
import { UserRole } from '../../types';
import { MobileNavBar } from './MobileNavBar';
import { BibleAIChatbot } from '../ai/BibleAIChatbot';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [activeTab]);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

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
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0 z-20">
        <div className="flex items-center gap-4 md:gap-8">
          <button 
            className="md:hidden p-2 text-slate-400 hover:text-slate-900"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <span className="font-bold text-lg md:text-xl tracking-tight text-slate-800">ALTAR</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end mr-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-tighter">{profile?.name}</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest">{profile?.roles?.[0]?.replace('_', ' ')}</span>
          </div>
          <div 
            onClick={() => setIsEditProfileOpen(true)}
            className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-slate-100 flex items-center justify-center border border-slate-100 group hover:border-slate-300 transition-all cursor-pointer overflow-hidden"
            title="Edit Profile"
          >
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="font-bold text-slate-400 text-xs">{profile?.name?.charAt(0)}</span>
            )}
          </div>
          <button 
            onClick={logOut}
            className="hidden md:block p-2 text-slate-400 hover:text-red-500 transition-colors"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div 
            className="md:hidden absolute inset-0 bg-slate-900/20 backdrop-blur-sm z-10"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`absolute md:relative w-64 h-full bg-white border-r border-slate-200 p-6 flex flex-col gap-2 shrink-0 overflow-y-auto transform transition-transform duration-300 z-20 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <div className="md:hidden flex items-center gap-3 mb-6 p-2 rounded-xl bg-slate-50 border border-slate-100">
             <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-slate-200 overflow-hidden">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="font-bold text-slate-400 text-xs">{profile?.name?.charAt(0)}</span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-tighter">{profile?.name}</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest">{profile?.roles?.[0]?.replace('_', ' ')}</span>
            </div>
          </div>

          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 px-2">Personal Area</h3>
          
          <SidebarItem 
            icon={BookOpen} 
            label="DashBoard" 
            isActive={activeTab === 'dashboard'} 
            onClick={() => handleTabClick('dashboard')} 
          />

          <SidebarItem 
            icon={SunMoon} 
            label="Quiet Time" 
            isActive={activeTab === 'qt'} 
            onClick={() => handleTabClick('qt')} 
          />

          <SidebarItem 
            icon={MessageSquare} 
            label="Prayer" 
            isActive={activeTab === 'prayer'} 
            onClick={() => handleTabClick('prayer')} 
          />

          <SidebarItem 
            icon={BookOpen} 
            label="Bible Study" 
            isActive={activeTab === 'study'} 
            onClick={() => handleTabClick('study')} 
          />

          <SidebarItem 
            icon={Database} 
            label="Journal" 
            isActive={activeTab === 'journal'} 
            onClick={() => handleTabClick('journal')} 
          />

          <div className="my-2 border-t border-slate-100" />
          
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 px-2">Community Space</h3>
          
          <SidebarItem 
            icon={Users} 
            label="Prayer Cells" 
            isActive={activeTab === 'cells'} 
            onClick={() => handleTabClick('cells')} 
          />
          
          <SidebarItem 
            icon={Calendar} 
            label="Community Events" 
            isActive={activeTab === 'events'} 
            onClick={() => handleTabClick('events')} 
          />

          <SidebarItem 
            icon={Clock} 
            label="Dawn/Dusk Prayers" 
            isActive={activeTab === 'prayers'} 
            onClick={() => handleTabClick('prayers')} 
          />

          <SidebarItem 
            icon={MessageSquare} 
            label="Fellowship Feed" 
            isActive={activeTab === 'chat-comm'} 
            onClick={() => handleTabClick('chat-comm')} 
          />

          <SidebarItem 
            icon={MessageSquare} 
            label="Community Chat" 
            isActive={activeTab === 'chat-realtime'} 
            onClick={() => handleTabClick('chat-realtime')} 
          />

          <div className="my-2 border-t border-slate-100" />
          
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 px-2">Committee Tools</h3>
          
          <SidebarItem 
            icon={DollarSign} 
            label="Treasury" 
            isActive={activeTab === 'treasury'} 
            onClick={() => handleTabClick('treasury')}
            roles={[UserRole.TREASURER, UserRole.SECRETARY, UserRole.ADMIN]}
          />

          <SidebarItem 
            icon={Database} 
            label="All Records" 
            isActive={activeTab === 'records'} 
            onClick={() => handleTabClick('records')}
            roles={[UserRole.SECRETARY, UserRole.ADMIN, UserRole.SENIOR_ADVISOR, UserRole.PRESIDENT, UserRole.PRAYER_CELL_SECRETARY]}
          />

          <SidebarItem 
            icon={MessageSquare} 
            label="Committee Chat" 
            isActive={activeTab === 'chat-cmte'} 
            onClick={() => handleTabClick('chat-cmte')}
            roles={[UserRole.SENIOR_ADVISOR, UserRole.PRESIDENT, UserRole.SECRETARY, UserRole.TREASURER, UserRole.PRAYER_SECRETARY, UserRole.PRAYER_CELL_SECRETARY, UserRole.ADMIN]}
          />

          <div className="mt-auto pt-4 border-t border-slate-100 space-y-2">
            <SidebarItem 
              icon={ShieldCheck} 
              label="Admin Panel" 
              isActive={activeTab === 'admin'} 
              onClick={() => handleTabClick('admin')}
              roles={[UserRole.ADMIN]}
            />
            <button 
              onClick={logOut}
              className="md:hidden w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-red-500 hover:bg-red-50"
            >
              <LogOut size={18} />
              <span className="text-sm font-medium">Log Out</span>
            </button>
          </div>
        </aside>

      {/* Content Area */}
        <main className="flex-1 overflow-y-auto w-full p-4 md:p-8 pb-20 md:pb-8">
          <div className="max-w-6xl mx-auto pb-12">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Bar */}
      <MobileNavBar
        activeTab={activeTab}
        onTabSelect={(t) => handleTabClick(t)}
        onOpenMenu={() => setMobileMenuOpen(true)}
      />

      {/* Footer Info (Minimal) */}
      <footer className="hidden md:flex h-8 bg-white border-t border-slate-200 px-4 md:px-8 items-center justify-between shrink-0">
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
        <span className="text-[10px] text-slate-300 font-medium tracking-widest text-right">DESIGNED BY SONALI STUDIO &bull; 2024</span>
      </footer>

      <EditProfileModal 
        isOpen={isEditProfileOpen} 
        onClose={() => setIsEditProfileOpen(false)} 
      />

      {/* Floating AI Assistant Button */}
      <button
        onClick={() => setIsAIChatOpen(true)}
        className="fixed bottom-20 md:bottom-8 right-5 z-40 bg-indigo-600 hover:bg-indigo-700 text-white p-3.5 rounded-full shadow-xl flex items-center gap-2 transition-all hover:scale-105 border border-indigo-400/30 group"
        title="Open Bible AI Assistant"
      >
        <Sparkles size={20} className="animate-pulse" />
        <span className="text-xs font-bold tracking-tight pr-1 hidden sm:inline">Bible AI</span>
      </button>

      {/* Bible AI Chatbot Modal */}
      <BibleAIChatbot
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
      />
    </div>
  );
};
