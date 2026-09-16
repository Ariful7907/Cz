import React from 'react';
import { Compass, Film, Users, UserPlus, User, Gift } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface BottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onNavigateToProfile: (userId: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  onNavigateToProfile,
}) => {
  const { currentUser } = useAuth();

  return (
    <nav className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800 px-3 py-2 flex items-center justify-around">
      <button
        type="button"
        onClick={() => onSelectTab('feed')}
        className={`flex flex-col items-center gap-1 p-1 transition-colors ${
          currentTab === 'feed'
            ? 'text-indigo-600 dark:text-indigo-400 font-bold'
            : 'text-slate-400 dark:text-slate-500'
        }`}
      >
        <Compass className="w-5 h-5" />
        <span className="text-[10px]">Feed</span>
      </button>

      <button
        type="button"
        onClick={() => onSelectTab('clips')}
        className={`flex flex-col items-center gap-1 p-1 transition-colors ${
          currentTab === 'clips'
            ? 'text-indigo-600 dark:text-indigo-400 font-bold'
            : 'text-slate-400 dark:text-slate-500'
        }`}
      >
        <Film className="w-5 h-5 text-rose-500" />
        <span className="text-[10px]">Clips</span>
      </button>

      <button
        type="button"
        onClick={() => onSelectTab('referrals')}
        className={`flex flex-col items-center gap-1 p-1 transition-colors ${
          currentTab === 'referrals'
            ? 'text-indigo-600 dark:text-indigo-400 font-bold'
            : 'text-slate-400 dark:text-slate-500'
        }`}
      >
        <Gift className="w-5 h-5 text-amber-500" />
        <span className="text-[10px]">Rewards</span>
      </button>

      <button
        type="button"
        onClick={() => onSelectTab('friends')}
        className={`flex flex-col items-center gap-1 p-1 transition-colors ${
          currentTab === 'friends'
            ? 'text-indigo-600 dark:text-indigo-400 font-bold'
            : 'text-slate-400 dark:text-slate-500'
        }`}
      >
        <UserPlus className="w-5 h-5" />
        <span className="text-[10px]">Friends</span>
      </button>

      <button
        type="button"
        onClick={() => onNavigateToProfile(currentUser.id)}
        className={`flex flex-col items-center gap-1 p-1 transition-colors ${
          currentTab === 'profile'
            ? 'text-indigo-600 dark:text-indigo-400 font-bold'
            : 'text-slate-400 dark:text-slate-500'
        }`}
      >
        <img
          src={currentUser.avatar}
          alt="Avatar"
          className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-300"
        />
        <span className="text-[10px]">Profile</span>
      </button>
    </nav>
  );
};
