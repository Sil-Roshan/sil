import { useState } from 'react';
import { Search, Star, Phone, Mail, MapPin, ThumbsUp, Plus } from 'lucide-react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner@2.0.3';
import { useApp } from '../contexts/AppContext';
import { translations } from '../utils/translations';

interface Service {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviews: number;
  description: string;
  recommendedBy: string[];
  phone?: string;
  responseTime: string;
}

const mockServices: Service[] = [
  {
    id: '1',
    name: 'سباكة محمد',
    category: 'سباك',
    rating: 4.8,
    reviews: 24,
    description: 'سباك مرخص بخبرة 15 سنة. متوفر للطوارئ.',
    recommendedBy: ['سارة م. (3ب)', 'أحمد د. (5أ)', 'ليزا ك. (7ج)'],
    phone: '+966 50 123 4567',
    responseTime: 'يرد عادةً خلال ساعتين',
  },
  {
    id: '2',
    name: 'حلول الكهرباء الاحترافية',
    category: 'كهربائي',
    rating: 4.9,
    reviews: 31,
    description: 'كهربائيون معتمدون لجميع الاحتياجات السكنية. تقديرات مجانية.',
    recommendedBy: ['ماريا ج. (2ج)', 'توم ر. (6أ)', 'آنا ب. (4د)'],
    responseTime: 'يرد عادةً خلال ساعة',
  },
  {
    id: '3',
    name: 'خدمات الصيانة الذكية',
    category: 'فني صيانة',
    rating: 4.7,
    reviews: 18,
    description: 'إصلاحات عامة، تركيب أثاث، دهان، والمزيد.',
    recommendedBy: ['داود ل. (8ب)', 'صوفيا ت. (1أ)'],
    responseTime: 'يرد عادةً خلال 4 ساعات',
  },
  {
    id: '4',
    name: 'تنسيق حدائق الخضراء',
    category: 'تنسيق حدائق',
    rating: 4.6,
    reviews: 12,
    description: 'صيانة الحدائق، العناية بالنجيل، والزينة الموسمية.',
    recommendedBy: ['راشيل ب. (5ج)', 'مايك و. (3د)'],
    responseTime: 'يرد عادةً خلال يوم',
  },
];

export function ServicesScreen() {
  const { language } = useApp();
  const t = translations[language];
  const [services, setServices] = useState<Service[]>(mockServices);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newService, setNewService] = useState({
    name: '',
    category: '',
    phone: '',
    description: '',
  });

  const handleAddService = () => {
    if (newService.name && newService.category && newService.description) {
      const service: Service = {
        id: Date.now().toString(),
        name: newService.name,
        category: newService.category,
        rating: 0,
        reviews: 0,
        description: newService.description,
        recommendedBy: ['أنت'],
        phone: newService.phone,
        responseTime: 'جديد',
      };
      setServices([service, ...services]);
      setNewService({ name: '', category: '', phone: '', description: '' });
      setIsDialogOpen(false);
      toast.success('تم إضافة الخدمة بنجاح');
    }
  };

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-[#24582a]">{t.trustedServices}</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-[#24582a] hover:bg-[#1a3a1f] text-white">
                <Plus className="w-4 h-4 ml-1" />
                {t.addService}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md dark:bg-gray-900 dark:border-gray-700">
              <DialogHeader>
                <DialogTitle className="dark:text-gray-100">{t.addNewService}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="dark:text-gray-200">{t.serviceName}</Label>
                  <Input
                    placeholder={language === 'ar' ? 'مثال: سباكة أحمد' : 'Example: Ahmad Plumbing'}
                    value={newService.name}
                    onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                    className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="dark:text-gray-200">{t.serviceCategory}</Label>
                  <Select 
                    value={newService.category} 
                    onValueChange={(value) => setNewService({ ...newService, category: value })}
                  >
                    <SelectTrigger className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100">
                      <SelectValue placeholder={t.selectCategory} />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                      <SelectItem value="سباك">{t.plumber}</SelectItem>
                      <SelectItem value="كهربائي">{t.electrician}</SelectItem>
                      <SelectItem value="فني صيانة">{t.handyman}</SelectItem>
                      <SelectItem value="تنسيق حدائق">{t.gardener}</SelectItem>
                      <SelectItem value="تنظيف">{t.cleaner}</SelectItem>
                      <SelectItem value="نجار">{t.carpenter}</SelectItem>
                      <SelectItem value="دهان">{t.painter}</SelectItem>
                      <SelectItem value="أخرى">{t.other}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="dark:text-gray-200">{t.phoneOptional}</Label>
                  <Input
                    placeholder="+966 50 123 4567"
                    value={newService.phone}
                    onChange={(e) => setNewService({ ...newService, phone: e.target.value })}
                    className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="dark:text-gray-200">{t.serviceDescription}</Label>
                  <Textarea
                    placeholder={t.describeService}
                    value={newService.description}
                    onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                    rows={3}
                    className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                  />
                </div>

                <Button onClick={handleAddService} className="w-full bg-[#24582a] hover:bg-[#1a3a1f] text-white">
                  {t.addService}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <Input
            type="text"
            placeholder={t.searchService}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          <Badge variant="outline" className="whitespace-nowrap cursor-pointer hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-950 dark:border-gray-600 dark:text-gray-300">
            {t.allServices}
          </Badge>
          <Badge variant="outline" className="whitespace-nowrap cursor-pointer hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-950 dark:border-gray-600 dark:text-gray-300">
            {t.plumber}
          </Badge>
          <Badge variant="outline" className="whitespace-nowrap cursor-pointer hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-950 dark:border-gray-600 dark:text-gray-300">
            {t.electrician}
          </Badge>
          <Badge variant="outline" className="whitespace-nowrap cursor-pointer hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-950 dark:border-gray-600 dark:text-gray-300">
            {t.handyman}
          </Badge>
          <Badge variant="outline" className="whitespace-nowrap cursor-pointer hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-950 dark:border-gray-600 dark:text-gray-300">
            {t.cleaner}
          </Badge>
        </div>
      </div>

      {/* Services List */}
      <div className="p-4 space-y-4">
        {filteredServices.map((service) => (
          <Card key={service.id} className="p-4 dark:bg-gray-900 dark:border-gray-700">
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-gray-900 dark:text-gray-100">{service.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{service.category}</p>
                </div>
                {service.rating > 0 && (
                  <Badge className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 border-0">
                    <Star className="w-3 h-3 ml-1 fill-yellow-500 text-yellow-500 dark:fill-yellow-400 dark:text-yellow-400" />
                    {service.rating}
                  </Badge>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 dark:text-gray-400">{service.description}</p>

              {/* Response Time */}
              <p className="text-xs text-gray-500 dark:text-gray-500 italic">{service.responseTime}</p>

              {/* Recommended By */}
              {service.reviews > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
                    <ThumbsUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span>{t.recommendedBy} {service.reviews} {t.neighbor}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {service.recommendedBy.slice(0, 3).map((neighbor, index) => (
                      <Badge key={index} variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-300">
                        {neighbor}
                      </Badge>
                    ))}
                    {service.recommendedBy.length > 3 && (
                      <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-300">
                        +{service.recommendedBy.length - 3} {language === 'ar' ? 'أكثر' : 'more'}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800">
                  <Phone className="w-4 h-4 ml-1" />
                  {t.contact}
                </Button>
                {service.reviews > 0 && (
                  <Button variant="outline" size="sm" className="flex-1 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800">
                    <Star className="w-4 h-4 ml-1" />
                    {t.reviews}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}