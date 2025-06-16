import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  PenTool,
  AlertTriangle,
  Eye,
  BarChart3
} from 'lucide-react';
import { documentWorkflowService, WorkflowContract } from '@/services/documentWorkflowService';
import { useAuth } from '@/components/access/AuthProvider';
import { useAccessControl } from '@/components/access/RoleBasedAccess';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface WorkflowStats {
  total: number;
  draft: number;
  pending_review: number;
  pending_signature: number;
  approved: number;
  rejected: number;
  completed: number;
}

const WorkflowDashboard: React.FC = () => {
  const [contracts, setContracts] = useState<WorkflowContract[]>([]);
  const [stats, setStats] = useState<WorkflowStats>({
    total: 0,
    draft: 0,
    pending_review: 0,
    pending_signature: 0,
    approved: 0,
    rejected: 0,
    completed: 0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { hasRole } = useAccessControl();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && hasRole('admin')) {
      loadWorkflowData();
    }
  }, [user]);

  const loadWorkflowData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await documentWorkflowService.getAllContractsForAdmin(user.id);
      setContracts(data);
      
      // Calculate stats
      const newStats = data.reduce((acc, contract) => {
        acc.total++;
        acc[contract.status as keyof WorkflowStats]++;
        return acc;
      }, {
        total: 0,
        draft: 0,
        pending_review: 0,
        pending_signature: 0,
        approved: 0,
        rejected: 0,
        completed: 0
      });
      
      setStats(newStats);
    } catch (error) {
      console.error('Error loading workflow data:', error);
      toast({
        title: "Error",
        description: "Failed to load workflow data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewContract = (contractId: string) => {
    navigate(`/contracts/${contractId}`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <FileText className="w-4 h-4" />;
      case 'pending_review':
        return <Clock className="w-4 h-4" />;
      case 'pending_signature':
        return <PenTool className="w-4 h-4" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'pending_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending_signature':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filterContractsByStatus = (status: string) => {
    return contracts.filter(contract => contract.status === status);
  };

  const renderStatsCards = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Draft</p>
              <p className="text-2xl font-bold">{stats.draft}</p>
            </div>
            <FileText className="w-8 h-8 text-gray-500" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Review</p>
              <p className="text-2xl font-bold">{stats.pending_review}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Signature</p>
              <p className="text-2xl font-bold">{stats.pending_signature}</p>
            </div>
            <PenTool className="w-8 h-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Approved</p>
              <p className="text-2xl font-bold">{stats.approved}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Rejected</p>
              <p className="text-2xl font-bold">{stats.rejected}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold">{stats.completed}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContractList = (contractList: WorkflowContract[], emptyMessage: string) => (
    <div className="space-y-4">
      {contractList.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">All clear!</h3>
            <p className="text-muted-foreground text-center">{emptyMessage}</p>
          </CardContent>
        </Card>
      ) : (
        contractList.map((contract) => (
          <Card key={contract.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">{contract.title}</h3>
                    <Badge className={`flex items-center gap-1 ${getStatusColor(contract.status)}`}>
                      {getStatusIcon(contract.status)}
                      {contract.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Created {formatDistanceToNow(new Date(contract.created_at), { addSuffix: true })}</p>
                    {contract.legal_reviewer_name && (
                      <p>Legal Reviewer: {contract.legal_reviewer_name}</p>
                    )}
                    {contract.viewer_name && (
                      <p>Viewer: {contract.viewer_name}</p>
                    )}
                    {contract.rejection_reason && (
                      <p className="text-red-600">Rejection Reason: {contract.rejection_reason}</p>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewContract(contract.id)}
                  className="flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  if (!hasRole('admin')) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
          <p className="text-muted-foreground text-center">
            You need admin privileges to access the workflow dashboard.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6" />
          <h2 className="text-2xl font-bold">Workflow Dashboard</h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Users className="w-6 h-6" />
        <h2 className="text-2xl font-bold">Workflow Dashboard</h2>
      </div>

      {renderStatsCards()}

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
          <TabsTrigger value="draft">Draft ({stats.draft})</TabsTrigger>
          <TabsTrigger value="pending_review">Review ({stats.pending_review})</TabsTrigger>
          <TabsTrigger value="pending_signature">Signature ({stats.pending_signature})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({stats.approved})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({stats.rejected})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({stats.completed})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          {renderContractList(contracts, "No contracts found.")}
        </TabsContent>
        
        <TabsContent value="draft" className="mt-6">
          {renderContractList(filterContractsByStatus('draft'), "No draft contracts.")}
        </TabsContent>
        
        <TabsContent value="pending_review" className="mt-6">
          {renderContractList(filterContractsByStatus('pending_review'), "No contracts pending review.")}
        </TabsContent>
        
        <TabsContent value="pending_signature" className="mt-6">
          {renderContractList(filterContractsByStatus('pending_signature'), "No contracts pending signature.")}
        </TabsContent>
        
        <TabsContent value="approved" className="mt-6">
          {renderContractList(filterContractsByStatus('approved'), "No approved contracts.")}
        </TabsContent>
        
        <TabsContent value="rejected" className="mt-6">
          {renderContractList(filterContractsByStatus('rejected'), "No rejected contracts.")}
        </TabsContent>
        
        <TabsContent value="completed" className="mt-6">
          {renderContractList(filterContractsByStatus('completed'), "No completed contracts.")}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkflowDashboard;