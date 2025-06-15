
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  CheckCircle, 
  XCircle, 
  Edit, 
  UserPlus, 
  Clock, 
  DollarSign, 
  AlertTriangle,
  Eye
} from 'lucide-react';

interface ApprovalCardProps {
  approval: any;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onApprove: () => void;
  onReject: () => void;
  onRequestChanges: () => void;
  onDelegate: () => void;
}

const ApprovalCard = ({
  approval,
  isSelected,
  onSelect,
  onApprove,
  onReject,
  onRequestChanges,
  onDelegate
}: ApprovalCardProps) => {
  const [showActions, setShowActions] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-500 border-red-500/30 bg-red-500/10';
      case 'medium':
        return 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10';
      case 'low':
        return 'text-green-500 border-green-500/30 bg-green-500/10';
      default:
        return 'text-gray-500 border-gray-500/30 bg-gray-500/10';
    }
  };

  const isOverdue = new Date(approval.dueDate) < new Date();

  return (
    <Card 
      className={`glass-card border-white/10 transition-all duration-200 hover:bg-white/10 ${
        isSelected ? 'ring-2 ring-primary' : ''
      } ${isOverdue ? 'border-red-500/30' : ''}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Checkbox
              checked={isSelected}
              onCheckedChange={onSelect}
              className="mt-1"
            />
            <div className="flex-1">
              <CardTitle className="text-lg flex items-center gap-2">
                {approval.title}
                {isOverdue && <AlertTriangle className="w-4 h-4 text-red-500" />}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {approval.description}
              </p>
            </div>
          </div>
          <Badge className={`${getPriorityColor(approval.priority)} border`}>
            {approval.priority}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Avatar className="w-6 h-6">
                <AvatarImage src={approval.requestorAvatar} />
                <AvatarFallback>{approval.requestor.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-muted-foreground">{approval.requestor}</span>
            </div>
            
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Due {approval.dueDate}</span>
            </div>
            
            {approval.amount !== 'N/A' && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <DollarSign className="w-4 h-4" />
                <span>{approval.amount}</span>
              </div>
            )}
          </div>
          
          <Badge variant="outline" className="text-xs">
            {approval.type}
          </Badge>
        </div>

        {/* Quick Actions - Mobile Swipe Support */}
        <div className={`flex gap-2 transition-all duration-200 ${
          showActions ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 md:opacity-100 md:translate-y-0'
        }`}>
          <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700" onClick={onApprove}>
            <CheckCircle className="w-4 h-4 mr-1" />
            Approve
          </Button>
          <Button size="sm" variant="destructive" className="flex-1" onClick={onReject}>
            <XCircle className="w-4 h-4 mr-1" />
            Reject
          </Button>
          <Button size="sm" variant="outline" className="flex-1" onClick={onRequestChanges}>
            <Edit className="w-4 h-4 mr-1" />
            Changes
          </Button>
          <Button size="sm" variant="outline" onClick={onDelegate}>
            <UserPlus className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost">
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApprovalCard;
