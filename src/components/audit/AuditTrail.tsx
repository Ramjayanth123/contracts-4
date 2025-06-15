
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { FileText, Edit, Download, Share2, Eye, UserPlus, Trash2 } from 'lucide-react';

interface AuditEvent {
  id: string;
  action: string;
  user: string;
  userRole: string;
  timestamp: string;
  details: string;
  ipAddress?: string;
  actionType: 'view' | 'edit' | 'download' | 'share' | 'delete' | 'create' | 'invite';
}

interface AuditTrailProps {
  contractId: string;
  events?: AuditEvent[];
}

const AuditTrail = ({ contractId, events }: AuditTrailProps) => {
  const auditEvents: AuditEvent[] = events || [
    {
      id: '1',
      action: 'Contract downloaded',
      user: 'Sarah Johnson',
      userRole: 'Legal',
      timestamp: '2024-06-13 14:30:25',
      details: 'Downloaded PDF version',
      ipAddress: '192.168.1.100',
      actionType: 'download'
    },
    {
      id: '2',
      action: 'Contract edited',
      user: 'John Smith',
      userRole: 'Admin',
      timestamp: '2024-06-13 11:15:10',
      details: 'Updated payment terms section',
      ipAddress: '192.168.1.105',
      actionType: 'edit'
    },
    {
      id: '3',
      action: 'Contract viewed',
      user: 'Mike Chen',
      userRole: 'Viewer',
      timestamp: '2024-06-13 09:45:33',
      details: 'Accessed contract details',
      ipAddress: '192.168.1.102',
      actionType: 'view'
    },
    {
      id: '4',
      action: 'Contract shared',
      user: 'Sarah Johnson',
      userRole: 'Legal',
      timestamp: '2024-06-12 16:20:15',
      details: 'Shared with external party',
      ipAddress: '192.168.1.100',
      actionType: 'share'
    }
  ];

  const getActionIcon = (actionType: string) => {
    const iconProps = { className: "w-4 h-4" };
    switch (actionType) {
      case 'view': return <Eye {...iconProps} />;
      case 'edit': return <Edit {...iconProps} />;
      case 'download': return <Download {...iconProps} />;
      case 'share': return <Share2 {...iconProps} />;
      case 'delete': return <Trash2 {...iconProps} />;
      case 'create': return <FileText {...iconProps} />;
      case 'invite': return <UserPlus {...iconProps} />;
      default: return <FileText {...iconProps} />;
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'view': return 'text-blue-400';
      case 'edit': return 'text-yellow-400';
      case 'download': return 'text-green-400';
      case 'share': return 'text-purple-400';
      case 'delete': return 'text-red-400';
      case 'create': return 'text-green-400';
      case 'invite': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin': return 'bg-red-500/20 text-red-300';
      case 'legal': return 'bg-blue-500/20 text-blue-300';
      case 'viewer': return 'bg-gray-500/20 text-gray-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  return (
    <Card className="glass-card border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Audit Trail
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {auditEvents.map((event) => (
            <div key={event.id} className="flex items-start gap-3 p-3 glass-card border border-white/10 rounded-lg">
              <div className={`p-2 rounded-full bg-white/10 ${getActionColor(event.actionType)}`}>
                {getActionIcon(event.actionType)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="text-xs">
                      {event.user.split(' ').map(n => n.charAt(0)).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-sm">{event.user}</span>
                  <Badge className={getRoleBadgeColor(event.userRole)}>
                    {event.userRole}
                  </Badge>
                </div>
                
                <p className="text-sm font-medium">{event.action}</p>
                <p className="text-xs text-muted-foreground">{event.details}</p>
                
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span>{event.timestamp}</span>
                  {event.ipAddress && <span>IP: {event.ipAddress}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AuditTrail;
