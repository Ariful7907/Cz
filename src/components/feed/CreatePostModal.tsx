import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Image,
  Video,
  Smile,
  Globe,
  Users,
  Lock,
  X,
  Sparkles,
  Layers,
  Upload,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { storage } from '../../services/storage';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultGroupId?: string;
  defaultGroupName?: string;
}

const FEELINGS = [
  'happy 😊',
  'excited 🎉',
  'blessed 🙏',
  'creative 🎨',
  'peaceful 🍃',
  'productive ⚡',
  'thoughtful ☕',
  'inspired ✨',
];

const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1000&auto=format&fit=crop&q=80',
];

const SAMPLE_VIDEOS = [
  {
    title: 'Scenic Firelight',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  },
  {
    title: 'Mountain Escapes',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  },
];

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  defaultGroupId,
  defaultGroupName,
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [content, setContent] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'friends' | 'only_me'>('public');
  const [feeling, setFeeling] = useState<string>('');
  const [showFeelings, setShowFeelings] = useState(false);
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'none'>('none');
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>(defaultGroupId || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const myGroups = storage.getGroups().filter((g) => g.memberIds.includes(currentUser.id));

  // Handle local image file upload using FileReader
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file', 'error');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      showToast('Image file size should be less than 8MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setMediaType('image');
        setMediaUrls([result]);
        showToast('Image attached successfully!', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle local video upload
  const handleVideoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      showToast('Please select a valid video file', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setMediaType('video');
        setMediaUrls([result]);
        showToast('Video attached!', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && mediaUrls.length === 0) {
      showToast('Please write something or attach media', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const group = selectedGroupId ? myGroups.find((g) => g.id === selectedGroupId) : undefined;

      storage.createPost({
        authorId: currentUser.id,
        content: content.trim(),
        privacy,
        feeling: feeling || undefined,
        mediaType: mediaUrls.length > 0 ? mediaType : 'none',
        mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
        groupId: selectedGroupId || undefined,
        groupName: group ? group.name : defaultGroupName || undefined,
      });

      showToast('Post published to ConnectZone!', 'success');
      setContent('');
      setMediaUrls([]);
      setMediaType('none');
      setFeeling('');
      onClose();
    } catch {
      showToast('Failed to publish post', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <span>Create Post</span>
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* User Meta & Selectors */}
            <div className="flex items-center gap-3">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                referrerPolicy="no-referrer"
                className="w-11 h-11 rounded-full object-cover ring-2 ring-indigo-500/30"
              />
              <div className="flex-1">
                <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  {currentUser.name}
                </div>
                <div className="flex items-center flex-wrap gap-2 mt-1">
                  {/* Privacy Selector */}
                  <select
                    value={privacy}
                    onChange={(e) => setPrivacy(e.target.value as any)}
                    className="text-xs bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-2.5 py-1 text-slate-700 dark:text-slate-300 font-medium focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="public">🌐 Public</option>
                    <option value="friends">👥 Friends Only</option>
                    <option value="only_me">🔒 Only Me</option>
                  </select>

                  {/* Group Selector */}
                  {myGroups.length > 0 && (
                    <select
                      value={selectedGroupId}
                      onChange={(e) => setSelectedGroupId(e.target.value)}
                      className="text-xs bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-2.5 py-1 text-slate-700 dark:text-slate-300 font-medium focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="">Public Feed</option>
                      {myGroups.map((g) => (
                        <option key={g.id} value={g.id}>
                          In Group: {g.name}
                        </option>
                      ))}
                    </select>
                  )}

                  {feeling && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
                      feeling {feeling}
                      <button
                        type="button"
                        onClick={() => setFeeling('')}
                        className="hover:text-indigo-900 ml-0.5"
                      >
                        ×
                      </button>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Post Textarea */}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`What's happening, ${currentUser.name.split(' ')[0]}? Share thoughts, #hashtags, or @mentions...`}
              rows={4}
              className="w-full p-2 bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm sm:text-base resize-none focus:outline-none"
              autoFocus
            />

            {/* Media Preview Box */}
            {mediaUrls.length > 0 && (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-black max-h-64">
                <button
                  type="button"
                  onClick={() => {
                    setMediaUrls([]);
                    setMediaType('none');
                  }}
                  className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-black/70 text-white hover:bg-black transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                {mediaType === 'video' ? (
                  <video src={mediaUrls[0]} controls className="w-full max-h-60 object-contain mx-auto" />
                ) : (
                  <img
                    src={mediaUrls[0]}
                    alt="Preview"
                    referrerPolicy="no-referrer"
                    className="w-full max-h-60 object-cover"
                  />
                )}
              </div>
            )}

            {/* Feelings Picker Row */}
            <AnimatePresence>
              {showFeelings && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  <div className="text-xs font-semibold text-slate-500 mb-2">How are you feeling?</div>
                  <div className="flex flex-wrap gap-1.5">
                    {FEELINGS.map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => {
                          setFeeling(f);
                          setShowFeelings(false);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                          feeling === f
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick Presets / Attachments Box */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                <span>Add to your post</span>
                <div className="flex items-center gap-1">
                  {/* Image Upload Button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                    title="Upload image"
                  >
                    <Image className="w-5 h-5" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageFileUpload}
                  />

                  {/* Video Upload Button */}
                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    className="p-2 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                    title="Upload video"
                  >
                    <Video className="w-5 h-5" />
                  </button>
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={handleVideoFileUpload}
                  />

                  {/* Feelings Button */}
                  <button
                    type="button"
                    onClick={() => setShowFeelings((p) => !p)}
                    className="p-2 rounded-lg text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                    title="Add feeling / activity"
                  >
                    <Smile className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Sample Media Quick Pickers for Quick Testing */}
              <div className="pt-1 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                <span>Instant photo presets:</span>
                <div className="flex items-center gap-1.5">
                  {SAMPLE_IMAGES.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setMediaType('image');
                        setMediaUrls([img]);
                      }}
                      className="w-6 h-6 rounded-md overflow-hidden ring-1 ring-slate-300 hover:ring-indigo-500 transition-all"
                    >
                      <img src={img} alt="Preset" className="w-full h-full object-cover" />
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setMediaType('video');
                      setMediaUrls([SAMPLE_VIDEOS[0].url]);
                    }}
                    className="px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-medium hover:bg-indigo-200"
                  >
                    +Video
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || (!content.trim() && mediaUrls.length === 0)}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-colors"
            >
              {isSubmitting ? 'Publishing...' : 'Post to ConnectZone'}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
