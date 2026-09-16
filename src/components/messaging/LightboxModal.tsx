import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, ZoomIn, ZoomOut } from 'lucide-react';

interface LightboxModalProps {
  isOpen: boolean;
  imageUrl: string | null;
  caption?: string;
  senderName?: string;
  timestamp?: string;
  onClose: () => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  isOpen,
  imageUrl,
  caption,
  senderName,
  timestamp,
  onClose,
}) => {
  const [zoom, setZoom] = React.useState(1);

  if (!isOpen || !imageUrl) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `connectzone-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
        {/* Top Control Bar */}
        <div className="absolute top-4 inset-x-4 flex items-center justify-between text-white z-10">
          <div>
            {senderName && (
              <p className="font-semibold text-sm drop-shadow-md">
                Sent by {senderName}
              </p>
            )}
            {timestamp && (
              <p className="text-xs text-white/70 drop-shadow-md">
                {new Date(timestamp).toLocaleDateString()} at{' '}
                {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(z + 0.25, 2.5))}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm"
              title="Zoom In"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(z - 0.25, 0.75))}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm"
              title="Zoom Out"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm"
              title="Download Image"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-sm"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Centered Image Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="max-w-4xl max-h-[80vh] flex flex-col items-center justify-center relative overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={imageUrl}
            alt="Full size attachment"
            referrerPolicy="no-referrer"
            style={{ transform: `scale(${zoom})`, transition: 'transform 0.2s ease-out' }}
            className="max-h-[75vh] w-auto object-contain rounded-2xl shadow-2xl select-none cursor-grab active:cursor-grabbing"
          />

          {caption && (
            <p className="mt-3 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md text-white text-xs sm:text-sm text-center max-w-lg">
              {caption}
            </p>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
