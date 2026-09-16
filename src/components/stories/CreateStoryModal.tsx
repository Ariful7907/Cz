import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Image as ImageIcon,
  Type,
  Video,
  Sparkles,
  Upload,
  Clock,
  Check,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { storage } from '../../services/storage';

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GRADIENTS = [
  { name: 'Sunset Glow', class: 'from-amber-500 via-rose-500 to-purple-600' },
  { name: 'Electric Indigo', class: 'from-indigo-600 via-purple-600 to-pink-500' },
  { name: 'Cyber Neon', class: 'from-fuchsia-600 via-violet-600 to-cyan-500' },
  { name: 'Emerald Wave', class: 'from-emerald-500 via-teal-600 to-cyan-600' },
  { name: 'Dark Nebula', class: 'from-slate-900 via-purple-950 to-indigo-950' },
  { name: 'Warm Amber', class: 'from-amber-600 via-orange-600 to-red-600' },
  { name: 'Cotton Candy', class: 'from-pink-400 via-rose-400 to-indigo-400' },
  { name: 'Deep Sea', class: 'from-blue-600 via-cyan-600 to-teal-500' },
];

const PRESET_STORY_IMAGES = [
  {
    label: 'Kyoto Coffee',
    url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80',
  },
  {
    label: 'Sunset Beach',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
  },
  {
    label: 'Creative Studio',
    url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&auto=format&fit=crop&q=80',
  },
  {
    label: 'Tech Workspace',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
  },
  {
    label: 'Mountain Fog',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80',
  },
];

const PRESET_STORY_VIDEOS = [
  {
    label: 'Blazes & Energy',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  },
  {
    label: 'Nature Escapes',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  },
  {
    label: 'Joy Ride',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  },
];

const STICKERS = ['🔥', '🚀', '☕', '💡', '💻', '✨', '🎉', '❤️', '🌟', '🏖️', '🍕', '🎵'];

const FONT_STYLES = [
  { label: 'Modern', value: 'font-sans' },
  { label: 'Serif', value: 'font-serif' },
  { label: 'Mono', value: 'font-mono' },
  { label: 'Heavy', value: 'font-black tracking-tight' },
];

