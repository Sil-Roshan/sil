import { Car, Mail, MessageCircle, Megaphone } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { translations } from '../utils/translations';

export function NeighborsScreen() {
  const { language } = useApp();
  const t = translations[language];
  const tiles = [
    {
      key: 'parking',
      label: t.neighborParking,
      description: t.neighborParkingDesc,
      icon: Car,
      accent: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200',
    },
    {
      key: 'invites',
      label: t.neighborInvites,
      description: t.neighborInvitesDesc,
      icon: Mail,
      accent: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200',
    },
    {
      key: 'chat',
      label: t.neighborChat,
      description: t.neighborChatDesc,
      icon: MessageCircle,
      accent: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200',
    },
    {
      key: 'notice',
      label: t.neighborNotice,
      description: t.neighborNoticeDesc,
      icon: Megaphone,
      accent: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-200',
    },
  ];

  return (
    <section className="p-4 space-y-4">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{t.neighbors}</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">{t.neighborIntro}</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {tiles.map(({ key, label, description, icon: Icon, accent }) => (
          <button
            key={key}
            type="button"
            className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition hover:border-[#24582a] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#24582a]/60"
          >
            <span className={`flex items-center justify-center w-12 h-12 rounded-lg ${accent}`}>
              <Icon className="w-5 h-5" />
            </span>
            <span className="flex flex-col items-start text-right rtl:text-right">
              <span className="text-sm font-medium text-gray-900 dark:text-white">{label}</span>
              <span className="text-xs text-gray-600 dark:text-gray-400">{description}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
