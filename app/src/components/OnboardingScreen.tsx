import { useState } from 'react';
import { Shield, Users, Lock, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface OnboardingScreenProps {
  onComplete: () => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [step, setStep] = useState(0);
  const [verificationCode, setVerificationCode] = useState('');

  const onboardingSteps = [
    {
      icon: <Users className="w-16 h-16 text-[#24582a]" />,
      title: 'مرحباً بك في سِل',
      description: 'تواصل مع جيرانك وابنِ مجتمعاً أقوى معاً.',
    },
    {
      icon: <Shield className="w-16 h-16 text-[#24582a]" />,
      title: 'خصوصيتك مهمة',
      description: 'جميع التواصلات تبقى داخل التطبيق. معلوماتك الشخصية محمية ولا تُشارك إلا بموافقتك.',
    },
    {
      icon: <Lock className="w-16 h-16 text-[#24582a]" />,
      title: 'التحقق الآمن',
      description: 'أدخل الرمز الفريد المقدم من إدارة المجمع للتحقق من انتمائك لهذا الحي.',
    },
  ];

  const handleNext = () => {
    if (step < onboardingSteps.length - 1) {
      setStep(step + 1);
    }
  };

  const handleVerify = () => {
    // Mock verification - in real app this would verify with backend
    if (verificationCode.length >= 6) {
      onComplete();
    }
  };

  if (step === onboardingSteps.length - 1) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white px-6" dir="rtl">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              {onboardingSteps[step].icon}
            </div>
            <h1 className="text-[#24582a]">
              {onboardingSteps[step].title}
            </h1>
            <p className="text-gray-600">
              {onboardingSteps[step].description}
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">رمز التحقق</Label>
              <Input
                id="code"
                type="text"
                placeholder="أدخل رمزك"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="text-center tracking-wider"
              />
            </div>

            <Button 
              onClick={handleVerify} 
              className="w-full bg-[#24582a] hover:bg-[#1a3a1f] text-white"
              disabled={verificationCode.length < 6}
            >
              <CheckCircle className="w-4 h-4 ml-2" />
              تحقق وتابع
            </Button>
          </div>

          <p className="text-center text-sm text-gray-500">
            ليس لديك رمز؟ تواصل مع إدارة المجمع.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-gradient-to-b from-blue-50 to-white px-6 py-12" dir="rtl">
      <div className="flex-1 flex flex-col items-center justify-center max-w-md w-full space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            {onboardingSteps[step].icon}
          </div>
          <h1 className="text-blue-600">
            {onboardingSteps[step].title}
          </h1>
          <p className="text-gray-600">
            {onboardingSteps[step].description}
          </p>
        </div>
      </div>

      <div className="w-full max-w-md space-y-4">
        {/* Progress Dots */}
        <div className="flex justify-center gap-2">
          {onboardingSteps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === step ? 'bg-[#24582a]' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        <Button 
          onClick={handleNext} 
          className="w-full bg-[#24582a] hover:bg-[#1a3a1f] text-white"
        >
          متابعة
        </Button>
      </div>
    </div>
  );
}