export const CreateStoryModal: React.FC<CreateStoryModalProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [storyType, setStoryType] = useState<'text' | 'image' | 'video'>('text');
  const [textContent, setTextContent] = useState('');
  const [selectedGradient, setSelectedGradient] = useState(GRADIENTS[0].class);
  const [fontStyle, setFontStyle] = useState('font-sans');
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'huge'>('large');
  const [selectedSticker, setSelectedSticker] = useState<string>('✨');
  const [mediaUrl, setMediaUrl] = useState('');
  const [filter, setFilter] = useState<'none' | 'warm' | 'cool' | 'vintage' | 'mono'>('none');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVid = file.type.startsWith('video/');
    const isImg = file.type.startsWith('image/');

    if (!isVid && !isImg) {
      showToast('Please select an image or video file', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setMediaUrl(result);
        setStoryType(isVid ? 'video' : 'image');
        showToast(`${isVid ? 'Video' : 'Photo'} loaded into story preview!`, 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();

    if (storyType === 'text' && !textContent.trim()) {
      showToast('Please enter text for your story', 'error');
      return;
    }

    if ((storyType === 'image' || storyType === 'video') && !mediaUrl) {
      showToast('Please upload or select media for your story', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      storage.createStory({
        userId: currentUser.id,
        type: storyType,
        content: textContent.trim() || undefined,
        mediaUrl: mediaUrl || undefined,
        backgroundGradient: storyType === 'text' ? selectedGradient : undefined,
        fontStyle: storyType === 'text' ? fontStyle : undefined,
        fontSize: storyType === 'text' ? fontSize : undefined,
        filter: storyType === 'image' ? filter : undefined,
        sticker: selectedSticker || undefined,
      });

      showToast('Your 24-hour story is now live for all your friends!', 'success');
      setTextContent('');
      setMediaUrl('');
      onClose();
    } catch {
      showToast('Failed to share story', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFilterClass = () => {
    switch (filter) {
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

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col my-auto max-h-[92vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                  Create 24-Hour Story
                </h3>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Disappears automatically after 24 hours
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Type Selector (Text | Image | Video) */}
          <div className="px-5 pt-3 shrink-0">
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl gap-1">
              <button
                type="button"
                onClick={() => {
                  setStoryType('text');
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  storyType === 'text'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Type className="w-4 h-4" />
                <span>Text Story</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStoryType('image');
                  if (!mediaUrl) setMediaUrl(PRESET_STORY_IMAGES[0].url);
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  storyType === 'image'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>Photo</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStoryType('video');
                  if (!mediaUrl || !mediaUrl.endsWith('.mp4')) {
                    setMediaUrl(PRESET_STORY_VIDEOS[0].url);
                  }
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  storyType === 'video'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Video className="w-4 h-4" />
                <span>Video</span>
              </button>
            </div>
          </div>

          {/* Scrollable Story Customizer Body */}
          <div className="p-5 overflow-y-auto space-y-4 flex-1">
            {/* Story Live 9:16 Preview Card */}
            <div className="flex justify-center">
              <div className="relative w-full max-w-[260px] h-[350px] rounded-3xl shadow-xl overflow-hidden flex flex-col justify-between p-4 border border-white/20 bg-slate-950">
                {/* Visual Background / Media Content */}
                {storyType === 'text' ? (
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${selectedGradient} flex flex-col items-center justify-center p-6 text-center text-white shadow-inner`}
                  >
                    {selectedSticker && (
                      <span className="text-3xl mb-3 animate-bounce drop-shadow">
                        {selectedSticker}
                      </span>
                    )}
                    <p
                      className={`${fontStyle} ${
                        fontSize === 'huge'
                          ? 'text-2xl font-extrabold leading-snug'
                          : fontSize === 'large'
                          ? 'text-lg font-bold leading-normal'
                          : 'text-sm font-semibold leading-relaxed'
                      } break-words max-w-full drop-shadow-md`}
                    >
                      {textContent || 'Share a moment, mood, or update...'}
                    </p>
                  </div>
                ) : storyType === 'video' ? (
                  <div className="absolute inset-0 w-full h-full bg-black">
                    {mediaUrl ? (
                      <video
                        src={mediaUrl}
                        autoPlay
                        loop
                        muted={isMuted}
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-white/50 p-4 text-center">
                        <Video className="w-8 h-8 mb-2" />
                        <span className="text-xs">No video chosen</span>
                      </div>
                    )}
                    {/* Caption pill */}
                    {textContent && (
                      <div className="absolute bottom-4 inset-x-3 p-2 bg-black/60 backdrop-blur-md rounded-xl text-white text-xs text-center border border-white/10">
                        {textContent}
                      </div>
                    )}
                    {/* Mute button */}
                    <button
                      type="button"
                      onClick={() => setIsMuted(!isMuted)}
                      className="absolute top-12 right-3 z-20 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                    >
                      {isMuted ? (
                        <VolumeX className="w-3.5 h-3.5" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="absolute inset-0 w-full h-full bg-black">
                    {mediaUrl ? (
                      <img
                        src={mediaUrl}
                        alt="Story preview"
                        referrerPolicy="no-referrer"
                        className={`w-full h-full object-cover transition-all ${getFilterClass()}`}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-white/50 p-4 text-center">
                        <Upload className="w-8 h-8 mb-2" />
                        <span className="text-xs">Select or upload a photo</span>
                      </div>
                    )}
                    {/* Sticker */}
                    {selectedSticker && (
                      <div className="absolute top-12 right-3 z-20 text-2xl drop-shadow">
                        {selectedSticker}
                      </div>
                    )}
                    {/* Caption pill */}
                    {textContent && (
                      <div className="absolute bottom-4 inset-x-3 p-2 bg-black/60 backdrop-blur-md rounded-xl text-white text-xs text-center border border-white/10">
                        {textContent}
                      </div>
                    )}
                  </div>
                )}

                {/* Simulated Top Story Header */}
                <div className="relative z-20 flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 rounded-full border-2 border-white object-cover"
                    />
                    <div className="leading-none">
                      <span className="text-[11px] font-bold text-white drop-shadow">
                        {currentUser.name}
                      </span>
                      <span className="text-[9px] text-white/70 block">Just now</span>
                    </div>
                  </div>
                  <span className="px-1.5 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-[9px] font-bold text-white">
                    24h
                  </span>
                </div>

                {/* Simulated Bottom Reply bar preview */}
                <div className="relative z-20">
                  <div className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] text-white/70 border border-white/20">
                    Reply to {currentUser.name.split(' ')[0]}...
                  </div>
                </div>
              </div>
            </div>

            {/* Customizer Controls based on type */}
            <div className="space-y-3.5 pt-2">
              {/* Text Input / Caption */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                  {storyType === 'text' ? 'Story Message' : 'Caption Overlay (Optional)'}
                </label>
                <div className="relative">
                  <textarea
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    placeholder={
                      storyType === 'text'
                        ? 'What are you thinking or working on today?'
                        : 'Add a memorable caption...'
                    }
                    maxLength={180}
                    rows={storyType === 'text' ? 3 : 2}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                  />
                  <span className="absolute bottom-2 right-3 text-[10px] text-slate-400">
                    {textContent.length}/180
                  </span>
                </div>
              </div>

              {/* Text-Specific Options */}
              {storyType === 'text' && (
                <>
                  {/* Background Gradients */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                      Background Gradient
                    </label>
                    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                      {GRADIENTS.map((g) => (
                        <button
                          key={g.name}
                          type="button"
                          onClick={() => setSelectedGradient(g.class)}
                          className={`shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br ${g.class} ring-2 flex items-center justify-center transition-all ${
                            selectedGradient === g.class
                              ? 'ring-indigo-600 scale-110 shadow-md'
                              : 'ring-transparent opacity-80 hover:opacity-100'
                          }`}
                          title={g.name}
                        >
                          {selectedGradient === g.class && (
                            <Check className="w-4 h-4 text-white drop-shadow" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Font Styling & Size */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                        Font Family
                      </label>
                      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1">
                        {FONT_STYLES.map((f) => (
                          <button
                            key={f.value}
                            type="button"
                            onClick={() => setFontStyle(f.value)}
                            className={`flex-1 py-1 text-[11px] rounded-lg font-semibold transition-all ${
                              fontStyle === f.value
                                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                                : 'text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                        Text Size
                      </label>
                      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1">
                        {(['normal', 'large', 'huge'] as const).map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setFontSize(s)}
                            className={`flex-1 py-1 text-[11px] capitalize rounded-lg font-semibold transition-all ${
                              fontSize === s
                                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                                : 'text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Photo Options */}
              {storyType === 'image' && (
                <>
                  {/* Photo Filters */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                      Color Filter
                    </label>
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1">
                      {(['none', 'warm', 'cool', 'vintage', 'mono'] as const).map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setFilter(f)}
                          className={`flex-1 py-1 text-[11px] capitalize rounded-lg font-semibold transition-all ${
                            filter === f
                              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                              : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Upload Device Photo or Presets */}
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2.5 border-2 border-dashed border-indigo-300 dark:border-indigo-700/60 rounded-2xl text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors flex items-center justify-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload Photo from Device</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />

                    <div>
                      <span className="text-[11px] font-semibold text-slate-500 mb-1.5 block">
                        Or pick a photo preset:
                      </span>
                      <div className="grid grid-cols-5 gap-2">
                        {PRESET_STORY_IMAGES.map((img) => (
                          <button
                            key={img.label}
                            type="button"
                            onClick={() => setMediaUrl(img.url)}
                            className={`group relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                              mediaUrl === img.url
                                ? 'border-indigo-600 ring-2 ring-indigo-500/30'
                                : 'border-slate-200 dark:border-slate-700 opacity-80 hover:opacity-100'
                            }`}
                          >
                            <img
                              src={img.url}
                              alt={img.label}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Video Options */}
              {storyType === 'video' && (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2.5 border-2 border-dashed border-indigo-300 dark:border-indigo-700/60 rounded-2xl text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Video Clip (MP4 / WebM)</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />

                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 mb-1.5 block">
                      Or choose sample video:
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {PRESET_STORY_VIDEOS.map((vid) => (
                        <button
                          key={vid.label}
                          type="button"
                          onClick={() => setMediaUrl(vid.url)}
                          className={`p-2 rounded-xl border text-left text-xs font-bold transition-all flex items-center gap-2 ${
                            mediaUrl === vid.url
                              ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                              : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <Video className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{vid.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Mood Sticker / Emoji */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                  Mood & Sticker
                </label>
                <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  <button
                    type="button"
                    onClick={() => setSelectedSticker('')}
                    className={`shrink-0 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      !selectedSticker
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600'
                        : 'border-slate-200 dark:border-slate-700 text-slate-400'
                    }`}
                  >
                    None
                  </button>
                  {STICKERS.map((stk) => (
                    <button
                      key={stk}
                      type="button"
                      onClick={() => setSelectedSticker(stk)}
                      className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-lg border transition-all ${
                        selectedSticker === stk
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 scale-110'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {stk}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleCreate}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? 'Publishing Story...' : 'Publish 24h Story'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
