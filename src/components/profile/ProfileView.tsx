import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Globe,
  Briefcase,
  Calendar,
  Edit3,
  UserPlus,
  UserCheck,
  UserX,
  MessageCircle,
  Lock,
  Grid,
  Image as ImageIcon,
  Bookmark,
  Users,
  ShieldCheck,
  Gift,
} from 'lucide-react';
import { User, Post } from '../../types';
import { storage, subscribeToStorage } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { PostCard } from '../feed/PostCard';
import { CreatePostBox } from '../feed/CreatePostBox';
import { EditProfileModal } from './EditProfileModal';
import { InviteFriendsCard } from './InviteFriendsCard';
import { ReferralDashboard } from '../referrals/ReferralDashboard';

interface ProfileViewProps {
  userId?: string;
  onOpenChatWithUser?: (userId: string) => void;
  onNavigateToProfile?: (userId: string) => void;
  onNavigateToReferrals?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userId,
  onOpenChatWithUser,
  onNavigateToProfile,
  onNavigateToReferrals,
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const targetUserId = userId || currentUser.id;
  const isMe = targetUserId === currentUser.id;

  const [profileUser, setProfileUser] = useState<User | undefined>(() =>
    storage.getUserById(targetUserId)
  );
  const [activeTab, setActiveTab] = useState<'posts' | 'media' | 'friends' | 'saved' | 'referrals'>('posts');
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    const sync = () => {
      setProfileUser(storage.getUserById(targetUserId));
    };
    sync();
    return subscribeToStorage(sync);
  }, [targetUserId]);

  if (!profileUser) {
    return (
      <div className="text-center py-20 text-slate-400">
        <p>User profile not found.</p>
      </div>
    );
  }

  const me = storage.getUserById(currentUser.id) || currentUser;
  const isFriend = me.friends?.includes(profileUser.id);
  const isFollowing = me.following?.includes(profileUser.id);
  const hasSentFriendRequest = me.friendRequestsSent?.includes(profileUser.id);
  const hasReceivedFriendRequest = me.friendRequestsReceived?.includes(profileUser.id);

  // User posts
  const allPosts = storage.getPosts();
  const userPosts = allPosts.filter((p) => p.authorId === profileUser.id);
  const mediaPosts = userPosts.filter((p) => p.mediaUrls && p.mediaUrls.length > 0);
  const savedPosts = isMe
    ? allPosts.filter((p) => p.savedBy?.includes(me.id))
    : [];

  const handleToggleFollow = () => {
    storage.toggleFollow(me.id, profileUser.id);
    showToast(isFollowing ? `Unfollowed @${profileUser.username}` : `Following @${profileUser.username}`, 'info');
  };

  const handleFriendAction = () => {
    if (isFriend) {
      if (window.confirm(`Remove ${profileUser.name} from friends?`)) {
        storage.removeFriend(me.id, profileUser.id);
        showToast('Friend removed', 'info');
      }
    } else if (hasReceivedFriendRequest) {
      storage.acceptFriendRequest(me.id, profileUser.id);
      showToast('Friend request accepted!', 'success');
    } else if (hasSentFriendRequest) {
      showToast('Friend request already sent', 'info');
    } else {
      storage.sendFriendRequest(me.id, profileUser.id);
      showToast('Friend request sent!', 'success');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Cover & Profile Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
        {/* Cover Photo */}
        <div className="relative h-48 sm:h-64 w-full bg-slate-200 dark:bg-slate-800">
          <img
            src={profileUser.coverPhoto}
            alt="Cover"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>

        {/* Profile Info Container */}
        <div className="px-6 pb-6 pt-3 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-4">
            {/* Avatar & Badges */}
            <div className="relative inline-block self-start sm:self-auto">
              <img
                src={profileUser.avatar}
                alt={profileUser.name}
                referrerPolicy="no-referrer"
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover ring-4 ring-white dark:ring-slate-900 shadow-xl"
              />
              {profileUser.isOnline && (
                <span
                  className="absolute bottom-2 right-2 w-5 h-5 bg-emerald-500 rounded-full ring-4 ring-white dark:ring-slate-900"
                  title="Online now"
                />
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {isMe ? (
                <button
                  type="button"
                  onClick={() => setIsEditOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-bold shadow-sm transition-colors"
                >
                  <Edit3 className="w-4 h-4" /> Edit Profile
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleFriendAction}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all ${
                      isFriend
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    {isFriend ? (
                      <>
                        <UserCheck className="w-4 h-4" /> Friends
                      </>
                    ) : hasSentFriendRequest ? (
                      'Request Sent'
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" /> Add Friend
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleToggleFollow}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-colors ${
                      isFollowing
                        ? 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                        : 'border-indigo-600 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40'
                    }`}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenChatWithUser?.(profileUser.id)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-bold transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" /> Message
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Name & Bio Details */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
                  {profileUser.name}
                </h1>
                {profileUser.role === 'admin' && (
                  <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 rounded-full">
                    <ShieldCheck className="w-3 h-3" /> Admin
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-400">@{profileUser.username}</p>
            </div>

            {profileUser.bio && (
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 max-w-2xl leading-relaxed">
                {profileUser.bio}
              </p>
            )}

            {/* Metadata Badges (Occupation, Location, Website, Joined) */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
              {profileUser.occupation && (
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  <span>{profileUser.occupation}</span>
                </div>
              )}
              {profileUser.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{profileUser.location}</span>
                </div>
              )}
              {profileUser.website && (
                <div className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  <a
                    href={profileUser.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    {profileUser.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  Joined{' '}
                  {new Date(profileUser.joinedDate || Date.now()).toLocaleDateString([], {
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>

            {/* Counters Row (Friends, Followers, Following) */}
            <div className="flex items-center gap-6 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs sm:text-sm">
              <div>
                <span className="font-black text-slate-900 dark:text-slate-100">
                  {profileUser.friends?.length || 0}
                </span>{' '}
                <span className="text-slate-500">Friends</span>
              </div>
              <div>
                <span className="font-black text-slate-900 dark:text-slate-100">
                  {profileUser.followers?.length || 0}
                </span>{' '}
                <span className="text-slate-500">Followers</span>
              </div>
              <div>
                <span className="font-black text-slate-900 dark:text-slate-100">
                  {profileUser.following?.length || 0}
                </span>{' '}
                <span className="text-slate-500">Following</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-6 border-t border-slate-200 dark:border-slate-800 text-xs font-bold bg-slate-50/50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={() => setActiveTab('posts')}
            className={`py-3.5 px-4 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'posts'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Grid className="w-4 h-4" /> Posts ({userPosts.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('media')}
            className={`py-3.5 px-4 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'media'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <ImageIcon className="w-4 h-4" /> Media ({mediaPosts.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('friends')}
            className={`py-3.5 px-4 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'friends'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Users className="w-4 h-4" /> Friends ({profileUser.friends?.length || 0})
          </button>
          {isMe && (
            <button
              type="button"
              onClick={() => setActiveTab('saved')}
              className={`py-3.5 px-4 border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === 'saved'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Bookmark className="w-4 h-4" /> Saved ({savedPosts.length})
            </button>
          )}
          {isMe && (
            <button
              type="button"
              onClick={() => setActiveTab('referrals')}
              className={`py-3.5 px-4 border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === 'referrals'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Gift className="w-4 h-4 text-amber-500" /> Referrals & Rewards
            </button>
          )}
        </div>
      </div>

      {/* Invite Friends Section on Profile */}
      {isMe && activeTab !== 'referrals' && (
        <InviteFriendsCard onNavigateToReferrals={onNavigateToReferrals || (() => setActiveTab('referrals'))} />
      )}

      {/* Tab Panels */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          {isMe && <CreatePostBox />}
          {userPosts.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-12 text-center text-slate-400 text-xs">
              No posts shared yet.
            </div>
          ) : (
            userPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onNavigateToProfile={onNavigateToProfile}
              />
            ))
          )}
        </div>
      )}

      {activeTab === 'media' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800">
          {mediaPosts.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No photos or videos shared yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {mediaPosts.map((post) =>
                post.mediaUrls?.map((url, idx) => (
                  <div
                    key={`${post.id}-${idx}`}
                    className="aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 group relative"
                  >
                    {post.mediaType === 'video' ? (
                      <video src={url} className="w-full h-full object-cover" />
                    ) : (
                      <img
                        src={url}
                        alt="Media post"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'friends' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {profileUser.friends?.map((fId) => {
              const friend = storage.getUserById(fId);
              if (!friend) return null;

              return (
                <button
                  key={fId}
                  type="button"
                  onClick={() => onNavigateToProfile?.(fId)}
                  className="p-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl flex items-center gap-3 text-left transition-colors border border-slate-200/60 dark:border-slate-700/60"
                >
                  <img
                    src={friend.avatar}
                    alt={friend.name}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-500/20"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate">
                      {friend.name}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">@{friend.username}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'saved' && isMe && (
        <div className="space-y-4">
          {savedPosts.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-12 text-center text-slate-400 text-xs">
              No saved posts yet. Tap "Save Post" on any post in your feed to bookmark it here!
            </div>
          ) : (
            savedPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onNavigateToProfile={onNavigateToProfile}
              />
            ))
          )}
        </div>
      )}

      {activeTab === 'referrals' && isMe && (
        <ReferralDashboard />
      )}

      <EditProfileModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} />
    </div>
  );
};
