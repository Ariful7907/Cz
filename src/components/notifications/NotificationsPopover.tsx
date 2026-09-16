import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  CheckCircle,
  Mail,
  Check,
  X,
  Clock,
  Gift,
  Sparkles,
  Coins,
  CheckCircle2,
  AlertCircle,
  Flag,
  ShieldCheck,
} from 'lucide-react';
import { AppNotification } from '../../types';
import { storage, subscribeToStorage } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface NotificationsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToProfile?: (userId: string) => void;
  onOpenChatWithUser?: (userId: string) => void;
}

export const NotificationsPopover: React.FC<NotificationsPopoverProps> = ({
  isOpen,
  onClose,
  onNavigateToProfile,
  onOpenChatWithUser,
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    storage.getNotifications(currentUser.id)
  );

  useEffect(() => {
    return subscribeToStorage(() => {
      setNotifications(storage.getNotifications(currentUser.id));
    });
  }, [currentUser.id]);

  if (!isOpen) return null;

  const handleMarkAllRead = () => {
    storage.markAllNotificationsRead(currentUser.id);
    showToast('All notifications marked as read', 'info');
  };

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'like':
      case 'reaction':
        return <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />;
      case 'comment':
      case 'reply':
        return <MessageCircle className="w-4 h-4 text-indigo-500 fill-indigo-500" />;
      case 'friend_request':
        return <UserPlus className="w-4 h-4 text-emerald-500" />;
      case 'friend_accept':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'message':
        return <Mail className="w-4 h-4 text-blue-500" />;
      case 'referral_registered':
        return <Gift className="w-4 h-4 text-purple-500" />;
      case 'referral_verified':
        return <ShieldCheck className="w-4 h-4 text-blue-500" />;
      case 'referral_qualified':
        return <Sparkles className="w-4 h-4 text-amber-500" />;
      case 'reward_credited':
        return <Coins className="w-4 h-4 text-emerald-500" />;
      case 'withdrawal_submitted':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'withdrawal_approved':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'withdrawal_rejected':
        return <AlertCircle className="w-4 h-4 text-rose-500" />;
      case 'referral_flagged':
        return <Flag className="w-4 h-4 text-amber-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="fixed inset-0 sm:absolute sm:inset-auto sm:right-0 sm:top-14 z-50 flex sm:block justify-center items-start pt-16 sm:pt-0 p-3 sm:p-0">
      <div className="fixed inset-0 sm:hidden bg-black/40" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -5 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative z-10 w-full sm:w-96 max-h-[80vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              Notifications
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
              {notifications.filter((n) => !n.isRead).length}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
            >
              Mark all read
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications Scroll List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No notifications yet. When friends interact with you, updates will show here.
            </div>
          ) : (
            notifications.map((notif) => {
              const sender = storage.getUserById(notif.senderId);

              return (
                <div
                  key={notif.id}
                  onClick={() => {
                    storage.markNotificationRead(notif.id);
                    if (notif.type === 'message' && onOpenChatWithUser) {
                      onOpenChatWithUser(notif.senderId);
                      onClose();
                    } else if (onNavigateToProfile) {
                      onNavigateToProfile(notif.senderId);
                      onClose();
                    }
                  }}
                  className={`p-3.5 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer ${
                    !notif.isRead ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={sender?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt="Avatar"
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <span className="absolute -bottom-1 -right-1 p-1 bg-white dark:bg-slate-900 rounded-full shadow-sm ring-1 ring-slate-200 dark:ring-slate-700">
                      {getIcon(notif.type)}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 text-xs">
                    <p className="text-slate-800 dark:text-slate-200 leading-snug">
                      <span className="font-bold">{sender?.name || 'Someone'}</span>{' '}
                      {notif.extraText}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {new Date(notif.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {!notif.isRead && (
                    <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 mt-1.5" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </motion.div>
    </div>
  );
};
