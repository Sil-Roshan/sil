import { useState } from 'react';
import { Car, Send, AlertTriangle, CheckCircle, Clock, Camera } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { toast } from 'sonner@2.0.3';
import { useApp } from '../contexts/AppContext';
import { translations } from '../utils/translations';

interface ParkingAlert {
  id: string;
  licensePlate: string;
  message: string;
  time: string;
  status: 'sent' | 'pending' | 'resolved';
}

const mockAlerts: ParkingAlert[] = [
  {
    id: '1',
    licensePlate: 'أ ب ج 123',
    message: 'سيارتك تسد المدخل. يرجى نقلها عندما يكون ذلك ممكناً.',
    time: 'قبل ساعتين',
    status: 'resolved',
  },
  {
    id: '2',
    licensePlate: 'س ع د 789',
    message: 'أنت متوقف في موقف محجوز (موقف رقم 12). يرجى نقل سيارتك.',
    time: 'قبل يوم',
    status: 'sent',
  },
];

export function ParkingAlerts() {
  const { language } = useApp();
  const t = translations[language];
  const [alerts, setAlerts] = useState<ParkingAlert[]>(mockAlerts);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [licensePlate, setLicensePlate] = useState('');
  const [message, setMessage] = useState('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const handleCameraClick = () => {
    // في التطبيق الحقيقي، هذا سيفتح الكاميرا
    // هنا سنحاكي التقاط صورة
    toast.success('تم التقاط صورة اللوحة');
    setCapturedImage('captured');
    setLicensePlate('أ ب ج 456'); // محاكاة قراءة اللوحة
  };

  const handleSendAlert = () => {
    if (licensePlate && message) {
      const newAlert: ParkingAlert = {
        id: Date.now().toString(),
        licensePlate: licensePlate.toUpperCase(),
        message,
        time: 'الآن',
        status: 'sent',
      };
      setAlerts([newAlert, ...alerts]);
      setLicensePlate('');
      setMessage('');
      setCapturedImage(null);
      setIsDialogOpen(false);
      toast.success('تم إرسال التنبيه بشكل مجهول لمالك المركبة');
    }
  };

  const quickMessages = [
    'سيارتك تسد المدخل',
    'يرجى نقل سيارتك من الموقف المحجوز',
    'منبه سيارتك يعمل',
    'أضواءك مشتعلة',
  ];

  const getStatusColor = (status: ParkingAlert['status']) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 text-green-700';
      case 'sent':
        return 'bg-[#e8e7dc] text-[#24582a]';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: ParkingAlert['status']) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="w-3 h-3" />;
      case 'sent':
        return <Clock className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getStatusName = (status: ParkingAlert['status']) => {
    switch (status) {
      case 'resolved':
        return 'تم الحل';
      case 'sent':
        return 'مرسل';
      default:
        return 'معلق';
    }
  };

  return (
    <div className="min-h-screen bg-[#e8e7dc] dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-[#24582a]">{t.parkingAlerts}</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-[#24582a] hover:bg-[#1a3a1f] text-white">
                <Send className="w-4 h-4 ml-1" />
                {t.reportIssue}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md dark:bg-gray-900 dark:border-gray-700">
              <DialogHeader>
                <DialogTitle className="dark:text-gray-100">{t.reportParking}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="bg-[#f4f3e8] border border-[#e8e7dc] rounded-lg p-3">
                  <div className="flex gap-2">
                    <AlertTriangle className="w-5 h-5 text-[#24582a] flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-[#24582a]">
                      {language === 'ar' 
                        ? 'سيتم إرسال هذا التنبيه بشكل مجهول لمالك المركبة دون الكشف عن هويتك.'
                        : 'This alert will be sent anonymously to the vehicle owner without revealing your identity.'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="dark:text-gray-200">{t.licensePlate}</Label>
                  <div className="relative">
                    <Input
                      placeholder={language === 'ar' ? 'مثال: أ ب ج 123' : 'Example: ABC 123'}
                      value={licensePlate}
                      onChange={(e) => setLicensePlate(e.target.value)}
                      className="uppercase pl-12 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                    />
                    <button
                      type="button"
                      onClick={handleCameraClick}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md bg-[#f4f3e8] hover:bg-[#e8e7dc] transition-colors"
                    >
                      <Camera className={`w-5 h-5 ${capturedImage ? 'text-green-600' : 'text-[#24582a]'}`} />
                    </button>
                  </div>
                  {capturedImage && (
                    <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      {language === 'ar' ? 'تم التقاط صورة اللوحة بنجاح' : 'License plate photo captured successfully'}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="dark:text-gray-200">{t.postMessage}</Label>
                  <Textarea
                    placeholder={t.describeIssue}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-gray-600 dark:text-gray-400">
                    {language === 'ar' ? 'رسائل سريعة' : 'Quick Messages'}
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {quickMessages.map((quickMsg, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="cursor-pointer hover:bg-[#f4f3e8] hover:border-[#24582a] dark:hover:bg-gray-800 dark:border-gray-600 dark:text-gray-300"
                        onClick={() => setMessage(quickMsg)}
                      >
                        {quickMsg}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button onClick={handleSendAlert} className="w-full bg-[#24582a] hover:bg-[#1a3a1f] text-white">
                  {language === 'ar' ? 'إرسال تنبيه مجهول' : 'Send Anonymous Alert'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {language === 'ar' 
            ? 'إرسال إشعارات مجهولة للجيران بخصوص مشاكل المواقف'
            : 'Send anonymous notifications to neighbors about parking issues'}
        </p>
      </div>

      {/* Info Card */}
      <div className="p-4">
        <Card className="p-4 bg-gradient-to-r from-[#f4f3e8] to-[#e8e7dc] border-[#d4d2c4]">
          <div className="flex gap-3">
            <Car className="w-6 h-6 text-[#24582a] flex-shrink-0" />
            <div className="space-y-1">
              <h3 className="text-[#24582a]">
                {language === 'ar' ? 'كيف يعمل' : 'How It Works'}
              </h3>
              <p className="text-sm text-[#5a7a5f]">
                {language === 'ar'
                  ? 'سجل مركبتك في الإعدادات لتلقي تنبيهات المواقف. جميع الإشعارات مجهولة ومحترمة.'
                  : 'Register your vehicle in settings to receive parking alerts. All notifications are anonymous and respectful.'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Alerts */}
      <div className="px-4 pb-4">
        <h2 className="text-gray-900 dark:text-gray-100 mb-3">
          {language === 'ar' ? 'التنبيهات الأخيرة' : 'Recent Alerts'}
        </h2>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <Card key={alert.id} className="p-4 dark:bg-gray-900 dark:border-gray-700">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <Car className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <p className="text-gray-900 dark:text-gray-100">{alert.licensePlate}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{alert.time}</p>
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(alert.status)} border-0 dark:bg-opacity-30`}>
                    {getStatusIcon(alert.status)}
                    <span className="mr-1">{getStatusName(alert.status)}</span>
                  </Badge>
                </div>

                <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  {alert.message}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}