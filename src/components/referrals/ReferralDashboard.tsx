import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Gift,
  Copy,
  Check,
  Share2,
  Users,
  CheckCircle2,
  Clock,
  Coins,
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Send,
  ExternalLink,
  Search,
  Filter,
  CreditCard,
  History,
  QrCode,
  UserPlus,
  Play,
  RotateCcw,
} from 'lucide-react';
import {
  Referral,
  ReferralCode,
  RewardWallet,
  WalletTransaction,
  ReferralCampaignConfig,
  User,
} from '../../types';
import { storage, subscribeToStorage } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { WithdrawalModal } from './WithdrawalModal';

export const ReferralDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [campaign, setCampaign] = useState<ReferralCampaignConfig>(() =>
    storage.getReferralCampaign()
  );
  const [codeRecord, setCodeRecord] = useState<ReferralCode>(() =>
    storage.getUserReferralCode(currentUser.id)
  );
  const [referrals, setReferrals] = useState<Referral[]>(() =>
    storage.getUserReferrals(currentUser.id)
  );
  const [wallet, setWallet] = useState<RewardWallet>(() =>
    storage.getUserWallet(currentUser.id)
  );
  const [transactions, setTransactions] = useState<WalletTransaction[]>(() =>
    storage.getWalletTransactions(currentUser.id)
  );

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [simName, setSimName] = useState('Jordan Lee');
  const [simUsername, setSimUsername] = useState('jordan_lee');

  // Reactive subscription
  useEffect(() => {
    return subscribeToStorage(() => {
      setCampaign(storage.getReferralCampaign());
      setCodeRecord(storage.getUserReferralCode(currentUser.id));
      setReferrals(storage.getUserReferrals(currentUser.id));
      setWallet(storage.getUserWallet(currentUser.id));
      setTransactions(storage.getWalletTransactions(currentUser.id));
    });
  }, [currentUser.id]);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://connectzone.io';
  const referralLink = `${baseUrl}/?ref=${codeRecord.code}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    showToast('Referral link copied to clipboard!', 'success');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeRecord.code);
    setCopiedCode(true);
    showToast(`Referral code ${codeRecord.code} copied!`, 'success');
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join me on ConnectZone!',
          text: `Join ConnectZone with my invite code ${codeRecord.code} and connect with wonderful creators:`,
          url: referralLink,
        });
      } catch (err) {
        // Ignored if cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(
      `Join me on ConnectZone! Use my invite code ${codeRecord.code} to connect with amazing communities: ${referralLink}`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Join me on ConnectZone! Use my invite code ${codeRecord.code}: ${referralLink}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleShareTelegram = () => {
    const text = encodeURIComponent(`Join me on ConnectZone! Use code ${codeRecord.code}`);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${text}`, '_blank');
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent('Invitation to join ConnectZone');
    const body = encodeURIComponent(
      `Hey!\n\nI'd love for you to join ConnectZone. Use my personal referral link below to get started:\n${referralLink}\n\nReferral Code: ${codeRecord.code}`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  // Metrics calculations
  const totalReferrals = referrals.length;
  const rewardedReferrals = referrals.filter((r) => r.status === 'rewarded' || r.rewardStatus === 'credited');
  const qualifiedReferrals = referrals.filter((r) => r.status === 'qualified' || r.status === 'rewarded');
  const pendingReferrals = referrals.filter((r) => r.status === 'pending_qualification' || r.status === 'registered');
  const fraudReviewReferrals = referrals.filter((r) => r.status === 'fraud_review');
  const totalRewardsAmount = wallet.totalEarned;
  const conversionRate = totalReferrals > 0 ? Math.round((qualifiedReferrals.length / totalReferrals) * 100) : 0;

  // Filtered referrals
  const filteredReferrals = referrals.filter((ref) => {
    const referredUser = storage.getUserById(ref.referredUserId);
    const matchesSearch =
      !searchQuery ||
      (referredUser &&
        (referredUser.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          referredUser.username.toLowerCase().includes(searchQuery.toLowerCase()))) ||
      ref.referralCode.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'all') return true;
    if (statusFilter === 'qualified') return ref.status === 'qualified' || ref.status === 'rewarded';
    if (statusFilter === 'pending') return ref.status === 'pending_qualification' || ref.status === 'registered';
    if (statusFilter === 'review') return ref.status === 'fraud_review';
    return true;
  });

  // Fast Simulator Action to demonstrate live functionality
  const handleSimulateReferralSignup = () => {
    const cleanUser = simUsername.trim().toLowerCase().replace('@', '');
    const cleanName = simName.trim() || 'New Friend';

    const simUser: User = {
      id: `user_sim_${Date.now()}`,
      name: cleanName,
      username: cleanUser,
      email: `${cleanUser}@example.com`,
      avatar: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 500)}?w=400&auto=format&fit=crop&q=80`,
      coverPhoto: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
      bio: 'Enthusiastic explorer and digital creator! Love design and creative networks.',
      role: 'user',
      followers: [],
      following: [],
      friends: [],
      friendRequestsReceived: [],
      friendRequestsSent: [],
      blockedUsers: [],
      privacySettings: {
        isPrivate: false,
        whoCanFollow: 'everyone',
        whoCanMessage: 'everyone',
        whoCanFriend: 'everyone',
      },
      createdAt: new Date().toISOString(),
      isOnline: true,
      isEmailVerified: true,
    };

    storage.createUser(simUser);
    storage.getUserReferralCode(simUser.id);

    // Register referral under this user's code
    const res = storage.registerReferral(codeRecord.code, simUser.id);

    if (res.success) {
      showToast(`Simulated signup for @${cleanUser} using your referral code!`, 'success');
      setShowSimulateModal(false);
    } else {
      showToast(res.error || 'Failed to simulate referral.', 'error');
    }
  };

  const handleSimulatePostForReferral = (referredUserId: string) => {
    storage.createPost({
      authorId: referredUserId,
      content: 'Hello ConnectZone! Excited to share my first thought here 🎉',
      privacy: 'public',
    });
    showToast('First post simulated! Qualification evaluated and reward credited.', 'success');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Banner / Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white p-6 sm:p-8 border border-indigo-800/40 shadow-2xl">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/4 -bottom-10 w-48 h-48 bg-purple-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>ConnectZone Referral Program</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Invite Friends, Build Community & Earn Rewards
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200/80 mt-2 leading-relaxed">
              Share ConnectZone with fellow creators. Earn{' '}
              <span className="text-amber-300 font-bold">
                {campaign.currency}{campaign.rewardAmount.toFixed(2)}
              </span>{' '}
              for every friend who registers and qualifies their account.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-4 rounded-2xl border border-white/15 shrink-0">
            <div className="p-3 bg-amber-400/20 text-amber-300 rounded-xl">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] uppercase font-bold tracking-wider text-indigo-200">
                Reward Per Qualified Friend
              </span>
              <div className="text-2xl font-black text-white">
                {campaign.currency}{campaign.rewardAmount.toFixed(2)}{' '}
                <span className="text-xs font-semibold text-indigo-300">
                  {campaign.rewardType === 'cash' ? 'Cash' : 'Points'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Section & Code Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Referral Link & Code Box */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl text-indigo-600 dark:text-indigo-400">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  Your Unique Referral Code
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Every user receives a unique code to track registrations
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowQrModal(true)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="Show QR Code"
            >
              <QrCode className="w-4 h-4 text-indigo-500" />
              <span className="hidden sm:inline">QR Code</span>
            </button>
          </div>

          {/* Code Badge Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Referral Code
                </span>
                <div className="text-xl font-black font-mono tracking-wider text-indigo-600 dark:text-indigo-400 mt-0.5">
                  {codeRecord.code}
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 shadow-sm transition-all"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Total Uses
                </span>
                <div className="text-xl font-black text-slate-900 dark:text-slate-100 mt-0.5">
                  {codeRecord.totalUses} <span className="text-xs font-normal text-slate-400">invites</span>
                </div>
              </div>
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Referral Link Input Box */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Personal Referral Link
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs text-slate-700 dark:text-slate-300 truncate select-all">
                {referralLink}
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 shrink-0"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Social Share Buttons */}
          <div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
              Instant Share Channels
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleNativeShare}
                className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5 text-indigo-500" /> Share Anywhere
              </button>
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Send className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp
              </button>
              <button
                type="button"
                onClick={handleShareTelegram}
                className="px-3 py-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900/60 text-sky-700 dark:text-sky-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Send className="w-3.5 h-3.5 text-sky-500" /> Telegram
              </button>
              <button
                type="button"
                onClick={handleShareTwitter}
                className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <span className="font-mono font-black text-xs">𝕏</span> X (Twitter)
              </button>
              <button
                type="button"
                onClick={handleShareEmail}
                className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" /> Email
              </button>
            </div>
          </div>
        </div>

        {/* Wallet & Balance Box */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Rewards Wallet
              </span>
              <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-4">
              <span className="text-[11px] text-slate-400 font-medium">Available Balance</span>
              <div className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                {campaign.currency}{wallet.availableBalance.toFixed(2)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] block uppercase font-bold">Total Earned</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {campaign.currency}{wallet.totalEarned.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block uppercase font-bold">Total Withdrawn</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {campaign.currency}{wallet.totalWithdrawn.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setIsWithdrawModalOpen(true)}
              disabled={wallet.availableBalance < campaign.minimumWithdrawal}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>
                {wallet.availableBalance >= campaign.minimumWithdrawal
                  ? 'Request Withdrawal'
                  : `Min. Withdrawal ${campaign.currency}${campaign.minimumWithdrawal}`}
              </span>
            </button>
            <p className="text-[10px] text-center text-slate-400">
              Payouts processed in 1-2 business days to PayPal, Bank or Crypto.
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Total Referrals</span>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl text-indigo-600 dark:text-indigo-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-2">
            {totalReferrals}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Registered accounts</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Qualified & Rewarded</span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-2">
            {qualifiedReferrals.length}
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 block">
            {conversionRate}% conversion rate
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Pending Qualification</span>
            <div className="p-2 bg-amber-50 dark:bg-amber-950/60 rounded-xl text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-2">
            {pendingReferrals.length}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Awaiting criteria</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Total Rewards</span>
            <div className="p-2 bg-purple-50 dark:bg-purple-950/60 rounded-xl text-purple-600 dark:text-purple-400">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-2">
            {campaign.currency}{totalRewardsAmount.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Lifetime earnings</span>
        </div>
      </div>

      {/* Simulator Test Bar for easy demonstration */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 p-4 rounded-2xl border border-indigo-200/60 dark:border-indigo-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 text-white rounded-xl">
            <Play className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-xs text-indigo-950 dark:text-indigo-200">
              Interactive Referral Testing Sandbox
            </span>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Instantly test the referral flow by simulating a friend registering with your code ({codeRecord.code}) and completing their qualification.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowSimulateModal(true)}
          className="px-4 py-2 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold shadow-sm transition-all shrink-0 flex items-center gap-1.5"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Simulate Referral Signup</span>
        </button>
      </div>

      {/* Referral History Table Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-lg text-slate-900 dark:text-slate-100">
              Referral History & Qualification Tracker
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Track the verification status of users registered with your code
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search referral name..."
                className="pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>

            {/* Status Filter */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                All ({totalReferrals})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('qualified')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  statusFilter === 'qualified'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                Qualified ({qualifiedReferrals.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('pending')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  statusFilter === 'pending'
                    ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                Pending ({pendingReferrals.length})
              </button>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-6">Referred User</th>
                <th className="py-3.5 px-4">Registered Date</th>
                <th className="py-3.5 px-4">Qualification Criteria</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Reward Status</th>
                <th className="py-3.5 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredReferrals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="max-w-xs mx-auto space-y-2">
                      <Gift className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                      <p className="font-bold text-slate-600 dark:text-slate-300">
                        No referrals found
                      </p>
                      <p className="text-[11px]">
                        Share your referral link above or use the test simulator to create your first referral!
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredReferrals.map((ref) => {
                  const user = storage.getUserById(ref.referredUserId);
                  const isQualified = ref.status === 'qualified' || ref.status === 'rewarded';
                  const isRewarded = ref.rewardStatus === 'credited';

                  return (
                    <tr key={ref.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      {/* User Info */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              user?.avatar ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
                            }
                            alt="User"
                            referrerPolicy="no-referrer"
                            className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800"
                          />
                          <div>
                            <div className="font-bold text-slate-900 dark:text-slate-100">
                              {user?.name || 'Unknown User'}
                            </div>
                            <div className="text-slate-400 text-[11px]">
                              @{user?.username || 'user'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Registered Date */}
                      <td className="py-4 px-4 text-slate-500">
                        {new Date(ref.registeredAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Qualification Checklist */}
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              ref.qualificationChecklist.accountVerified
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                            }`}
                            title="Account Active & Standing"
                          >
                            {ref.qualificationChecklist.accountVerified ? '✓' : '○'} Verified
                          </span>

                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              ref.qualificationChecklist.profileCompleted
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                            }`}
                            title="Profile avatar and bio completed"
                          >
                            {ref.qualificationChecklist.profileCompleted ? '✓' : '○'} Profile
                          </span>

                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              ref.qualificationChecklist.firstPostMade
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                            }`}
                            title="First post published"
                          >
                            {ref.qualificationChecklist.firstPostMade ? '✓' : '○'} 1st Post
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        {ref.status === 'rewarded' && (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold text-[11px] inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Rewarded
                          </span>
                        )}
                        {ref.status === 'qualified' && (
                          <span className="px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold text-[11px] inline-flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" /> Qualified
                          </span>
                        )}
                        {ref.status === 'pending_qualification' && (
                          <span className="px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 font-bold text-[11px] inline-flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> Pending
                          </span>
                        )}
                        {ref.status === 'fraud_review' && (
                          <span className="px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold text-[11px] inline-flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" /> Under Review
                          </span>
                        )}
                      </td>

                      {/* Reward Status */}
                      <td className="py-4 px-4 text-right font-semibold">
                        {isRewarded ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                            +{campaign.currency}{(ref.rewardAmount || campaign.rewardAmount).toFixed(2)} Credited
                          </span>
                        ) : (
                          <span className="text-slate-400">
                            {campaign.currency}{campaign.rewardAmount.toFixed(2)} Pending
                          </span>
                        )}
                      </td>

                      {/* Action / Test Helper */}
                      <td className="py-4 px-6 text-right">
                        {!ref.qualificationChecklist.firstPostMade && user && (
                          <button
                            type="button"
                            onClick={() => handleSimulatePostForReferral(user.id)}
                            className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 text-[11px] font-bold rounded-lg transition-colors inline-flex items-center gap-1"
                            title="Simulate user posting to trigger qualification"
                          >
                            <Play className="w-3 h-3" /> Simulate Post
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Qualification Guidelines & Money Rules Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rules */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl text-indigo-600 dark:text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Qualification Rules & Criteria
            </h3>
          </div>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                <strong>Account Verification:</strong> Referred users must complete registration and verify their email address.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                <strong>Profile Completion:</strong> The referred friend must upload an avatar and complete their profile bio.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                <strong>Community Interaction:</strong> The user must publish at least one original post or story to qualify.
              </span>
            </li>
          </ul>
        </div>

        {/* Anti-Fraud & Money Terms */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-50 dark:bg-amber-950/60 rounded-xl text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Anti-Fraud Policy & Money Rules
            </h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            ConnectZone operates with strict compliance standards. Self-referrals, automated script registrations, and disposable accounts are automatically detected and flagged for administrative review.
          </p>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60 text-[11px] text-slate-500">
            <strong>Transparency Notice:</strong> Referral rewards are variable and subject to platform terms. We make no guaranteed income claims. Payouts require minimum threshold ({campaign.currency}{campaign.minimumWithdrawal}) and administrative authorization.
          </div>
        </div>
      </div>

      {/* Withdrawal Modal */}
      <WithdrawalModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
      />

      {/* Simulator Modal */}
      <AnimatePresence>
        {showSimulateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setShowSimulateModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  Simulate Referral Registration
                </h3>
                <button
                  type="button"
                  onClick={() => setShowSimulateModal(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-slate-500">
                This creates a new test user account and applies your referral code (<strong className="font-mono">{codeRecord.code}</strong>).
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Friend's Name
                </label>
                <input
                  type="text"
                  value={simName}
                  onChange={(e) => setSimName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={simUsername}
                  onChange={(e) => setSimUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSimulateModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSimulateReferralSignup}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all"
                >
                  Register Test Referral
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQrModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setShowQrModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Scan to Join
                </span>
                <button
                  type="button"
                  onClick={() => setShowQrModal(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 bg-white rounded-2xl border-2 border-dashed border-indigo-200 inline-block shadow-inner">
                {/* SVG QR Code Simulation */}
                <svg
                  className="w-48 h-48 mx-auto"
                  viewBox="0 0 100 100"
                  fill="currentColor"
                >
                  {/* Outer corner squares */}
                  <rect x="10" y="10" width="24" height="24" rx="2" fill="#4f46e5" />
                  <rect x="14" y="14" width="16" height="16" rx="1" fill="#ffffff" />
                  <rect x="18" y="18" width="8" height="8" rx="1" fill="#4f46e5" />

                  <rect x="66" y="10" width="24" height="24" rx="2" fill="#4f46e5" />
                  <rect x="70" y="14" width="16" height="16" rx="1" fill="#ffffff" />
                  <rect x="74" y="18" width="8" height="8" rx="1" fill="#4f46e5" />

                  <rect x="10" y="66" width="24" height="24" rx="2" fill="#4f46e5" />
                  <rect x="14" y="70" width="16" height="16" rx="1" fill="#ffffff" />
                  <rect x="18" y="74" width="8" height="8" rx="1" fill="#4f46e5" />

                  {/* QR Grid Patterns */}
                  <rect x="40" y="14" width="6" height="6" fill="#1e1b4b" />
                  <rect x="52" y="14" width="6" height="6" fill="#1e1b4b" />
                  <rect x="44" y="24" width="12" height="6" fill="#1e1b4b" />

                  <rect x="14" y="44" width="6" height="12" fill="#1e1b4b" />
                  <rect x="24" y="40" width="8" height="6" fill="#1e1b4b" />
                  <rect x="24" y="52" width="6" height="8" fill="#1e1b4b" />

                  <rect x="40" y="40" width="20" height="20" rx="3" fill="#4f46e5" />
                  <rect x="44" y="44" width="12" height="12" fill="#ffffff" />
                  <rect x="47" y="47" width="6" height="6" fill="#4f46e5" />

                  <rect x="68" y="44" width="8" height="6" fill="#1e1b4b" />
                  <rect x="80" y="40" width="6" height="10" fill="#1e1b4b" />
                  <rect x="74" y="54" width="12" height="6" fill="#1e1b4b" />

                  <rect x="40" y="70" width="8" height="6" fill="#1e1b4b" />
                  <rect x="52" y="74" width="12" height="6" fill="#1e1b4b" />
                  <rect x="44" y="84" width="10" height="6" fill="#1e1b4b" />

                  <rect x="70" y="70" width="6" height="8" fill="#1e1b4b" />
                  <rect x="80" y="76" width="6" height="10" fill="#1e1b4b" />
                </svg>
              </div>

              <div>
                <div className="font-mono font-black text-indigo-600 text-lg">
                  {codeRecord.code}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Point phone camera to register with your referral link
                </p>
              </div>

              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Copy Link Instead
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
