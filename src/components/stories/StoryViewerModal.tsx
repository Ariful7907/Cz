import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  Send,
  Heart,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Trash2,
  Share2,
  Clock,
  Sparkles,
  MessageCircle,
  Smile,
  Check,
} from 'lucide-react';
import { Story, ReactionType } from '../../types';
import { storage } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { REACTION_DETAILS } from '../feed/ReactionPicker';

interface StoryViewerModalProps {
  stories: Story[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToProfile?: (userId: string) => void;
}

interface FloatingParticle {
  id: number;
  emoji: string;
  x: number;
}

const STORY_DURATION_MS = 6500;

export const StoryViewerModal: React.FC<StoryViewerModalProps> = ({
  stories,
  initialIndex = 0,
  isOpen,
  onClose,
  onNavigateToProfile,
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [showActivityDrawer, setShowActivityDrawer] = useState(false);
  const [activeTab, setActiveTab] = useState<'viewers' | 'replies'>('viewers');
  const [floatingParticles, setFloatingParticles] = useState<FloatingParticle[]>([]);
  const [viewerSearch, setViewerSearch] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const nextParticleId = useRef(0);

  // Sync initial index if prop changes
  useEffect(() => {
    setCurrentIndex(initialIndex);
    setProgress(0);
  }, [initialIndex]);

  const currentStory = stories[currentIndex];
  const storyAuthor = currentStory ? storage.getUserById(currentStory.userId) : undefined;
  const isMyStory = currentStory?.userId === currentUser.id;

  // Mark story as viewed by current user
  useEffect(() => {
    if (isOpen && currentStory) {
      storage.viewStory(currentStory.id, currentUser.id);
    }
  }, [isOpen, currentStory?.id, currentUser.id]);

  // Story Progress Timer
  useEffect(() => {
    if (!isOpen || isPaused || showActivityDrawer || !currentStory) return;

    setProgress(0);
    const intervalMs = 50;
    const step = (intervalMs / STORY_DURATION_MS) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          if (currentIndex < stories.length - 1) {
            setCurrentIndex((c) => c + 1);
            return 0;
          } else {
            onClose();
            return 100;
          }
        }
        return prev + step;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isOpen, isPaused, showActivityDrawer, currentIndex, stories.length, onClose, currentStory?.id]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showActivityDrawer) {
          setShowActivityDrawer(false);
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowRight' || e.key === ' ') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, showActivityDrawer, stories.length]);

  if (!isOpen || !currentStory) return null;

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((c) => c + 1);
      setProgress(0);
      setShowActivityDrawer(false);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((c) => c - 1);
      setProgress(0);
      setShowActivityDrawer(false);
    }
  };

  const handleReact = (type: ReactionType) => {
    storage.reactStory(currentStory.id, currentUser.id, type);
    const emoji = REACTION_DETAILS[type]?.emoji || '❤️';

    // Spawn floating emoji particles
    const newParticles: FloatingParticle[] = Array.from({ length: 4 }).map((_, i) => ({
      id: nextParticleId.current++,
      emoji,
      x: 30 + Math.random() * 40 + (i % 2 === 0 ? -10 : 10),
    }));

    setFloatingParticles((prev) => [...prev, ...newParticles]);
    setTimeout(() => {
      setFloatingParticles((prev) =>
        prev.filter((p) => !newParticles.some((np) => np.id === p.id))
      );
    }, 1800);

    showToast(`Reacted ${emoji} to story!`, 'success');
  };

  const handleSendReply = (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = customText || replyText.trim();
    if (!textToSend) return;

    storage.replyStory(currentStory.id, currentUser.id, textToSend);

    // Spawn chat particle
    const chatParticle: FloatingParticle = {
      id: nextParticleId.current++,
      emoji: '💬',
      x: 50,
    };
    setFloatingParticles((prev) => [...prev, chatParticle]);
    setTimeout(() => {
      setFloatingParticles((prev) => prev.filter((p) => p.id !== chatParticle.id));
    }, 1800);

    showToast(`Reply sent to ${storyAuthor?.name.split(' ')[0]}!`, 'success');
    setReplyText('');
    setIsPaused(false);
  };

