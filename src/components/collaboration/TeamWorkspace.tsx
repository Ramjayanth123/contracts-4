
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  FileText, 
  MessageSquare, 
  Share, 
  Download, 
  Eye,
  Users,
  Clock,
  Plus
} from 'lucide-react';

const TeamWorkspace = () => {
  const sharedDocuments = [
    {
      id: '1',
      name: 'Contract Template Library',
      type: 'folder',
      lastModified: '2 hours ago',
      modifiedBy: 'Sarah Johnson',
      shared: 8
    },
    {
      id: '2',
      name: 'Service Agreement - TechCorp.pdf',
      type: 'pdf',
      size: '2.4 MB',
      lastModified: '4 hours ago',
      modifiedBy: 'John Smith',
      shared: 5
    },
    {
      id: '3',
      name: 'Legal Review Guidelines.docx',
      type: 'doc',
      size: '856 KB',
      lastModified: '1 day ago',
      modifiedBy: 'Legal Team',
      shared: 12
    },
    {
      id: '4',
      name: 'Approval Process Flowchart.png',
      type: 'image',
      size: '1.2 MB',
      lastModified: '2 days ago',
      modifiedBy: 'Mike Chen',
      shared: 6
    }
  ];

  const recentActivity = [
    {
      id: '1',
      action: 'commented on',
      document: 'Service Agreement - TechCorp',
      user: 'John Smith',
      avatar: '/placeholder.svg',
      time: '2 hours ago'
    },
    {
      id: '2',
      action: 'shared',
      document: 'Legal Review Guidelines',
      user: 'Sarah Johnson',
      avatar: '/placeholder.svg',
      time: '4 hours ago'
    },
    {
      id: '3',
      action: 'uploaded',
      document: 'Updated NDA Template',
      user: 'Legal Team',
      avatar: '/placeholder.svg',
      time: '1 day ago'
    }
  ];

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'folder':
        return '📁';
      case 'pdf':
        return '📄';
      case 'doc':
        return '📝';
      case 'image':
        return '🖼️';
      default:
        return '📄';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Shared Documents */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Shared Documents</h3>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Upload
          </Button>
        </div>

        <div className="space-y-3">
          {sharedDocuments.map((doc) => (
            <Card key={doc.id} className="glass-card border-white/10 hover:bg-white/10 transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getFileIcon(doc.type)}</span>
                  <div className="flex-1">
                    <h4 className="font-medium">{doc.name}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span>Modified {doc.lastModified} by {doc.modifiedBy}</span>
                      {doc.size && <span>{doc.size}</span>}
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{doc.shared} people</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Share className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Activity Feed */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={activity.avatar} />
                <AvatarFallback>{activity.user.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-medium">{activity.user}</span>
                  <span className="text-muted-foreground"> {activity.action} </span>
                  <span className="font-medium">{activity.document}</span>
                </p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamWorkspace;
