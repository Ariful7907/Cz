import React, { useState, useEffect } from 'react';
import {
  Compass,
  Film,
  Users,
  UserPlus,
  Bookmark,
  ShieldAlert,
  User,
  Settings,
  Sparkles,
  MessageSquare,
  Gift,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { storage, subscribeToStorage } from '../../services/storage';

interface SidebarLeftProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onNavigateToProfile: (userId: string) => void;
  onOpenChat?: () => void;
}

export const SidebarLeft: React.FC<SidebarLeftProps> = ({
  currentTab,
  onSelectTab,
  onNavigateToProfile,
  onOpenChat,
}) => {
  const { currentUser } = useAuth();
  const myGroups = storage.getGroups().filter((g) => g.memberIds.includes(currentUser.id));
  const [unreadCount, setUnreadCount] = useState(0);
  const [walletBalance, setWalletBalance] = useState(() =>
    storage.getUserWallet(currentUser.id).availableBalance
  );

  useEffect(() => {
    const updateUnread = () => {
      const convos = storage
        .getConversations()
        .filter((c) => c.participantIds.includes(currentUser.id));
      const unread = convos.filter(
        (c) =>
          c.lastMessage &&
          c.lastMessage.receiverId === currentUser.id &&
          !c.lastMessage.seen
      ).length;
      setUnreadCount(unread);
      setWalletBalance(storage.getUserWallet(currentUser.id).availableBalance);
    };
    updateUnread();
    return subscribeToStorage(updateUnread);
  }, [currentUser.id]);

  return (
    <aside className="w-60 xl:w-64 shrink-0 hidden lg:flex flex-col gap-6 py-6 pr-4 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto no-scrollbar">
      {/* Current User Quick Tile */}
      <button
        type="button"
        onClick={() => onNavigateToProfile(currentUser.id)}
        className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-500/40 transition-all text-left group"
      >
        <div className="relative">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            referrerPolicy="no-referrer"
            className="w-11 h-11 rounded-full object-cover ring-2 ring-indigo-500/20 group-hover:ring-indigo-500 transition-all"
          />
          {currentUser.isOnline && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
            {currentUser.name}
          </div>
          <div className="text-xs text-slate-400 truncate">@{currentUser.username}</div>
        </div>
      </button>

      {/* Main Nav Links */}
      <div className="space-y-1">
        <button
          type="button"
          onClick={() => onSelectTab('feed')}
          className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all text-left ${
            currentTab === 'feed'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span>Home Feed</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('clips')}
          className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all text-left ${
            currentTab === 'clips'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900'
          }`}
        >
          <Film className="w-5 h-5 text-rose-500" />
          <span>ConnectClips</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('groups')}
          className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all text-left ${
            currentTab === 'groups'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900'
          }`}
        >
          <Users className="w-5 h-5 text-amber-500" />
          <span>Communities</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenChat?.()}
          className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900 transition-all text-left group"
        >
          <div className="flex items-center gap-3.5">
            <MessageSquare className="w-5 h-5 text-indigo-500 group-hover:scale-110 transition-transform" />
            <span>Messages</span>
          </div>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-600 text-white shadow-xs animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('friends')}
          className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all text-left ${
            currentTab === 'friends'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900'
          }`}
        >
          <UserPlus className="w-5 h-5 text-emerald-500" />
          <span>Friends & Network</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('referrals')}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all text-left group ${
            currentTab === 'referrals'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <Gift className={`w-5 h-5 ${currentTab === 'referrals' ? 'text-white' : 'text-amber-500'}`} />
            <span>Earn Rewards</span>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold transition-all ${
              currentTab === 'referrals'
                ? 'bg-white/20 text-white'
                : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
            }`}
          >
            ${walletBalance.toFixed(2)}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onNavigateToProfile(currentUser.id)}
          className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all text-left ${
            currentTab === 'profile'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900'
          }`}
        >
          <User className="w-5 h-5 text-purple-500" />
          <span>My Profile</span>
        </button>

        {currentUser.role === 'admin' && (
          <button
            type="button"
            onClick={() => onSelectTab('admin')}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all text-left ${
              currentTab === 'admin'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                : 'text-rose-600 dark:text-rose-400 hover:bg-white dark:hover:bg-slate-900'
            }`}
          >
            <ShieldAlert className="w-5 h-5" />
            <span>Admin Console</span>
          </button>
        )}
      </div>

      {/* Your Groups Shortcuts */}
      {myGroups.length > 0 && (
        <div className="space-y-2">
          <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Your Groups
          </div>
          <div className="space-y-1">
            {myGroups.slice(0, 4).map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => onSelectTab('groups')}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-900 text-left transition-colors"
              >
                <img
                  src={g.avatar || g.coverImage}
                  alt={g.name}
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-lg object-cover"
                />
                <span className="truncate flex-1">{g.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-auto pt-4 text-[11px] text-slate-400 px-3 space-y-1">
        <div className="font-semibold text-slate-500 dark:text-slate-400">
          ConnectZone © {new Date().getFullYear()}
        </div>
        <p className="text-[10px] leading-tight">
          Next-Gen Social Network • Privacy • Community Rules
        </p>
      </div>
    </aside>
  );
};
