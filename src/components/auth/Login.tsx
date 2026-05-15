import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, Sparkles, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';

export const Login: React.FC = () => {
  const { signIn } = useAuth();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-slate-200">
            <Shield className="text-white" size={32} />
          </div>
          <h1 className="text-4xl font-light tracking-tight text-slate-900 mb-2">Committee Hub</h1>
          <p className="text-slate-500 font-medium">Manage your community with grace and precision.</p>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-2xl shadow-slate-200/50">
          <div className="space-y-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                <Sparkles className="text-blue-600" size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Prayer Cells</h3>
                <p className="text-xs text-slate-500 mt-1">Coordinate meetings, attendance and small group study.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
                <MessageCircle className="text-emerald-600" size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Real-time Coordination</h3>
                <p className="text-xs text-slate-500 mt-1">Chat areas and collaborative record keeping for committee members.</p>
              </div>
            </div>
          </div>

          <button
            onClick={signIn}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-800 transition-all active:scale-[0.98] shadow-lg shadow-slate-900/10"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5 bg-white p-1 rounded" alt="Google" />
            Sign in with Google
          </button>
          
          <p className="text-[10px] text-slate-400 text-center mt-6 uppercase tracking-widest font-bold">
            Authorized Personnel Only &bull; Secure Protocol 
          </p>
        </div>
      </motion.div>
    </div>
  );
};
