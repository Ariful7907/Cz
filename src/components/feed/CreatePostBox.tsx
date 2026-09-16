import React, { useState } from 'react';
import { Image, Video, Smile, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CreatePostModal } from './CreatePostModal';

interface CreatePostBoxProps {
  defaultGroupId?: string;
  defaultGroupName?: string;
}

export const CreatePostBox: React.FC<CreatePostBoxProps> = ({
  defaultGroupId,
  defaultGroupName,
}) => {
  const { currentUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            referrerPolicy="no-referrer"
            className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/20"
          />
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex-1 text-left px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 text-slate-500 dark:text-slate-400 rounded-full text-xs sm:text-sm transition-colors"
          >
            What's on your mind, {currentUser.name.split(' ')[0]}?
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 py-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-emerald-600 dark:text-emerald-400 transition-colors"
          >
            <Image className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Photo</span>
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 py-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-indigo-600 dark:text-indigo-400 transition-colors"
          >
            <Video className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Video</span>
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 py-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-amber-500 dark:text-amber-400 transition-colors"
          >
            <Smile className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Feeling</span>
          </button>
        </div>
      </div>

      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultGroupId={defaultGroupId}
        defaultGroupName={defaultGroupName}
      />
    </>
  );
};
