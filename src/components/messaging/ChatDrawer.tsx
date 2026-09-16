import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Send,
  Image as ImageIcon,
  Smile,
  Check,
  CheckCheck,
  Trash2,
  Search,
  MessageSquarePlus,
  Phone,
  Video,
  MoreVertical,
  Maximize2,
  Minimize2,
  Copy,
  Sparkles,
  Paperclip,
  Clock,
  ArrowLeft,
} from 'lucide-react';
import { User, Message, Conversation } from '../../types';
import { storage, subscribeToStorage, subscribeToTyping } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { EmojiPicker } from './EmojiPicker';
import { LightboxModal } from './LightboxModal';
import { CallModal } from './CallModal';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserId?: string | null;
  onNavigateToProfile?: (userId: string) => void;
}

const QUICK_REACTION_EMOJIS = ['❤️', '👍', '😂', '😮', '😢', '🔥'];

const STICKER_PRESETS = [
  { label: 'High Five', url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&auto=format&fit=crop&q=80' },
  { label: 'Celebration', url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&auto=format&fit=crop&q=80' },
  { label: 'Coffee Time', url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&auto=format&fit=crop&q=80' },
  { label: 'Nature Vibes', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&auto=format&fit=crop&q=80' },
  { label: 'Tech Life', url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&auto=format&fit=crop&q=80' },
];

// Helper to test if text is strictly 1 to 3 emojis
const isOnlyEmojis = (str: string) => {
  if (!str) return false;
  const trimmed = str.trim();
  const emojiRegex = /^(\p{Extended_Pictographic}|\p{Emoji_Presentation}|\u200d|\ufe0f){1,3}$/u;
  return emojiRegex.test(trimmed);
};

// Helper for date headers (Today, Yesterday, Date)
const formatDayHeader = (isoString: string) => {
  const date = new Date(isoString);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isToday) return 'Today';
  if (isYesterday) return 'Yesterday';
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  onClose,
  targetUserId,
  onNavigateToProfile,
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [conversations, setConversations] = useState<Conversation[]>(() =>
    storage.getConversations().filter((c) => c.participantIds.includes(currentUser.id))
  );
  const [selectedConvoId, setSelectedConvoId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showStickersPicker, setShowStickersPicker] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [inChatSearch, setInChatSearch] = useState('');
  const [showInChatSearch, setShowInChatSearch] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [activeMenuMsgId, setActiveMenuMsgId] = useState<string | null>(null);
  const [typingUserIds, setTypingUserIds] = useState<string[]>([]);
  const [showConvoMenu, setShowConvoMenu] = useState(false);

  // Pre-send image staging
  const [stagedImage, setStagedImage] = useState<string | null>(null);

  // Lightbox
  const [lightboxData, setLightboxData] = useState<{
    url: string;
    caption?: string;
    senderName?: string;
    timestamp?: string;
  } | null>(null);

  // Call Modal
  const [activeCall, setActiveCall] = useState<{
    type: 'audio' | 'video';
    user: User;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronize conversations and messages from storage
  useEffect(() => {
    const sync = () => {
      const convos = storage
        .getConversations()
        .filter((c) => c.participantIds.includes(currentUser.id));
      setConversations(convos);

      if (selectedConvoId) {
        setMessages(storage.getMessages(selectedConvoId));
      }
    };
    return subscribeToStorage(sync);
  }, [currentUser.id, selectedConvoId]);

  // Subscribe to typing bus
  useEffect(() => {
    return subscribeToTyping((convoId, activeIds) => {
      if (convoId === selectedConvoId) {
        // filter out current user
        setTypingUserIds(activeIds.filter((id) => id !== currentUser.id));
      }
    });
  }, [selectedConvoId, currentUser.id]);

  // Handle incoming targetUserId (e.g. from clicking message on a profile or card)
  useEffect(() => {
    if (targetUserId && targetUserId !== currentUser.id) {
      const convo = storage.getOrCreateConversation(currentUser.id, targetUserId);
      setSelectedConvoId(convo.id);
    } else if (!selectedConvoId && conversations.length > 0) {
      setSelectedConvoId(conversations[0].id);
    }
  }, [targetUserId, currentUser.id, conversations, selectedConvoId]);

  // When selected convo changes, load messages & mark seen
  useEffect(() => {
    if (selectedConvoId) {
      setMessages(storage.getMessages(selectedConvoId));
      storage.markMessagesSeen(selectedConvoId, currentUser.id);
      setTypingUserIds(
        storage.getTypingUsers(selectedConvoId).filter((id) => id !== currentUser.id)
      );
      setShowEmojiPicker(false);
      setShowStickersPicker(false);
      setStagedImage(null);
    }
  }, [selectedConvoId, currentUser.id]);

  // Scroll to bottom on new messages or typing
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUserIds]);

  if (!isOpen) return null;

  const currentConvo = conversations.find((c) => c.id === selectedConvoId);
  const otherParticipantId = currentConvo?.participantIds.find((id) => id !== currentUser.id);
  const otherUser: User | undefined = otherParticipantId
    ? storage.getUserById(otherParticipantId)
    : undefined;

  // Typing event handler
  const handleInputChange = (text: string) => {
    setInputText(text);

    if (selectedConvoId && otherParticipantId) {
      storage.setTyping(selectedConvoId, currentUser.id, true);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        storage.setTyping(selectedConvoId, currentUser.id, false);
      }, 2500);
    }
  };

  const handleSendMessage = (mediaUrl?: string) => {
    const textToSend = inputText.trim();
    const imageToSend = mediaUrl || stagedImage;

    if (!textToSend && !imageToSend) return;
    if (!selectedConvoId || !otherParticipantId) return;

    // Clear typing
    storage.setTyping(selectedConvoId, currentUser.id, false);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    storage.sendMessage(
      selectedConvoId,
      currentUser.id,
      otherParticipantId,
      textToSend,
      imageToSend || undefined
    );

    setInputText('');
    setStagedImage(null);
    setShowEmojiPicker(false);
    setShowStickersPicker(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setStagedImage(result);
        showToast('Image ready to send! Add an optional caption below.', 'info');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const result = event.target?.result as string;
            if (result) {
              setStagedImage(result);
              showToast('Image pasted! Press send or add a caption.', 'info');
            }
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  const handleDeleteMessage = (msgId: string) => {
    storage.deleteMessage(msgId);
    showToast('Message deleted', 'info');
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard', 'success');
  };

  const handleToggleReaction = (msgId: string, emoji: string) => {
    storage.toggleMessageReaction(msgId, currentUser.id, emoji);
    setActiveMenuMsgId(null);
  };

  const handleClearChat = () => {
    if (!selectedConvoId) return;
    if (window.confirm('Are you sure you want to clear all messages in this conversation?')) {
      storage.clearConversation(selectedConvoId);
      setShowConvoMenu(false);
      showToast('Conversation cleared', 'info');
    }
  };

  const filteredConversations = conversations.filter((c) => {
    const pId = c.participantIds.find((id) => id !== currentUser.id);
    const user = pId ? storage.getUserById(pId) : null;
    if (!user) return false;
    return (
      user.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      user.username.toLowerCase().includes(searchFilter.toLowerCase())
    );
  });

  const availableFriends = storage
    .getUsers()
    .filter((u) => u.id !== currentUser.id && !u.isBanned);

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const filtered = inChatSearch.trim()
      ? messages.filter((m) =>
          m.text.toLowerCase().includes(inChatSearch.toLowerCase().trim())
        )
      : messages;

    const groups: { date: string; messages: Message[] }[] = [];
    filtered.forEach((msg) => {
      const header = formatDayHeader(msg.timestamp);
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.date === header) {
        lastGroup.messages.push(msg);
      } else {
        groups.push({ date: header, messages: [msg] });
      }
    });
    return groups;
  }, [messages, inChatSearch]);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm transition-all">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={`w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col sm:flex-row transition-all ${
            isMaximized
              ? 'fixed inset-2 sm:inset-4 max-w-none h-[calc(100vh-16px)] sm:h-[calc(100vh-32px)]'
              : 'max-w-4xl h-[90vh] max-h-[740px]'
          }`}
          onPaste={handlePaste}
        >
          {/* Left Column: Conversations List */}
          <div
            className={`w-full sm:w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/70 dark:bg-slate-900/60 ${
              selectedConvoId ? 'hidden sm:flex' : 'flex'
            }`}
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-lg text-slate-900 dark:text-slate-100">
                  Messages
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400">
                  Direct
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowNewChatModal(true)}
                  className="p-2 rounded-xl text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
                  title="New Message"
                >
                  <MessageSquarePlus className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="sm:hidden p-2 rounded-xl text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Search Box */}
            <div className="p-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs shadow-xs">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Search conversations..."
                  className="bg-transparent flex-1 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none"
                />
                {searchFilter && (
                  <button
                    type="button"
                    onClick={() => setSearchFilter('')}
                    className="text-[10px] text-slate-400 hover:text-slate-600"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Conversations Scrollable List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 no-scrollbar">
              {filteredConversations.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 space-y-2">
                  <p>No conversations found.</p>
                  <button
                    type="button"
                    onClick={() => setShowNewChatModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs text-xs"
                  >
                    <MessageSquarePlus className="w-3.5 h-3.5" /> Start a chat
                  </button>
                </div>
              ) : (
                filteredConversations.map((convo) => {
                  const otherId = convo.participantIds.find((id) => id !== currentUser.id);
                  const user = otherId ? storage.getUserById(otherId) : null;
                  const isSelected = convo.id === selectedConvoId;
                  const unread =
                    convo.lastMessage &&
                    convo.lastMessage.receiverId === currentUser.id &&
                    !convo.lastMessage.seen;

                  return (
                    <button
                      key={convo.id}
                      type="button"
                      onClick={() => setSelectedConvoId(convo.id)}
                      className={`w-full p-3.5 flex items-center gap-3 text-left transition-colors relative ${
                        isSelected
                          ? 'bg-indigo-50/90 dark:bg-indigo-950/50'
                          : 'hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="relative shrink-0">
                        <img
                          src={user?.avatar}
                          alt={user?.name}
                          referrerPolicy="no-referrer"
                          className="w-11 h-11 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                        />
                        {user?.isOnline && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                            {user?.name || 'ConnectZone User'}
                          </span>
                          {convo.lastMessage && (
                            <span className="text-[10px] text-slate-400">
                              {new Date(convo.lastMessage.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          {convo.lastMessage && convo.lastMessage.senderId === currentUser.id && (
                            <span className="shrink-0 text-slate-400">
                              {convo.lastMessage.seen ? (
                                <CheckCheck className="w-3 h-3 text-indigo-500" />
                              ) : (
                                <Check className="w-3 h-3 text-slate-400" />
                              )}
                            </span>
                          )}
                          <p
                            className={`text-xs truncate ${
                              unread
                                ? 'font-bold text-indigo-600 dark:text-indigo-400'
                                : 'text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            {convo.lastMessage
                              ? convo.lastMessage.text || 'Photo attachment'
                              : 'Started a conversation'}
                          </p>
                        </div>
                      </div>

                      {unread && (
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0 shadow-xs" />
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Current user status indicator footer */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <span className="font-medium text-[11px]">Active as {currentUser.name.split(' ')[0]}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Chat View */}
          <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-900 min-w-0">
            {currentConvo && otherUser ? (
              <>
                {/* Chat Header */}
                <div className="p-3.5 sm:px-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 shadow-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => setSelectedConvoId(null)}
                      className="sm:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onNavigateToProfile?.(otherUser.id)}
                      className="relative shrink-0 group"
                      title="View Profile"
                    >
                      <img
                        src={otherUser.avatar}
                        alt={otherUser.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/20 group-hover:ring-indigo-500 transition-all"
                      />
                      {otherUser.isOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900 shadow-xs" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <button
                        type="button"
                        onClick={() => onNavigateToProfile?.(otherUser.id)}
                        className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 hover:text-indigo-600 truncate block text-left"
                      >
                        {otherUser.name}
                      </button>
                      <div className="text-xs text-slate-400 flex items-center gap-1.5">
                        {otherUser.isOnline ? (
                          <span className="text-emerald-500 font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Online now
                          </span>
                        ) : (
                          <span>Active {otherUser.lastSeen || 'recently'}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Header Actions */}
                  <div className="flex items-center gap-1 text-slate-400 relative">
                    <button
                      type="button"
                      onClick={() => setShowInChatSearch(!showInChatSearch)}
                      className={`p-2 rounded-xl transition-colors ${
                        showInChatSearch
                          ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200'
                      }`}
                      title="Search in conversation"
                    >
                      <Search className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveCall({ type: 'audio', user: otherUser })}
                      className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 transition-colors"
                      title="Start Voice Call"
                    >
                      <Phone className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveCall({ type: 'video', user: otherUser })}
                      className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 transition-colors"
                      title="Start Video Call"
                    >
                      <Video className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsMaximized(!isMaximized)}
                      className="hidden sm:block p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                      title={isMaximized ? 'Restore View' : 'Maximize View'}
                    >
                      {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>

                    {/* Convo Options Dropdown */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowConvoMenu(!showConvoMenu)}
                        className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                        title="More Options"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {showConvoMenu && (
                        <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-30 text-xs">
                          <button
                            type="button"
                            onClick={() => {
                              onNavigateToProfile?.(otherUser.id);
                              setShowConvoMenu(false);
                            }}
                            className="w-full px-3.5 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                          >
                            View Profile
                          </button>
                          <button
                            type="button"
                            onClick={handleClearChat}
                            className="w-full px-3.5 py-2 text-left hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 font-medium"
                          >
                            Clear Conversation
                          </button>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={onClose}
                      className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                      title="Close"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* In-Chat Search Bar */}
                <AnimatePresence>
                  {showInChatSearch && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-4 py-2 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-hidden text-xs"
                    >
                      <Search className="w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={inChatSearch}
                        onChange={(e) => setInChatSearch(e.target.value)}
                        placeholder="Search text in this chat..."
                        className="flex-1 bg-transparent text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none"
                      />
                      {inChatSearch && (
                        <button
                          type="button"
                          onClick={() => setInChatSearch('')}
                          className="text-[10px] text-slate-400 hover:text-slate-600"
                        >
                          Clear
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Messages Body */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-slate-950/30">
                  {groupedMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-3">
                      <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center text-3xl shadow-inner">
                        👋
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">
                          Say hello to {otherUser.name.split(' ')[0]}!
                        </p>
                        <p className="text-xs max-w-xs text-slate-400 mt-1">
                          Connect with one-to-one real-time chat, photos, stickers, and reactions.
                        </p>
                      </div>
                      <div className="flex items-center gap-2 pt-2">
                        {['👋 Hello!', '🔥 How are you?', '✨ Great to connect!'].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => {
                              setInputText(preset);
                              handleSendMessage();
                            }}
                            className="px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 hover:border-indigo-500 transition-colors shadow-2xs"
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    groupedMessages.map((group) => (
                      <div key={group.date} className="space-y-3.5">
                        {/* Date Divider Badge */}
                        <div className="flex items-center justify-center my-2">
                          <span className="px-3 py-1 rounded-full bg-slate-200/70 dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-400 shadow-2xs">
                            {group.date}
                          </span>
                        </div>

                        {group.messages.map((msg, msgIndex) => {
                          const isMe = msg.senderId === currentUser.id;
                          const onlyEmojis = isOnlyEmojis(msg.text) && !msg.mediaUrl;
                          const isLastFromUser =
                            msgIndex === group.messages.length - 1 ||
                            group.messages[msgIndex + 1]?.senderId !== msg.senderId;

                          return (
                            <div
                              key={msg.id}
                              className={`flex items-end gap-2 group relative ${
                                isMe ? 'justify-end' : 'justify-start'
                              }`}
                            >
                              {!isMe && (
                                <img
                                  src={otherUser.avatar}
                                  alt={otherUser.name}
                                  referrerPolicy="no-referrer"
                                  className="w-7 h-7 rounded-full object-cover shrink-0 mb-1"
                                />
                              )}

                              <div className="relative max-w-[80%] sm:max-w-md flex flex-col">
                                {/* Message Bubble / Big Emoji */}
                                {onlyEmojis ? (
                                  <div className="text-4xl sm:text-5xl py-1 select-none hover:scale-110 transition-transform">
                                    {msg.text}
                                  </div>
                                ) : (
                                  <div
                                    className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed break-words shadow-2xs relative ${
                                      isMe
                                        ? 'bg-indigo-600 text-white rounded-br-xs'
                                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-xs border border-slate-200/80 dark:border-slate-700'
                                    }`}
                                  >
                                    {/* Image Attachment */}
                                    {msg.mediaUrl && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setLightboxData({
                                            url: msg.mediaUrl!,
                                            caption: msg.text,
                                            senderName: isMe ? 'You' : otherUser.name,
                                            timestamp: msg.timestamp,
                                          })
                                        }
                                        className="block rounded-xl overflow-hidden mb-2 max-h-60 w-full group/img relative"
                                      >
                                        <img
                                          src={msg.mediaUrl}
                                          alt="Attachment"
                                          referrerPolicy="no-referrer"
                                          className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-200"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 flex items-center justify-center transition-colors">
                                          <span className="opacity-0 group-hover/img:opacity-100 text-white text-[11px] font-bold bg-black/60 px-2 py-1 rounded-md transition-opacity">
                                            Click to expand
                                          </span>
                                        </div>
                                      </button>
                                    )}

                                    {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}
                                  </div>
                                )}

                                {/* Floating Reaction Bar on hover */}
                                <div
                                  className={`absolute -top-7 hidden group-hover:flex items-center gap-1 p-1 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 z-20 ${
                                    isMe ? 'right-0' : 'left-0'
                                  }`}
                                >
                                  {QUICK_REACTION_EMOJIS.map((emoji) => (
                                    <button
                                      key={emoji}
                                      type="button"
                                      onClick={() => handleToggleReaction(msg.id, emoji)}
                                      className="p-1 hover:scale-125 transition-transform text-sm"
                                    >
                                      {emoji}
                                    </button>
                                  ))}

                                  <button
                                    type="button"
                                    onClick={() => handleCopyText(msg.text)}
                                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                    title="Copy text"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>

                                  {isMe && (
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteMessage(msg.id)}
                                      className="p-1 text-rose-500 hover:text-rose-700"
                                      title="Delete"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>

                                {/* Reactions Pills */}
                                {msg.reactions && msg.reactions.length > 0 && (
                                  <div
                                    className={`flex flex-wrap gap-1 mt-1 ${
                                      isMe ? 'justify-end' : 'justify-start'
                                    }`}
                                  >
                                    {(Array.from(new Set(msg.reactions.map((r) => r.emoji))) as string[]).map(
                                      (emoji) => {
                                        const count = msg.reactions?.filter(
                                          (r) => r.emoji === emoji
                                        ).length;
                                        const reactedByMe = msg.reactions?.some(
                                          (r) => r.emoji === emoji && r.userId === currentUser.id
                                        );

                                        return (
                                          <button
                                            key={emoji}
                                            type="button"
                                            onClick={() => handleToggleReaction(msg.id, emoji)}
                                            className={`px-2 py-0.5 rounded-full text-xs flex items-center gap-1 shadow-2xs border transition-transform hover:scale-105 ${
                                              reactedByMe
                                                ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-300 dark:border-indigo-800 text-indigo-600'
                                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                                            }`}
                                          >
                                            <span>{emoji}</span>
                                            {count && count > 1 && (
                                              <span className="font-bold text-[10px]">{count}</span>
                                            )}
                                          </button>
                                        );
                                      }
                                    )}
                                  </div>
                                )}

                                {/* Timestamp & Status info */}
                                <div
                                  className={`flex items-center gap-1.5 text-[10px] text-slate-400 mt-1 ${
                                    isMe ? 'justify-end' : 'justify-start'
                                  }`}
                                >
                                  <span title={new Date(msg.timestamp).toLocaleString()}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>

                                  {isMe && (
                                    <div className="flex items-center gap-1">
                                      {msg.seen ? (
                                        <span className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-0.5">
                                          <CheckCheck className="w-3.5 h-3.5" />
                                          <span>Seen</span>
                                        </span>
                                      ) : (
                                        <span className="text-slate-400 flex items-center gap-0.5">
                                          <CheckCheck className="w-3.5 h-3.5" />
                                          <span>Delivered</span>
                                        </span>
                                      )}

                                      {/* Docked mini recipient avatar on last seen message */}
                                      {msg.seen && isLastFromUser && (
                                        <img
                                          src={otherUser.avatar}
                                          alt={otherUser.name}
                                          referrerPolicy="no-referrer"
                                          className="w-3.5 h-3.5 rounded-full object-cover ring-1 ring-white dark:ring-slate-900 shadow-2xs ml-0.5"
                                          title={`Seen by ${otherUser.name}`}
                                        />
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))
                  )}

                  {/* Real-time Typing Indicator Bubble */}
                  {typingUserIds.length > 0 && (
                    <div className="flex items-end gap-2 justify-start">
                      <img
                        src={otherUser.avatar}
                        alt={otherUser.name}
                        referrerPolicy="no-referrer"
                        className="w-7 h-7 rounded-full object-cover shrink-0 mb-1"
                      />
                      <div className="px-4 py-3 bg-white dark:bg-slate-800 rounded-2xl rounded-bl-xs border border-slate-200/80 dark:border-slate-700 shadow-2xs flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
                        <span className="text-[11px] text-slate-400 font-medium ml-1">
                          {otherUser.name.split(' ')[0]} is typing...
                        </span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Staged Image Preview Banner */}
                {stagedImage && (
                  <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/40 border-t border-indigo-100 dark:border-indigo-900/60 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={stagedImage}
                        alt="Preview"
                        className="w-12 h-12 rounded-xl object-cover ring-1 ring-indigo-300"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          Photo ready to send
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          Add a caption in the text box below or click send.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setStagedImage(null)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Stickers Preset Popover */}
                <AnimatePresence>
                  {showStickersPicker && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="p-3 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 overflow-x-auto"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                          Quick Stickers & Photos
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowStickersPicker(false)}
                          className="text-slate-400 hover:text-slate-600 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="flex items-center gap-2.5 pb-1">
                        {STICKER_PRESETS.map((stk) => (
                          <button
                            key={stk.label}
                            type="button"
                            onClick={() => {
                              handleSendMessage(stk.url);
                              setShowStickersPicker(false);
                            }}
                            className="group relative w-20 h-16 rounded-xl overflow-hidden shrink-0 ring-1 ring-slate-200 dark:ring-slate-700 hover:ring-2 hover:ring-indigo-500 transition-all shadow-2xs"
                          >
                            <img
                              src={stk.url}
                              alt={stk.label}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                            />
                            <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] font-semibold text-center py-0.5">
                              {stk.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Emoji popover */}
                <AnimatePresence>
                  {showEmojiPicker && (
                    <div className="absolute bottom-16 left-4 z-40">
                      <EmojiPicker
                        onSelectEmoji={(emoji) => {
                          setInputText((prev) => prev + emoji);
                        }}
                        onClose={() => setShowEmojiPicker(false)}
                      />
                    </div>
                  )}
                </AnimatePresence>

                {/* Message Input Bar */}
                <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 relative">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEmojiPicker((p) => !p);
                      setShowStickersPicker(false);
                    }}
                    className={`p-2 rounded-xl transition-colors ${
                      showEmojiPicker
                        ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                        : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    title="Insert Emoji"
                  >
                    <Smile className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-slate-400 hover:text-emerald-500 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Upload Photo / File"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />

                  <button
                    type="button"
                    onClick={() => {
                      setShowStickersPicker((s) => !s);
                      setShowEmojiPicker(false);
                    }}
                    className={`p-2 rounded-xl transition-colors ${
                      showStickersPicker
                        ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40'
                        : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    title="Send Sticker / Photo"
                  >
                    <Sparkles className="w-5 h-5" />
                  </button>

                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder={stagedImage ? 'Add a caption...' : 'Type a message in real-time...'}
                    className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 rounded-full text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                  />

                  <button
                    type="button"
                    onClick={() => handleSendMessage()}
                    disabled={!inputText.trim() && !stagedImage}
                    className="p-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 transition-all shadow-md active:scale-95 shrink-0"
                    title="Send"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-6 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center text-3xl">
                  💬
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-200">
                    Your Messages
                  </h3>
                  <p className="text-xs max-w-xs text-slate-400 mt-1">
                    Select a conversation from the left or start a new real-time chat with your friends.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNewChatModal(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
                >
                  Start New Chat
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* New Chat Modal Picker */}
        {showNewChatModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-slate-900 dark:text-slate-100">
                  New Direct Message
                </h3>
                <button
                  type="button"
                  onClick={() => setShowNewChatModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 no-scrollbar">
                {availableFriends.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      const convo = storage.getOrCreateConversation(currentUser.id, u.id);
                      setSelectedConvoId(convo.id);
                      setShowNewChatModal(false);
                    }}
                    className="w-full p-2.5 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl text-left transition-colors"
                  >
                    <div className="relative shrink-0">
                      <img
                        src={u.avatar}
                        alt={u.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      {u.isOnline && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate">
                        {u.name}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        @{u.username} • {u.isOnline ? 'Online' : 'Offline'}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* Lightbox for Full-screen Image Viewing */}
      <LightboxModal
        isOpen={Boolean(lightboxData)}
        imageUrl={lightboxData?.url || null}
        caption={lightboxData?.caption}
        senderName={lightboxData?.senderName}
        timestamp={lightboxData?.timestamp}
        onClose={() => setLightboxData(null)}
      />

      {/* Audio / Video Simulated Call Modal */}
      {activeCall && (
        <CallModal
          isOpen={Boolean(activeCall)}
          type={activeCall.type}
          targetUser={activeCall.user}
          onEndCall={() => {
            setActiveCall(null);
            showToast('Call ended', 'info');
          }}
        />
      )}
    </>
  );
};
