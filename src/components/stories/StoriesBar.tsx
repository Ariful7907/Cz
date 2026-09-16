import React, { useState, useRef } from 'react';
import { Plus, ChevronLeft, ChevronRight, Video, Play, Sparkles } from 'lucide-react';
import { Story } from '../../types';
import { storage } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import { StoryViewerModal } from './StoryViewerModal';
import { CreateStoryModal } from './CreateStoryModal';

interface StoriesBarProps {
  stories: Story[];
  onNavigateToProfile?: (userId: string) => void;
}

export const StoriesBar: React.FC<StoriesBarProps> = ({ stories, onNavigateToProfile }) => {
  const { currentUser } = useAuth();
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Group active stories by user
  const storiesByUser = stories.reduce((acc, story) => {
    if (!acc[story.userId]) {
      acc[story.userId] = [];
    }
    acc[story.userId].push(story);
    return acc;
  }, {} as Record<string, Story[]>);

  // Current user's stories
  const myStories = storiesByUser[currentUser.id] || [];
  const hasMyStories = myStories.length > 0;

  // Other users' IDs
  const otherUserIds = Object.keys(storiesByUser).filter((id) => id !== currentUser.id);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const offset = direction === 'left' ? -260 : 260;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const getRelativeTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${Math.max(1, mins)}m ago`;
    const hours = Math.floor(mins / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="relative group/bar">
      {/* Scroll Left Button */}
      <button
        type="button"
        onClick={() => scroll('left')}
        className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md text-slate-700 dark:text-slate-300 items-center justify-center opacity-0 group-hover/bar:opacity-100 transition-opacity hover:scale-110"
        title="Scroll left"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Scroll Right Button */}
      <button
        type="button"
        onClick={() => scroll('right')}
        className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md text-slate-700 dark:text-slate-300 items-center justify-center opacity-0 group-hover/bar:opacity-100 transition-opacity hover:scale-110"
        title="Scroll right"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Stories Horizontal Carousel */}
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1 px-0.5 scroll-smooth"
      >
        {/* CURRENT USER STORY CARD */}
        {hasMyStories ? (
          /* User has an active story: show their story preview with a small add-story badge */
          <div className="group relative shrink-0 w-28 sm:w-32 h-44 sm:h-48 rounded-2xl overflow-hidden cursor-pointer shadow-xs hover:shadow-md transition-all border border-indigo-200 dark:border-indigo-900/60 flex flex-col justify-between">
            {/* Background preview */}
            <div
              className="absolute inset-0 w-full h-full"
              onClick={() => {
                const flatIndex = stories.findIndex((s) => s.id === myStories[0].id);
                setSelectedStoryIndex(flatIndex >= 0 ? flatIndex : 0);
              }}
            >
              {myStories[0].type === 'image' ? (
                <img
                  src={myStories[0].mediaUrl}
                  alt="My story preview"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : myStories[0].type === 'video' ? (
                <div className="relative w-full h-full bg-slate-900">
                  <video
                    src={myStories[0].mediaUrl}
                    className="w-full h-full object-cover"
                    muted
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Play className="w-6 h-6 text-white drop-shadow" />
                  </div>
                </div>
              ) : (
                <div
                  className={`w-full h-full bg-gradient-to-br ${
                    myStories[0].backgroundGradient || 'from-indigo-600 to-pink-600'
                  } flex items-center justify-center p-2 text-center text-[10px] text-white font-medium line-clamp-3`}
                >
                  {myStories[0].content}
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
            </div>

            {/* Top User Avatar + Story indicator */}
            <div className="relative z-10 p-2.5 flex items-center justify-between">
              <div className="p-0.5 rounded-full bg-indigo-500 ring-2 ring-white dark:ring-slate-900">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover"
                />
              </div>

              {/* Add another story button (+) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCreateOpen(true);
                }}
                className="w-6 h-6 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                title="Add another story"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>

            {/* Bottom Label: "Your Story" + viewer count */}
            <div
              className="relative z-10 p-2.5"
              onClick={() => {
                const flatIndex = stories.findIndex((s) => s.id === myStories[0].id);
                setSelectedStoryIndex(flatIndex >= 0 ? flatIndex : 0);
              }}
            >
              <p className="text-white text-xs font-bold leading-tight drop-shadow">
                Your Story
              </p>
              <span className="text-[10px] text-white/80 drop-shadow">
                {myStories[0].viewers?.length || 0} views
              </span>
            </div>
          </div>
        ) : (
          /* User does NOT have active story: show standard Create Story card */
          <div
            onClick={() => setIsCreateOpen(true)}
            className="group relative shrink-0 w-28 sm:w-32 h-44 sm:h-48 rounded-2xl overflow-hidden cursor-pointer shadow-xs hover:shadow-md transition-all border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between"
          >
            <div className="relative h-32 sm:h-36 overflow-hidden bg-slate-100 dark:bg-slate-800">
              <img
                src={currentUser.avatar}
                alt="My Avatar"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
            </div>

            <div className="relative h-12 bg-white dark:bg-slate-900 flex flex-col items-center justify-center pt-2">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md ring-4 ring-white dark:ring-slate-900 group-hover:scale-110 transition-transform">
                <Plus className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-200">
                Create Story
              </span>
            </div>
          </div>
        )}

        {/* OTHER USERS' STORIES */}
        {otherUserIds.map((userId) => {
          const userStories = storiesByUser[userId];
          const latestStory = userStories[0];
          const author = storage.getUserById(userId);
          const hasUnseen = userStories.some(
            (s) => !s.viewers.some((v) => v.userId === currentUser.id)
          );

          return (
            <div
              key={userId}
              onClick={() => {
                const flatIndex = stories.findIndex((s) => s.id === latestStory.id);
                setSelectedStoryIndex(flatIndex >= 0 ? flatIndex : 0);
              }}
              className="group relative shrink-0 w-28 sm:w-32 h-44 sm:h-48 rounded-2xl overflow-hidden cursor-pointer shadow-xs hover:shadow-md transition-all border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between"
            >
              {/* Background preview */}
              {latestStory.type === 'image' ? (
                <img
                  src={latestStory.mediaUrl}
                  alt="Story thumbnail"
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : latestStory.type === 'video' ? (
                <div className="absolute inset-0 w-full h-full bg-slate-900">
                  <video
                    src={latestStory.mediaUrl}
                    className="w-full h-full object-cover"
                    muted
                  />
                  <div className="absolute top-2.5 right-2.5 z-10 w-5 h-5 rounded-full bg-black/60 backdrop-blur-xs flex items-center justify-center text-white">
                    <Video className="w-3 h-3" />
                  </div>
                </div>
              ) : (
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${
                    latestStory.backgroundGradient || 'from-indigo-600 to-pink-600'
                  } flex items-center justify-center p-3 text-center text-[10px] sm:text-xs text-white font-medium line-clamp-3`}
                >
                  {latestStory.content}
                </div>
              )}

              {/* Dark overlay for contrast */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/85" />

              {/* Author Avatar with dynamic gradient ring */}
              <div className="relative z-10 p-2.5 flex items-center justify-between">
                <div
                  className={`p-0.5 rounded-full transition-all ${
                    hasUnseen
                      ? 'bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-500 ring-2 ring-indigo-500/20'
                      : 'bg-slate-400/80'
                  }`}
                >
                  <img
                    src={author?.avatar}
                    alt={author?.name}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-white dark:ring-slate-900 group-hover:scale-105 transition-transform"
                  />
                </div>

                {/* Multiple stories indicator badge */}
                {userStories.length > 1 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-black/50 backdrop-blur-xs text-[9px] font-bold text-white">
                    {userStories.length}
                  </span>
                )}
              </div>

              {/* Author Name and Timestamp */}
              <div className="relative z-10 p-2.5 leading-tight">
                <p className="text-white text-xs font-bold truncate drop-shadow">
                  {author?.name.split(' ')[0]}
                </p>
                <span className="text-[10px] text-white/70 drop-shadow">
                  {getRelativeTime(latestStory.createdAt)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Story Viewer Modal */}
      {selectedStoryIndex !== null && (
        <StoryViewerModal
          stories={stories}
          initialIndex={selectedStoryIndex}
          isOpen={true}
          onClose={() => setSelectedStoryIndex(null)}
          onNavigateToProfile={onNavigateToProfile}
        />
      )}

      {/* Create Story Modal */}
      <CreateStoryModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
};
