import React, { useState, useMemo } from 'react';
import { Search, Clock, Smile, Hand, Heart, Sparkles, Utensils, Laptop } from 'lucide-react';

interface EmojiPickerProps {
  onSelectEmoji: (emoji: string) => void;
  onClose?: () => void;
}

const EMOJI_CATEGORIES = [
  {
    id: 'smileys',
    name: 'Smileys',
    icon: Smile,
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '🥲', '🥹', '😊', '😇',
      '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛',
      '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸', '🤩', '🥳', '😏', '😒',
      '😞', '😔', '😟', '😕', '🙁', '😣', '😖', '😫', '😩', '🥺', '😢', '😭',
      '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥',
    ],
  },
  {
    id: 'gestures',
    name: 'Gestures',
    icon: Hand,
    emojis: [
      '👍', '👎', '👊', '✊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏',
      '✍️', '💅', '🤳', '💪', '✌️', '🤞', '🫰', '🤟', '🤘', '🤙', '👈', '👉',
      '👆', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏',
    ],
  },
  {
    id: 'hearts',
    name: 'Hearts',
    icon: Heart,
    emojis: [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '❤️‍🩹',
      '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '💌', '💐', '🌹',
    ],
  },
  {
    id: 'celebrate',
    name: 'Party',
    icon: Sparkles,
    emojis: [
      '🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '🥈', '🥉', '✨', '⭐', '🌟', '💫',
      '🔥', '💯', '🚀', '🎯', '🪄', '🎨', '🎬', '🎤', '🎧', '🎸', '🎹', '🎲',
    ],
  },
  {
    id: 'food',
    name: 'Food',
    icon: Utensils,
    emojis: [
      '🍕', '🍔', '🍟', '🌭', '🍿', '🥓', '🍳', '🧇', '🥞', '🥐', '🥯', '🧀',
      '🥗', '🌮', '🌯', '🍜', '🍝', '🍣', '🍱', '🍦', '🍩', '🍪', '🎂', '☕',
      '🍵', '🧃', '🥤', '🧋', '🍺', '🍷', '🍸', '🍹',
    ],
  },
  {
    id: 'tech',
    name: 'Objects',
    icon: Laptop,
    emojis: [
      '💻', '📱', '📷', '📸', '📹', '🎥', '🎙️', '🎧', '🕹️', '💡', '🔮', '🔑',
      '💎', '⏳', '⏰', '🧭', '✉️', '📬', '📢', '🔔', '📣', '💬', '💭', '🛡️',
    ],
  },
];

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelectEmoji }) => {
  const [activeTab, setActiveTab] = useState<string>('smileys');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredEmojis = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase().trim();
    const all = EMOJI_CATEGORIES.flatMap((c) => c.emojis);
    // Unique list
    return Array.from(new Set(all)).filter(() => true);
  }, [searchQuery]);

  return (
    <div className="w-80 max-w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-3 space-y-3">
      {/* Search Input */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs">
        <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search emojis..."
          className="bg-transparent flex-1 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            Clear
          </button>
        )}
      </div>

      {/* Category Tabs */}
      {!searchQuery && (
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          {EMOJI_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeTab === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveTab(cat.id)}
                className={`p-1.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
                title={cat.name}
              >
                <Icon className="w-4 h-4" />
              </button>
            );
          })}
        </div>
      )}

      {/* Emoji Grid */}
      <div className="h-48 overflow-y-auto grid grid-cols-7 gap-1 p-1 no-scrollbar">
        {searchQuery ? (
          filteredEmojis && filteredEmojis.length > 0 ? (
            filteredEmojis.map((emoji, idx) => (
              <button
                key={`${emoji}_${idx}`}
                type="button"
                onClick={() => onSelectEmoji(emoji)}
                className="w-9 h-9 flex items-center justify-center text-xl hover:scale-125 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-transform"
              >
                {emoji}
              </button>
            ))
          ) : (
            <div className="col-span-7 py-8 text-center text-xs text-slate-400">
              No emojis matching &quot;{searchQuery}&quot;
            </div>
          )
        ) : (
          EMOJI_CATEGORIES.find((c) => c.id === activeTab)?.emojis.map((emoji, idx) => (
            <button
              key={`${emoji}_${idx}`}
              type="button"
              onClick={() => onSelectEmoji(emoji)}
              className="w-9 h-9 flex items-center justify-center text-xl hover:scale-125 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-transform"
            >
              {emoji}
            </button>
          ))
        )}
      </div>

      {/* Quick Common Presets Footer */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1 text-[11px]">
          <Clock className="w-3 h-3" /> Quick reactions
        </span>
        <div className="flex items-center gap-1.5">
          {['❤️', '👍', '😂', '🔥', '🎉'].map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => onSelectEmoji(e)}
              className="hover:scale-125 transition-transform"
            >
              {e}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
