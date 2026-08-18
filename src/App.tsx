import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './components/auth/Login';
import { SetupProfile } from './components/auth/SetupProfile';
import { Shell } from './components/layout/Shell';
import { Dashboard } from './components/dashboard/Dashboard';
import { CellList } from './components/cells/CellList';
import { CellDetail } from './components/cells/CellDetail';
import { AdminPanel } from './components/admin/AdminPanel';
import { FinanceManager } from './components/finance/FinanceManager';
import { QuietTime } from './components/quiettime/QuietTime';
import { RecordsManager } from './components/records/RecordsManager';
import { EventList } from './components/events/EventList';
import { CreateCellModal } from './components/cells/CreateCellModal';
import { PrayerPage } from './components/prayer/PrayerPage';
import { BibleStudy } from './components/bible/BibleStudy';
import { JournalPage } from './components/journal/JournalPage';
import { DawnDuskPrayers } from './components/prayer/DawnDuskPrayers';
import { CommunityFeed } from './components/community/CommunityFeed';
import { CommunityChat } from './components/community/CommunityChat';
import { CommitteeChat } from './components/community/CommitteeChat';
import { LandingPage } from './components/landing/LandingPage';
import { AnimatePresence, motion } from 'motion/react';
import { dbService } from './services/db';

const AppContent: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);
  const [showCreateCell, setShowCreateCell] = useState(false);
  const [publicView, setPublicView] = useState<'landing' | 'login'>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('login') === 'true' || params.get('invite') || params.get('joinCell') ? 'login' : 'landing';
  });

  React.useEffect(() => {
    const processInvite = async () => {
      if (!user || !profile) return;
      const searchParams = new URLSearchParams(window.location.search);
      
      const inviteCode = searchParams.get('invite');
      if (inviteCode) {
        const cellId = await dbService.joinPrayerCellByInvite(inviteCode, user.uid);
        if (cellId) {
          window.history.replaceState({}, document.title, window.location.pathname);
          setSelectedCellId(cellId);
          setActiveTab('cells');
        }
      }

      const joinCellId = searchParams.get('joinCell');
      if (joinCellId) {
        await dbService.addCellMember(joinCellId, user.uid);
        window.history.replaceState({}, document.title, window.location.pathname);
        setSelectedCellId(joinCellId);
        setActiveTab('cells');
      }
    };
    processInvite();
  }, [user, profile]);

  if (loading) {
    return (
      <div className="h-screen bg-white flex flex-col items-center justify-center p-8">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin mb-4" />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Initializing Hub</span>
      </div>
    );
  }

  if (!user) {
    if (publicView === 'login') {
      return <Login onBackToLanding={() => setPublicView('landing')} />;
    }
    return <LandingPage onOpenApp={() => setPublicView('login')} />;
  }

  if (user && !profile) {
    return <SetupProfile user={user} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'cells':
        if (selectedCellId) {
          return (
            <motion.div key="cell-detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <CellDetail cellId={selectedCellId} onBack={() => setSelectedCellId(null)} />
            </motion.div>
          );
        }
        return (
          <motion.div key="cell-list" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <CellList onSelectCell={(id) => setSelectedCellId(id)} onNewCell={() => setShowCreateCell(true)} />
          </motion.div>
        );
      case 'events':
        return <EventList />;
      case 'treasury':
        return <FinanceManager />;
      case 'qt':
        return <QuietTime />;
      case 'prayer':
        return <PrayerPage />;
      case 'study':
        return <BibleStudy />;
      case 'journal':
        return <JournalPage />;
      case 'prayers':
        return <DawnDuskPrayers />;
      case 'chat-comm':
        return <CommunityFeed />;
      case 'chat-realtime':
        return <CommunityChat />;
      case 'chat-cmte':
        return <CommitteeChat />;
      case 'records':
        return <RecordsManager />;
      case 'admin':
        return <AdminPanel />;
      case 'dashboard':
      default:
        return <Dashboard onNewCell={() => setShowCreateCell(true)} onNavigate={(t) => { setActiveTab(t); setSelectedCellId(null); }} />;
    }
  };

  return (
    <div className="relative">
      <Shell activeTab={activeTab} setActiveTab={(t) => { setActiveTab(t); setSelectedCellId(null); }}>
        <AnimatePresence mode="wait">
          <div className="pb-12">
            {renderContent()}
          </div>
        </AnimatePresence>
      </Shell>
      {showCreateCell && (
        <CreateCellModal 
          onClose={() => setShowCreateCell(false)} 
          onCreated={(id) => { setShowCreateCell(false); setSelectedCellId(id); setActiveTab('cells'); }} 
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
