import { useState, useEffect } from 'react';
import { Home, Wrench, Car, Building2, Settings } from 'lucide-react';
import { AppProvider, useApp } from './contexts/AppContext';
import { SplashScreen } from './components/SplashScreen';
import { AuthScreen } from './components/AuthScreen';
import { CommunitySelection } from './components/CommunitySelection';
import { TopBar } from './components/TopBar';
import { CommunityFeed } from './components/CommunityFeed';
import { ServicesScreen } from './components/ServicesScreen';
import { ParkingAlerts } from './components/ParkingAlerts';
import { RealEstateScreen } from './components/RealEstateScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { Toaster } from './components/ui/sonner';
import { translations } from './utils/translations';

function AppContent() {
  const [showSplash, setShowSplash] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [showCommunitySelection, setShowCommunitySelection] = useState(false);
  const [activeTab, setActiveTab] = useState('community');

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
      case 'services':
        return <ServicesScreen />;
      case 'parking':
        return <ParkingAlerts />;
      case 'realestate':
        return <RealEstateScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <CommunityFeed />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950 max-w-md mx-auto" dir="rtl">
      {/* Top Bar */}
      <TopBar />

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>

      {/* Bottom Navigation */}
      <nav className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-4 py-2 safe-area-inset-bottom">
        <div className="flex items-center justify-around">
          <button
            onClick={() => setActiveTab('community')}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
              activeTab === 'community' ? 'text-[#24582a]' : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <Home className="w-6 h-6" />
            <span className="text-xs">{t.community}</span>
          </button>

          <button
            onClick={() => setActiveTab('services')}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
              activeTab === 'services' ? 'text-[#24582a]' : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <Wrench className="w-6 h-6" />
            <span className="text-xs">{t.services}</span>
          </button>

          <button
            onClick={() => setActiveTab('parking')}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
              activeTab === 'parking' ? 'text-[#24582a]' : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <Car className="w-6 h-6" />
            <span className="text-xs">{t.parking}</span>
          </button>

          <button
            onClick={() => setActiveTab('realestate')}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
              activeTab === 'realestate' ? 'text-[#24582a]' : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <Building2 className="w-6 h-6" />
            <span className="text-xs">{t.realEstate}</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
              activeTab === 'settings' ? 'text-[#24582a]' : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <Settings className="w-6 h-6" />
            <span className="text-xs">{t.settings}</span>
          </button>
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
