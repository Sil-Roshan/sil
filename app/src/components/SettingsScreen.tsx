import { useState } from 'react';
import {
  User,
  Shield,
  Bell,
  Car,
  Home,
  LogOut,
  Lock,
  Eye,
  MessageSquare,
  Moon,
  Sun,
  Languages,
  Palette,
  Key,
  Copy,
  Users,
} from 'lucide-react';
import { Card } from './ui/card';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { useApp } from '../contexts/AppContext';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';
import { translations } from '../utils/translations';

export function SettingsScreen() {
  const { userProfile, community, signOut, isDarkMode, toggleDarkMode, language, setLanguage } = useApp();
  const t = translations[language];
  const [settings, setSettings] = useState({
    showName: true,
    showApartment: true,
    showCarInfo: false,
    allowVisitorMessages: true,
    parkingAlerts: true,
    communityUpdates: true,
    serviceRecommendations: false,
  });

  const [showJoinCodeDialog, setShowJoinCodeDialog] = useState(false);
  const [newCodeRecipient, setNewCodeRecipient] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [loading, setLoading] = useState(false);

  const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-85e399fd`;

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const generateJoinCode = async () => {
    if (!community) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/communities/${community.id}/generate-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          recipientName: newCodeRecipient,
          expiresInDays: 7,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setGeneratedCode(data.joinCode);
        toast.success(language === 'ar' ? 'تم إنشاء كود الانضمام بنجاح!' : 'Join code created successfully!');
      } else {
        toast.error(data.error || (language === 'ar' ? 'فشل إنشاء الكود' : 'Failed to create code'));
      }
    } catch (error) {
      console.error('Error generating code:', error);
      toast.error(language === 'ar' ? 'حدث خطأ أثناء إنشاء الكود' : 'Error creating code');
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      toast.success(language === 'ar' ? 'تم نسخ الكود' : 'Code copied');
    }
  };

  const isOwner = userProfile?.role === 'owner';

  return (
    <div className="min-h-screen bg-[#e8e7dc] dark:bg-gray-950 pb-4">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-4">
        <h1 className="text-[#24582a]">{t.settings}</h1>
      </div>

      {/* Profile Section */}
      <div className="p-4">
        <Card className="p-4 dark:bg-gray-900 dark:border-gray-800">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="bg-[#e8e7dc] text-[#24582a] text-xl">
                {userProfile?.name?.substring(0, 2) || 'أد'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-gray-900 dark:text-gray-100">{userProfile?.name || 'مستخدم'}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {userProfile?.email}
              </p>
              {community && (
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-gray-500 dark:text-gray-500">{community.name}</p>
                  {isOwner && (
                    <span className="text-xs bg-[#e8e7dc] text-[#24582a] px-2 py-0.5 rounded-full">
                      مالك
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Owner Controls */}
      {isOwner && community && (
        <div className="px-4 pb-4">
          <div className="flex items-center gap-2 mb-3">
            <Key className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            <h2 className="text-gray-900 dark:text-gray-100">{t.communityManagement}</h2>
          </div>
          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <Dialog open={showJoinCodeDialog} onOpenChange={setShowJoinCodeDialog}>
              <DialogTrigger asChild>
                <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                      <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="text-right">
                      <p className="text-gray-900 dark:text-gray-100">{t.generateJoinCode}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t.generateJoinCodeDesc}
                      </p>
                    </div>
                  </div>
                </button>
              </DialogTrigger>
              <DialogContent className="dark:bg-gray-900 dark:border-gray-700">
                <DialogHeader>
                  <DialogTitle className="dark:text-gray-100">{t.newJoinCode}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {!generatedCode ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="recipient" className="dark:text-gray-200">
                          {t.recipientNameOptional}
                        </Label>
                        <Input
                          id="recipient"
                          value={newCodeRecipient}
                          onChange={(e) => setNewCodeRecipient(e.target.value)}
                          placeholder={t.recipientNameExample}
                          className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                        />
                      </div>
                      <Button
                        onClick={generateJoinCode}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-green-600 to-teal-600 dark:from-green-500 dark:to-teal-500"
                      >
                        {loading ? t.generating : t.generateCode}
                      </Button>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t.joinCode}</p>
                        <p className="text-3xl tracking-widest text-green-700 dark:text-green-400 mb-4">
                          {generatedCode}
                        </p>
                        <Button
                          onClick={copyCode}
                          variant="outline"
                          size="sm"
                          className="gap-2 dark:border-gray-600"
                        >
                          <Copy className="w-4 h-4" />
                          {t.copyCode}
                        </Button>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                        {t.codeValidDays}
                      </p>
                      <Button
                        onClick={() => {
                          setGeneratedCode('');
                          setNewCodeRecipient('');
                          setShowJoinCodeDialog(false);
                        }}
                        variant="outline"
                        className="w-full dark:border-gray-600"
                      >
                        {t.close}
                      </Button>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </Card>
        </div>
      )}

      {/* Privacy Section */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-2 mb-3">
          <Lock className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          <h2 className="text-gray-900 dark:text-gray-100">{t.privacy}</h2>
        </div>
        <Card className="divide-y divide-gray-200 dark:divide-gray-800 dark:bg-gray-900 dark:border-gray-800">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#e8e7dc] flex items-center justify-center">
                <Eye className="w-5 h-5 text-[#24582a]" />
              </div>
              <div>
                <Label htmlFor="show-name" className="cursor-pointer dark:text-gray-100">
                  {t.showMyName}
                </Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t.showNameDesc}
                </p>
              </div>
            </div>
            <Switch
              id="show-name"
              checked={settings.showName}
              onCheckedChange={() => handleToggle('showName')}
            />
          </div>

          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#e8e7dc] flex items-center justify-center">
                <Home className="w-5 h-5 text-[#24582a]" />
              </div>
              <div>
                <Label htmlFor="show-apt" className="cursor-pointer dark:text-gray-100">
                  {t.showApartment}
                </Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t.showApartmentDesc}
                </p>
              </div>
            </div>
            <Switch
              id="show-apt"
              checked={settings.showApartment}
              onCheckedChange={() => handleToggle('showApartment')}
            />
          </div>

          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#e8e7dc] flex items-center justify-center">
                <Car className="w-5 h-5 text-[#24582a]" />
              </div>
              <div>
                <Label htmlFor="show-car" className="cursor-pointer dark:text-gray-100">
                  {t.shareCarInfo}
                </Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t.shareCarInfoDesc}
                </p>
              </div>
            </div>
            <Switch
              id="show-car"
              checked={settings.showCarInfo}
              onCheckedChange={() => handleToggle('showCarInfo')}
            />
          </div>

          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#e8e7dc] flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-[#24582a]" />
              </div>
              <div>
                <Label htmlFor="visitor-msg" className="cursor-pointer dark:text-gray-100">
                  {t.allowVisitorMessages}
                </Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t.allowVisitorMessagesDesc}
                </p>
              </div>
            </div>
            <Switch
              id="visitor-msg"
              checked={settings.allowVisitorMessages}
              onCheckedChange={() => handleToggle('allowVisitorMessages')}
            />
          </div>
        </Card>
      </div>

      {/* Account Section */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-2 mb-3">
          <User className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          <h2 className="text-gray-900 dark:text-gray-100">{t.account}</h2>
        </div>
        <Card className="divide-y divide-gray-200 dark:divide-gray-800 dark:bg-gray-900 dark:border-gray-800">
          <button className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-right">
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
              <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <p className="text-gray-900 dark:text-gray-100">{t.editProfile}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t.editProfileDesc}
              </p>
            </div>
          </button>

          <button className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-right">
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
              <Lock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <p className="text-gray-900 dark:text-gray-100">{t.changePassword}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t.changePasswordDesc}
              </p>
            </div>
          </button>

          <button className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-right">
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
              <Car className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <p className="text-gray-900 dark:text-gray-100">{t.manageVehicle}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t.manageVehicleDesc}
              </p>
            </div>
          </button>
        </Card>
      </div>

      {/* Notifications Section */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-2 mb-3">
          <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          <h2 className="text-gray-900 dark:text-gray-100">{t.notifications}</h2>
        </div>
        <Card className="divide-y divide-gray-200 dark:divide-gray-800 dark:bg-gray-900 dark:border-gray-800">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                <Car className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <Label htmlFor="parking" className="cursor-pointer dark:text-gray-100">
                  {t.parkingNotifications}
                </Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t.parkingNotificationsDesc}
                </p>
              </div>
            </div>
            <Switch
              id="parking"
              checked={settings.parkingAlerts}
              onCheckedChange={() => handleToggle('parkingAlerts')}
            />
          </div>

          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                <Bell className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <Label htmlFor="updates" className="cursor-pointer dark:text-gray-100">
                  {t.communityUpdates}
                </Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t.communityUpdatesDesc}
                </p>
              </div>
            </div>
            <Switch
              id="updates"
              checked={settings.communityUpdates}
              onCheckedChange={() => handleToggle('communityUpdates')}
            />
          </div>

          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <Label htmlFor="services" className="cursor-pointer dark:text-gray-100">
                  {t.serviceRecommendations}
                </Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t.serviceRecommendationsDesc}
                </p>
              </div>
            </div>
            <Switch
              id="services"
              checked={settings.serviceRecommendations}
              onCheckedChange={() => handleToggle('serviceRecommendations')}
            />
          </div>
        </Card>
      </div>

      {/* Appearance & Language Section */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-2 mb-3">
          <Palette className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          <h2 className="text-gray-900 dark:text-gray-100">{t.appearance}</h2>
        </div>
        <Card className="divide-y divide-gray-200 dark:divide-gray-800 dark:bg-gray-900 dark:border-gray-800">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                {isDarkMode ? (
                  <Moon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                ) : (
                  <Sun className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                )}
              </div>
              <div>
                <Label htmlFor="dark-mode" className="cursor-pointer dark:text-gray-100">
                  {isDarkMode ? t.darkMode : t.lightMode}
                </Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t.changeAppearance}
                </p>
              </div>
            </div>
            <Switch
              id="dark-mode"
              checked={isDarkMode}
              onCheckedChange={toggleDarkMode}
            />
          </div>

          <button
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                <Languages className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="text-right">
                <p className="text-gray-900 dark:text-gray-100">{t.language}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {language === 'ar' ? t.arabic : t.english}
                </p>
              </div>
            </div>
          </button>
        </Card>
      </div>

      {/* Logout */}
      <div className="px-4 pb-8">
        <Button
          onClick={signOut}
          variant="outline"
          className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 dark:border-red-800"
        >
          <LogOut className="w-4 h-4 ml-2" />
          {t.logout}
        </Button>
      </div>

      {/* Version */}
      <div className="text-center pb-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">{t.version}</p>
      </div>
    </div>
  );
}
