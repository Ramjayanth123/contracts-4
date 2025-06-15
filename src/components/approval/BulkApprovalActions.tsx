
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Edit, UserPlus } from 'lucide-react';

interface BulkApprovalActionsProps {
  selectedCount: number;
  onBulkAction: (action: string) => void;
}

const BulkApprovalActions = ({ selectedCount, onBulkAction }: BulkApprovalActionsProps) => {
  return (
    <Card className="glass-card border-white/10 bg-primary/10">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            {selectedCount} approval{selectedCount > 1 ? 's' : ''} selected
          </span>
          
          <div className="flex gap-2">
            <Button 
              size="sm" 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => onBulkAction('approve')}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Bulk Approve
            </Button>
            <Button 
              size="sm" 
              variant="destructive"
              onClick={() => onBulkAction('reject')}
            >
              <XCircle className="w-4 h-4 mr-1" />
              Bulk Reject
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onBulkAction('delegate')}
            >
              <UserPlus className="w-4 h-4 mr-1" />
              Bulk Delegate
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BulkApprovalActions;
