import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  MessageCircle,
  Clock,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { User } from '../../types';
import { storage, subscribeToStorage } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface FriendsViewProps {
  onOpenChatWithUser?: (userId: string) => void;
  onNavigateToProfile?: (userId: string) => void;
}

export const FriendsView: React.FC<FriendsViewProps> = ({
  onOpenChatWithUser,
  onNavigateToProfile,
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [users, setUsers] = useState<User[]>(() => storage.getUsers());
  const [activeTab, setActiveTab] = useState<
    'requests' | 'suggestions' | 'friends' | 'followers' | 'following'
  >('requests');
  const [search, setSearch] = useState('');

  useEffect(() => {
    return subscribeToStorage(() => {
      setUsers(storage.getUsers());
    });
  }, []);

  const me = storage.getUserById(currentUser.id) || currentUser;

  // Categorize
  const friendRequestsReceived = users.filter((u) =>
    me.friendRequestsReceived?.includes(u.id)
  );
  const friendsList = users.filter((u) => me.friends?.includes(u.id));
  const followersList = users.filter((u) => me.followers?.includes(u.id));
  const followingList = users.filter((u) => me.following?.includes(u.id));

  // Suggestions: users who are not friends, not self, and no pending requests
  const suggestionsList = users.filter(
    (u) =>
      u.id !== me.id &&
      !u.isBanned &&
      !me.friends?.includes(u.id) &&
      !me.friendRequestsReceived?.includes(u.id) &&
      !me.friendRequestsSent?.includes(u.id)
  );

  const handleAcceptRequest = (senderId: string) => {
    storage.acceptFriendRequest(me.id, senderId);
    showToast('Friend request accepted!', 'success');
  };

  const handleRejectRequest = (senderId: string) => {
    storage.rejectFriendRequest(me.id, senderId);
    showToast('Friend request declined', 'info');
  };

  const handleSendFriendRequest = (targetId: string) => {
    storage.sendFriendRequest(me.id, targetId);
    showToast('Friend request sent!', 'success');
  };

  const handleRemoveFriend = (friendId: string) => {
    if (window.confirm('Are you sure you want to remove this friend?')) {
      storage.removeFriend(me.id, friendId);
      showToast('Friend removed', 'info');
    }
  };

  const handleToggleFollow = (targetId: string) => {
    storage.toggleFollow(me.id, targetId);
  };

  const renderUserGrid = (list: User[], type: string) => {
    const filtered = list.filter(
      (u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.username.toLowerCase().includes(search.toLowerCase())
    );

    if (filtered.length === 0) {
      return (
        <div className="text-center py-16 text-slate-400 text-xs">
          No users found in {type}.
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((user) => {
          const isFriend = me.friends?.includes(user.id);
          const isFollowing = me.following?.includes(user.id);
          const hasSentRequest = me.friendRequestsSent?.includes(user.id);

          return (
            <div
              key={user.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => onNavigateToProfile?.(user.id)}
                  className="relative shrink-0 group"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-indigo-500/20 group-hover:ring-indigo-500 transition-all"
                  />
                  {user.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => onNavigateToProfile?.(user.id)}
                    className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 truncate block text-left"
                  >
                    {user.name}
                  </button>
                  <p className="text-xs text-slate-400 truncate">@{user.username}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                    {user.bio || 'ConnectZone member'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                {type === 'requests' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleAcceptRequest(user.id)}
                      className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRejectRequest(user.id)}
                      className="flex-1 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors"
                    >
                      Delete
                    </button>
                  </>
                ) : (
                  <>
                    {isFriend ? (
                      <>
                        <button
                          type="button"
                          onClick={() => onOpenChatWithUser?.(user.id)}
                          className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" /> Message
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveFriend(user.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Remove friend"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      </>
                    ) : hasSentRequest ? (
                      <span className="flex-1 py-1.5 text-center text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-xl">
                        Request Sent
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSendFriendRequest(user.id)}
                        className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                      >
                        <UserPlus className="w-3.5 h-3.5" /> Add Friend
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleToggleFollow(user.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                        isFollowing
                          ? 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                          : 'border-indigo-600 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40'
                      }`}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            <span>Friends & Network</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your friendship requests, discover mutual connections, and stay in touch.
          </p>
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search people..."
            className="bg-transparent flex-1 text-slate-900 dark:text-slate-100 focus:outline-none"
          />
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('requests')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            activeTab === 'requests'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <span>Requests</span>
          {friendRequestsReceived.length > 0 && (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] ${
                activeTab === 'requests' ? 'bg-white text-indigo-600' : 'bg-rose-500 text-white'
              }`}
            >
              {friendRequestsReceived.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('suggestions')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'suggestions'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Suggestions
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('friends')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'friends'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          All Friends ({friendsList.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('followers')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'followers'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Followers ({followersList.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('following')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'following'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Following ({followingList.length})
        </button>
      </div>

      {/* Tab Contents */}
      <div>
        {activeTab === 'requests' && renderUserGrid(friendRequestsReceived, 'Friend Requests')}
        {activeTab === 'suggestions' && renderUserGrid(suggestionsList, 'Suggestions')}
        {activeTab === 'friends' && renderUserGrid(friendsList, 'All Friends')}
        {activeTab === 'followers' && renderUserGrid(followersList, 'Followers')}
        {activeTab === 'following' && renderUserGrid(followingList, 'Following')}
      </div>
    </div>
  );
};
