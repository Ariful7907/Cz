import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flag, X, AlertTriangle } from 'lucide-react';
import { storage } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'post' | 'user' | 'comment';
  targetId: string;
  targetAuthorId?: string;
  targetSnippet?: string;
}

const REPORT_REASONS = [
  'Inappropriate or offensive content',
  'Harassment or hate speech',
  'Spam, misleading, or scam',
  'Misinformation or harmful claims',
  'Copyright or intellectual property violation',
  'Other violation of community guidelines',
];

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetAuthorId,
  targetSnippet,
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      storage.createReport({
        reporterId: currentUser.id,
        targetType,
        targetId,
        targetAuthorId,
        targetSnippet: targetSnippet?.slice(0, 100),
        reason,
        details: details.trim(),
      });

      showToast('Thank you. Your report has been submitted to community moderators.', 'success');
      onClose();
    } catch {
      showToast('Failed to submit report. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-semibold text-base">
              <Flag className="w-5 h-5" />
              <span>Report {targetType.toUpperCase()}</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="flex items-start gap-3 p-3.5 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-200 text-xs leading-relaxed">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              <span>
                Help us keep ConnectZone safe. False reports may result in account penalties.
              </span>
            </div>

            {targetSnippet && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-xs text-slate-600 dark:text-slate-400 italic border border-slate-200/60 dark:border-slate-700/50 line-clamp-2">
                &ldquo;{targetSnippet}&rdquo;
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Reason for Reporting
              </label>
              <div className="space-y-2">
                {REPORT_REASONS.map((r) => (
                  <label
                    key={r}
                    className={`flex items-center gap-3 p-2.5 rounded-lg border text-sm cursor-pointer transition-colors ${
                      reason === r
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-950 dark:text-indigo-200 font-medium'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reportReason"
                      value={r}
                      checked={reason === r}
                      onChange={() => setReason(r)}
                      className="text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span>{r}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Additional Context (Optional)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Provide any details that will help our moderation team review..."
                rows={2}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
