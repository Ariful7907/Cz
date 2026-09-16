import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Globe,
  Users,
  Lock,
  Heart,
  Send,
  Trash2,
  Edit3,
  Pin,
  Flag,
  Copy,
  Smile,
  X,
  Check,
} from 'lucide-react';
import { Post, ReactionType, PostComment, User } from '../../types';
import { storage } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ReactionPicker, REACTION_DETAILS } from './ReactionPicker';
import { ReportModal } from '../common/ReportModal';

interface PostCardProps {
  post: Post;
  onNavigateToProfile?: (userId: string) => void;
  onNavigateToGroup?: (groupId: string) => void;
  onOpenMedia?: (url: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onNavigateToProfile,
  onNavigateToGroup,
  onOpenMedia,
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const author: User | undefined = storage.getUserById(post.authorId);
  const isAuthor = currentUser.id === post.authorId;
  const isSaved = post.savedBy?.includes(currentUser.id);

  // States
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showReactionsBreakdown, setShowReactionsBreakdown] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareCaption, setShareCaption] = useState('');

  const pickerTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Current user's reaction
  const userReaction = post.reactions?.find((r) => r.userId === currentUser.id);

  const handleMouseEnterReaction = () => {
    if (pickerTimeoutRef.current) clearTimeout(pickerTimeoutRef.current);
    setShowReactionPicker(true);
  };

  const handleMouseLeaveReaction = () => {
    pickerTimeoutRef.current = setTimeout(() => {
      setShowReactionPicker(false);
    }, 300);
  };

  const handleSelectReaction = (type: ReactionType) => {
    storage.toggleReaction(post.id, currentUser.id, type);
    setShowReactionPicker(false);
  };

  const handleQuickLike = () => {
    if (userReaction) {
      storage.toggleReaction(post.id, currentUser.id, userReaction.type);
    } else {
      storage.toggleReaction(post.id, currentUser.id, 'like');
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    storage.addComment(post.id, currentUser.id, commentText.trim());
    setCommentText('');
    setShowComments(true);
    showToast('Comment posted', 'success');
  };

  const handleAddReply = (commentId: string) => {
    if (!replyText.trim()) return;
    storage.addReply(post.id, commentId, currentUser.id, replyText.trim());
    setReplyText('');
    setReplyingToCommentId(null);
    showToast('Reply posted', 'success');
  };

  const handleDeletePost = () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      storage.deletePost(post.id);
      showToast('Post deleted', 'info');
    }
  };

  const handleSavePost = () => {
    storage.toggleSavePost(post.id, currentUser.id);
    showToast(isSaved ? 'Removed from saved' : 'Post saved to your bookmarks', 'success');
    setShowMenu(false);
  };

  const handleSaveEdit = () => {
    if (!editContent.trim()) return;
    storage.updatePost(post.id, { content: editContent.trim() });
    setIsEditing(false);
    showToast('Post updated', 'success');
  };

  const handleShareToFeed = () => {
    storage.createPost({
      authorId: currentUser.id,
      content: `${shareCaption ? shareCaption + '\n\n' : ''}🔁 Reposted from @${author?.username || 'user'}:\n"${post.content}"`,
      mediaType: post.mediaType,
      mediaUrls: post.mediaUrls,
      privacy: 'public',
    });
    storage.incrementShare(post.id);
    setShowShareModal(false);
    setShareCaption('');
    showToast('Shared to your feed!', 'success');
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('Post link copied to clipboard', 'info');
    setShowMenu(false);
    setShowShareModal(false);
  };

  // Format time ago
  const formatTime = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const mins = Math.floor(diffMs / 60000);
      if (mins < 1) return 'Just now';
      if (mins < 60) return `${mins}m`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}h`;
      const days = Math.floor(hours / 24);
      if (days < 7) return `${days}d`;
      return new Date(isoString).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  // Group reactions by type for breakdown summary
  const reactionCounts = (post.reactions || []).reduce((acc, r) => {
    acc[r.type] = (acc[r.type] || 0) + 1;
    return acc;
  }, {} as Record<ReactionType, number>);

  const activeReactionTypes = (Object.keys(reactionCounts) as ReactionType[]).sort(
    (a, b) => reactionCounts[b] - reactionCounts[a]
  );

  return (
    <article
      id={`post-${post.id}`}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
    >
      {/* Post Header */}
      <div className="p-4 sm:p-5 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigateToProfile?.(post.authorId)}
            className="relative shrink-0 focus:outline-none group"
          >
            <img
              src={author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'}
              alt={author?.name || 'Author'}
              referrerPolicy="no-referrer"
              className="w-11 h-11 rounded-full object-cover ring-2 ring-transparent group-hover:ring-indigo-500 transition-all"
            />
            {author?.isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>

          <div>
            <div className="flex items-center flex-wrap gap-1.5 leading-snug">
              <button
                type="button"
                onClick={() => onNavigateToProfile?.(post.authorId)}
                className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                {author?.name || 'Community Member'}
              </button>
              <span className="text-xs text-slate-400">@{author?.username || 'user'}</span>

              {post.feeling && (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  is feeling <span className="font-semibold">{post.feeling}</span>
                </span>
              )}

              {post.groupName && (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  in{' '}
                  <button
                    type="button"
                    onClick={() => post.groupId && onNavigateToGroup?.(post.groupId)}
                    className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    {post.groupName}
                  </button>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span>{formatTime(post.createdAt)}</span>
              <span>•</span>
              {post.privacy === 'public' && <Globe className="w-3.5 h-3.5" title="Public" />}
              {post.privacy === 'friends' && <Users className="w-3.5 h-3.5" title="Friends Only" />}
              {post.privacy === 'only_me' && <Lock className="w-3.5 h-3.5" title="Only Me" />}
              {post.isPinned && (
                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                  • <Pin className="w-3 h-3" /> Pinned
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Post Actions Dropdown */}
        <div className="relative">
          <button
            type="button"
            id={`post-menu-btn-${post.id}`}
            onClick={() => setShowMenu((prev) => !prev)}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-0 top-8 z-40 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 text-sm"
              >
                <button
                  type="button"
                  onClick={handleSavePost}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 text-left transition-colors"
                >
                  <Bookmark className={`w-4 h-4 ${isSaved ? 'text-indigo-600 fill-indigo-600' : ''}`} />
                  <span>{isSaved ? 'Unsave Post' : 'Save Post'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 text-left transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy Link</span>
                </button>

                {isAuthor && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(true);
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 text-left transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Edit Post</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDeletePost}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Post</span>
                    </button>
                  </>
                )}

                {!isAuthor && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowReportModal(true);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left transition-colors"
                  >
                    <Flag className="w-4 h-4" />
                    <span>Report Post</span>
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Post Content */}
      <div className="px-4 sm:px-5 pb-3">
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={3}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-slate-900 dark:text-slate-100"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line break-words">
            {post.content.split(' ').map((word, i) => {
              if (word.startsWith('#')) {
                return (
                  <span key={i} className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline cursor-pointer">
                    {word}{' '}
                  </span>
                );
              }
              if (word.startsWith('@')) {
                return (
                  <span key={i} className="text-teal-600 dark:text-teal-400 font-medium hover:underline cursor-pointer">
                    {word}{' '}
                  </span>
                );
              }
              return word + ' ';
            })}
          </p>
        )}
      </div>

      {/* Media Attachments */}
      {post.mediaUrls && post.mediaUrls.length > 0 && (
        <div className="relative border-y border-slate-100 dark:border-slate-800/80 bg-slate-950">
          {post.mediaType === 'video' ? (
            <video
              src={post.mediaUrls[0]}
              controls
              className="w-full max-h-[500px] object-contain mx-auto bg-black"
            />
          ) : (
            <div className={`grid gap-1 ${post.mediaUrls.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {post.mediaUrls.map((url, index) => (
                <div
                  key={index}
                  onClick={() => onOpenMedia?.(url)}
                  className="relative group cursor-pointer overflow-hidden max-h-[480px] bg-slate-900"
                >
                  <img
                    src={url}
                    alt="Attachment"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 max-h-[480px]"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reactions Summary & Counts Bar */}
      <div className="px-4 sm:px-5 py-2.5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800/60">
        <button
          type="button"
          onClick={() => (post.reactions?.length || 0) > 0 && setShowReactionsBreakdown(true)}
          className="flex items-center gap-1.5 hover:underline focus:outline-none"
        >
          {activeReactionTypes.length > 0 ? (
            <div className="flex -space-x-1 items-center">
              {activeReactionTypes.slice(0, 3).map((type) => (
                <span
                  key={type}
                  className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white dark:bg-slate-800 shadow text-xs"
                >
                  {REACTION_DETAILS[type]?.emoji}
                </span>
              ))}
            </div>
          ) : (
            <Heart className="w-4 h-4 text-slate-400" />
          )}
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {post.reactions?.length || 0}
          </span>
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowComments((prev) => !prev)}
            className="hover:underline"
          >
            {post.comments?.length || 0} comments
          </button>
          <span>•</span>
          <span>{post.sharesCount || 0} shares</span>
        </div>
      </div>

      {/* Action Buttons: Like, Comment, Share, Save */}
      <div className="px-2 py-1.5 flex items-center justify-between relative border-b border-slate-100 dark:border-slate-800/60">
        {/* Animated Reaction Picker Container */}
        <div
          className="relative flex-1"
          onMouseEnter={handleMouseEnterReaction}
          onMouseLeave={handleMouseLeaveReaction}
        >
          <AnimatePresence>
            {showReactionPicker && (
              <div className="absolute bottom-11 left-0 z-30">
                <ReactionPicker onSelect={handleSelectReaction} />
              </div>
            )}
          </AnimatePresence>

          <button
            type="button"
            onClick={handleQuickLike}
            className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl font-semibold text-xs sm:text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 ${
              userReaction
                ? REACTION_DETAILS[userReaction.type]?.color
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {userReaction ? (
              <>
                <span className="text-lg">{REACTION_DETAILS[userReaction.type]?.emoji}</span>
                <span>{REACTION_DETAILS[userReaction.type]?.label}</span>
              </>
            ) : (
              <>
                <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>React</span>
              </>
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowComments((prev) => !prev)}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl font-semibold text-xs sm:text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Comment</span>
        </button>

        <button
          type="button"
          onClick={() => setShowShareModal(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl font-semibold text-xs sm:text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Share</span>
        </button>

        <button
          type="button"
          onClick={handleSavePost}
          className={`flex items-center justify-center p-2 rounded-xl text-xs sm:text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 ${
            isSaved
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
          title={isSaved ? 'Unsave' : 'Save post'}
        >
          <Bookmark className={`w-4 h-4 sm:w-5 sm:h-5 ${isSaved ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Expandable Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-900/50 space-y-4"
          >
            {/* New Comment Input Box */}
            <form onSubmit={handleAddComment} className="flex items-start gap-3">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full object-cover shrink-0"
              />
              <div className="flex-1 flex items-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-1.5 focus-within:ring-2 focus-within:ring-indigo-500">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 bg-transparent text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="p-1 text-indigo-600 dark:text-indigo-400 disabled:opacity-30 hover:opacity-80 transition-opacity"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-3.5 pt-2">
              {post.comments?.length === 0 ? (
                <p className="text-xs text-center text-slate-400 py-2">
                  No comments yet. Be the first to share your thoughts!
                </p>
              ) : (
                post.comments?.map((comment) => {
                  const cAuthor = storage.getUserById(comment.authorId);
                  const isCommentAuthor = comment.authorId === currentUser.id;
                  const isCommentLiked = comment.likes?.includes(currentUser.id);

                  return (
                    <div key={comment.id} className="flex items-start gap-2.5 group">
                      <button
                        type="button"
                        onClick={() => onNavigateToProfile?.(comment.authorId)}
                        className="shrink-0"
                      >
                        <img
                          src={cAuthor?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'}
                          alt={cAuthor?.name || 'Commenter'}
                          referrerPolicy="no-referrer"
                          className="w-7 h-7 rounded-full object-cover"
                        />
                      </button>

                      <div className="flex-1">
                        <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-tl-sm border border-slate-200/60 dark:border-slate-700/60 text-xs sm:text-sm inline-block max-w-full">
                          <button
                            type="button"
                            onClick={() => onNavigateToProfile?.(comment.authorId)}
                            className="font-bold text-slate-900 dark:text-slate-100 hover:underline mr-2"
                          >
                            {cAuthor?.name || 'User'}
                          </button>
                          <span className="text-slate-800 dark:text-slate-200 break-words">
                            {comment.content}
                          </span>
                        </div>

                        {/* Comment Actions: Like, Reply, Delete */}
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 ml-1">
                          <button
                            type="button"
                            onClick={() => storage.toggleCommentLike(post.id, comment.id, currentUser.id)}
                            className={`font-semibold hover:underline ${
                              isCommentLiked ? 'text-rose-500' : 'text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            Like {comment.likes?.length ? `(${comment.likes.length})` : ''}
                          </button>
                          <span>•</span>
                          <button
                            type="button"
                            onClick={() =>
                              setReplyingToCommentId(
                                replyingToCommentId === comment.id ? null : comment.id
                              )
                            }
                            className="font-semibold text-slate-500 dark:text-slate-400 hover:underline"
                          >
                            Reply
                          </button>
                          <span>•</span>
                          <span>{formatTime(comment.createdAt)}</span>

                          {isCommentAuthor && (
                            <>
                              <span>•</span>
                              <button
                                type="button"
                                onClick={() => storage.deleteComment(post.id, comment.id)}
                                className="text-rose-500 hover:underline"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>

                        {/* Threaded Replies */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="ml-4 mt-2 space-y-2 border-l-2 border-slate-200 dark:border-slate-700 pl-3">
                            {comment.replies.map((reply) => {
                              const rAuthor = storage.getUserById(reply.authorId);
                              return (
                                <div key={reply.id} className="flex items-start gap-2">
                                  <img
                                    src={rAuthor?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'}
                                    alt={rAuthor?.name || 'Replier'}
                                    referrerPolicy="no-referrer"
                                    className="w-5 h-5 rounded-full object-cover shrink-0"
                                  />
                                  <div className="bg-white dark:bg-slate-800 p-2 rounded-xl text-xs flex-1 border border-slate-200/50 dark:border-slate-700/50">
                                    <span className="font-bold text-slate-900 dark:text-slate-100 mr-1.5">
                                      {rAuthor?.name || 'User'}
                                    </span>
                                    <span className="text-slate-700 dark:text-slate-300">
                                      {reply.content}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Reply Input Form */}
                        {replyingToCommentId === comment.id && (
                          <div className="ml-4 mt-2 flex items-center gap-2">
                            <input
                              type="text"
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder={`Reply to ${cAuthor?.name || 'user'}...`}
                              className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddReply(comment.id);
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => handleAddReply(comment.id)}
                              className="px-2.5 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium"
                            >
                              Reply
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Share2 className="w-5 h-5 text-indigo-600" /> Share Post
              </h3>
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <textarea
              value={shareCaption}
              onChange={(e) => setShareCaption(e.target.value)}
              placeholder="What are your thoughts on this post? (Optional)"
              rows={3}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400">
              <div className="font-semibold text-slate-800 dark:text-slate-200">
                {author?.name}:
              </div>
              <p className="line-clamp-2 mt-0.5">{post.content}</p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                <Copy className="w-4 h-4" /> Copy Link
              </button>
              <button
                type="button"
                onClick={handleShareToFeed}
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-colors"
              >
                Share to Feed
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Reaction Breakdown Modal */}
      {showReactionsBreakdown && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Reactions ({post.reactions?.length || 0})
              </h3>
              <button
                type="button"
                onClick={() => setShowReactionsBreakdown(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {post.reactions?.map((r, i) => {
                const rUser = storage.getUserById(r.userId);
                const info = REACTION_DETAILS[r.type];
                return (
                  <div key={i} className="flex items-center justify-between py-2.5">
                    <div className="flex items-center gap-3">
                      <img
                        src={rUser?.avatar}
                        alt={rUser?.name}
                        referrerPolicy="no-referrer"
                        className="w-9 h-9 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                          {rUser?.name}
                        </div>
                        <div className="text-xs text-slate-400">@{rUser?.username}</div>
                      </div>
                    </div>
                    <span className="text-xl">{info?.emoji}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetType="post"
        targetId={post.id}
        targetAuthorId={post.authorId}
        targetSnippet={post.content}
      />
    </article>
  );
};
