import React, { useState, useEffect } from 'react';
import { Users, Plus, Globe, Lock, Search } from 'lucide-react';
import { Group } from '../../types';
import { storage, subscribeToStorage } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { CreateGroupModal } from './CreateGroupModal';
import { GroupDetailModal } from './GroupDetailModal';

export const GroupsView: React.FC<{ onNavigateToProfile?: (userId: string) => void }> = ({
  onNavigateToProfile,
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [groups, setGroups] = useState<Group[]>(() => storage.getGroups());
  const [filter, setFilter] = useState<'all' | 'my'>('all');
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  useEffect(() => {
    return subscribeToStorage(() => {
      setGroups(storage.getGroups());
    });
  }, []);

  const filteredGroups = groups.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.category.toLowerCase().includes(search.toLowerCase()) ||
      g.description.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (filter === 'my') return g.memberIds.includes(currentUser.id);
    return true;
  });

  const handleToggleJoin = (e: React.MouseEvent, g: Group) => {
    e.stopPropagation();
    storage.toggleJoinGroup(g.id, currentUser.id);
    const isMember = g.memberIds.includes(currentUser.id);
    showToast(isMember ? `Left ${g.name}` : `Joined ${g.name}!`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider">
            Communities
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-2">ConnectZone Groups</h1>
          <p className="text-white/80 text-xs sm:text-sm max-w-md mt-1">
            Connect around shared hobbies, engineering frameworks, creative arts, and local meetups.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-700 hover:bg-slate-100 font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-transform hover:scale-105"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Create Group
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === 'all'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Discover All
          </button>
          <button
            type="button"
            onClick={() => setFilter('my')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === 'my'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            My Groups ({groups.filter((g) => g.memberIds.includes(currentUser.id)).length})
          </button>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs flex-1 sm:max-w-xs">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search groups..."
            className="bg-transparent flex-1 text-slate-900 dark:text-slate-100 focus:outline-none"
          />
        </div>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGroups.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-400 text-xs">
            No groups match your search criteria.
          </div>
        ) : (
          filteredGroups.map((g) => {
            const isMember = g.memberIds.includes(currentUser.id);

            return (
              <div
                key={g.id}
                onClick={() => setSelectedGroup(g)}
                className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-32 w-full overflow-hidden">
                    <img
                      src={g.coverImage}
                      alt={g.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-black/50 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider">
                      {g.category}
                    </span>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {g.name}
                      </h3>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {g.description}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800/80 mt-2 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{g.memberIds.length} members</span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleToggleJoin(e, g)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                      isMember
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                    }`}
                  >
                    {isMember ? 'Joined' : 'Join'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <CreateGroupModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={(newId) => {
          const created = storage.getGroups().find((g) => g.id === newId);
          if (created) setSelectedGroup(created);
        }}
      />

      {selectedGroup && (
        <GroupDetailModal
          group={selectedGroup}
          isOpen={true}
          onClose={() => setSelectedGroup(null)}
          onNavigateToProfile={onNavigateToProfile}
        />
      )}
    </div>
  );
};