  const handleDeleteStory = () => {
    if (window.confirm('Are you sure you want to delete this story?')) {
      storage.deleteStory(currentStory.id);
      showToast('Story deleted', 'info');
      onClose();
    }
  };

  const handleShareStory = () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      showToast('Story link copied to clipboard!', 'success');
    }
  };

  // Format 24-hour remaining countdown
  const getRemainingTime = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return 'Expired';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h left`;
    return `${minutes}m left`;
  };

  // Filter class for image stories
  const getImageFilterClass = (f?: string) => {
    switch (f) {
      case 'warm':
        return 'sepia-[0.3] brightness-105 saturate-125';
      case 'cool':
        return 'hue-rotate-15 contrast-105 saturate-110';
      case 'vintage':
        return 'sepia-[0.5] contrast-95 brightness-95';
      case 'mono':
        return 'grayscale contrast-125';
      default:
        return '';
    }
  };

  // Filter viewers list
  const filteredViewers = (currentStory.viewers || []).filter((v) => {
    const u = storage.getUserById(v.userId);
    if (!u) return false;
    if (!viewerSearch.trim()) return true;
    const query = viewerSearch.toLowerCase();
    return u.name.toLowerCase().includes(query) || u.username.toLowerCase().includes(query);
  });

  const myReaction = currentStory.reactions?.find((r) => r.userId === currentUser.id);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl select-none">
        {/* Desktop Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          title="Close story"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Desktop Previous Button */}
        {currentIndex > 0 && (
          <button
            type="button"
            onClick={handlePrev}
            className="hidden sm:flex absolute left-6 z-40 p-3.5 rounded-full bg-white/10 hover:bg-white/20 hover:scale-110 text-white transition-all shadow-xl"
            title="Previous story"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>
        )}

        {/* Desktop Next Button */}
        {currentIndex < stories.length - 1 && (
          <button
            type="button"
            onClick={handleNext}
            className="hidden sm:flex absolute right-6 z-40 p-3.5 rounded-full bg-white/10 hover:bg-white/20 hover:scale-110 text-white transition-all shadow-xl"
            title="Next story"
          >
            <ChevronRight className="w-7 h-7" />
          </button>
        )}

        {/* Main 9:16 Story Stage */}
        <div
          className="relative w-full max-w-[420px] h-full sm:h-[88vh] max-h-[820px] bg-slate-950 sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between"
          onMouseDown={() => !showActivityDrawer && setIsPaused(true)}
          onMouseUp={() => !showActivityDrawer && setIsPaused(false)}
          onTouchStart={() => !showActivityDrawer && setIsPaused(true)}
          onTouchEnd={() => !showActivityDrawer && setIsPaused(false)}
        >
          {/* Top Progress Segmented Bar */}
          <div className="absolute top-3 inset-x-3 z-30 flex items-center gap-1.5">
            {stories.map((s, idx) => (
              <div
                key={s.id}
                className="h-1.5 flex-1 bg-white/25 rounded-full overflow-hidden backdrop-blur-xs"
              >
                <div
                  className="h-full bg-white transition-all ease-linear"
                  style={{
                    width:
                      idx < currentIndex
                        ? '100%'
                        : idx === currentIndex
                        ? `${progress}%`
                        : '0%',
                  }}
                />
              </div>
            ))}
          </div>

          {/* Top Header Bar */}
          <div className="relative z-30 p-4 pt-7 flex items-center justify-between text-white drop-shadow-md bg-gradient-to-b from-black/70 via-black/30 to-transparent">
            {/* Author Profile */}
            <div
              className="flex items-center gap-2.5 cursor-pointer group"
              onClick={() => {
                if (onNavigateToProfile && storyAuthor) {
                  onNavigateToProfile(storyAuthor.id);
                  onClose();
                }
              }}
            >
              <div className="relative">
                <img
                  src={storyAuthor?.avatar}
                  alt={storyAuthor?.name}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500 shadow-md group-hover:scale-105 transition-transform"
                />
                {currentStory.sticker && (
                  <span className="absolute -bottom-1 -right-1 text-xs">
                    {currentStory.sticker}
                  </span>
                )}
              </div>
              <div className="leading-tight">
                <div className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors flex items-center gap-1">
                  <span>{storyAuthor?.name}</span>
                </div>
                <div className="text-[11px] text-white/80 flex items-center gap-1.5">
                  <span>
                    {new Date(currentStory.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-0.5 text-amber-300 font-medium">
                    <Clock className="w-3 h-3" />
                    {getRemainingTime(currentStory.expiresAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Header Action Controls */}
            <div className="flex items-center gap-1.5 text-white">
              {/* Play/Pause Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPaused(!isPaused);
                }}
                className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md transition-colors"
                title={isPaused ? 'Resume' : 'Pause'}
              >
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </button>

              {/* Mute/Unmute for Video stories */}
              {currentStory.type === 'video' && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMuted(!isMuted);
                  }}
                  className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md transition-colors"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              )}

              {/* Share link */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleShareStory();
                }}
                className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md transition-colors"
                title="Share Story"
              >
                <Share2 className="w-4 h-4" />
              </button>

              {/* Delete Story if owner */}
              {isMyStory && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteStory();
                  }}
                  className="p-1.5 rounded-full bg-rose-500/40 hover:bg-rose-600 backdrop-blur-md transition-colors text-white"
                  title="Delete Story"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              {/* Mobile Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="sm:hidden p-1.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Story Visual Content (Image, Video, or Text) */}
          <div className="absolute inset-0 z-10 flex items-center justify-center overflow-hidden">
            {currentStory.type === 'text' ? (
              <div
                className={`w-full h-full bg-gradient-to-br ${
                  currentStory.backgroundGradient || 'from-indigo-600 to-pink-600'
                } flex flex-col items-center justify-center p-8 text-center text-white shadow-2xl relative`}
              >
                {currentStory.sticker && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-5xl mb-4 drop-shadow-xl animate-pulse"
                  >
                    {currentStory.sticker}
                  </motion.span>
                )}
                <p
                  className={`${currentStory.fontStyle || 'font-sans'} ${
                    currentStory.fontSize === 'huge'
                      ? 'text-3xl font-extrabold leading-tight'
                      : currentStory.fontSize === 'normal'
                      ? 'text-lg font-semibold leading-normal'
                      : 'text-2xl font-bold leading-snug'
                  } max-w-sm drop-shadow-md break-words`}
                >
                  {currentStory.content}
                </p>
              </div>
            ) : currentStory.type === 'video' ? (
              <div className="relative w-full h-full bg-black flex items-center justify-center">
                <video
                  ref={videoRef}
                  src={currentStory.mediaUrl}
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                  className="w-full h-full object-cover"
                />
                {/* Caption overlay */}
                {currentStory.content && (
                  <div className="absolute bottom-28 inset-x-4 p-3.5 bg-black/60 backdrop-blur-md rounded-2xl text-white text-xs sm:text-sm text-center border border-white/10 shadow-lg z-20">
                    {currentStory.content}
                  </div>
                )}
              </div>
            ) : (
              <div className="relative w-full h-full bg-black flex items-center justify-center">
                <img
                  src={currentStory.mediaUrl}
                  alt="Story photo"
                  referrerPolicy="no-referrer"
                  className={`w-full h-full object-cover ${getImageFilterClass(
                    currentStory.filter
                  )}`}
                />
                {/* Sticker badge */}
                {currentStory.sticker && (
                  <div className="absolute top-20 right-5 z-20 text-4xl drop-shadow-lg">
                    {currentStory.sticker}
                  </div>
                )}
                {/* Caption overlay */}
                {currentStory.content && (
                  <div className="absolute bottom-28 inset-x-4 p-3.5 bg-black/65 backdrop-blur-md rounded-2xl text-white text-xs sm:text-sm text-center border border-white/10 shadow-lg z-20">
                    {currentStory.content}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Floating Reaction Particles */}
          <div className="absolute inset-0 z-35 pointer-events-none overflow-hidden">
            {floatingParticles.map((particle) => (
              <motion.div
                key={particle.id}
                initial={{ opacity: 1, y: 550, scale: 0.8, x: `${particle.x}%` }}
                animate={{
                  opacity: 0,
                  y: 100,
                  scale: 1.6,
                  x: `${particle.x + (Math.random() * 20 - 10)}%`,
                }}
                transition={{ duration: 1.7, ease: 'easeOut' }}
                className="absolute text-4xl drop-shadow-2xl"
              >
                {particle.emoji}
              </motion.div>
            ))}
          </div>

          {/* Tap Zones: Left 30% for Prev, Right 70% for Next */}
          <div className="absolute inset-0 z-20 flex">
            <div
              className="w-1/3 h-full cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
            />
            <div
              className="w-2/3 h-full cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
            />
          </div>

          {/* Bottom Bar: Quick Reactions + Reply Input (Or Activity Drawer for Author) */}
          <div className="relative z-30 p-3 sm:p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent space-y-2.5">
            {isMyStory ? (
              /* Story Author Controls: Analytics & Activity Button */
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2.5 flex items-center justify-between border border-white/15">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowActivityDrawer(true);
                    setIsPaused(true);
                  }}
                  className="flex items-center gap-3 text-white hover:opacity-90 transition-opacity"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold bg-white/20 px-3 py-1.5 rounded-xl">
                    <Eye className="w-4 h-4 text-indigo-300" />
                    <span>{currentStory.viewers?.length || 0} Views</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-bold bg-white/20 px-3 py-1.5 rounded-xl">
                    <Heart className="w-4 h-4 text-rose-400" />
                    <span>{currentStory.reactions?.length || 0} Reactions</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-bold bg-white/20 px-3 py-1.5 rounded-xl">
                    <MessageCircle className="w-4 h-4 text-emerald-300" />
                    <span>{currentStory.replies?.length || 0} Replies</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowActivityDrawer(true);
                    setIsPaused(true);
                  }}
                  className="text-xs font-bold text-indigo-300 hover:text-white px-2 py-1"
                >
                  View Activity ↑
                </button>
              </div>
            ) : (
              /* Viewer Controls: Reaction Bar + Direct Reply Input */
              <>
                {/* Quick Emoji Reaction Buttons */}
                <div className="flex items-center justify-between px-2 bg-white/10 backdrop-blur-md rounded-2xl py-1.5 border border-white/15">
                  {(['love', 'haha', 'wow', 'sad', 'angry', 'like'] as ReactionType[]).map(
                    (type) => {
                      const isSelected = myReaction?.type === type;
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReact(type);
                          }}
                          className={`text-2xl hover:scale-135 transition-all active:scale-95 drop-shadow p-1 rounded-xl ${
                            isSelected ? 'bg-white/30 scale-115 ring-2 ring-white' : ''
                          }`}
                          title={`React ${REACTION_DETAILS[type].label}`}
                        >
                          {REACTION_DETAILS[type].emoji}
                        </button>
                      );
                    }
                  )}
                </div>

                {/* Quick Reply Text & Form */}
                <form
                  onSubmit={(e) => handleSendReply(e)}
                  className="flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={replyText}
                      onFocus={() => setIsPaused(true)}
                      onBlur={() => !showActivityDrawer && setIsPaused(false)}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Send reply to ${storyAuthor?.name.split(' ')[0]}...`}
                      className="w-full pl-4 pr-10 py-2.5 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-xs sm:text-sm text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/80"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleSendReply(undefined, '🔥')}
                        className="hover:scale-120 transition-transform text-sm"
                        title="Send Fire"
                      >
                        🔥
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSendReply(undefined, '😍')}
                        className="hover:scale-120 transition-transform text-sm"
                        title="Send Heart Eyes"
                      >
                        😍
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!replyText.trim()}
                    className="p-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 transition-all shadow-lg hover:scale-105"
                    title="Send Reply"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Activity Drawer (Bottom Sheet) */}
          <AnimatePresence>
            {showActivityDrawer && (
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="absolute inset-x-0 bottom-0 max-h-[80%] z-40 bg-slate-900/95 backdrop-blur-2xl rounded-t-3xl border-t border-slate-700 p-4 flex flex-col text-white shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Drag Handle & Close */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm sm:text-base">Story Activity</span>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-semibold">
                      {currentStory.viewers?.length || 0} views
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowActivityDrawer(false);
                      setIsPaused(false);
                    }}
                    className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Tabs: Viewers | Replies */}
                <div className="flex p-1 bg-slate-800/80 rounded-xl my-3 gap-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab('viewers')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      activeTab === 'viewers'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Viewers ({currentStory.viewers?.length || 0})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('replies')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      activeTab === 'replies'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Replies ({currentStory.replies?.length || 0})</span>
                  </button>
                </div>

                {/* Content: Viewers Tab */}
                {activeTab === 'viewers' && (
                  <div className="space-y-2 flex-1 overflow-y-auto max-h-[280px] pr-1">
                    {/* Search viewer input */}
                    {currentStory.viewers && currentStory.viewers.length > 3 && (
                      <input
                        type="text"
                        value={viewerSearch}
                        onChange={(e) => setViewerSearch(e.target.value)}
                        placeholder="Search viewers..."
                        className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 mb-2"
                      />
                    )}

                    {filteredViewers.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 text-xs">
                        No viewers yet. Friends will appear here as they watch your story.
                      </div>
                    ) : (
                      filteredViewers.map((viewer) => {
                        const user = storage.getUserById(viewer.userId);
                        if (!user) return null;
                        const viewerReaction = currentStory.reactions?.find(
                          (r) => r.userId === user.id
                        );

                        return (
                          <div
                            key={viewer.userId}
                            className="flex items-center justify-between p-2 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <img
                                src={user.avatar}
                                alt={user.name}
                                referrerPolicy="no-referrer"
                                className="w-9 h-9 rounded-full object-cover"
                              />
                              <div className="leading-tight">
                                <span className="font-bold text-xs text-white block">
                                  {user.name}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  Viewed{' '}
                                  {new Date(viewer.viewedAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                            </div>

                            {/* Viewer Reaction badge if any */}
                            {viewerReaction && (
                              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-700 text-sm">
                                <span>{REACTION_DETAILS[viewerReaction.type]?.emoji || '❤️'}</span>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {/* Content: Replies Tab */}
                {activeTab === 'replies' && (
                  <div className="space-y-2 flex-1 overflow-y-auto max-h-[280px] pr-1">
                    {!currentStory.replies || currentStory.replies.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 text-xs">
                        No direct replies on this story yet.
                      </div>
                    ) : (
                      currentStory.replies.map((reply) => {
                        const sender = storage.getUserById(reply.userId);
                        return (
                          <div
                            key={reply.id}
                            className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <img
                                  src={sender?.avatar}
                                  alt={sender?.name}
                                  referrerPolicy="no-referrer"
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                                <span className="text-xs font-bold text-white">
                                  {sender?.name}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400">
                                {new Date(reply.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>

                            <p className="text-xs text-slate-200 pl-8 leading-relaxed">
                              &ldquo;{reply.text}&rdquo;
                            </p>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AnimatePresence>
  );
};
