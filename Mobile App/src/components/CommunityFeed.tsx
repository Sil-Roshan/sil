import { useState, useEffect } from 'react';
import { Plus, AlertCircle, HelpCircle, MessageSquare, Heart, Share2, MoreVertical, Bell, X, Users } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { translations } from '../utils/translations';

interface Post {
  id: string;
  author: string;
  apartment: string;
  time: string;
  type: 'announcement' | 'alert' | 'help' | 'general';
  content: string;
  likes: number;
  comments: number;
}

interface ImportantNotification {
  id: string;
  title: string;
  message: string;
  type: 'emergency' | 'management';
  time: string;
}

const mockNotifications: ImportantNotification[] = [
  {
    id: '1',
    title: 'تنبيه طارئ',
    message: 'انقطاع الكهرباء المتوقع اليوم من 2 - 4 مساءً للصيانة الضرورية',
    type: 'emergency',
    time: 'قبل ساعة',
  },
  {
    id: '2',
    title: 'إعلان من الإدارة',
    message: 'يرجى عدم وقوف السيارات أمام المدخل الرئيسي غداً بسبب أعمال الصيانة',
    type: 'management',
    time: 'قبل 3 ساعات',
  },
];

const mockPosts: Post[] = [
  {
    id: '1',
    author: 'سارة م.',
    apartment: 'شقة 3ب',
    time: 'قبل ساعتين',
    type: 'alert',
    content: 'توصيل طرود غداً من الساعة 10 صباحاً إلى 12 ظهراً. إذا كان بإمكان أي شخص استلام طرود الجيران، يرجى إعلامنا!',
    likes: 12,
    comments: 3,
  },
  {
    id: '2',
    author: 'أحمد د.',
    apartment: 'شقة 5أ',
    time: 'قبل 5 ساعات',
    type: 'help',
    content: 'هل لدى أحد سلم يمكنني استعارته لبضع ساعات؟ أحتاج لتغيير مصباح في الممر.',
    likes: 8,
    comments: 5,
  },
  {
    id: '3',
    author: 'إدارة المجمع',
    apartment: 'الإدارة',
    time: 'قبل يوم',
    type: 'announcement',
    content: 'تذكير: صيانة المبنى يوم السبت القادم من 9 صباحاً - 1 ظهراً. سيتم قطع المياه مؤقتاً.',
    likes: 24,
    comments: 8,
  },
  {
    id: '4',
    author: 'ماريا ج.',
    apartment: 'شقة 2ج',
    time: 'قبل يومين',
    type: 'general',
    content: 'شكراً لمن ساعدني في إحضار البقالة أمس! هذا المجتمع رائع! 💙',
    likes: 35,
    comments: 12,
  },
];

