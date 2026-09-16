import React, { useState, useEffect } from 'react';
import {
  Gift,
  Copy,
  Check,
  Share2,
  ArrowUpRight,
  Sparkles,
  Coins,
  Send,
  Users,
} from 'lucide-react';
import { storage, subscribeToStorage } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface InviteFriendsCardProps {
  onNavigateToReferrals?: () => void;
}

export const InviteFriendsCard: React.FC<InviteFriendsCardProps> = ({
  onNavigateToReferrals,
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [codeRecord, setCodeRecord] = useState(() =>
    storage.getUserReferralCode(currentUser.id)
  );
  const [wallet, setWallet] = useState(() =>
    storage.getUserWallet(currentUser.id)
  );
  const [referrals, setReferrals] = useState(() =>
    storage.getUserReferrals(currentUser.id)
  );
  const [campaign, setCampaign] = useState(() =>
    storage.getReferralCampaign()
  );

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    return subscribeToStorage(() => {
      setCodeRecord(storage.getUserReferralCode(currentUser.id));
      setWallet(storage.getUserWallet(currentUser.id));
      setReferrals(storage.getUserReferrals(currentUser.id));
      setCampaign(storage.getReferralCampaign());
    });
  }, [currentUser.id]);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://connectzone.io';
  const referralLink = `${baseUrl}/?ref=${codeRecord.code}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    showToast('Referral link copied to clipboard!', 'success');
    setTimeout(() => setCopiedLink(false), 2200);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeRecord.code);
    setCopiedCode(true);
    showToast(`Referral code ${codeRecord.code} copied!`, 'success');
    setTimeout(() => setCopiedCode(false), 2200);
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

  const handleShareTwitter = () => {
    const text = encodeURIComponent(
      `Connect with me on ConnectZone! Use invite code ${codeRecord.code}: ${referralLink}`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900/90 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 border border-indigo-800/50 shadow-xl space-y-5 relative overflow-hidden">
      <div className="absolute -right-8 -top-8 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between gap-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/20 text-indigo-300 rounded-2xl border border-indigo-400/30">
            <Gift className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-base text-white">Invite Friends & Earn Rewards</h3>
              <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-extrabold uppercase">
                {campaign.currency}{campaign.rewardAmount.toFixed(2)} Each
              </span>
            </div>
            <p className="text-xs text-indigo-200/80 mt-0.5">
              Share your invite link with creators. Earn cash rewards upon qualified registration.
            </p>
          </div>
        </div>

        {onNavigateToReferrals && (
          <button
            type="button"
            onClick={onNavigateToReferrals}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all flex items-center gap-1 shrink-0"
          >
            <span>Dashboard</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Code and Link Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 relative z-10">
        {/* Referral Code */}
        <div className="bg-white/10 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-indigo-200 font-bold uppercase tracking-wider block">
              Your Code
            </span>
            <span className="font-mono font-black text-lg text-amber-300 tracking-wider">
              {codeRecord.code}
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopyCode}
            className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors"
            title="Copy Code"
          >
            {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {/* Quick Stats: Referrals */}
        <div className="bg-white/10 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-indigo-200 font-bold uppercase tracking-wider block">
              Total Referrals
            </span>
            <span className="font-black text-lg text-white">
              {referrals.length} <span className="text-xs font-normal text-indigo-300">friends</span>
            </span>
          </div>
          <div className="p-2 bg-indigo-500/30 rounded-xl text-indigo-300">
            <Users className="w-4 h-4" />
          </div>
        </div>

        {/* Quick Stats: Wallet Balance */}
        <div className="bg-white/10 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-indigo-200 font-bold uppercase tracking-wider block">
              Available Balance
            </span>
            <span className="font-black text-lg text-emerald-400">
              {campaign.currency}{wallet.availableBalance.toFixed(2)}
            </span>
          </div>
          <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-300">
            <Coins className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Share Actions Bar */}
      <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 relative z-10 text-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyLink}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Invite Link</span>
              </>
            )}
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-indigo-200 font-medium mr-1">Share to:</span>
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-400 transition-colors"
            title="Share on WhatsApp"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleShareTelegram}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-sky-400 transition-colors"
            title="Share on Telegram"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleShareTwitter}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono font-bold transition-colors"
            title="Share on X"
          >
            𝕏
          </button>
        </div>
      </div>
    </div>
  );
};
