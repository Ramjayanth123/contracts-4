
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Clock, CheckCircle, XCircle, AlertTriangle, User, Calendar } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import ApprovalCard from './ApprovalCard';
import BulkApprovalActions from './BulkApprovalActions';

const ApprovalDashboard = () => {
  const [selectedApprovals, setSelectedApprovals] = useState<string[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState([
    {
      id: '1',
      title: 'Service Agreement - TechCorp',
      requestor: 'Sarah Johnson',
      requestorAvatar: '/placeholder.svg',
      dueDate: '2024-06-15',
      priority: 'high',
      amount: '$50,000',
      type: 'Service Agreement',
      description: 'Annual software maintenance contract with TechCorp...',
      overdue: false
    },
    {
      id: '2',
      title: 'NDA - StartupXYZ',
      requestor: 'Mike Chen',
      requestorAvatar: '/placeholder.svg',
      dueDate: '2024-06-14',
      priority: 'medium',
      amount: 'N/A',
      type: 'NDA',
      description: 'Non-disclosure agreement for upcoming partnership...',
      overdue: true
    },
    {
      id: '3',
      title: 'Vendor Contract - SupplyChain Inc',
      requestor: 'Emily Davis',
      requestorAvatar: '/placeholder.svg',
      dueDate: '2024-06-16',
      priority: 'low',
      amount: '$25,000',
      type: 'Vendor Contract',
      description: 'Quarterly supply agreement for raw materials...',
      overdue: false
    }
  ]);

  const sentApprovals = [
    {
      id: '4',
      title: 'Employment Contract - New Hire',
      approver: 'Legal Team',
      sentDate: '2024-06-12',
      status: 'pending',
      type: 'Employment Contract'
    }
  ];

  const completedApprovals = [
    {
      id: '5',
      title: 'License Agreement - SoftwareCo',
      approver: 'John Smith',
      completedDate: '2024-06-11',
      decision: 'approved',
      type: 'License Agreement'
    }
  ];

  const handleSelectApproval = (approvalId: string, checked: boolean) => {
    if (checked) {
      setSelectedApprovals([...selectedApprovals, approvalId]);
    } else {
      setSelectedApprovals(selectedApprovals.filter(id => id !== approvalId));
    }
  };

  const handleSelectAll = (approvals: any[], checked: boolean) => {
    if (checked) {
      setSelectedApprovals([...selectedApprovals, ...approvals.map(a => a.id)]);
    } else {
      setSelectedApprovals(selectedApprovals.filter(id => !approvals.some(a => a.id === id)));
    }
  };

  const handleApprove = (approvalId: string) => {
    setPendingApprovals(prev => prev.filter(a => a.id !== approvalId));
    toast({
      title: "Approval Successful",
      description: `Contract has been approved`,
    });
  };

  const handleReject = (approvalId: string) => {
    setPendingApprovals(prev => prev.filter(a => a.id !== approvalId));
    toast({
      title: "Approval Rejected",
      description: `Contract has been rejected`,
    });
  };

  const handleRequestChanges = (approvalId: string) => {
    toast({
      title: "Changes Requested",
      description: `Changes have been requested for this contract`,
    });
  };

  const handleDelegate = (approvalId: string) => {
    toast({
      title: "Delegated Successfully",
      description: `Contract has been delegated to another approver`,
    });
  };

  const handleBulkAction = (action: string) => {
    const count = selectedApprovals.length;
    switch (action) {
      case 'approve':
        setPendingApprovals(prev => prev.filter(a => !selectedApprovals.includes(a.id)));
        toast({
          title: "Bulk Approval Successful",
          description: `${count} contracts have been approved`,
        });
        break;
      case 'reject':
        setPendingApprovals(prev => prev.filter(a => !selectedApprovals.includes(a.id)));
        toast({
          title: "Bulk Rejection Successful",
          description: `${count} contracts have been rejected`,
        });
        break;
      case 'delegate':
        toast({
          title: "Bulk Delegation Successful",
          description: `${count} contracts have been delegated`,
        });
        break;
    }
    setSelectedApprovals([]);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="glass-card border-white/10">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Pending My Approval
            <Badge variant="secondary" className="ml-1">{pendingApprovals.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="sent" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Sent for Approval
            <Badge variant="secondary" className="ml-1">{sentApprovals.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Completed
            <Badge variant="secondary" className="ml-1">{completedApprovals.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {selectedApprovals.length > 0 && (
            <BulkApprovalActions
              selectedCount={selectedApprovals.length}
              onBulkAction={handleBulkAction}
            />
          )}
          
          <div className="flex items-center gap-2 mb-4">
            <Checkbox
              checked={selectedApprovals.length === pendingApprovals.length}
              onCheckedChange={(checked) => handleSelectAll(pendingApprovals, checked as boolean)}
            />
            <span className="text-sm text-muted-foreground">Select All</span>
          </div>

          <div className="grid gap-4">
            {pendingApprovals.map((approval) => (
              <ApprovalCard
                key={approval.id}
                approval={approval}
                isSelected={selectedApprovals.includes(approval.id)}
                onSelect={(checked) => handleSelectApproval(approval.id, checked)}
                onApprove={() => handleApprove(approval.id)}
                onReject={() => handleReject(approval.id)}
                onRequestChanges={() => handleRequestChanges(approval.id)}
                onDelegate={() => handleDelegate(approval.id)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sent" className="space-y-4">
          <div className="grid gap-4">
            {sentApprovals.map((approval) => (
              <Card key={approval.id} className="glass-card border-white/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{approval.title}</CardTitle>
                    <Badge variant={approval.status === 'pending' ? 'secondary' : 'default'}>
                      {approval.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {approval.approver}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Sent {approval.sentDate}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="grid gap-4">
            {completedApprovals.map((approval) => (
              <Card key={approval.id} className="glass-card border-white/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{approval.title}</CardTitle>
                    <Badge variant={approval.decision === 'approved' ? 'default' : 'destructive'}>
                      {approval.decision}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {approval.approver}
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Completed {approval.completedDate}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApprovalDashboard;
