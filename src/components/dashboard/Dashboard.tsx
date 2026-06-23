import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, 
  Calendar, 
  SunMoon,
  MessageSquare,
  Sparkles,
  ChevronRight,
  TrendingUp,
  CircleCheckBig,
  BookOpen,
  DollarSign,
  Clock,
  ArrowUpRight,
  Plus
} from 'lucide-react';
import { motion } from 'motion/react';
import { dbService } from '../../services/db';

const CommitteeDashboard: React.FC<{ onNewCell: () => void, onNavigate: (t: string) => void, profile: any, hasRole: any, stats: any }> = ({ onNewCell, onNavigate, profile, hasRole, stats }) => (
  <div className="space-y-8 max-w-6xl mx-auto">
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <h1 className="text-3xl md:text-4xl font-light tracking-tight text-slate-900 leading-tight">
          Hello, <span className="font-bold">{profile?.name}</span>
        </h1>
        <p className="text-slate-500 font-medium mt-1">Here is what's happening in the committee today.</p>
      </motion.div>
    </div>

    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 }}
      className="bg-slate-900 rounded-3xl p-8 md:p-10 text-white relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <BookOpen size={120} />
      </div>
      <div className="relative z-10 max-w-2xl">
        <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase tracking-widest mb-4">
          <Sparkles size={14} />
          <span>Verse of the Day</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-serif italic mb-4 leading-relaxed">
          "But they who wait for the Lord shall renew their strength; they shall mount up with wings like eagles; they shall run and not be weary; they shall walk and not faint."
        </h2>
        <p className="text-slate-400 font-medium">— Isaiah 40:31</p>
      </div>
    </motion.div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <motion.div onClick={() => onNavigate('cells')} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4 border border-blue-100">
          <Users size={24} />
        </div>
        <div className="text-4xl font-light text-slate-900">{stats.cells}</div>
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Active Prayer Cells</div>
      </motion.div>

      <motion.div onClick={() => onNavigate('records')} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4 border border-emerald-100">
          <Users size={24} />
        </div>
        <div className="text-4xl font-light text-slate-900">{stats.members}</div>
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Total Members</div>
      </motion.div>

      <motion.div onClick={() => onNavigate('treasury')} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 mb-4 border border-amber-100">
          <DollarSign size={24} />
        </div>
        <div className="text-4xl font-light text-slate-900">${stats.balance.toLocaleString()}</div>
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Social Fund Balance</div>
      </motion.div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
       <button onClick={() => onNavigate('events')} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
          <Calendar size={32} className="mb-2" />
          <span className="font-bold text-sm uppercase tracking-widest">Events</span>
       </button>
       <button onClick={() => onNavigate('chat-comm')} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
          <MessageSquare size={32} className="mb-2" />
          <span className="font-bold text-sm uppercase tracking-widest">Fellowship Feed</span>
       </button>
       <button onClick={() => onNavigate('qt')} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
          <SunMoon size={32} className="mb-2" />
          <span className="font-bold text-sm uppercase tracking-widest">Quiet Time</span>
       </button>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">Upcoming Events</h3>
          <button onClick={() => onNavigate('events')} className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">See All</button>
        </div>
        <div className="space-y-4">
          <div onClick={() => onNavigate('events')} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 group cursor-pointer hover:bg-slate-100 transition-all">
            <div className="w-12 h-12 rounded-xl bg-white flex flex-col items-center justify-center shadow-sm shrink-0 border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400">Oct</span>
              <span className="text-lg font-bold text-slate-900 leading-none">12</span>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-slate-900">Annual Gala Meeting</h4>
              <p className="text-xs text-slate-500 mt-0.5">Central Hall, 6:00 PM</p>
            </div>
            <ArrowUpRight size={16} className="text-slate-300 group-hover:text-slate-900 transition-colors" />
          </div>
        </div>
      </div>


      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">Recent Activity</h3>
          <Clock size={18} className="text-slate-300" />
        </div>
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
            <div>
              <p className="text-sm text-slate-600 leading-relaxed">
                <span className="font-bold text-slate-900">Sarah Jenkins</span> created 2 new records for the <span className="font-bold text-slate-900 underline decoration-blue-200">Bible Seminar</span>.
              </p>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">2 hours ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const MemberDashboard: React.FC<{ profile: any, onNavigate: (t: string) => void, stats: any }> = ({ profile, onNavigate, stats }) => {
  const metrics = [
    { label: 'Current Streak', value: `${stats?.streak || 0} days`, icon: TrendingUp, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'Quiet Time Entries', value: `${stats?.qtCount || 0}`, icon: SunMoon, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { label: 'Prayers Answered', value: `${stats?.prayerCount || 0}`, icon: CircleCheckBig, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl md:text-4xl font-light tracking-tight text-slate-900 leading-tight">
            Hello, <span className="font-bold">{profile?.name}</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1">"Commit your works to the Lord, and your thoughts will be established." - Prov 16:3</p>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-900 rounded-3xl p-8 md:p-10 text-white relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <BookOpen size={120} />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase tracking-widest mb-4">
            <Sparkles size={14} />
            <span>Verse of the Day</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-serif italic mb-4 leading-relaxed">
            "But they who wait for the Lord shall renew their strength; they shall mount up with wings like eagles; they shall run and not be weary; they shall walk and not faint."
          </h2>
          <p className="text-slate-400 font-medium">— Isaiah 40:31</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {metrics.map((m, idx) => (
          <motion.div 
            key={m.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + idx * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4"
          >
             <div className={`p-4 rounded-2xl ${m.bg} ${m.color}`}>
                <m.icon size={24} />
             </div>
             <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">{m.label}</p>
                <p className="text-2xl font-bold text-slate-900">{m.value}</p>
             </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest pl-2 border-l-4 border-indigo-500">Personal Growth</h3>
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            {[
              { title: 'Quiet Time', desc: 'Reflect on the word', icon: SunMoon, color: 'text-indigo-500', tab: 'qt' },
              { title: 'Prayer Journal', desc: 'Adoration, Confession, Thanksgiving', icon: MessageSquare, color: 'text-emerald-500', tab: 'prayer' },
              { title: 'Bible Study', desc: 'Observation & Interpretation', icon: BookOpen, color: 'text-amber-500', tab: 'study' },
              { title: 'Personal Journal', desc: 'Daily logs & notes', icon: BookOpen, color: 'text-slate-500', tab: 'journal' }
            ].map((item, idx, arr) => (
              <div onClick={() => onNavigate(item.tab)} key={item.title} className={`p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors ${idx !== arr.length - 1 ? 'border-b border-slate-100' : ''}`}>
                <div className="flex items-center gap-4">
                  <div className={`p-2 bg-slate-50 rounded-xl ${item.color}`}>
                     <item.icon size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-300" />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest pl-2 border-l-4 border-emerald-500">Community Spaces</h3>
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            {[
              { title: 'Prayer Cells', desc: 'Join local fellowship groups', icon: Users, color: 'text-blue-500', tab: 'cells' },
              { title: 'Community Events', desc: 'Upcoming gatherings and retreats', icon: Calendar, color: 'text-purple-500', tab: 'events' },
              { title: 'Fellowship Feed', desc: 'Share requests and testimonies', icon: Sparkles, color: 'text-orange-500', tab: 'chat-comm' },
              { title: 'Community Chat', desc: 'Real-time discussions', icon: MessageSquare, color: 'text-teal-500', tab: 'chat-realtime' }
            ].map((item, idx, arr) => (
              <div onClick={() => onNavigate(item.tab)} key={item.title} className={`p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors ${idx !== arr.length - 1 ? 'border-b border-slate-100' : ''}`}>
                <div className="flex items-center gap-4">
                  <div className={`p-2 bg-slate-50 rounded-xl ${item.color}`}>
                     <item.icon size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-300" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const Dashboard: React.FC<{ onNewCell: () => void, onNavigate: (t: string) => void }> = ({ onNewCell, onNavigate }) => {
  const { profile, hasRole } = useAuth();
  
  const [stats, setStats] = useState({ cells: 0, members: 0, balance: 0 });
  const [memberStats, setMemberStats] = useState({ streak: 0, qtCount: 0, prayerCount: 0, studyCount: 0 });

  useEffect(() => {
    const loadStats = async () => {
      if (hasRole(['SECRETARY', 'ADMIN', 'PRESIDENT', 'SENIOR_ADVISOR'])) {
        const cells = await dbService.getPrayerCells();
        const memberships = await dbService.getMembershipRecords();
        setStats({
          cells: cells.length,
          members: memberships.length,
          balance: 0 // Fetch from finance records if needed
        });
      }

      if (profile?.uid) {
        const quietTimes = await dbService.getQuietTimes(profile.uid);
        const prayers = await dbService.getPrayers(profile.uid);
        const journals = await dbService.getJournals(profile.uid); // Or study count

        // Calculate streak manually based on dates (assuming daily entries)
        let streak = 0;
        if (quietTimes && quietTimes.length > 0) {
           streak = 1; // Basic logic just for show, should ideally check consecutive days
        }

        setMemberStats({
          streak,
          qtCount: quietTimes?.length || 0,
          prayerCount: prayers?.filter(p => p.status === 'answered').length || 0,
          studyCount: journals?.length || 0
        });
      }
    };
    loadStats();
  }, [hasRole, profile]);

  if (hasRole(['SECRETARY', 'ADMIN', 'PRESIDENT', 'SENIOR_ADVISOR'])) {
    return <CommitteeDashboard onNewCell={onNewCell} onNavigate={onNavigate} profile={profile} hasRole={hasRole} stats={stats} />;
  }

  return <MemberDashboard profile={profile} onNavigate={onNavigate} stats={memberStats} />;
};
