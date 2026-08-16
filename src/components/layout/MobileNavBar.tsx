import React from 'react';
import { LayoutDashboard, SunMoon, Heart, Users, Menu } from 'lucide-react';

interface MobileNavBarProps {
  activeTab: string;
  onTabSelect: (tab: string) => void;
  onOpenMenu: () => void;
}

export const MobileNavBar: React.FC<MobileNavBarProps> = ({
  activeTab,
  onTabSelect,
  onOpenMenu,
}) => {
  const items = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'qt', label: 'Quiet Time', icon: SunMoon },
    { id: 'prayer', label: 'Prayer', icon: Heart },
    { id: 'cells', label: 'Cells', icon: Users },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-slate-200/80 flex items-center justify-around px-2 z-30 shadow-lg safe-area-pb">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onTabSelect(item.id)}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all ${
              isActive ? 'text-slate-950 scale-105' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className={`p-1 rounded-xl transition-colors ${isActive ? 'bg-slate-100' : ''}`}>
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
            </div>
            <span className={`text-[10px] font-medium tracking-tight mt-0.5 ${isActive ? 'font-bold text-slate-900' : ''}`}>
              {item.label}
            </span>
          </button>
        );
      })}
      
      <button
        onClick={onOpenMenu}
        className="flex flex-col items-center justify-center flex-1 h-full py-1 text-slate-400 hover:text-slate-600 transition-colors"
      >
        <div className="p-1 rounded-xl">
          <Menu size={20} strokeWidth={1.8} />
        </div>
        <span className="text-[10px] font-medium tracking-tight mt-0.5">More</span>
      </button>
    </div>
  );
};
