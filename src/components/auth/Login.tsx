import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, Sparkles, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginProps {
  onBackToLanding?: () => void;
}

export const Login: React.FC<LoginProps> = ({ onBackToLanding }) => {
  const { signIn } = useAuth();
  const [isSigningIn, setIsSigningIn] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSignIn = async () => {
    if (isSigningIn) return;
    setError(null);
    setIsSigningIn(true);
    try {
      await signIn();
    } catch (err: any) {
      console.error('[AUTH] Sign-in error:', err);
      if (err?.message?.includes('cancelled') || err?.code === 'auth/popup-closed-by-user') {
        setError('Sign-in was cancelled.');
      } else if (err?.message?.includes('network') || err?.code === 'auth/network-request-failed') {
        setError('Network error. Please check your internet connection.');
      } else {
        setError(err?.message || 'Unable to complete sign-in. Please try again.');
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 font-sans relative">
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />

      {onBackToLanding && (
        <button
          onClick={onBackToLanding}
          className="absolute top-6 left-6 z-20 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-4 py-2 rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5"
        >
          &larr; Back to Website
        </button>
      )}
      
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

          {error && (
            <div className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs font-medium text-red-700 leading-relaxed text-center">
              {error}
            </div>
          )}

          <button
            onClick={handleSignIn}
            disabled={isSigningIn}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-800 disabled:opacity-60 transition-all active:scale-[0.98] shadow-lg shadow-slate-900/10"
          >
            {isSigningIn ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5 bg-white p-1 rounded" alt="Google" />
            )}
            {isSigningIn ? 'Signing in...' : 'Sign in with Google'}
          </button>
          
          <p className="text-[10px] text-slate-400 text-center mt-6 uppercase tracking-widest font-bold">
            Authorized Personnel Only &bull; Secure Protocol 
          </p>
        </div>
      </motion.div>
    </div>
  );
};
