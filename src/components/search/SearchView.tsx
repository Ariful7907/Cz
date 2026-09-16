import React, { useState, useEffect } from 'react';
import { Search, Hash, Users, FileText, TrendingUp, Sparkles } from 'lucide-react';
import { User, Post } from '../../types';
import { storage } from '../../services/storage';
import { PostCard } from '../feed/PostCard';

interface SearchViewProps {
  initialQuery?: string;
  onNavigateToProfile?: (userId: string) => void;
}

const TRENDING_TOPICS = [
  { tag: 'WebDev', postsCount: '1.4k posts' },
  { tag: 'AIRevolution', postsCount: '2.8k posts' },
  { tag: 'Photography', postsCount: '890 posts' },
  { tag: 'ConnectZone', postsCount: '3.1k posts' },
  { tag: 'DesignSystems', postsCount: '620 posts' },
  { tag: 'NatureWalks', postsCount: '450 posts' },
  { tag: 'RemoteWork', postsCount: '1.1k posts' },
];

export const SearchView: React.FC<SearchViewProps> = ({
  initialQuery = '',
  onNavigateToProfile,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [filterType, setFilterType] = useState<'all' | 'posts' | 'users' | 'tags'>('all');

  const allPosts = storage.getPosts();
  const allUsers = storage.getUsers().filter((u) => !u.isBanned);

  const cleanQ = query.trim().toLowerCase();

  // Matched users
  const matchedUsers = cleanQ
    ? allUsers.filter(
        (u) =>
          u.name.toLowerCase().includes(cleanQ) ||
          u.username.toLowerCase().includes(cleanQ) ||
          u.bio?.toLowerCase().includes(cleanQ)
      )
    : [];

  // Matched posts
  const matchedPosts = cleanQ
    ? allPosts.filter(
        (p) =>
          p.content.toLowerCase().includes(cleanQ) ||
          p.tags?.some((t) => t.toLowerCase().includes(cleanQ))
      )
    : [];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Search Input Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-3 px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-2xl">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ConnectZone (topics, people, #hashtags)..."
            className="w-full bg-transparent text-sm sm:text-base text-slate-900 dark:text-slate-100 focus:outline-none placeholder-slate-400"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs font-bold pt-1">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-4 py-1.5 rounded-xl transition-all ${
              filterType === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            All Results
          </button>
          <button
            type="button"
            onClick={() => setFilterType('users')}
            className={`flex items-center gap-1 px-4 py-1.5 rounded-xl transition-all ${
              filterType === 'users'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> People ({matchedUsers.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('posts')}
            className={`flex items-center gap-1 px-4 py-1.5 rounded-xl transition-all ${
              filterType === 'posts'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Posts ({matchedPosts.length})
          </button>
        </div>
      </div>

      {/* Trending Topics Cloud */}
      {!cleanQ && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <span>Trending Topics on ConnectZone</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {TRENDING_TOPICS.map((topic) => (
              <button
                key={topic.tag}
                type="button"
                onClick={() => setQuery(topic.tag)}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200/60 dark:border-slate-700/60 text-left transition-all group"
              >
                <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{topic.tag}</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">{topic.postsCount}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Results Display */}
      {cleanQ && (
        <div className="space-y-6">
          {/* Matched Users Section */}
          {(filterType === 'all' || filterType === 'users') && matchedUsers.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" /> People
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {matchedUsers.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => onNavigateToProfile?.(u.id)}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700 flex items-center gap-3 text-left transition-colors"
                  >
                    <img
                      src={u.avatar}
                      alt={u.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                        {u.name}
                      </div>
                      <div className="text-xs text-slate-400 truncate">@{u.username}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{u.bio}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matched Posts Section */}
          {(filterType === 'all' || filterType === 'posts') && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2 px-1">
                <FileText className="w-4 h-4 text-indigo-600" /> Posts ({matchedPosts.length})
              </h3>
              {matchedPosts.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-8 text-center text-xs text-slate-400">
                  No posts matched "{query}".
                </div>
              ) : (
                matchedPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onNavigateToProfile={onNavigateToProfile}
                  />
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
