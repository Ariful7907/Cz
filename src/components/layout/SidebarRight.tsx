import React from 'react';
import { TrendingUp, UserPlus, MessageCircle, Hash, Sparkles } from 'lucide-react';
import { storage } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface SidebarRightProps {
  onOpenChatWithUser: (userId: string) => void;
  onNavigateToProfile: (userId: string) => void;
  onSelectTag: (tag: string) => void;
}

const TRENDING = [
  { tag: 'WebDev', posts: '1.4k posts' },
  { tag: 'AIRevolution', posts: '2.8k posts' },
  { tag: 'Photography', posts: '890 posts' },
  { tag: 'ConnectZone', posts: '3.1k posts' },
];

export const SidebarRight: React.FC<SidebarRightProps> = ({
  onOpenChatWithUser,
  onNavigateToProfile,
  onSelectTag,
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const allUsers = storage.getUsers().filter((u) => !u.isBanned);
  const me = storage.getUserById(currentUser.id) || currentUser;

  // Friend suggestions
  const suggestions = allUsers
    .filter(
      (u) =>
        u.id !== me.id &&
        !me.friends?.includes(u.id) &&
        !me.friendRequestsSent?.includes(u.id) &&
        !me.friendRequestsReceived?.includes(u.id)
    )
    .slice(0, 3);

  // Online contacts (friends first, or other users)
  const contacts = allUsers
    .filter((u) => u.id !== me.id)
    .sort((a, b) => (b.isOnline ? 1 : 0) - (a.isOnline ? 1 : 0))
    .slice(0, 6);

  const handleAddFriend = (targetId: string) => {
    storage.sendFriendRequest(me.id, targetId);
    showToast('Friend request sent!', 'success');
  };

  return (
    <aside className="w-72 xl:w-80 shrink-0 hidden xl:flex flex-col gap-5 py-6 pl-4 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto no-scrollbar">
      {/* Trending Topics Widget */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <span>Trending for you</span>
          </h4>
        </div>

        <div className="space-y-2">
          {TRENDING.map((item) => (
            <button
              key={item.tag}
              type="button"
              onClick={() => onSelectTag(item.tag)}
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 text-left transition-colors group"
            >
              <div>
                <div className="font-bold text-xs text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500" />
                  <span>{item.tag}</span>
                </div>
                <div className="text-[10px] text-slate-400">{item.posts}</div>
              </div>
              <span className="text-[10px] text-slate-400 group-hover:text-indigo-600 font-semibold">
                Explore →
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Suggested Connections */}
      {suggestions.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs space-y-3">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <UserPlus className="w-4 h-4 text-emerald-600" />
            <span>People you may know</span>
          </h4>

          <div className="space-y-2.5">
            {suggestions.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between gap-2 p-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => onNavigateToProfile(user.id)}
                  className="flex items-center gap-2.5 text-left min-w-0 flex-1"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    referrerPolicy="no-referrer"
                    className="w-9 h-9 rounded-full object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate hover:text-indigo-600">
                      {user.name}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">@{user.username}</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleAddFriend(user.id)}
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-bold shadow-xs transition-colors shrink-0"
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Online Contacts & Direct Chat */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <MessageCircle className="w-4 h-4 text-indigo-600" />
            <span>Contacts</span>
          </h4>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        <div className="space-y-1">
          {contacts.map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={() => onOpenChatWithUser(user.id)}
              className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors group"
            >
              <div className="relative shrink-0">
                <img
                  src={user.avatar}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover"
                />
                {user.isOnline && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  {user.name}
                </div>
                <div className="text-[10px] text-slate-400">
                  {user.isOnline ? 'Online' : user.lastSeen || 'Offline'}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};
