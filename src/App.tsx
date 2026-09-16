import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { SidebarLeft } from './components/layout/SidebarLeft';
import { SidebarRight } from './components/layout/SidebarRight';
import { BottomNav } from './components/layout/BottomNav';
import { FeedView } from './components/feed/FeedView';
import { ClipsView } from './components/clips/ClipsView';
import { GroupsView } from './components/groups/GroupsView';
import { FriendsView } from './components/friends/FriendsView';
import { ProfileView } from './components/profile/ProfileView';
import { SearchView } from './components/search/SearchView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ReferralDashboard } from './components/referrals/ReferralDashboard';
import { ChatDrawer } from './components/messaging/ChatDrawer';
import { AuthView } from './components/auth/AuthView';

const MainLayout: React.FC = () => {
  const { currentUser } = useAuth();

  const [currentTab, setCurrentTab] = useState<string>('feed');
  const [selectedProfileUserId, setSelectedProfileUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatTargetUserId, setChatTargetUserId] = useState<string | null>(null);

  if (!currentUser) {
    return <AuthView />;
  }

  const handleNavigateToProfile = (userId: string) => {
    setSelectedProfileUserId(userId);
    setCurrentTab('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenChatWithUser = (userId: string) => {
    setChatTargetUserId(userId);
    setIsChatOpen(true);
  };

  const handleSearchSubmit = (query: string) => {
    setSearchQuery(query);
    setCurrentTab('search');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectTab = (tab: string) => {
    if (tab === 'profile') {
      setSelectedProfileUserId(currentUser.id);
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors pb-16 sm:pb-6">
      {/* Top App Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        onOpenChat={() => {
          setChatTargetUserId(null);
          setIsChatOpen(true);
        }}
        onNavigateToProfile={handleNavigateToProfile}
        onSearchSubmit={handleSearchSubmit}
      />

      {/* Main Multi-Column Content Area */}
      <div className="max-w-7xl mx-auto w-full px-2 sm:px-4 lg:px-6 flex-1 flex justify-center gap-2 sm:gap-6">
        {/* Left Sticky Sidebar Navigation */}
        <SidebarLeft
          currentTab={currentTab}
          onSelectTab={handleSelectTab}
          onNavigateToProfile={handleNavigateToProfile}
          onOpenChat={() => setIsChatOpen(true)}
        />

        {/* Center Main Stage */}
        <main
          className={`flex-1 w-full py-4 sm:py-6 min-w-0 transition-all ${
            currentTab === 'referrals' || currentTab === 'admin'
              ? 'max-w-5xl'
              : 'max-w-3xl'
          }`}
        >
          {currentTab === 'feed' && (
            <FeedView onNavigateToProfile={handleNavigateToProfile} />
          )}

          {currentTab === 'clips' && <ClipsView />}

          {currentTab === 'groups' && (
            <GroupsView onNavigateToProfile={handleNavigateToProfile} />
          )}

          {currentTab === 'friends' && (
            <FriendsView
              onOpenChatWithUser={handleOpenChatWithUser}
              onNavigateToProfile={handleNavigateToProfile}
            />
          )}

          {currentTab === 'referrals' && <ReferralDashboard />}

          {currentTab === 'profile' && (
            <ProfileView
              userId={selectedProfileUserId || currentUser.id}
              onOpenChatWithUser={handleOpenChatWithUser}
              onNavigateToProfile={handleNavigateToProfile}
              onNavigateToReferrals={() => handleSelectTab('referrals')}
            />
          )}

          {currentTab === 'search' && (
            <SearchView
              initialQuery={searchQuery}
              onNavigateToProfile={handleNavigateToProfile}
            />
          )}

          {currentTab === 'admin' && <AdminDashboard />}
        </main>

        {/* Right Sticky Sidebar (Trending & Contacts) */}
        {currentTab !== 'clips' && (
          <SidebarRight
            onOpenChatWithUser={handleOpenChatWithUser}
            onNavigateToProfile={handleNavigateToProfile}
            onSelectTag={(tag) => handleSearchSubmit(tag)}
          />
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        onNavigateToProfile={handleNavigateToProfile}
      />

      {/* Real-time Style Private Chat Drawer */}
      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => {
          setIsChatOpen(false);
          setChatTargetUserId(null);
        }}
        targetUserId={chatTargetUserId}
        onNavigateToProfile={handleNavigateToProfile}
      />
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <MainLayout />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
