import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface User {
  id: string;
  email: string;
  user_metadata?: {
    name?: string;
    phoneNumber?: string;
  };
}

interface UserProfile {
  id: string;
  email: string;
  name: string;
  phoneNumber: string;
  role: 'none' | 'guest' | 'resident' | 'owner';
  communityId: string | null;
  createdAt: string;
}

interface Community {
  id: string;
  name: string;
  address: string;
  ownerId: string;
  ownerName: string;
  memberCount: number;
  createdAt: string;
  settings: {
    allowGuestViewing: boolean;
    requireApproval: boolean;
  };
}

interface AppContextType {
  // Auth
  user: User | null;
  userProfile: UserProfile | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  loading: boolean;
  
  // Community
  community: Community | null;
  memberCount: number;
  
  // Theme & Language
  isDarkMode: boolean;
  language: 'ar' | 'en';
  
  // Actions
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, name: string, phoneNumber?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => void;
  setGuestMode: () => void;
  loadCommunity: () => Promise<void>;
  toggleDarkMode: () => void;
  setLanguage: (lang: 'ar' | 'en') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [community, setCommunity] = useState<Community | null>(null);
  const [memberCount, setMemberCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  const [isGuest, setIsGuest] = useState(false);

  const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-85e399fd`;

  // Load saved auth state on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('accessToken');
    const savedUser = localStorage.getItem('user');
    const savedProfile = localStorage.getItem('userProfile');
    const savedIsGuest = localStorage.getItem('isGuest');
    
    if (savedIsGuest === 'true') {
      setIsGuest(true);
      setLoading(false);
    } else if (savedToken && savedUser && savedProfile) {
      setAccessToken(savedToken);
      setUser(JSON.parse(savedUser));
      setUserProfile(JSON.parse(savedProfile));
      loadCommunityData(savedToken);
    } else {
      setLoading(false);
    }

    // Load theme preferences
    const savedTheme = localStorage.getItem('isDarkMode');
    if (savedTheme === 'true') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    const savedLang = localStorage.getItem('language') as 'ar' | 'en';
    if (savedLang) {
      setLanguage(savedLang);
    }
  }, []);

  const loadCommunityData = async (token: string) => {
    try {
      const response = await fetch(`${baseUrl}/communities/my-community`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.community) {
          setCommunity(data.community);
          setMemberCount(data.memberCount || 0);
        }
      }
    } catch (error) {
      console.error('Error loading community:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch(`${baseUrl}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'فشل تسجيل الدخول' };
      }

      setAccessToken(data.accessToken);
      setUser(data.user);
      setUserProfile(data.profile);
      
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('userProfile', JSON.stringify(data.profile));
      localStorage.removeItem('isGuest');

      await loadCommunityData(data.accessToken);

      return { success: true };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: 'حدث خطأ أثناء تسجيل الدخول' };
    }
  };

  const signUp = async (email: string, password: string, name: string, phoneNumber?: string) => {
    try {
      const response = await fetch(`${baseUrl}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name, phoneNumber }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'فشل إنشاء الحساب' };
      }

      // After signup, sign in automatically
      return await signIn(email, password);
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: 'حدث خطأ أثناء إنشاء الحساب' };
    }
  };

  const signOut = () => {
    setUser(null);
    setUserProfile(null);
    setAccessToken(null);
    setCommunity(null);
    setIsGuest(false);
    
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('isGuest');
  };

  const setGuestMode = () => {
    setIsGuest(true);
    localStorage.setItem('isGuest', 'true');
    setLoading(false);
  };

  const loadCommunity = async () => {
    if (!accessToken) return;
    await loadCommunityData(accessToken);
  };

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('isDarkMode', String(newMode));
    
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const changeLanguage = (lang: 'ar' | 'en') => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const value: AppContextType = {
    user,
    userProfile,
    accessToken,
    isAuthenticated: !!user && !!accessToken,
    isGuest,
    loading,
    community,
    memberCount,
    isDarkMode,
    language,
    signIn,
    signUp,
    signOut,
    setGuestMode,
    loadCommunity,
    toggleDarkMode,
    setLanguage: changeLanguage,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
