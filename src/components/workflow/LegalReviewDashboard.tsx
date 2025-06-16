import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CheckCircle, XCircle, FileText, Clock, AlertTriangle, Eye } from 'lucide-react';
import { documentWorkflowService, WorkflowContract } from '@/services/documentWorkflowService';
import { useAuth } from '@/components/access/AuthProvider';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const LegalReviewDashboard: React.FC = () => {
  const [contracts, setContracts] = useState<WorkflowContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedContract, setSelectedContract] = useState<WorkflowContract | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadContracts();
    }
  }, [user]);

  const loadContracts = async () => {
    if (!user) return;
    
    // Validate user ID
    if (!user.id || user.id === 'undefined') {
      toast({
        title: "Error",
        description: "Invalid user ID. Please refresh or log in again.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    try {
      const data = await documentWorkflowService.getContractsForLegalReview(user.id);
      setContracts(data);
    } catch (error) {
      console.error('Error loading contracts:', error);
      toast({
        title: "Error",
        description: "Failed to load contracts for review",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (contractId: string) => {
    // Validate contractId
    if (!contractId || contractId === 'undefined') {
      toast({
        title: "Error",
        description: "Invalid contract ID",
        variant: "destructive",
      });
      return;
    }
    
    setActionLoading(contractId);
    try {
      const success = await documentWorkflowService.approveContract(contractId);
      if (success) {
        await loadContracts(); // Refresh the list
      }
    } catch (error) {
      console.error('Error approving contract:', error);
      toast({
        title: "Error",
        description: `Failed to approve contract: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (contractId: string) => {
    // Validate contractId
    if (!contractId || contractId === 'undefined') {
      toast({
        title: "Error",
        description: "Invalid contract ID",
        variant: "destructive",
      });
      return;
    }
    
    if (!rejectionReason.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      });
      return;
    }

    setActionLoading(contractId);
    try {
      const success = await documentWorkflowService.rejectContract(contractId, rejectionReason);
      if (success) {
        setRejectionReason('');
        setSelectedContract(null);
        await loadContracts(); // Refresh the list
      }
    } catch (error) {
      console.error('Error rejecting contract:', error);
      toast({
        title: "Error",
        description: `Failed to reject contract: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewContract = (contractId: string) => {
    navigate(`/contracts/${contractId}`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6" />
          <h2 className="text-2xl font-bold">Legal Review Dashboard</h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6" />
          <h2 className="text-2xl font-bold">Legal Review Dashboard</h2>
        </div>
        <Badge variant="secondary" className="text-sm">
          {contracts.length} contract{contracts.length !== 1 ? 's' : ''} pending review
        </Badge>
      </div>

      {contracts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
            <p className="text-muted-foreground text-center">
              No contracts are currently pending your review.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {contracts.map((contract) => (
            <Card key={contract.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{contract.title}</CardTitle>
                    <CardDescription>
                      Sent for review {contract.sent_for_review_at && 
                        formatDistanceToNow(new Date(contract.sent_for_review_at), { addSuffix: true })
                      }
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Pending Review
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewContract(contract.id)}
                    className="flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View Contract
                  </Button>
                  
                  <div className="flex items-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setSelectedContract(contract)}
                          disabled={actionLoading === contract.id}
                          className="flex items-center gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Reject Contract</DialogTitle>
                          <DialogDescription>
                            Please provide a reason for rejecting "{contract.title}". This feedback will be sent to the admin.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="rejection-reason">Reason for Rejection</Label>
                            <Textarea
                              id="rejection-reason"
                              placeholder="Please explain why this contract needs to be revised..."
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              rows={4}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setRejectionReason('');
                              setSelectedContract(null);
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleReject(contract.id)}
                            disabled={!rejectionReason.trim() || actionLoading === contract.id}
                          >
                            {actionLoading === contract.id ? (
                              <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Rejecting...
                              </div>
                            ) : (
                              'Reject Contract'
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Button
                      onClick={() => handleApprove(contract.id)}
                      disabled={actionLoading === contract.id}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      {actionLoading === contract.id ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Approving...
                        </div>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default LegalReviewDashboard;