import { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, User, Phone, Eye, EyeOff, UserCheck } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useApp } from '../contexts/AppContext';
import logoImage from 'figma:asset/4d469f59699cac6a9a15d8811eae70e226ad746b.png';

interface AuthScreenProps {
  onComplete: () => void;
}

export function AuthScreen({ onComplete }: AuthScreenProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signIn, signUp, setGuestMode } = useApp();

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      if (mode === 'signin') {
        result = await signIn(email, password);
      } else {
        if (!name) {
          setError('الرجاء إدخال الاسم');
          setLoading(false);
          return;
        }
        result = await signUp(email, password, name, phoneNumber);
      }

      if (result.success) {
        onComplete();
      } else {
        setError(result.error || 'حدث خطأ');
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestMode = () => {
    setGuestMode();
    onComplete();
  };

  return (
    <div className="min-h-screen bg-[#f4f3e8] flex items-center justify-center p-4" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            className="inline-block mb-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <img
              src={logoImage}
              alt="صِلّ Logo"
              className="mx-auto"
              style={{ width: '140px', height: '140px', objectFit: 'contain' }}
            />
          </motion.div>
          <p className="text-[#24582a] opacity-80 mt-2">مجتمعك الرقمي</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-[#e8e7dc]">
          {/* Tab Switcher */}
          <div className="flex gap-2 mb-6 bg-[#f4f3e8] rounded-lg p-1">
            <button
              onClick={() => setMode('signin')}
              className={`flex-1 py-2 px-4 rounded-lg transition-all ${
                mode === 'signin'
                  ? 'bg-white shadow-sm text-[#24582a]'
                  : 'text-gray-600'
              }`}
            >
              تسجيل الدخول
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 px-4 rounded-lg transition-all ${
                mode === 'signup'
                  ? 'bg-white shadow-sm text-[#24582a]'
                  : 'text-gray-600'
              }`}
            >
              حساب جديد
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">الاسم الكامل</Label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5a7a5f]" />
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pr-10 focus:border-[#24582a]"
                      placeholder="أدخل اسمك الكامل"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">رقم الجوال (اختياري)</Label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5a7a5f]" />
                    <Input
                      id="phone"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="pr-10 focus:border-[#24582a]"
                      placeholder="05xxxxxxxx"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5a7a5f]" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pr-10 focus:border-[#24582a]"
                  placeholder="example@email.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5a7a5f]" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10 pl-10 focus:border-[#24582a]"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5a7a5f] hover:text-[#24582a]"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#24582a] hover:bg-[#1a3a1f] text-white"
              disabled={loading}
            >
              {loading ? 'جارٍ المعالجة...' : mode === 'signin' ? 'تسجيل الدخول' : 'إنشاء حساب'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">أو</span>
            </div>
          </div>

          {/* Guest Mode */}
          <Button
            type="button"
            onClick={handleGuestMode}
            variant="outline"
            className="w-full border-[#24582a] text-[#24582a] hover:bg-[#f4f3e8]"
          >
            <UserCheck className="ml-2 w-5 h-5" />
            الدخول كزائر
          </Button>

          <p className="text-xs text-gray-500 text-center mt-4">
            الزوار لديهم صلاحيات محدودة - يمكنهم المشاهدة فقط
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-[#5a7a5f] text-sm mt-6">
          بالمتابعة، أنت توافق على شروط الخدمة وسياسة الخصوصية
        </p>
      </motion.div>
    </div>
  );
}
