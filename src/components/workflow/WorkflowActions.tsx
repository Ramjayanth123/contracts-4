import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, FileText, ThumbsDown, RefreshCcw } from 'lucide-react';
import { useAccessControl } from '@/components/access/RoleBasedAccess';
import { documentWorkflowService } from '@/services/documentWorkflowService';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface WorkflowActionsProps {
  contractId: string;
  status: string;
  workflow_stage?: string;
  created_by?: string;
  legal_reviewer_id?: string;
  viewer_id?: string;
}

const WorkflowActions: React.FC<WorkflowActionsProps> = ({
  contractId,
  status,
  workflow_stage,
  created_by,
  legal_reviewer_id,
  viewer_id,
}) => {
  const { hasRole, userProfile } = useAccessControl();
  const { toast } = useToast();
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = hasRole('admin');
  const isLegal = hasRole('legal');
  const isViewer = hasRole('viewer');
  const currentUserId = userProfile?.id;

  // Check if current user is the assigned legal reviewer or viewer
  const isAssignedLegal = currentUserId && legal_reviewer_id === currentUserId;
  const isAssignedViewer = currentUserId && viewer_id === currentUserId;
  const isContractCreator = currentUserId && created_by === currentUserId;

  const handleAccept = async () => {
    if (!contractId) return;
    
    setIsSubmitting(true);
    try {
      console.log(`Legal reviewer accepting contract: ${contractId}`);
      
      // Legal reviewer accepts contract
      if (isLegal && isAssignedLegal && 
         (status === 'pending_review' || workflow_stage === 'legal_review')) {
        const success = await documentWorkflowService.approveContract(contractId);
        
        if (success) {
          // Refresh the page to show updated status
          window.location.reload();
        }
      }
    } catch (error) {
      console.error('Error accepting contract:', error);
      toast({
        title: "Error",
        description: "Failed to accept contract",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSign = async () => {
    if (!contractId) return;
    
    setIsSubmitting(true);
    try {
      console.log(`Viewer signing contract: ${contractId}`);
      console.log(`Contract status: ${status}, Workflow stage: ${workflow_stage}`);
      console.log(`User roles: isViewer=${isViewer}, isAssignedViewer=${isAssignedViewer}`);
      
      // Force validation to debug
      if (!isViewer) {
        console.error('User is not a viewer');
      }
      
      if (!isAssignedViewer) {
        console.error('User is not the assigned viewer for this contract');
      }
      
      if (status !== 'pending_signature' && workflow_stage !== 'awaiting_signature') {
        console.error(`Invalid status for signing. Status: ${status}, Workflow stage: ${workflow_stage}`);
      }
      
      // Viewer signs document - ensure we meet the conditions
      if (isViewer && isAssignedViewer) {
        console.log('All conditions met for signing, calling signContract');
        const success = await documentWorkflowService.signContract(contractId);
        
        if (success) {
          console.log('Sign successful, reloading page');
          // Force a hard reload to ensure we get fresh state
          window.location.href = window.location.href;
        } else {
          console.error('Sign returned false');
        }
      } else {
        console.error('Conditions not met for signing');
      }
    } catch (error) {
      console.error('Error signing contract:', error);
      toast({
        title: "Error",
        description: "Failed to sign contract",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openRejectDialog = () => {
    setRejectReason('');
    setShowRejectDialog(true);
  };

  const handleReject = async () => {
    if (!contractId || !rejectReason.trim()) return;
    
    setIsSubmitting(true);
    try {
      console.log(`Handling rejection for contract: ${contractId}, Status: ${status}, Workflow stage: ${workflow_stage}`);
      console.log(`User roles: isLegal=${isLegal}, isViewer=${isViewer}, isAssignedLegal=${isAssignedLegal}, isAssignedViewer=${isAssignedViewer}`);
      
      let success = false;
      
      // Legal reviewer rejects (sends back to admin)
      if (isLegal && isAssignedLegal && 
         (status === 'pending_review' || workflow_stage === 'legal_review')) {
        console.log('Legal reviewer rejecting contract');
        success = await documentWorkflowService.rejectContract(contractId, rejectReason);
      }
      
      // Viewer rejects (sends back to legal reviewer)
      if (isViewer && isAssignedViewer && 
         (status === 'pending_signature' || workflow_stage === 'awaiting_signature')) {
        console.log('Viewer rejecting contract');
        success = await documentWorkflowService.rejectContractByViewer(contractId, rejectReason);
      }
      
      if (success) {
        setShowRejectDialog(false);
        // Refresh the page to show updated status
        window.location.reload();
      }
    } catch (error) {
      console.error('Error rejecting contract:', error);
      toast({
        title: "Error",
        description: "Failed to reject contract",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = async () => {
    if (!contractId) return;
    
    setIsSubmitting(true);
    try {
      // Admin resets a rejected contract back to draft
      // Handle both 'rejected' status and 'draft' status with 'rejected' workflow_stage
      if (isAdmin && isContractCreator && 
          (status === 'rejected' || (status === 'draft' && workflow_stage === 'rejected'))) {
        const success = await documentWorkflowService.resetContractToDraft(contractId);
        
        if (success) {
          // Refresh the page to show updated status
          window.location.reload();
        }
      }
    } catch (error) {
      console.error('Error resetting contract:', error);
      toast({
        title: "Error",
        description: "Failed to reset contract",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Don't render any actions if document is already completed or user doesn't have a role
  if (status === 'completed' || status === 'signed' || !userProfile) {
    return null;
  }

  // Show Reset button for rejected contracts (admin only)
  if ((status === 'rejected' || (status === 'draft' && workflow_stage === 'rejected')) && isAdmin && isContractCreator) {
    return (
      <div className="mt-6 border-t pt-4 border-white/10">
        <h3 className="text-lg font-semibold mb-4">Contract Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Button 
            onClick={handleReset}
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Reset to Draft
          </Button>
        </div>
      </div>
    );
  }

  // Show different actions based on role and document state
  return (
    <div className="mt-6 border-t pt-4 border-white/10">
      <h3 className="text-lg font-semibold mb-4">Contract Actions</h3>
      <div className="flex flex-wrap gap-3">
        {/* Legal reviewer actions */}
        {isLegal && isAssignedLegal && 
         (status === 'pending_review' || workflow_stage === 'legal_review') && (
          <>
            <Button 
              onClick={handleAccept}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Accept
            </Button>
            <Button 
              onClick={openRejectDialog}
              disabled={isSubmitting}
              variant="destructive"
            >
              <ThumbsDown className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </>
        )}

        {/* Viewer actions */}
        {isViewer && isAssignedViewer && 
         (status === 'pending_signature' || workflow_stage === 'awaiting_signature') && (
          <>
            <Button 
              onClick={handleSign}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              <FileText className="h-4 w-4 mr-2" />
              Sign Document
            </Button>
            <Button 
              onClick={openRejectDialog}
              disabled={isSubmitting}
              variant="destructive"
            >
              <ThumbsDown className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </>
        )}
      </div>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Contract</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this contract.
              {isLegal ? " This will send the contract back to the admin." : 
                " This will send the contract back to the legal reviewer."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Label htmlFor="rejection-reason">Rejection Reason</Label>
            <Textarea
              id="rejection-reason"
              placeholder="Enter the reason for rejection..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="mt-2"
              rows={4}
            />
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowRejectDialog(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={isSubmitting || !rejectReason.trim()}
            >
              {isSubmitting ? "Processing..." : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkflowActions; 