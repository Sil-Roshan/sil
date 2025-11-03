import { useState } from 'react';
import { MapPin, Bed, Bath, Square, Star, Heart } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useApp } from '../contexts/AppContext';
import { translations } from '../utils/translations';

interface Property {
  id: string;
  image: string;
  type: 'rent' | 'sale';
  price: string;
  title: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  floor: string;
  rating: number;
  reviews: number;
  description: string;
  available: string;
}

const mockProperties: Property[] = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1594873604892-b599f847e859?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcGFydG1lbnQlMjBpbnRlcmlvcnxlbnwxfHx8fDE3NjE0MDgwOTR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    type: 'rent',
    price: '6,500 ريال/شهرياً',
    title: 'شقة عصرية غرفتين',
    bedrooms: 2,
    bathrooms: 1,
    sqft: 950,
    floor: 'الطابق الرابع',
    rating: 4.8,
    reviews: 12,
    description: 'تم تجديدها مؤخراً مع أرضيات خشبية وأجهزة حديثة.',
    available: 'متاحة 1 ديسمبر',
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1686056040370-b5e5c06c4273?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBhcGFydG1lbnR8ZW58MXx8fHwxNzYxMzg2OTMwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    type: 'rent',
    price: '9,000 ريال/شهرياً',
    title: 'شقة واسعة 3 غرف مع شرفة',
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1200,
    floor: 'الطابق السابع',
    rating: 4.9,
    reviews: 8,
    description: 'وحدة ركنية مع إطلالات بانورامية وشرفة خاصة.',
    available: 'متاحة الآن',
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1610123172763-1f587473048f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3p5JTIwc3R1ZGlvJTIwYXBhcnRtZW50fGVufDF8fHx8MTc2MTQ2MzY5N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    type: 'sale',
    price: '920,000 ريال',
    title: 'وحدة استوديو مريحة',
    bedrooms: 1,
    bathrooms: 1,
    sqft: 550,
    floor: 'الطابق الثاني',
    rating: 4.6,
    reviews: 5,
    description: 'منزل مثالي للمبتدئين في موقع رائع.',
    available: 'متاحة 15 يناير',
  },
];

export function RealEstateScreen() {
  const { language } = useApp();
  const t = translations[language];
  const [properties] = useState<Property[]>(mockProperties);
  const [activeFilter, setActiveFilter] = useState<'all' | 'rent' | 'sale'>('all');

  const filteredProperties = properties.filter(
    property => activeFilter === 'all' || property.type === activeFilter
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-4 sticky top-0 z-10">
        <h1 className="text-[#24582a] mb-3">{t.realEstate}</h1>
        
        {/* Filter Tabs */}
        <div className="flex gap-2">
          <Button
            variant={activeFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter('all')}
            className={activeFilter === 'all' ? 'bg-[#24582a] hover:bg-[#1a3a1f] text-white' : 'dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800'}
          >
            {language === 'ar' ? 'الكل' : 'All'}
          </Button>
          <Button
            variant={activeFilter === 'rent' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter('rent')}
            className={activeFilter === 'rent' ? 'bg-[#24582a] hover:bg-[#1a3a1f] text-white' : 'dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800'}
          >
            {t.forRent}
          </Button>
          <Button
            variant={activeFilter === 'sale' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter('sale')}
            className={activeFilter === 'sale' ? 'bg-[#24582a] hover:bg-[#1a3a1f] text-white' : 'dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800'}
          >
            {t.forSale}
          </Button>
        </div>
      </div>

      {/* Properties List */}
      <div className="p-4 space-y-4">
        {filteredProperties.map((property) => (
          <Card key={property.id} className="overflow-hidden dark:bg-gray-900 dark:border-gray-700">
            {/* Image */}
            <div className="relative h-48">
              <ImageWithFallback
                src={property.image}
                alt={property.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3">
                <Badge className={`${
                  property.type === 'rent' 
                    ? 'bg-[#24582a]' 
                    : 'bg-green-600'
                } text-white border-0`}>
                  {property.type === 'rent' ? t.forRent : t.forSale}
                </Badge>
              </div>
              <button className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/90 dark:bg-gray-800/90 flex items-center justify-center hover:bg-white dark:hover:bg-gray-800 transition-colors">
                <Heart className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
              <div className="absolute bottom-3 right-3">
                <p className="text-white text-xl px-2 py-1 bg-black/50 dark:bg-black/70 rounded backdrop-blur-sm">
                  {property.price}
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              <div>
                <h3 className="text-gray-900 dark:text-gray-100">{property.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{property.floor} • {property.available}</p>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Bed className="w-4 h-4" />
                  <span>{property.bedrooms} {language === 'ar' ? 'غرفة' : 'bed'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Bath className="w-4 h-4" />
                  <span>{property.bathrooms} {language === 'ar' ? 'حمام' : 'bath'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Square className="w-4 h-4" />
                  <span>{property.sqft} {language === 'ar' ? 'قدم²' : 'sqft'}</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 dark:text-gray-400">{property.description}</p>

              {/* Rating */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm dark:text-gray-300">{property.rating}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    ({property.reviews} {language === 'ar' ? 'تقييم' : 'review'})
                  </span>
                </div>
                <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800">
                  {language === 'ar' ? 'عرض التفاصيل' : 'View Details'}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Info Banner */}
      <div className="px-4 pb-4">
        <Card className="p-4 bg-gradient-to-r from-[#f4f3e8] to-[#e8e7dc] border-[#d4d2c4]">
          <p className="text-sm text-[#24582a]">
            🏠 {language === 'ar' 
              ? 'جميع القوائم من سكان موثوقين في مجتمعك. تواصل مع مدراء العقارات مباشرة عبر التطبيق.'
              : 'All listings from trusted residents in your community. Contact property managers directly through the app.'}
          </p>
        </Card>
      </div>
    </div>
  );
}