import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart,
  MessageCircle,
  Share2,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Music,
  Plus,
  Send,
  X,
  UserPlus,
  UserCheck,
  Eye,
} from 'lucide-react';
import { ShortVideo, User } from '../../types';
import { storage, subscribeToStorage } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { CreateClipModal } from './CreateClipModal';

export const ClipsView: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [videos, setVideos] = useState<ShortVideo[]>(() => storage.getShortVideos());
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  // Sync with storage
  useEffect(() => {
    return subscribeToStorage(() => {
      setVideos(storage.getShortVideos());
    });
  }, []);

  const currentVideo = videos[activeIndex];
  const creator: User | undefined = currentVideo
    ? storage.getUserById(currentVideo.creatorId)
    : undefined;

  const isLiked = currentVideo?.likes.includes(currentUser.id);
  const isFollowing = creator ? currentUser.following.includes(creator.id) : false;

  // Increment view on change
  useEffect(() => {
    if (currentVideo) {
      storage.incrementVideoView(currentVideo.id);
    }
  }, [activeIndex, currentVideo?.id]);

  const handleToggleLike = () => {
    if (!currentVideo) return;
    storage.toggleLikeShortVideo(currentVideo.id, currentUser.id);
  };

  const handleToggleFollow = () => {
    if (!creator) return;
    storage.toggleFollow(currentUser.id, creator.id);
    showToast(isFollowing ? `Unfollowed @${creator.username}` : `Following @${creator.username}`, 'info');
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !currentVideo) return;

    storage.addCommentShortVideo(currentVideo.id, currentUser.id, commentText.trim());
    setCommentText('');
    showToast('Comment posted', 'success');
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('Link to ConnectClip copied!', 'info');
  };

  const handleNext = () => {
    if (activeIndex < videos.length - 1) {
      setActiveIndex((prev) => prev + 1);
      setIsPlaying(true);
    }
  };

  const handlePrev = () => {
    if (activeIndex > 0) {
      setActiveIndex((prev) => prev - 1);
      setIsPlaying(true);
    }
  };

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400">
        <p className="mb-4">No clips available right now.</p>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold"
        >
          Create the first Clip
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-md mx-auto h-[calc(100vh-140px)] sm:h-[720px] bg-black rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between select-none">
      {/* Top Controls Overlay */}
      <div className="absolute top-4 inset-x-4 z-30 flex items-center justify-between">
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs font-bold">
          <span className="text-rose-500 font-extrabold tracking-wide uppercase">Clips</span>
          <span className="text-white/60">
            {activeIndex + 1}/{videos.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Create Clip Button */}
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create</span>
          </button>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => setIsMuted((prev) => !prev)}
            className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Vertical Video Element */}
      <div
        className="absolute inset-0 z-10 flex items-center justify-center cursor-pointer bg-slate-950"
        onClick={() => {
          if (videoRef.current) {
            if (isPlaying) {
              videoRef.current.pause();
              setIsPlaying(false);
            } else {
              videoRef.current.play();
              setIsPlaying(true);
            }
          }
        }}
      >
        <video
          ref={videoRef}
          src={currentVideo?.videoUrl}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          className="w-full h-full object-cover"
        />

        {/* Play/Pause icon badge on toggle */}
        {!isPlaying && (
          <div className="absolute z-20 p-4 rounded-full bg-black/50 text-white pointer-events-none">
            <Play className="w-10 h-10 fill-white" />
          </div>
        )}
      </div>

      {/* Navigation Touch / Click buttons (Up / Down) */}
      <div className="absolute inset-x-0 top-16 bottom-32 z-10 flex flex-col justify-between pointer-events-none px-4">
        {activeIndex > 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="pointer-events-auto self-center bg-black/30 hover:bg-black/60 text-white/80 p-2 rounded-full backdrop-blur-sm transition-all"
            title="Previous clip"
          >
            ▲
          </button>
        )}
        <div className="flex-1" />
        {activeIndex < videos.length - 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="pointer-events-auto self-center bg-black/30 hover:bg-black/60 text-white/80 p-2 rounded-full backdrop-blur-sm transition-all mb-2"
            title="Next clip"
          >
            ▼
          </button>
        )}
      </div>

      {/* Right Side Action Bar (Likes, Comments, Shares, Views) */}
      <div className="absolute right-3 bottom-24 z-30 flex flex-col items-center gap-4 text-white">
        {/* Like Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleToggleLike();
          }}
          className="flex flex-col items-center gap-1 group"
        >
          <div
            className={`p-3 rounded-full backdrop-blur-md transition-all ${
              isLiked ? 'bg-rose-500/80 text-white scale-110' : 'bg-black/40 text-white hover:bg-black/60'
            }`}
          >
            <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
          </div>
          <span className="text-[11px] font-bold drop-shadow">
            {currentVideo?.likes.length || 0}
          </span>
        </button>

        {/* Comment Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowComments(true);
          }}
          className="flex flex-col items-center gap-1 group"
        >
          <div className="p-3 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white transition-all">
            <MessageCircle className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-bold drop-shadow">
            {currentVideo?.comments.length || 0}
          </span>
        </button>

        {/* Share Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleShare();
          }}
          className="flex flex-col items-center gap-1 group"
        >
          <div className="p-3 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white transition-all">
            <Share2 className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-bold drop-shadow">
            {currentVideo?.sharesCount || 0}
          </span>
        </button>

        {/* Views Count */}
        <div className="flex flex-col items-center gap-0.5 text-white/80">
          <Eye className="w-4 h-4" />
          <span className="text-[10px] font-semibold">{currentVideo?.viewsCount || 1}</span>
        </div>
      </div>

      {/* Bottom Info Overlay: Creator, Caption, Audio */}
      <div className="relative z-20 p-5 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white space-y-2.5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={creator?.avatar}
              alt={creator?.name}
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm leading-tight truncate">
                {creator?.name || 'Creator'}
              </span>
              <span className="text-xs text-white/70">@{creator?.username}</span>

              {creator?.id !== currentUser.id && (
                <button
                  type="button"
                  onClick={handleToggleFollow}
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 transition-all ${
                    isFollowing
                      ? 'bg-white/20 text-white hover:bg-white/30'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <UserCheck className="w-3 h-3" /> Following
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3 h-3" /> Follow
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Caption */}
        <p className="text-xs sm:text-sm text-white/95 leading-snug line-clamp-2 drop-shadow">
          {currentVideo?.caption}
        </p>

        {/* Audio ticker */}
        <div className="flex items-center gap-2 text-xs text-white/80">
          <Music className="w-3.5 h-3.5 shrink-0 animate-pulse text-indigo-400" />
          <span className="truncate text-[11px]">{currentVideo?.audioTrack}</span>
        </div>
      </div>

      {/* Slide-over Comments Drawer */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="absolute inset-x-0 bottom-0 top-1/3 z-40 bg-slate-900/95 backdrop-blur-lg rounded-t-3xl border-t border-slate-700/60 flex flex-col p-4 text-white shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="font-bold text-sm">
                Comments ({currentVideo?.comments.length || 0})
              </span>
              <button
                type="button"
                onClick={() => setShowComments(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-3">
              {currentVideo?.comments.length === 0 ? (
                <div className="text-center text-xs text-slate-400 py-6">
                  No comments yet. Say something awesome!
                </div>
              ) : (
                currentVideo?.comments.map((comment) => {
                  const cAuthor = storage.getUserById(comment.authorId);
                  return (
                    <div key={comment.id} className="flex items-start gap-2.5 text-xs">
                      <img
                        src={cAuthor?.avatar}
                        alt={cAuthor?.name}
                        referrerPolicy="no-referrer"
                        className="w-7 h-7 rounded-full object-cover shrink-0"
                      />
                      <div className="flex-1 bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/50">
                        <div className="font-bold text-slate-200 mb-0.5">
                          {cAuthor?.name || 'User'}
                        </div>
                        <p className="text-slate-300">{comment.content}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-2 border-t border-slate-800">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-3 py-2 bg-slate-800 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="p-2 rounded-xl bg-indigo-600 text-white disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <CreateClipModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
};
