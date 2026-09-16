import React, { useState, useEffect } from 'react';
import { Sparkles, Flame, Users, Image as ImageIcon } from 'lucide-react';
import { Post, Story } from '../../types';
import { storage, subscribeToStorage } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import { StoriesBar } from '../stories/StoriesBar';
import { CreatePostBox } from './CreatePostBox';
import { PostCard } from './PostCard';

interface FeedViewProps {
  onNavigateToProfile: (userId: string) => void;
}

export const FeedView: React.FC<FeedViewProps> = ({ onNavigateToProfile }) => {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState<Post[]>(() => storage.getPosts());
  const [stories, setStories] = useState<Story[]>(() => storage.getStories());
  const [feedFilter, setFeedFilter] = useState<'foryou' | 'following' | 'media'>('foryou');

  useEffect(() => {
    return subscribeToStorage(() => {
      setPosts(storage.getPosts());
      setStories(storage.getStories());
    });
  }, []);

  const me = storage.getUserById(currentUser.id) || currentUser;

  // Filter logic
  const filteredPosts = posts.filter((post) => {
    if (feedFilter === 'following') {
      return (
        post.authorId === me.id ||
        me.following?.includes(post.authorId) ||
        me.friends?.includes(post.authorId)
      );
    }
    if (feedFilter === 'media') {
      return post.media && post.media.length > 0;
    }
    return true; // 'foryou'
  });

  return (
    <div className="space-y-5 max-w-xl mx-auto">
      {/* 24h Stories Bar */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-3 sm:p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <StoriesBar stories={stories} onNavigateToProfile={onNavigateToProfile} />
      </section>

      {/* Quick Post Creator Box */}
      <CreatePostBox />

      {/* Feed Filters */}
      <div className="flex items-center justify-between px-2 pt-1">
        <div className="flex items-center gap-1 bg-slate-200/70 dark:bg-slate-800 p-1 rounded-2xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setFeedFilter('foryou')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all ${
              feedFilter === 'foryou'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>For You</span>
          </button>

          <button
            type="button"
            onClick={() => setFeedFilter('following')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all ${
              feedFilter === 'following'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Following</span>
          </button>

          <button
            type="button"
            onClick={() => setFeedFilter('media')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all ${
              feedFilter === 'media'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Photos & Videos</span>
          </button>
        </div>

        <span className="text-[11px] text-slate-400 hidden sm:inline">
          {filteredPosts.length} posts
        </span>
      </div>

      {/* Posts Stream */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center text-slate-400 text-xs border border-slate-200/80 dark:border-slate-800 space-y-3">
            <p className="font-semibold text-sm text-slate-600 dark:text-slate-300">
              No posts found in this stream
            </p>
            <p className="text-xs max-w-xs mx-auto">
              Follow more people, join active community groups, or post an update above!
            </p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onNavigateToProfile={onNavigateToProfile}
            />
          ))
        )}
      </div>
    </div>
  );
};
