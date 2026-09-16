import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mail,
  Lock,
  User,
  AtSign,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle,
  KeyRound,
  Gift,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { storage } from '../../services/storage';

export const AuthView: React.FC = () => {
  const { login, signup, resetPassword, switchAccount } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [referrerName, setReferrerName] = useState<string | null>(null);
  const [avatar, setAvatar] = useState(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // Check URL query parameters for ?ref=... or hash
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      let ref = urlParams.get('ref');
      if (!ref && window.location.hash.includes('ref=')) {
        const hashParams = new URLSearchParams(window.location.hash.substring(window.location.hash.indexOf('?')));
        ref = hashParams.get('ref');
      }

      if (ref) {
        const clean = ref.trim().toUpperCase();
        setReferralCode(clean);
        setMode('signup');

        // Look up owner of code
        const codes = storage.getReferralCodes();
        const codeRec = codes.find((c) => c.code.toUpperCase() === clean);
        if (codeRec) {
          const referrer = storage.getUserById(codeRec.userId);
          if (referrer) {
            setReferrerName(referrer.name);
          }
        }
      }
    } catch (e) {
      console.error('Error reading referral params', e);
    }
  }, []);

  // Update referrer name when typing referral code manually
  useEffect(() => {
    if (referralCode.trim().length >= 4) {
      const clean = referralCode.trim().toUpperCase();
      const codes = storage.getReferralCodes();
      const codeRec = codes.find((c) => c.code.toUpperCase() === clean);
      if (codeRec) {
        const referrer = storage.getUserById(codeRec.userId);
        if (referrer) {
          setReferrerName(referrer.name);
          return;
        }
      }
    }
    setReferrerName(null);
  }, [referralCode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const success = login(email, password);
        if (success) {
          showToast('Welcome back to ConnectZone!', 'success');
        } else {
          showToast('Invalid email or password. Try demo accounts below!', 'error');
        }
      } else if (mode === 'signup') {
        if (!name || !username || !email || !password) {
          showToast('Please fill in all required fields', 'error');
          setIsLoading(false);
          return;
        }

        const res = signup({
          name,
          username: username.replace('@', '').toLowerCase(),
          email,
          password,
          avatar,
          referralCode: referralCode.trim() || undefined,
        });

        if (res.success && res.user) {
          showToast(`Welcome to ConnectZone, ${res.user.name}!`, 'success');
        } else if (res.error) {
          showToast(res.error, 'error');
        }
      } else if (mode === 'forgot') {
        const success = resetPassword(email);
        if (success) {
          setResetSent(true);
          showToast('Password reset link simulated and sent!', 'success');
        } else {
          showToast('No account found with this email', 'error');
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Authentication error', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const demoUsers = storage.getUsers().slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center p-4 selection:bg-indigo-500 selection:text-white">
      {/* Visual Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-indigo-500/15 dark:bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-xl shadow-indigo-600/25 mb-3 ring-4 ring-white dark:ring-slate-900">
            <span className="font-black text-2xl tracking-tighter">CZ</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Connect<span className="text-indigo-600 dark:text-indigo-400">Zone</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            The next-generation social network for ideas, stories & communities
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/80 dark:border-slate-800 backdrop-blur-xl">
          {/* Mode Switcher Tabs */}
          {mode !== 'forgot' ? (
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl mb-6 text-xs font-bold">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`flex-1 py-2.5 rounded-xl transition-all ${
                  mode === 'login'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`flex-1 py-2.5 rounded-xl transition-all ${
                  mode === 'signup'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Create Account
              </button>
            </div>
          ) : (
            <div className="mb-6 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setResetSent(false);
                }}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
              >
                ← Back to Sign In
              </button>
              <span className="text-xs font-bold text-slate-500">Reset Password</span>
            </div>
          )}

          {resetSent ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                Check your inbox
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                We've sent password reset instructions to <span className="font-bold">{email}</span>.
              </p>
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setResetSent(false);
                }}
                className="mt-4 px-5 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl"
              >
                Return to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Full Name
                    </label>
                    <div className="flex items-center gap-2.5 px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl">
                      <User className="w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Maya Lin"
                        required
                        className="bg-transparent flex-1 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Username
                    </label>
                    <div className="flex items-center gap-2.5 px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl">
                      <AtSign className="w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="mayalin"
                        required
                        className="bg-transparent flex-1 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="flex items-center gap-2.5 px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="bg-transparent flex-1 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              {mode !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Password
                    </label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => setMode('forgot')}
                        className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                      >
                        Forgot?
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2.5 px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl">
                    <Lock className="w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="bg-transparent flex-1 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {mode === 'signup' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Referral Code
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">Optional</span>
                  </div>
                  <div className="flex items-center gap-2.5 px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl">
                    <Gift className="w-4 h-4 text-indigo-500" />
                    <input
                      type="text"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                      placeholder="e.g. CZ8K4P2"
                      className="bg-transparent flex-1 text-xs sm:text-sm uppercase font-mono tracking-wider text-slate-900 dark:text-slate-100 focus:outline-none"
                    />
                    {referrerName && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Valid
                      </span>
                    )}
                  </div>
                  {referrerName && (
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Invited by <span className="font-bold">{referrerName}</span>. Referral rewards will be unlocked upon qualification!
                    </p>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <span>Processing...</span>
                ) : mode === 'login' ? (
                  <>
                    <span>Sign In to Feed</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : mode === 'signup' ? (
                  <>
                    <span>Join ConnectZone Free</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Send Reset Instructions</span>
                    <KeyRound className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick 1-Click Demo Login Panel */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 text-center">
              ⚡ Instant 1-Click Demo Login
            </div>
            <div className="space-y-1.5">
              {demoUsers.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => switchAccount(u.id)}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200/60 dark:border-slate-700 flex items-center justify-between text-left transition-all group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={u.avatar}
                      alt={u.name}
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 truncate">
                        {u.name}
                      </div>
                      <div className="text-[10px] text-slate-400">@{u.username}</div>
                    </div>
                  </div>
                  {u.role === 'admin' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                      Admin
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
