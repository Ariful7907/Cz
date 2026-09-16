import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ArrowUpRight,
  ShieldCheck,
  AlertCircle,
  CreditCard,
  Building2,
  Coins,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { storage } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WithdrawalModal: React.FC<WithdrawalModalProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const campaign = storage.getReferralCampaign();
  const wallet = storage.getUserWallet(currentUser.id);

  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>(
    campaign.withdrawalMethods[0] || 'USD (PayPal)'
  );
  const [payoutDetails, setPayoutDetails] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const minAmount = campaign.minimumWithdrawal;
  const maxAvailable = wallet.availableBalance;
  const numericAmount = parseFloat(amount) || 0;

  const handleMaxClick = () => {
    setAmount(maxAvailable.toFixed(2));
    setErrorMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (numericAmount < minAmount) {
      setErrorMsg(`Minimum withdrawal amount is ${campaign.currency}${minAmount.toFixed(2)}`);
      return;
    }

    if (numericAmount > maxAvailable) {
      setErrorMsg(`Withdrawal amount exceeds available balance of ${campaign.currency}${maxAvailable.toFixed(2)}`);
      return;
    }

    if (!payoutDetails.trim() || payoutDetails.trim().length < 3) {
      setErrorMsg('Please enter your payout destination (email, address or bank details).');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = storage.requestWithdrawal(
        currentUser.id,
        numericAmount,
        paymentMethod,
        payoutDetails.trim()
      );

      if (res.success) {
        showToast(
          `Withdrawal request for ${campaign.currency}${numericAmount.toFixed(2)} submitted successfully!`,
          'success'
        );
        onClose();
      } else {
        setErrorMsg(res.error || 'Failed to submit withdrawal request.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during withdrawal request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="relative z-10 w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-lg text-slate-900 dark:text-slate-100">
                Request Withdrawal
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Transfer your verified rewards to your payout account
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Balance Preview Card */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Available to Withdraw
              </span>
              <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
                {campaign.currency}{wallet.availableBalance.toFixed(2)}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-medium">Minimum Threshold</span>
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {campaign.currency}{minAmount.toFixed(2)}
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Amount Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Withdrawal Amount ({campaign.currency})
              </label>
              <button
                type="button"
                onClick={handleMaxClick}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Max ({campaign.currency}{maxAvailable.toFixed(2)})
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                {campaign.currency}
              </span>
              <input
                type="number"
                step="0.01"
                min={minAmount}
                max={maxAvailable}
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setErrorMsg(null);
                }}
                placeholder={minAmount.toFixed(2)}
                required
                className="w-full pl-8 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
            {numericAmount > 0 && numericAmount < minAmount && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
                Amount must be at least {campaign.currency}{minAmount.toFixed(2)}
              </p>
            )}
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            >
              {campaign.withdrawalMethods.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Payout Details */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Payout Details / Account Destination
            </label>
            <input
              type="text"
              value={payoutDetails}
              onChange={(e) => {
                setPayoutDetails(e.target.value);
                setErrorMsg(null);
              }}
              placeholder={
                paymentMethod.toLowerCase().includes('paypal')
                  ? 'Enter PayPal Email Address'
                  : paymentMethod.toLowerCase().includes('crypto')
                  ? 'Enter USDC (ERC-20/SOL) Wallet Address'
                  : 'Enter Bank Account / Routing / IBAN'
              }
              required
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Ensure destination details are accurate. Funds sent to incorrect accounts cannot be reversed.
            </span>
          </div>

          {/* Compliance & Security Note */}
          <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/60 flex items-start gap-2.5 text-[11px] text-indigo-950 dark:text-indigo-300">
            <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Security & Review:</span> All withdrawal requests are verified for compliance against fraud rules. Requests are processed within 1-2 business days.
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || numericAmount < minAmount || numericAmount > maxAvailable}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSubmitting ? 'Processing...' : `Submit Request (${campaign.currency}${numericAmount.toFixed(2)})`}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
