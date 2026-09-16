import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { PhoneOff, Mic, MicOff, Video, VideoOff, Volume2, VolumeX } from 'lucide-react';
import { User } from '../../types';

interface CallModalProps {
  isOpen: boolean;
  type: 'audio' | 'video';
  targetUser: User;
  onEndCall: () => void;
}

export const CallModal: React.FC<CallModalProps> = ({
  isOpen,
  type,
  targetUser,
  onEndCall,
}) => {
  const [callState, setCallState] = useState<'ringing' | 'connected'>('ringing');
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);

  // Ringing timeout -> auto connect after 2.5s
  useEffect(() => {
    if (!isOpen) {
      setCallState('ringing');
      setDurationSeconds(0);
      return;
    }

    const timer = setTimeout(() => {
      setCallState('connected');
    }, 2400);

    return () => clearTimeout(timer);
  }, [isOpen]);

  // Duration timer when connected
  useEffect(() => {
    if (callState !== 'connected') return;
    const interval = setInterval(() => {
      setDurationSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [callState]);

  if (!isOpen) return null;

  const formatDuration = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-slate-900 text-white rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col relative"
      >
        {/* Background Visual for Video Call */}
        {type === 'video' && !isVideoOff && callState === 'connected' ? (
          <div className="relative h-96 w-full bg-slate-950 overflow-hidden">
            <img
              src={targetUser.avatar}
              alt={targetUser.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover filter brightness-75 scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-transparent to-slate-950/70" />

            {/* Picture-in-picture Self View */}
            <div className="absolute top-4 right-4 w-28 h-36 rounded-2xl border-2 border-white/20 bg-slate-800 overflow-hidden shadow-xl">
              <div className="w-full h-full flex flex-col items-center justify-center bg-indigo-900/60">
                <span className="text-xs text-white/80 font-semibold">You</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 flex flex-col items-center justify-center space-y-4">
            {/* Avatar with pulsing ring */}
            <div className="relative mt-4">
              <img
                src={targetUser.avatar}
                alt={targetUser.name}
                referrerPolicy="no-referrer"
                className="w-24 h-24 rounded-full object-cover ring-4 ring-indigo-500/30 shadow-2xl"
              />
              {callState === 'ringing' ? (
                <span className="absolute -inset-2 rounded-full border-2 border-indigo-400 animate-ping opacity-75" />
              ) : (
                <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full ring-2 ring-slate-900" />
              )}
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-xl font-bold">{targetUser.name}</h3>
              <p className="text-xs text-indigo-400 font-medium tracking-wide uppercase">
                {callState === 'ringing'
                  ? `Ringing ${type === 'video' ? 'Video' : 'Audio'} Call...`
                  : `${type === 'video' ? 'Video' : 'HD Voice'} Call • ${formatDuration(durationSeconds)}`}
              </p>
            </div>

            {/* Audio waveform simulation */}
            {callState === 'connected' && (
              <div className="flex items-center gap-1.5 h-8 pt-2">
                {[40, 75, 20, 90, 60, 30, 85, 45, 95, 35].map((height, i) => (
                  <div
                    key={i}
                    style={{ height: `${height}%` }}
                    className="w-1 bg-indigo-500 rounded-full animate-pulse"
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bottom Call Controls */}
        <div className="p-6 bg-slate-950/80 border-t border-slate-800/80 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className={`p-3.5 rounded-full transition-colors ${
              isMuted ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {type === 'video' && (
            <button
              type="button"
              onClick={() => setIsVideoOff(!isVideoOff)}
              className={`p-3.5 rounded-full transition-colors ${
                isVideoOff ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
              title={isVideoOff ? 'Start Camera' : 'Stop Camera'}
            >
              {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            className={`p-3.5 rounded-full transition-colors ${
              !isSpeakerOn ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            title={isSpeakerOn ? 'Mute Audio Output' : 'Speaker On'}
          >
            {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          <button
            type="button"
            onClick={onEndCall}
            className="p-4 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
            title="End Call"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
