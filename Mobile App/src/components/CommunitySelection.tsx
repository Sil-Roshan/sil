import { useState } from 'react';
import { motion } from 'motion/react';
import { Building2, Plus, LogIn, Key, MapPin, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { useApp } from '../contexts/AppContext';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

interface CommunitySelectionProps {
  onComplete: () => void;
}

export function CommunitySelection({ onComplete }: CommunitySelectionProps) {
  const [mode, setMode] = useState<'choice' | 'create' | 'join'>('choice');
  const [loading, setLoading] = useState(false);
  const { accessToken, loadCommunity, isGuest, userProfile } = useApp();

  // Create community form
  const [communityName, setCommunityName] = useState('');
  const [communityAddress, setCommunityAddress] = useState('');
  const [authCode, setAuthCode] = useState('');

  // Join community form
  const [joinCode, setJoinCode] = useState('');

  const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-85e399fd`;

  const handleCreateCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${baseUrl}/communities/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: communityName,
          address: communityAddress,
          authorizationCode: authCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'فشل إنشاء المجتمع');
        setLoading(false);
        return;
      }

      toast.success('تم إنشاء المجتمع بنجاح!');
      await loadCommunity();
      onComplete();
    } catch (error) {
      console.error('Error creating community:', error);
      toast.error('حدث خطأ أثناء إنشاء المجتمع');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${baseUrl}/communities/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          joinCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'فشل الانضمام للمجتمع');
        setLoading(false);
        return;
      }

      toast.success('تم الانضمام للمجتمع بنجاح!');
      await loadCommunity();
      onComplete();
    } catch (error) {
      console.error('Error joining community:', error);
      toast.error('حدث خطأ أثناء الانضمام للمجتمع');
    } finally {
      setLoading(false);
    }
  };

  // Guest users skip this screen
  if (isGuest) {
    onComplete();
    return null;
  }

  if (mode === 'create') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4" dir="rtl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#e8e7dc] rounded-full mb-4">
                <Building2 className="w-8 h-8 text-[#24582a]" />
              </div>
              <h2 className="text-gray-900 mb-2" style={{ fontSize: '24px', fontWeight: '600' }}>
                إنشاء مجتمع جديد
              </h2>
              <p className="text-gray-600 text-sm">
                أنت بحاجة لكود تفويض من الإدارة لإنشاء مجتمع
              </p>
            </div>

            <form onSubmit={handleCreateCommunity} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">اسم المجتمع / المبنى</Label>
                <div className="relative">
                  <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    value={communityName}
                    onChange={(e) => setCommunityName(e.target.value)}
                    className="pr-10"
                    placeholder="مثال: برج النخيل"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">العنوان</Label>
                <div className="relative">
                  <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="address"
                    type="text"
                    value={communityAddress}
                    onChange={(e) => setCommunityAddress(e.target.value)}
                    className="pr-10"
                    placeholder="الرياض، حي النخيل"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="authCode">كود التفويض</Label>
                <div className="relative">
                  <Shield className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="authCode"
                    type="text"
                    value={authCode}
                    onChange={(e) => setAuthCode(e.target.value.toUpperCase())}
                    className="pr-10"
                    placeholder="XXXXXXXX"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500">
                  للتجربة، استخدم: SILL2025 أو OWNER123
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setMode('choice')}
                  className="flex-1"
                  disabled={loading}
                >
                  رجوع
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
                  disabled={loading}
                >
                  {loading ? 'جارٍ الإنشاء...' : 'إنشاء المجتمع'}
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (mode === 'join') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4" dir="rtl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <LogIn className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-gray-900 mb-2" style={{ fontSize: '24px', fontWeight: '600' }}>
                الانضمام لمجتمع
              </h2>
              <p className="text-gray-600 text-sm">
                أدخل كود الانضمام الذي حصلت عليه من مالك المجتمع
              </p>
            </div>

            <form onSubmit={handleJoinCommunity} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="joinCode">كود الانضمام</Label>
                <div className="relative">
                  <Key className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="joinCode"
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    className="pr-10 text-center tracking-wider"
                    placeholder="XXXXXXXX"
                    maxLength={8}
                    required
                  />
                </div>
                <p className="text-xs text-gray-500">
                  الكود مكون من 8 أحرف وأرقام
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setMode('choice')}
                  className="flex-1"
                  disabled={loading}
                >
                  رجوع
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-green-600 to-teal-600"
                  disabled={loading}
                >
                  {loading ? 'جارٍ الانضمام...' : 'انضم الآن'}
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Choice screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h2 className="text-gray-900 mb-2" style={{ fontSize: '28px', fontWeight: '700' }}>
            مرحباً {userProfile?.name}!
          </h2>
          <p className="text-gray-600">
            هل ترغب في إنشاء مجتمع جديد أم الانضمام لمجتمع موجود؟
          </p>
        </div>

        <div className="space-y-4">
          <Card
            onClick={() => setMode('create')}
            className="p-6 cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-500"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-[#e8e7dc] rounded-lg flex items-center justify-center">
                <Plus className="w-6 h-6 text-[#24582a]" />
              </div>
              <div className="flex-1">
                <h3 className="text-gray-900 mb-1" style={{ fontWeight: '600' }}>
                  إنشاء مجتمع جديد
                </h3>
                <p className="text-sm text-gray-600">
                  كن مالك المجتمع وابدأ في بناء مجتمعك الرقمي
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs text-[#24582a]">
                  <Shield className="w-4 h-4" />
                  <span>يتطلب كود تفويض من الإدارة</span>
                </div>
              </div>
            </div>
          </Card>

          <Card
            onClick={() => setMode('join')}
            className="p-6 cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-green-500"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <LogIn className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-gray-900 mb-1" style={{ fontWeight: '600' }}>
                  الانضمام لمجتمع
                </h3>
                <p className="text-sm text-gray-600">
                  انضم لمجتمعك باستخدام كود من المالك
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs text-green-600">
                  <Key className="w-4 h-4" />
                  <span>احصل على كود الانضمام من مالك المجتمع</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          يمكنك الانضمام لمجتمع واحد فقط في نفس الوقت
        </p>
      </motion.div>
    </div>
  );
}
