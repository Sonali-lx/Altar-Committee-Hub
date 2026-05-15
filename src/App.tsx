import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './components/auth/Login';
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
import { AnimatePresence, motion } from 'motion/react';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);
  const [showCreateCell, setShowCreateCell] = useState(false);

  if (loading) {
    return (
      <div className="h-screen bg-white flex flex-col items-center justify-center p-8">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin mb-4" />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Initializing Hub</span>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'cells':
        if (selectedCellId) {
          return (
            <motion.div
              key="cell-detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <CellDetail cellId={selectedCellId} onBack={() => setSelectedCellId(null)} />
            </motion.div>
          );
        }
        return (
          <motion.div
            key="cell-list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <CellList 
              onSelectCell={(id) => setSelectedCellId(id)} 
              onNewCell={() => setShowCreateCell(true)} 
            />
          </motion.div>
        );
      case 'events':
        return <EventList />;
      case 'treasury':
        return <FinanceManager />;
      case 'qt':
        return <QuietTime />;
      case 'records':
        return <RecordsManager />;
      case 'admin':
        return <AdminPanel />;
      case 'dashboard':
      default:
        return <Dashboard onNewCell={() => setShowCreateCell(true)} />;
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
