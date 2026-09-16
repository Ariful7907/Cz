import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  FileText,
  Flag,
  Trash2,
  Ban,
  CheckCircle,
  AlertTriangle,
  FolderOpen,
  Search,
} from 'lucide-react';
import { User, Post, Report, Group } from '../../types';
import { storage, subscribeToStorage } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { AdminReferralsPanel } from './AdminReferralsPanel';

export const AdminDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'users' | 'posts' | 'referrals'>('overview');
  const [users, setUsers] = useState<User[]>(() => storage.getUsers());
  const [posts, setPosts] = useState<Post[]>(() => storage.getPosts());
  const [groups, setGroups] = useState<Group[]>(() => storage.getGroups());
  const [reports, setReports] = useState<Report[]>(() => storage.getReports());
  const [userSearch, setUserSearch] = useState('');

  useEffect(() => {
    return subscribeToStorage(() => {
      setUsers(storage.getUsers());
      setPosts(storage.getPosts());
      setGroups(storage.getGroups());
      setReports(storage.getReports());
    });
  }, []);

  const pendingReports = reports.filter((r) => r.status === 'pending');

  const handleResolveReport = (reportId: string, action: 'dismiss' | 'action_taken') => {
    storage.resolveReport(reportId, action);
    showToast(`Report marked as ${action === 'dismiss' ? 'dismissed' : 'action taken'}`, 'info');
  };

  const handleToggleBanUser = (user: User) => {
    storage.toggleBanUser(user.id);
    showToast(user.isBanned ? `Unbanned ${user.name}` : `Banned ${user.name}`, 'info');
  };

  const handleDeletePost = (postId: string) => {
    if (window.confirm('Delete this post permanently as admin?')) {
      storage.deletePost(postId);
      showToast('Post removed by administrator', 'info');
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" /> Admin Console
            </span>
            <span className="text-xs text-slate-400">Restricted Access</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black mt-2">ConnectZone Moderation & Stats</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
            Monitor platform activity, resolve community flag reports, regulate user standing, and manage public content.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase">Total Users</span>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
              {users.length}
            </div>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl text-indigo-600 dark:text-indigo-400">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase">Total Posts</span>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
              {posts.length}
            </div>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl text-emerald-600 dark:text-emerald-400">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase">Communities</span>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
              {groups.length}
            </div>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/60 rounded-xl text-amber-600 dark:text-amber-400">
            <FolderOpen className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase">Pending Flags</span>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
              {pendingReports.length}
            </div>
          </div>
          <div className="p-3 bg-rose-50 dark:bg-rose-950/60 rounded-xl text-rose-600 dark:text-rose-400">
            <Flag className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'overview'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Reports Queue ({pendingReports.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'users'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          User Accounts ({users.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('posts')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'posts'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Post Moderation ({posts.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('referrals')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'referrals'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <span>Referrals & Payouts</span>
          {(storage.getWithdrawalRequests().filter((w) => w.status === 'pending').length > 0 ||
            storage.getFraudFlags().filter((f) => f.status === 'flagged').length > 0) && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          )}
        </button>
      </div>

      {/* Tab: Reports Queue */}
      {activeTab === 'overview' && (
        <div className="space-y-3">
          {reports.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center text-slate-400 text-xs border border-slate-200/80 dark:border-slate-800">
              No reports submitted yet. Everything is serene and peaceful!
            </div>
          ) : (
            reports.map((r) => {
              const reporter = storage.getUserById(r.reporterId);
              const targetPost = r.targetType === 'post' ? storage.getPostById(r.targetId) : null;
              const targetUser = r.targetType === 'user' ? storage.getUserById(r.targetId) : null;

              return (
                <div
                  key={r.id}
                  className={`bg-white dark:bg-slate-900 p-5 rounded-2xl border shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    r.status === 'pending'
                      ? 'border-rose-300 dark:border-rose-900/60'
                      : 'border-slate-200/80 dark:border-slate-800 opacity-60'
                  }`}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                        {r.reason}
                      </span>
                      <span className="text-xs text-slate-400">
                        Reported {new Date(r.createdAt).toLocaleDateString()} by {reporter?.name}
                      </span>
                    </div>

                    <div className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                      Target: <span className="font-bold">{r.targetType.toUpperCase()}</span> (
                      {r.targetId})
                    </div>

                    {targetPost && (
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs text-slate-600 dark:text-slate-300 italic border border-slate-200/50">
                        "{targetPost.content}"
                      </div>
                    )}
                  </div>

                  {r.status === 'pending' ? (
                    <div className="flex items-center gap-2">
                      {targetPost && (
                        <button
                          type="button"
                          onClick={() => {
                            handleDeletePost(targetPost.id);
                            handleResolveReport(r.id, 'action_taken');
                          }}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete Post
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleResolveReport(r.id, 'dismiss')}
                        className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors"
                      >
                        Dismiss
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Resolved
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab: Users Accounts */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs w-72">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search by name, email, @handle..."
                className="bg-transparent flex-1 text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Joined</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar}
                          alt={u.name}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-slate-100">{u.name}</div>
                          <div className="text-slate-400">@{u.username} • {u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-semibold capitalize">{u.role}</td>
                    <td className="p-4">
                      {u.isBanned ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-bold text-[10px]">
                          Banned
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold text-[10px]">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-slate-400">
                      {new Date(u.joinedDate).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      {u.id !== currentUser.id && (
                        <button
                          type="button"
                          onClick={() => handleToggleBanUser(u)}
                          className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                            u.isBanned
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : 'bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-300'
                          }`}
                        >
                          {u.isBanned ? 'Unban User' : 'Ban User'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Posts Moderation */}
      {activeTab === 'posts' && (
        <div className="space-y-3">
          {posts.map((post) => {
            const author = storage.getUserById(post.authorId);

            return (
              <div
                key={post.id}
                className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <img
                    src={author?.avatar}
                    alt={author?.name}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                        {author?.name}
                      </span>
                      <span className="text-xs text-slate-400">@{author?.username}</span>
                      <span className="text-xs text-slate-400">• {new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 line-clamp-2">
                      {post.content}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeletePost(post.id)}
                  className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                  title="Delete Post"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab: Referrals & Payouts Moderation */}
      {activeTab === 'referrals' && <AdminReferralsPanel />}
    </div>
  );
};
