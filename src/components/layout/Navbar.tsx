import React, { useState, useEffect } from 'react';
import {
  Compass,
  Film,
  Users,
  UserPlus,
  Bell,
  MessageSquare,
  Search,
  Moon,
  Sun,
  ShieldAlert,
  LogOut,
  User as UserIcon,
  ChevronDown,
  Sparkles,
  Bookmark,
  Gift,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { storage, subscribeToStorage } from '../../services/storage';
import { NotificationsPopover } from '../notifications/NotificationsPopover';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenChat: () => void;
  onNavigateToProfile: (userId: string) => void;
  onSearchSubmit: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenChat,
  onNavigateToProfile,
  onSearchSubmit,
}) => {
  const { currentUser, logout, switchAccount } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  useEffect(() => {
    const updateBadges = () => {
      const notifs = storage.getNotifications(currentUser.id);
      setUnreadNotifsCount(notifs.filter((n) => !n.isRead).length);

      const convos = storage
        .getConversations()
        .filter((c) => c.participantIds.includes(currentUser.id));
      const unreadMsgs = convos.filter(
        (c) =>
          c.lastMessage &&
          c.lastMessage.receiverId === currentUser.id &&
          !c.lastMessage.seen
      ).length;
      setUnreadMessagesCount(unreadMsgs);
    };

    updateBadges();
    return subscribeToStorage(updateBadges);
  }, [currentUser.id]);

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      onSearchSubmit(searchQuery.trim());
    }
  };

  const allDemoUsers = storage.getUsers().filter((u) => !u.isBanned);

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Brand Logo & Global Search */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <button
            type="button"
            onClick={() => onSelectTab('feed')}
            className="flex items-center gap-2 group text-left"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-all">
              <div className="relative">
                <span className="font-black text-xl tracking-tighter">CZ</span>
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-indigo-600" />
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="font-black text-base tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-1 leading-none">
                Connect<span className="text-indigo-600 dark:text-indigo-400">Zone</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                Social Network
              </span>
            </div>
          </button>

          {/* Quick Search */}
          <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-full text-xs text-slate-600 dark:text-slate-300 w-52 lg:w-64 border border-transparent focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search ConnectZone..."
              className="bg-transparent flex-1 text-slate-900 dark:text-slate-100 focus:outline-none placeholder-slate-400"
            />
          </div>
        </div>

        {/* Center: Main App Tabs Navigation */}
        <nav className="hidden sm:flex items-center gap-1">
          <button
            type="button"
            onClick={() => onSelectTab('feed')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              currentTab === 'feed'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Home Feed"
          >
            <Compass className="w-4 h-4" />
            <span className="hidden md:inline">Feed</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('clips')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              currentTab === 'clips'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Short Videos"
          >
            <Film className="w-4 h-4" />
            <span className="hidden md:inline">Clips</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('groups')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              currentTab === 'groups'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Groups"
          >
            <Users className="w-4 h-4" />
            <span className="hidden md:inline">Groups</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('friends')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              currentTab === 'friends'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Friends"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden md:inline">Friends</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('referrals')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              currentTab === 'referrals'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Referrals & Rewards"
          >
            <Gift className="w-4 h-4 text-amber-500" />
            <span className="hidden md:inline">Rewards</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('search')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              currentTab === 'search'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Explore & Search"
          >
            <Search className="w-4 h-4" />
            <span className="hidden md:inline">Explore</span>
          </button>

          {currentUser.role === 'admin' && (
            <button
              type="button"
              onClick={() => onSelectTab('admin')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                currentTab === 'admin'
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Admin Panel"
            >
              <ShieldAlert className="w-4 h-4" />
              <span className="hidden md:inline">Admin</span>
            </button>
          )}
        </nav>

        {/* Right: Actions, Notifications, Messages & User Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mobile search toggle */}
          <button
            type="button"
            onClick={() => onSelectTab('search')}
            className="sm:hidden p-2 rounded-full text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2.5 rounded-full text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Messages Button */}
          <button
            type="button"
            onClick={onOpenChat}
            className="relative p-2.5 rounded-full text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Chat & Direct Messages"
          >
            <MessageSquare className="w-5 h-5" />
            {unreadMessagesCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-indigo-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadMessagesCount}
              </span>
            )}
          </button>

          {/* Notifications Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications((prev) => !prev)}
              className="relative p-2.5 rounded-full text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            <NotificationsPopover
              isOpen={showNotifications}
              onClose={() => setShowNotifications(false)}
              onNavigateToProfile={onNavigateToProfile}
              onOpenChatWithUser={(uId) => {
                onOpenChat();
              }}
            />
          </div>

          {/* User Profile Dropdown Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowUserMenu((p) => !p)}
              className="flex items-center gap-1.5 p-1 pl-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/30"
              />
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 top-12 z-50 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {/* Current User Info */}
                  <div className="px-4 py-3">
                    <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      {currentUser.name}
                    </div>
                    <div className="text-slate-400">@{currentUser.username}</div>
                  </div>

                  {/* Links */}
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        onNavigateToProfile(currentUser.id);
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                    >
                      <UserIcon className="w-4 h-4 text-indigo-500" /> View Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectTab('referrals');
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                    >
                      <Gift className="w-4 h-4 text-amber-500" /> Referrals & Rewards
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectTab('feed');
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                    >
                      <Bookmark className="w-4 h-4 text-amber-500" /> Saved Posts
                    </button>
                    {currentUser.role === 'admin' && (
                      <button
                        type="button"
                        onClick={() => {
                          onSelectTab('admin');
                          setShowUserMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left font-medium text-rose-600 dark:text-rose-400 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                      >
                        <ShieldAlert className="w-4 h-4" /> Admin Console
                      </button>
                    )}
                  </div>

                  {/* Switch Demo Accounts Quick Selector */}
                  <div className="p-2 space-y-1">
                    <div className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Switch Demo User:
                    </div>
                    {allDemoUsers.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          switchAccount(u.id);
                          setShowUserMenu(false);
                        }}
                        className={`w-full px-2.5 py-1.5 rounded-xl text-left flex items-center gap-2 transition-colors ${
                          u.id === currentUser.id
                            ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-bold'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                        <span className="truncate">{u.name}</span>
                        {u.role === 'admin' && (
                          <span className="text-[9px] bg-indigo-100 dark:bg-indigo-900 px-1 rounded ml-auto">
                            Admin
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Logout */}
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
