import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Users, Globe, Lock, Shield, Plus, Check } from 'lucide-react';
import { Group, Post } from '../../types';
import { storage } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { PostCard } from '../feed/PostCard';
import { CreatePostBox } from '../feed/CreatePostBox';

interface GroupDetailModalProps {
  group: Group;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToProfile?: (userId: string) => void;
}

export const GroupDetailModal: React.FC<GroupDetailModalProps> = ({
  group,
  isOpen,
  onClose,
  onNavigateToProfile,
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'feed' | 'members' | 'about'>('feed');

  if (!isOpen) return null;

  const isMember = group.memberIds.includes(currentUser.id);
  const isAdmin = group.adminIds.includes(currentUser.id);

  const groupPosts = storage.getPosts().filter((p) => p.groupId === group.id);

  const handleToggleJoin = () => {
    storage.toggleJoinGroup(group.id, currentUser.id);
    showToast(isMember ? `Left "${group.name}"` : `Joined "${group.name}"!`, 'success');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-2xl bg-slate-50 dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Cover & Top Bar */}
          <div className="relative h-44 sm:h-52 w-full shrink-0">
            <img
              src={group.coverImage}
              alt={group.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Title & Join button over cover */}
            <div className="absolute bottom-4 inset-x-5 flex items-end justify-between">
              <div className="text-white">
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider">
                  {group.category}
                </span>
                <h2 className="text-lg sm:text-2xl font-black mt-1 leading-tight">{group.name}</h2>
                <div className="flex items-center gap-2 text-xs text-white/80 mt-1">
                  <span className="flex items-center gap-1">
                    {group.privacy === 'public' ? (
                      <Globe className="w-3.5 h-3.5" />
                    ) : (
                      <Lock className="w-3.5 h-3.5" />
                    )}
                    {group.privacy === 'public' ? 'Public Group' : 'Private Group'}
                  </span>
                  <span>•</span>
                  <span>{group.memberIds.length} members</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleToggleJoin}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                  isMember
                    ? 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-md'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {isMember ? 'Joined ✓' : '+ Join Group'}
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex px-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('feed')}
              className={`py-3 px-4 border-b-2 transition-colors ${
                activeTab === 'feed'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Discussion
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('members')}
              className={`py-3 px-4 border-b-2 transition-colors ${
                activeTab === 'members'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Members ({group.memberIds.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('about')}
              className={`py-3 px-4 border-b-2 transition-colors ${
                activeTab === 'about'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              About
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeTab === 'feed' && (
              <>
                {isMember ? (
                  <CreatePostBox defaultGroupId={group.id} defaultGroupName={group.name} />
                ) : (
                  <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200 dark:border-indigo-900 text-xs text-indigo-800 dark:text-indigo-200 text-center font-medium">
                    Join this group to participate in discussions and publish posts!
                  </div>
                )}

                {groupPosts.length === 0 ? (
                  <div className="text-center py-10 text-xs text-slate-400">
                    No posts inside this group yet. Be the first to start a conversation!
                  </div>
                ) : (
                  groupPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onNavigateToProfile={onNavigateToProfile}
                    />
                  ))
                )}
              </>
            )}

            {activeTab === 'members' && (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 rounded-2xl p-2 border border-slate-200 dark:border-slate-800">
                {group.memberIds.map((mId) => {
                  const mUser = storage.getUserById(mId);
                  const isGroupAdmin = group.adminIds.includes(mId);

                  return (
                    <div
                      key={mId}
                      className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={mUser?.avatar}
                          alt={mUser?.name}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
                            {mUser?.name}
                          </div>
                          <div className="text-xs text-slate-400">@{mUser?.username}</div>
                        </div>
                      </div>

                      {isGroupAdmin && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-full">
                          <Shield className="w-3.5 h-3.5" /> Admin
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === 'about' && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4 text-xs sm:text-sm">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-xs mb-1">
                    Description
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {group.description || 'Welcome to our vibrant group!'}
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-xs mb-1">
                    Group Rules
                  </h4>
                  <ul className="list-disc list-inside space-y-1.5 text-slate-600 dark:text-slate-400">
                    {group.rules?.map((rule, idx) => (
                      <li key={idx}>{rule}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
