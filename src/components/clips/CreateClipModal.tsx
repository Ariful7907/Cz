import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, Video, Music } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { storage } from '../../services/storage';

interface CreateClipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_CLIPS = [
  {
    title: 'Campfire Night Vibes',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  },
  {
    title: 'Mountain Trail Run',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  },
  {
    title: 'Urban Fun Time',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  },
];

export const CreateClipModal: React.FC<CreateClipModalProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [caption, setCaption] = useState('');
  const [audioTrack, setAudioTrack] = useState('Original Sound - ' + currentUser.name);
  const [videoUrl, setVideoUrl] = useState(SAMPLE_CLIPS[0].url);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      showToast('Please select a video file', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setVideoUrl(result);
        showToast('Video uploaded and previewing!', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim()) {
      showToast('Please add a caption for your clip', 'error');
      return;
    }
    if (!videoUrl) {
      showToast('Please provide a video', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      storage.createShortVideo({
        creatorId: currentUser.id,
        caption: caption.trim(),
        videoUrl,
        audioTrack: audioTrack.trim() || 'Original Audio',
      });

      showToast('ConnectClip published!', 'success');
      setCaption('');
      onClose();
    } catch {
      showToast('Failed to publish clip', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Video className="w-5 h-5 text-indigo-600" />
              <span>Create ConnectClip</span>
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Video Preview */}
            <div className="w-full h-56 bg-black rounded-2xl overflow-hidden relative flex items-center justify-center">
              {videoUrl ? (
                <video src={videoUrl} autoPlay loop muted className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs text-slate-400">No video selected</span>
              )}
            </div>

            {/* Upload Button */}
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-2 px-3 border border-indigo-500 rounded-xl text-xs font-semibold text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" /> Upload Vertical Video
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>

            {/* Presets */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="text-[11px]">Or select preset:</span>
              {SAMPLE_CLIPS.map((clip, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setVideoUrl(clip.url)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-medium border ${
                    videoUrl === clip.url
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Clip {i + 1}
                </button>
              ))}
            </div>

            {/* Caption */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Caption & #Hashtags
              </label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write an engaging caption, tag friends or topics..."
                rows={3}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 resize-none"
              />
            </div>

            {/* Audio name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-indigo-500" /> Audio Track Name
              </label>
              <input
                type="text"
                value={audioTrack}
                onChange={(e) => setAudioTrack(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Uploading...' : 'Publish ConnectClip'}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
