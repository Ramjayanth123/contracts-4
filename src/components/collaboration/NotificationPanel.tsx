
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Bell, 
  MessageSquare, 
  CheckCircle, 
  AlertTriangle, 
  Calendar,
  Filter
} from 'lucide-react';

const NotificationPanel = () => {
  const [filter, setFilter] = useState('all');

  const notifications = [
    {
      id: '1',
      type: 'mention',
      title: 'You were mentioned in Service Agreement',
      message: 'John Smith mentioned you in a comment about payment terms',
      time: '5 minutes ago',
      unread: true,
      avatar: '/placeholder.svg',
      author: 'John Smith'
    },
    {
      id: '2',
      type: 'approval',
      title: 'Approval request pending',
      message: 'NDA with StartupXYZ requires your approval',
      time: '2 hours ago',
      unread: true,
      priority: 'high'
    },
    {
      id: '3',
      type: 'comment',
      title: 'New comment on Vendor Contract',
      message: 'Sarah Johnson added feedback on section 3.2',
      time: '4 hours ago',
      unread: false,
      avatar: '/placeholder.svg',
      author: 'Sarah Johnson'
    },
    {
      id: '4',
      type: 'deadline',
      title: 'Contract deadline approaching',
      message: 'License Agreement review due tomorrow',
      time: '1 day ago',
      unread: false,
      priority: 'medium'
    }
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'mention':
        return MessageSquare;
      case 'approval':
        return CheckCircle;
      case 'comment':
        return MessageSquare;
      case 'deadline':
        return Calendar;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type: string, priority?: string) => {
    if (priority === 'high') return 'text-red-500';
    if (priority === 'medium') return 'text-yellow-500';
    
    switch (type) {
      case 'mention':
        return 'text-blue-500';
      case 'approval':
        return 'text-green-500';
      case 'comment':
        return 'text-purple-500';
      case 'deadline':
        return 'text-orange-500';
      default:
        return 'text-gray-500';
    }
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => n.unread);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'unread' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('unread')}
          >
            Unread
            <Badge variant="secondary" className="ml-2">
              {notifications.filter(n => n.unread).length}
            </Badge>
          </Button>
        </div>
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      <div className="space-y-3">
        {filteredNotifications.map((notification) => {
          const Icon = getNotificationIcon(notification.type);
          const color = getNotificationColor(notification.type, notification.priority);
          
          return (
            <Card 
              key={notification.id} 
              className={`glass-card border-white/10 transition-all duration-200 hover:bg-white/10 cursor-pointer ${
                notification.unread ? 'border-primary/30' : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    {notification.avatar ? (
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={notification.avatar} />
                        <AvatarFallback>{notification.author?.charAt(0)}</AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className={`w-8 h-8 rounded-full bg-background border flex items-center justify-center`}>
                        <Icon className={`w-4 h-4 ${color}`} />
                      </div>
                    )}
                    {notification.unread && (
                      <div className="w-2 h-2 bg-primary rounded-full mt-1 mx-auto" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-sm">{notification.title}</h4>
                      <span className="text-xs text-muted-foreground">{notification.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                    
                    {notification.priority && (
                      <Badge 
                        className={`mt-2 ${
                          notification.priority === 'high' 
                            ? 'bg-red-500/20 text-red-400 border-red-500/30' 
                            : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                        } border text-xs`}
                      >
                        {notification.priority} priority
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default NotificationPanel;
