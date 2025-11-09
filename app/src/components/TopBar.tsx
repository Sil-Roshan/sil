import { Home, Users, Wrench, Building2, Settings } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { translations } from '../utils/translations';

type TabKey = 'community' | 'neighbors' | 'services' | 'realestate' | 'settings';

interface TopBarProps {
  activeTab: TabKey;
}

const tabMeta: Record<TabKey, { title: keyof typeof translations.en; subtitle: keyof typeof translations.en; icon: LucideIcon }> = {
  community: { title: 'community', subtitle: 'communitySubtitle', icon: Home },
  neighbors: { title: 'neighbors', subtitle: 'neighborsSubtitle', icon: Users },
  services: { title: 'services', subtitle: 'servicesSubtitle', icon: Wrench },
  realestate: { title: 'realEstate', subtitle: 'realEstateSubtitle', icon: Building2 },
  settings: { title: 'settings', subtitle: 'settingsSubtitle', icon: Settings },
};

export function TopBar({ activeTab }: TopBarProps) {
  const { language } = useApp();
  const t = translations[language];
  const { title, subtitle, icon: Icon } = tabMeta[activeTab];

  return (
    <header className="bg-gradient-to-r from-[#24582a] to-[#2f7d38] text-white shadow-sm">
      <div className="px-4 pt-5 pb-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/15 backdrop-blur">
              <Icon className="w-5 h-5" aria-hidden="true" />
            </span>
            <div className="text-right">
              <h1 className="text-lg font-semibold">{t[title]}</h1>
              <p className="text-xs text-white/80">{t[subtitle]}</p>
            </div>
          </div>
          <span className="px-3 py-1 text-[11px] font-medium rounded-full bg-white/10">
            {t.topBarTagline}
          </span>
        </div>
      </div>
    </header>
  );
}
