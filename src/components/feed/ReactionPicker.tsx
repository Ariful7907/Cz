import React from 'react';
import { motion } from 'motion/react';
import { ReactionType } from '../../types';

interface ReactionPickerProps {
  onSelect: (type: ReactionType) => void;
  onClose?: () => void;
  className?: string;
}

export const REACTION_DETAILS: Record<
  ReactionType,
  { emoji: string; label: string; color: string; bg: string }
> = {
  like: {
    emoji: '👍',
    label: 'Like',
    color: 'text-blue-500',
    bg: 'hover:bg-blue-50 dark:hover:bg-blue-950/40',
  },
  love: {
    emoji: '❤️',
    label: 'Love',
    color: 'text-rose-500',
    bg: 'hover:bg-rose-50 dark:hover:bg-rose-950/40',
  },
  haha: {
    emoji: '😂',
    label: 'Haha',
    color: 'text-amber-500',
    bg: 'hover:bg-amber-50 dark:hover:bg-amber-950/40',
  },
  wow: {
    emoji: '😮',
    label: 'Wow',
    color: 'text-amber-500',
    bg: 'hover:bg-amber-50 dark:hover:bg-amber-950/40',
  },
  sad: {
    emoji: '😢',
    label: 'Sad',
    color: 'text-indigo-400',
    bg: 'hover:bg-indigo-50 dark:hover:bg-indigo-950/40',
  },
  angry: {
    emoji: '😡',
    label: 'Angry',
    color: 'text-orange-600',
    bg: 'hover:bg-orange-50 dark:hover:bg-orange-950/40',
  },
};

export const ReactionPicker: React.FC<ReactionPickerProps> = ({
  onSelect,
  className = '',
}) => {
  const reactions: ReactionType[] = ['like', 'love', 'haha', 'wow', 'sad', 'angry'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 450, damping: 25 }}
      className={`flex items-center gap-1.5 p-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-full shadow-xl border border-slate-200/80 dark:border-slate-800 z-30 ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {reactions.map((type, idx) => {
        const item = REACTION_DETAILS[type];
        return (
          <motion.button
            key={type}
            id={`reaction-btn-${type}`}
            whileHover={{ scale: 1.35, y: -6 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 500, damping: 15 }}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(type);
            }}
            title={item.label}
            className={`relative group flex flex-col items-center justify-center w-9 h-9 rounded-full transition-colors ${item.bg}`}
          >
            <span className="text-xl leading-none filter drop-shadow-sm select-none">
              {item.emoji}
            </span>
            <span className="absolute -top-7 px-2 py-0.5 text-[11px] font-semibold text-white bg-slate-900 dark:bg-slate-800 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow whitespace-nowrap">
              {item.label}
            </span>
          </motion.button>
        );
      })}
    </motion.div>
  );
};
