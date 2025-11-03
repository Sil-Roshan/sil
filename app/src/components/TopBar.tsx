import { Moon, Sun, Languages } from 'lucide-react';
import { Button } from './ui/button';
import { useApp } from '../contexts/AppContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export function TopBar() {
  const { isDarkMode, toggleDarkMode, language, setLanguage } = useApp();

  const translations = {
    ar: {
      darkMode: 'الوضع الليلي',
      lightMode: 'الوضع النهاري',
      language: 'اللغة',
      arabic: 'العربية',
      english: 'English'
    },
    en: {
      darkMode: 'Dark Mode',
      lightMode: 'Light Mode',
      language: 'Language',
      arabic: 'العربية',
      english: 'English'
    }
  };

  const t = translations[language];

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
      
    </div>
  );
}
