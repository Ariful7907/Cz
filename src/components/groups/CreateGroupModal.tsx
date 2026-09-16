import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Users, Globe, Lock, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { storage } from '../../services/storage';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (groupId: string) => void;
}

const CATEGORIES = [
  'Technology',
  'Photography',
  'Design',
  'Gaming',
  'Music',
  'Travel',
  'Fitness',
  'Art & Culture',
];

const PRESET_COVERS = [
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80',
];

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public');
  const [coverImage, setCoverImage] = useState(PRESET_COVERS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please provide a group name', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const newGroup = storage.createGroup(
        {
          name: name.trim(),
          description: description.trim(),
          category,
          privacy,
          coverImage,
          avatar: coverImage,
          rules: [
            'Be respectful of all community members',
            'No spam, promotions, or off-topic links',
            'Constructive collaboration and feedback welcome',
          ],
        },
        currentUser.id
      );

      showToast(`Group "${newGroup.name}" created!`, 'success');
      onCreated?.(newGroup.id);
      onClose();
    } catch {
      showToast('Failed to create group', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <span>Create New Group</span>
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
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Group Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. NextGen Web Builders"
                required
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this community all about?"
                rows={2}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Privacy
                </label>
                <select
                  value={privacy}
                  onChange={(e) => setPrivacy(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="public">🌐 Public (Anyone can join)</option>
                  <option value="private">🔒 Private (Members only)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Choose Banner Cover
              </label>
              <div className="grid grid-cols-4 gap-2">
                {PRESET_COVERS.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCoverImage(img)}
                    className={`h-14 rounded-xl overflow-hidden border-2 transition-all ${
                      coverImage === img
                        ? 'border-indigo-600 scale-105 shadow-md'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Cover" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-colors disabled:opacity-50 mt-2"
            >
              {isSubmitting ? 'Creating Group...' : 'Launch Community Group'}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
