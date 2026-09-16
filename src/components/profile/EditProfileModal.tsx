import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Camera, Upload, Globe, MapPin, Briefcase, User as UserIcon } from 'lucide-react';
import { User } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
];

const PRESET_COVERS = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200&auto=format&fit=crop&q=80',
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(currentUser.name);
  const [username, setUsername] = useState(currentUser.username);
  const [bio, setBio] = useState(currentUser.bio || '');
  const [location, setLocation] = useState(currentUser.location || '');
  const [website, setWebsite] = useState(currentUser.website || '');
  const [occupation, setOccupation] = useState(currentUser.occupation || '');
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [coverPhoto, setCoverPhoto] = useState(currentUser.coverPhoto);
  const [isPrivate, setIsPrivate] = useState(currentUser.privacySettings.isPrivate);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) setAvatar(ev.target.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCoverFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) setCoverPhoto(ev.target.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim()) {
      showToast('Name and Username are required', 'error');
      return;
    }

    updateProfile({
      name: name.trim(),
      username: username.trim().toLowerCase().replace('@', ''),
      bio: bio.trim(),
      location: location.trim(),
      website: website.trim(),
      occupation: occupation.trim(),
      avatar,
      coverPhoto,
      privacySettings: {
        ...currentUser.privacySettings,
        isPrivate,
      },
    });

    showToast('Profile updated successfully!', 'success');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Edit Profile</h3>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            {/* Visual Cover and Avatar Preview & Pickers */}
            <div className="relative mb-8">
              <div className="relative h-32 w-full rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-800">
                <img
                  src={coverPhoto}
                  alt="Cover preview"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  className="absolute bottom-2.5 right-2.5 px-3 py-1.5 bg-black/60 hover:bg-black/80 text-white rounded-xl text-xs font-semibold backdrop-blur-sm flex items-center gap-1.5 transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" /> Change Cover
                </button>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverFile}
                />
              </div>

              {/* Avatar position */}
              <div className="absolute -bottom-6 left-5">
                <div className="relative">
                  <img
                    src={avatar}
                    alt="Avatar preview"
                    referrerPolicy="no-referrer"
                    className="w-20 h-20 rounded-full object-cover ring-4 ring-white dark:ring-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="absolute bottom-0 right-0 p-1.5 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 shadow-md ring-2 ring-white dark:ring-slate-900 transition-colors"
                    title="Change Avatar"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarFile}
                  />
                </div>
              </div>
            </div>

            {/* Quick avatar presets */}
            <div className="flex items-center gap-2 pt-2">
              <span className="text-xs text-slate-400">Avatar Presets:</span>
              {PRESET_AVATARS.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setAvatar(img)}
                  className="w-7 h-7 rounded-full overflow-hidden ring-1 ring-slate-300 hover:ring-indigo-500 hover:scale-110 transition-all"
                >
                  <img src={img} alt="Preset" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                placeholder="Tell your story to the ConnectZone community..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" /> Occupation
                </label>
                <input
                  type="text"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  placeholder="e.g. Designer"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Vancouver"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-slate-400" /> Website
                </label>
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>
            </div>

            {/* Privacy toggle */}
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <div>
                <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                  Private Account
                </div>
                <div className="text-[11px] text-slate-400">
                  When enabled, only your approved friends can view your full posts.
                </div>
              </div>
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
