
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Bell, 
  CheckSquare, 
  MessageSquare, 
  Share, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import NotificationPanel from './NotificationPanel';
import TaskAssignment from './TaskAssignment';
import TeamWorkspace from './TeamWorkspace';

const CollaborationPanel = () => {
  const [activeUsers, setActiveUsers] = useState([
    { id: '1', name: 'Sarah Johnson', avatar: '/placeholder.svg', status: 'viewing', document: 'Service Agreement' },
    { id: '2', name: 'John Smith', avatar: '/placeholder.svg', status: 'editing', document: 'NDA Template' },
    { id: '3', name: 'Mike Chen', avatar: '/placeholder.svg', status: 'commenting', document: 'Vendor Contract' }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'editing':
        return 'bg-green-500';
      case 'viewing':
        return 'bg-blue-500';
      case 'commenting':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* User Presence */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Active Team Members
            <Badge variant="secondary">{activeUsers.length} online</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {activeUsers.map((user) => (
              <div key={user.id} className="flex items-center gap-3 p-3 glass-card border border-white/10 rounded-lg">
                <div className="relative">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(user.status)} rounded-full border-2 border-background`} />
                </div>
                <div>
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.status} • {user.document}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Collaboration Tabs */}
      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="glass-card border-white/10">
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="tasks">
            <CheckSquare className="w-4 h-4 mr-2" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="workspace">
            <Share className="w-4 h-4 mr-2" />
            Team Workspace
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications">
          <NotificationPanel />
        </TabsContent>

        <TabsContent value="tasks">
          <TaskAssignment />
        </TabsContent>

        <TabsContent value="workspace">
          <TeamWorkspace />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CollaborationPanel;
