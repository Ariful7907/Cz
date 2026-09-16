import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Gift,
  Coins,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Search,
  Filter,
  CreditCard,
  Settings,
  DollarSign,
  UserCheck,
  RefreshCw,
  Eye,
  Check,
} from 'lucide-react';
import {
  Referral,
  WithdrawalRequest,
  ReferralFraudFlag,
  ReferralCampaignConfig,
  User,
} from '../../types';
import { storage, subscribeToStorage } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const AdminReferralsPanel: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [campaign, setCampaign] = useState<ReferralCampaignConfig>(() =>
    storage.getReferralCampaign()
  );
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>(() =>
    storage.getWithdrawalRequests()
  );
  const [fraudFlags, setFraudFlags] = useState<ReferralFraudFlag[]>(() =>
    storage.getFraudFlags()
  );
  const [allReferrals, setAllReferrals] = useState<Referral[]>(() =>
    storage.getReferrals()
  );

  const [activeSubTab, setActiveSubTab] = useState<'withdrawals' | 'fraud' | 'campaign' | 'all'>(
    'withdrawals'
  );
  const [withdrawalFilter, setWithdrawalFilter] = useState<'all' | 'pending' | 'approved' | 'paid' | 'rejected'>('all');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');

  // Editable Campaign Config Form State
  const [editRewardAmount, setEditRewardAmount] = useState(campaign.rewardAmount);
  const [editMinWithdrawal, setEditMinWithdrawal] = useState(campaign.minimumWithdrawal);
  const [editIsActive, setEditIsActive] = useState(campaign.rewardStatus === 'active');
  const [editRequireVerified, setEditRequireVerified] = useState(campaign.minimumQualification.requireEmailVerified);
  const [editRequireProfile, setEditRequireProfile] = useState(campaign.minimumQualification.requireProfileComplete);
  const [editRequirePost, setEditRequirePost] = useState(campaign.minimumQualification.requireFirstPost);

  useEffect(() => {
    return subscribeToStorage(() => {
      const c = storage.getReferralCampaign();
      setCampaign(c);
      setWithdrawals(storage.getWithdrawalRequests());
      setFraudFlags(storage.getFraudFlags());
      setAllReferrals(storage.getReferrals());
    });
  }, []);

  // Stats
  const pendingWithdrawals = withdrawals.filter((w) => w.status === 'pending');
  const pendingAmount = pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0);
  const activeFraudFlags = fraudFlags.filter((f) => f.status === 'flagged');
  const totalPaidOut = withdrawals
    .filter((w) => w.status === 'paid')
    .reduce((sum, w) => sum + w.amount, 0);

  // Actions
  const handleApproveWithdrawal = (id: string) => {
    storage.approveWithdrawal(id, currentUser.id);
    showToast('Withdrawal request approved for payout processing.', 'success');
  };

  const handleMarkPaid = (id: string) => {
    if (
      window.confirm(
        'Confirm that payment has been genuinely sent via PayPal, Wire, or Crypto? Never mark as paid without real payment confirmation.'
      )
    ) {
      storage.markWithdrawalPaid(id, currentUser.id);
      showToast('Withdrawal marked as Paid and transaction completed!', 'success');
    }
  };

  const handleConfirmReject = (id: string) => {
    if (!rejectionReason.trim()) {
      showToast('Please provide a rejection reason.', 'error');
      return;
    }
    storage.rejectWithdrawal(id, currentUser.id, rejectionReason.trim());
    showToast('Withdrawal rejected. Funds have been refunded to user available balance.', 'info');
    setRejectingId(null);
    setRejectionReason('');
  };

  const handleResolveFraud = (flagId: string, resolution: 'cleared' | 'confirmed_fraud') => {
    storage.resolveFraudFlag(flagId, resolution === 'cleared' ? 'clear' : 'confirm_fraud');
    showToast(
      resolution === 'cleared'
        ? 'Fraud flag cleared: referral validated and reward credited.'
        : 'Fraud confirmed: referral flagged as invalid.',
      'info'
    );
  };

  const handleSaveCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: ReferralCampaignConfig = {
      ...campaign,
      rewardAmount: Number(editRewardAmount),
      minimumWithdrawal: Number(editMinWithdrawal),
      rewardStatus: editIsActive ? 'active' : 'paused',
      minimumQualification: {
        ...campaign.minimumQualification,
        requireEmailVerified: editRequireVerified,
        requireProfileComplete: editRequireProfile,
        requireFirstPost: editRequirePost,
      },
    };
    storage.saveReferralCampaign(updated);
    showToast('Referral campaign configuration updated successfully!', 'success');
  };

  const filteredWithdrawals = withdrawals.filter((w) => {
    if (withdrawalFilter === 'all') return true;
    return w.status === withdrawalFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase">Pending Payouts</span>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
              {campaign.currency}{pendingAmount.toFixed(2)}
            </div>
            <span className="text-[11px] text-slate-400">{pendingWithdrawals.length} requests</span>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/60 rounded-xl text-amber-600 dark:text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase">Fraud Reviews</span>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
              {activeFraudFlags.length}
            </div>
            <span className="text-[11px] text-slate-400">Flagged referrals</span>
          </div>
          <div className="p-3 bg-rose-50 dark:bg-rose-950/60 rounded-xl text-rose-600 dark:text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase">Total Referrals</span>
            <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
              {allReferrals.length}
            </div>
            <span className="text-[11px] text-slate-400">Platform-wide</span>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl text-indigo-600 dark:text-indigo-400">
            <Gift className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase">Total Paid Out</span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {campaign.currency}{totalPaidOut.toFixed(2)}
            </div>
            <span className="text-[11px] text-slate-400">Completed disbursements</span>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Sub-Tab Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveSubTab('withdrawals')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeSubTab === 'withdrawals'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Withdrawal Requests ({withdrawals.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('fraud')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            activeSubTab === 'fraud'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <span>Fraud & Security Flags</span>
          {activeFraudFlags.length > 0 && (
            <span className="px-1.5 py-0.2 bg-white text-rose-600 rounded-full text-[10px] font-extrabold">
              {activeFraudFlags.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('campaign')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeSubTab === 'campaign'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Campaign Settings
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('all')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeSubTab === 'all'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          All Referrals Audit ({allReferrals.length})
        </button>
      </div>

      {/* Sub-Tab 1: Withdrawals Queue */}
      {activeSubTab === 'withdrawals' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
              {(['all', 'pending', 'approved', 'paid', 'rejected'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setWithdrawalFilter(tab)}
                  className={`px-3 py-1 rounded-lg capitalize transition-colors ${
                    withdrawalFilter === tab
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <span className="text-xs text-slate-400">
              Showing {filteredWithdrawals.length} withdrawal requests
            </span>
          </div>

          {filteredWithdrawals.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center text-slate-400 text-xs border border-slate-200/80 dark:border-slate-800">
              No withdrawal requests in this category.
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="py-3.5 px-6">User</th>
                      <th className="py-3.5 px-4">Amount</th>
                      <th className="py-3.5 px-4">Payment Method</th>
                      <th className="py-3.5 px-4">Destination</th>
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-6 text-right">Admin Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredWithdrawals.map((w) => {
                      const user = storage.getUserById(w.userId);

                      return (
                        <tr key={w.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                                alt="User"
                                referrerPolicy="no-referrer"
                                className="w-8 h-8 rounded-full object-cover"
                              />
                              <div>
                                <div className="font-bold text-slate-900 dark:text-slate-100">
                                  {user?.name || 'Unknown'}
                                </div>
                                <div className="text-slate-400 text-[11px]">@{user?.username}</div>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-4 font-black text-sm text-slate-900 dark:text-slate-100">
                            {campaign.currency}{w.amount.toFixed(2)}
                          </td>

                          <td className="py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">
                            {w.paymentMethod}
                          </td>

                          <td className="py-4 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-400 truncate max-w-[180px]">
                            {w.payoutDetails}
                          </td>

                          <td className="py-4 px-4 text-slate-400">
                            {new Date(w.requestedAt).toLocaleDateString()}
                          </td>

                          <td className="py-4 px-4">
                            {w.status === 'pending' && (
                              <span className="px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 font-bold text-[10px]">
                                Pending Review
                              </span>
                            )}
                            {w.status === 'approved' && (
                              <span className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold text-[10px]">
                                Approved (Processing)
                              </span>
                            )}
                            {w.status === 'paid' && (
                              <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                                Paid
                              </span>
                            )}
                            {w.status === 'rejected' && (
                              <span className="px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold text-[10px]">
                                Rejected
                              </span>
                            )}
                          </td>

                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {w.status === 'pending' && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleApproveWithdrawal(w.id)}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] shadow-sm transition-all"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setRejectingId(w.id);
                                      setRejectionReason('');
                                    }}
                                    className="px-2.5 py-1 bg-rose-50 dark:bg-rose-950/60 text-rose-600 hover:bg-rose-100 rounded-lg font-bold text-[11px] transition-all"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}

                              {w.status === 'approved' && (
                                <button
                                  type="button"
                                  onClick={() => handleMarkPaid(w.id)}
                                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[11px] shadow-sm transition-all"
                                  title="Mark as executed after verifying third-party payout"
                                >
                                  Mark as Paid
                                </button>
                              )}

                              {w.status === 'paid' && (
                                <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 justify-end">
                                  <Check className="w-3.5 h-3.5" /> Disbursed
                                </span>
                              )}

                              {w.status === 'rejected' && (
                                <span className="text-[11px] text-slate-400">
                                  Refunded to User
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Rejection Modal */}
          <AnimatePresence>
            {rejectingId && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
                  onClick={() => setRejectingId(null)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
                >
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                    Reject Withdrawal Request
                  </h3>
                  <p className="text-xs text-slate-500">
                    The withdrawn amount will be automatically returned to the user's available wallet balance.
                  </p>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Reason for Rejection
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="e.g. Invalid PayPal email or account compliance check failed"
                      rows={3}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setRejectingId(null)}
                      className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleConfirmReject(rejectingId)}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md"
                    >
                      Confirm Rejection & Refund
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Sub-Tab 2: Fraud Flags */}
      {activeSubTab === 'fraud' && (
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Anti-Fraud Compliance Standard:</span> Accounts are never permanently banned automatically based only on a single signal. Suspect events are marked as <span className="font-mono font-bold">Flagged for Review</span> so human administrators can evaluate legitimacy and prevent false positives.
            </div>
          </div>

          {fraudFlags.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center text-slate-400 text-xs border border-slate-200/80 dark:border-slate-800">
              No referral fraud signals recorded. Clean network activity!
            </div>
          ) : (
            <div className="space-y-3">
              {fraudFlags.map((flag) => {
                const user = storage.getUserById(flag.userId);
                const referral = allReferrals.find((r) => r.id === flag.referralId);
                const isPending = flag.status === 'flagged';

                return (
                  <div
                    key={flag.id}
                    className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 text-[10px] font-extrabold uppercase">
                          {flag.reason.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(flag.createdAt).toLocaleString()}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          flag.status === 'cleared'
                            ? 'bg-emerald-100 text-emerald-700'
                            : flag.status === 'confirmed_fraud'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {flag.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                        {flag.details}
                      </p>
                      <div className="text-[11px] text-slate-500">
                        Referrer: <strong className="text-slate-700 dark:text-slate-300">{user?.name} (@{user?.username})</strong> • Code: <strong className="font-mono">{referral?.referralCode}</strong>
                      </div>
                    </div>

                    {isPending && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleResolveFraud(flag.id, 'cleared')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                        >
                          Clear & Validate
                        </button>
                        <button
                          type="button"
                          onClick={() => handleResolveFraud(flag.id, 'confirmed_fraud')}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                        >
                          Confirm Fraud & Invalidate
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Sub-Tab 3: Campaign Configuration */}
      {activeSubTab === 'campaign' && (
        <form onSubmit={handleSaveCampaign} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 max-w-2xl">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              Live Referral Campaign Configuration
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Modify global reward parameters, qualification criteria, and threshold rules.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Reward Amount ({campaign.currency})
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={editRewardAmount}
                onChange={(e) => setEditRewardAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
                required
              />
              <span className="text-[10px] text-slate-400">Credited when referred user qualifies</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Minimum Withdrawal ({campaign.currency})
              </label>
              <input
                type="number"
                step="1"
                min="1"
                value={editMinWithdrawal}
                onChange={(e) => setEditMinWithdrawal(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
                required
              />
              <span className="text-[10px] text-slate-400">Minimum balance before payout request</span>
            </div>
          </div>

          {/* Campaign Active Switch */}
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Campaign Status (Active)
              </span>
              <p className="text-[11px] text-slate-400">
                When disabled, new referrals are paused from issuing rewards.
              </p>
            </div>
            <input
              type="checkbox"
              checked={editIsActive}
              onChange={(e) => setEditIsActive(e.target.checked)}
              className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
            />
          </div>

          {/* Qualification Criteria Checkboxes */}
          <div className="space-y-3">
            <span className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Required Qualification Conditions:
            </span>

            <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={editRequireVerified}
                onChange={(e) => setEditRequireVerified(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 rounded"
              />
              <span className="text-slate-800 dark:text-slate-200">
                Require user verification & email confirmation
              </span>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={editRequireProfile}
                onChange={(e) => setEditRequireProfile(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 rounded"
              />
              <span className="text-slate-800 dark:text-slate-200">
                Require completed profile (avatar and bio)
              </span>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={editRequirePost}
                onChange={(e) => setEditRequirePost(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 rounded"
              />
              <span className="text-slate-800 dark:text-slate-200">
                Require at least one post/story published by referred user
              </span>
            </label>
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition-all"
          >
            Save Campaign Changes
          </button>
        </form>
      )}

      {/* Sub-Tab 4: All Platform Referrals Audit */}
      {activeSubTab === 'all' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Audit Log: All Registered Referrals ({allReferrals.length})
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-6">Referrer</th>
                  <th className="py-3.5 px-4">Referred Friend</th>
                  <th className="py-3.5 px-4">Code</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Reward</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {allReferrals.map((r) => {
                  const referrer = storage.getUserById(r.referrerUserId);
                  const referred = storage.getUserById(r.referredUserId);

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-4 px-6 font-bold text-slate-900 dark:text-slate-100">
                        {referrer?.name || 'Unknown'} (@{referrer?.username})
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-900 dark:text-slate-100">
                        {referred?.name || 'Unknown'} (@{referred?.username})
                      </td>
                      <td className="py-4 px-4 font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                        {r.referralCode}
                      </td>
                      <td className="py-4 px-4 text-slate-400">
                        {new Date(r.registeredAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">
                        <span className="capitalize font-semibold text-slate-700 dark:text-slate-300">
                          {r.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right font-bold">
                        {r.rewardStatus === 'credited' ? (
                          <span className="text-emerald-600 dark:text-emerald-400">
                            +{campaign.currency}{(r.rewardAmount || campaign.rewardAmount).toFixed(2)} Credited
                          </span>
                        ) : (
                          <span className="text-slate-400">{r.rewardStatus}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