export function CommunityFeed() {
  const { community, memberCount, accessToken, isGuest, language } = useApp();
  const t = translations[language];
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [notifications, setNotifications] = useState<ImportantNotification[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPostType, setNewPostType] = useState<Post['type']>('general');
  const [newPostContent, setNewPostContent] = useState('');

  const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-85e399fd`;

  // Load owner announcements
  useEffect(() => {
    if (!community || !accessToken) return;
    
    const loadAnnouncements = async () => {
      try {
        const response = await fetch(`${baseUrl}/communities/${community.id}/announcements`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const formattedNotifications = data.announcements.slice(0, 3).map((ann: any) => ({
            id: ann.id,
            title: ann.title,
            message: ann.message,
            type: ann.priority === 'urgent' ? 'emergency' : 'management',
            time: formatTime(ann.createdAt),
          }));
          setNotifications(formattedNotifications);
        }
      } catch (error) {
        console.error('Error loading announcements:', error);
      }
    };

    loadAnnouncements();
    // Refresh every 30 seconds
    const interval = setInterval(loadAnnouncements, 30000);
    return () => clearInterval(interval);
  }, [community, accessToken]);

  const formatTime = (isoDate: string) => {
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `قبل ${diffMins} دقيقة`;
    if (diffHours < 24) return `قبل ${diffHours} ساعة`;
    return `قبل ${diffDays} يوم`;
  };

  const dismissNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getTypeColor = (type: Post['type']) => {
    switch (type) {
      case 'announcement':
        return 'bg-[#e8e7dc] text-[#24582a]';
      case 'alert':
        return 'bg-orange-100 text-orange-700';
      case 'help':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeIcon = (type: Post['type']) => {
    switch (type) {
      case 'announcement':
        return <MessageSquare className="w-3 h-3" />;
      case 'alert':
        return <AlertCircle className="w-3 h-3" />;
      case 'help':
        return <HelpCircle className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getTypeName = (type: Post['type']) => {
    switch (type) {
      case 'announcement':
        return 'إعلان';
      case 'alert':
        return 'تنبيه';
      case 'help':
        return 'طلب مساعدة';
      default:
        return 'عام';
    }
  };

  const handleCreatePost = () => {
    if (newPostContent.trim()) {
      const newPost: Post = {
        id: Date.now().toString(),
        author: 'أنت',
        apartment: 'شقة 4ب',
        time: 'الآن',
        type: newPostType,
        content: newPostContent,
        likes: 0,
        comments: 0,
      };
      setPosts([newPost, ...posts]);
      setNewPostContent('');
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[#24582a]">{t.appName}</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {community ? community.name : t.appTagline}
            </p>
            {memberCount > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500 mt-1">
                <Users className="w-3 h-3" />
                <span>{memberCount} {t.member}</span>
              </div>
            )}
          </div>
          {!isGuest && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-[#24582a] hover:bg-[#1a3a1f] text-white">
                  <Plus className="w-4 h-4 ml-1" />
                  {t.newPost}
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-md dark:bg-gray-900 dark:border-gray-700">
              <DialogHeader>
                <DialogTitle className="dark:text-gray-100">{t.createPost}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="dark:text-gray-200">{t.postType}</Label>
                  <Select value={newPostType} onValueChange={(value: Post['type']) => setNewPostType(value)}>
                    <SelectTrigger className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                      <SelectItem value="general">{t.general}</SelectItem>
                      <SelectItem value="announcement">{t.announcement}</SelectItem>
                      <SelectItem value="alert">{t.alert}</SelectItem>
                      <SelectItem value="help">{t.help}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="dark:text-gray-200">{t.postMessage}</Label>
                  <Textarea
                    placeholder={t.postContent}
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    rows={4}
                    className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                  />
                </div>
                <Button onClick={handleCreatePost} className="w-full bg-[#24582a] hover:bg-[#1a3a1f] text-white">
                  {t.postToCommunity}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          )}
        </div>
      </div>

      {/* Important Notifications from Owner */}
      {notifications.length > 0 && (
        <div className="bg-gradient-to-r from-[#24582a] to-[#3a7841] px-4 py-3">
          <div className="flex items-center gap-2 text-white mb-2">
            <Bell className="w-4 h-4" />
            <span className="text-sm">{t.importantNotifications}</span>
          </div>
          <div className="space-y-2">
            {notifications.map((notification) => (
              <Alert
                key={notification.id}
                className={`${
                  notification.type === 'emergency'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-white border-white'
                }`}
              >
              <div className="flex gap-3">
                <Bell className={`w-5 h-5 ${
                  notification.type === 'emergency' ? 'text-red-600' : 'text-amber-600'
                }`} />
                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className={`${
                      notification.type === 'emergency' ? 'text-red-900' : 'text-amber-900'
                    }`}>
                      {notification.title}
                    </h3>
                    <button
                      onClick={() => dismissNotification(notification.id)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <AlertDescription className={`${
                    notification.type === 'emergency' ? 'text-red-800' : 'text-amber-800'
                  }`}>
                    {notification.message}
                  </AlertDescription>
                  <p className="text-xs text-gray-600">{notification.time}</p>
                </div>
              </div>
            </Alert>
            ))}
          </div>
        </div>
      )}

      {/* Feed */}
      <div className="p-4 space-y-4">
        {posts.map((post) => (
          <Card key={post.id} className="p-4 dark:bg-gray-900 dark:border-gray-700">
            <div className="flex items-start gap-3">
              <Avatar>
                <AvatarFallback className="bg-[#e8e7dc] text-[#24582a]">
                  {post.author.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-900 dark:text-gray-100">{post.author}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{post.apartment}</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{post.time}</p>
                  </div>
                  <button className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                <Badge className={`${getTypeColor(post.type)} border-0 dark:bg-opacity-30`}>
                  {getTypeIcon(post.type)}
                  <span className="mr-1">{getTypeName(post.type)}</span>
                </Badge>

                <p className="text-gray-700 dark:text-gray-300">{post.content}</p>

                <div className="flex items-center gap-6 pt-2">
                  <button className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                    <Heart className="w-4 h-4" />
                    <span className="text-sm">{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-[#24582a] transition-colors">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-sm">{post.comments}</span>
                  </button>
                  <button className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-[#24582a] transition-colors">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}