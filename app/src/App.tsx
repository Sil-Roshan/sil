import { useState, useEffect } from 'react';
import { Home, Wrench, Building2, Settings, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { AppProvider, useApp } from './contexts/AppContext';
import { SplashScreen } from './components/SplashScreen';
import { AuthScreen } from './components/AuthScreen';
import { CommunitySelection } from './components/CommunitySelection';
import { CommunityFeed } from './components/CommunityFeed';
import { ServicesScreen } from './components/ServicesScreen';
import { NeighborsScreen } from './components/NeighborsScreen';
import { RealEstateScreen } from './components/RealEstateScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { Toaster } from './components/ui/sonner';
import { translations } from './utils/translations';

type TabKey = 'community' | 'neighbors' | 'services' | 'realestate' | 'settings';

function AppContent() {
  const [showSplash, setShowSplash] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [showCommunitySelection, setShowCommunitySelection] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('community');

  const { isAuthenticated, isGuest, community, loading, language } = useApp();
  const t = translations[language];

  useEffect(() => {
    // Wait for auth state to load
    if (!loading) {
      if (!isAuthenticated && !isGuest) {
        setShowAuth(true);
      } else if (isAuthenticated && !community && !isGuest) {
        setShowCommunitySelection(true);
      }
    }
  }, [isAuthenticated, isGuest, community, loading]);

  // Show splash screen
  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  // Show auth screen
  if (showAuth && !isAuthenticated && !isGuest) {
    return <AuthScreen onComplete={() => setShowAuth(false)} />;
  }

  // Show community selection for authenticated users without a community
  if (showCommunitySelection && isAuthenticated && !community) {
    return <CommunitySelection onComplete={() => setShowCommunitySelection(false)} />;
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">{t.loading}</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'community':
        return <CommunityFeed />;
      case 'realestate':
        return <RealEstateScreen />;
      case 'settings':
        return <SettingsScreen />;
      case 'neighbors':
        return <NeighborsScreen />;
      case 'services':
        return <ServicesScreen />;
      default:
        return <CommunityFeed />;
    }
  };

  const navTabs: Array<{ key: TabKey; icon: LucideIcon; label: string; main?: boolean }> = [
    { key: 'services', icon: Wrench, label: t.services },
    { key: 'neighbors', icon: Users, label: t.neighbors },
    { key: 'community', icon: Home, label: t.community, main: true },
    { key: 'realestate', icon: Building2, label: t.realEstate },
    { key: 'settings', icon: Settings, label: t.settings },
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950 max-w-md mx-auto" dir="rtl">
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>

      {/* Bottom Navigation */}
      <nav className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-4 py-2 safe-area-inset-bottom">
        <div className="flex items-center justify-around">
          {navTabs.map(({ key, icon: Icon, label, main }) => {
            const isActive = activeTab === key;
            const baseClasses = 'flex flex-col items-center gap-1 rounded-lg transition-colors';
            const sizeClasses = main ? 'px-4 py-3 rounded-full' : 'px-3 py-2';
            const stateClasses = main
              ? isActive
                ? 'bg-[#24582a] text-white shadow-lg'
                : 'bg-[#24582a]/10 text-[#24582a]'
              : isActive
                ? 'text-[#24582a]'
                : 'text-gray-600 dark:text-gray-400';
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`${baseClasses} ${sizeClasses} ${stateClasses}`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
      <Toaster position="top-center" dir="rtl" />
    </AppProvider>
  );
}
