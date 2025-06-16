import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface WorkflowContract {
  id: string;
  title: string;
  status: string;  // Can be: 'draft', 'pending_review', 'pending_signature', 'rejected', 'completed', etc.
  workflow_stage: string;  // Can be: 'draft', 'legal_review', 'awaiting_signature', 'rejected', 'rejected_by_viewer', 'completed', etc.
  created_by: string;
  legal_reviewer_id?: string;
  viewer_id?: string;
  rejection_reason?: string;
  sent_for_review_at?: string;
  reviewed_at?: string;
  sent_for_signature_at?: string;
  signed_at?: string;
  rejected_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'legal' | 'viewer';
}

class DocumentWorkflowService {
  // Get users by role for assignment
  async getUsersByRole(role: 'legal' | 'viewer'): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, role')
        .eq('role', role)
        .order('full_name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Error fetching ${role} users:`, error);
      return [];
    }
  }

  // Send contract for review (Admin action)
  async sendForReview(contractId: string, legalReviewerId: string, viewerId: string): Promise<boolean> {
    try {
      // Validate inputs
      if (!contractId || contractId === 'undefined') {
        throw new Error('Invalid contract ID');
      }
      if (!legalReviewerId || legalReviewerId === 'undefined') {
        throw new Error('Invalid legal reviewer ID');
      }
      if (!viewerId || viewerId === 'undefined') {
        throw new Error('Invalid viewer ID');
      }

      console.log(`Sending contract ${contractId} for review to legal reviewer ${legalReviewerId} and viewer ${viewerId}`);

      const { error } = await supabase
        .from('contracts')
        .update({
          status: 'pending_review',
          workflow_stage: 'legal_review',
          legal_reviewer_id: legalReviewerId,
          viewer_id: viewerId,
          sent_for_review_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          // Clear any previous rejection data
          rejection_reason: null,
          rejected_at: null
        })
        .eq('id', contractId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Contract sent for legal review",
      });

      return true;
    } catch (error) {
      console.error('Error sending contract for review:', error);
      toast({
        title: "Error",
        description: "Failed to send contract for review",
        variant: "destructive",
      });
      return false;
    }
  }

  // Approve contract (Legal action)
  async approveContract(contractId: string): Promise<boolean> {
    try {
      // Validate UUID
      if (!contractId || contractId === 'undefined') {
        throw new Error('Invalid contract ID');
      }

      const { error } = await supabase
        .from('contracts')
        .update({
          status: 'pending_signature',
          workflow_stage: 'awaiting_signature',
          updated_at: new Date().toISOString()
        })
        .eq('id', contractId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Contract approved and sent for signature",
      });

      return true;
    } catch (error) {
      console.error('Error approving contract:', error);
      toast({
        title: "Error",
        description: "Failed to approve contract",
        variant: "destructive",
      });
      return false;
    }
  }

  // Reject contract (Legal action)
  async rejectContract(contractId: string, reason: string): Promise<boolean> {
    try {
      // Validate UUID
      if (!contractId || contractId === 'undefined') {
        throw new Error('Invalid contract ID');
      }

      console.log(`Rejecting contract ${contractId} by legal with reason: ${reason}`);

      const { error } = await supabase
        .from('contracts')
        .update({
          status: 'draft',
          workflow_stage: 'rejected',
          rejection_reason: reason,
          rejected_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          // Reset these fields since we're going back to draft
          reviewed_at: null,
          sent_for_review_at: null
        })
        .eq('id', contractId);

      if (error) {
        console.error('Supabase error in rejectContract:', error);
        throw error;
      }

      console.log(`Successfully rejected contract ${contractId} by legal`);

      toast({
        title: "Success",
        description: "Contract rejected and sent back to admin",
      });

      return true;
    } catch (error) {
      console.error('Error rejecting contract by legal:', error);
      toast({
        title: "Error",
        description: "Failed to reject contract",
        variant: "destructive",
      });
      return false;
    }
  }

  // Sign contract (Viewer action)
  async signContract(contractId: string): Promise<boolean> {
    try {
      // Validate UUID
      if (!contractId || contractId === 'undefined') {
        throw new Error('Invalid contract ID');
      }

      console.log(`Signing contract ${contractId}`);
      
      // First get the current contract status to debug
      const { data: contractBefore, error: fetchError } = await supabase
        .from('contracts')
        .select('status, workflow_stage')
        .eq('id', contractId)
        .single();
        
      if (fetchError) {
        console.error('Error fetching contract before signing:', fetchError);
        throw fetchError;
      }
      
      console.log('Contract status before signing:', contractBefore);

      // Now update the contract
      const { data, error } = await supabase
        .from('contracts')
        .update({
          status: 'completed',
          workflow_stage: 'completed',
          signed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', contractId)
        .select();

      if (error) {
        console.error('Supabase error in signContract:', error);
        throw error;
      }
      
      console.log('Contract update result:', data);
      console.log(`Successfully signed contract ${contractId}`);

      // Verify the update worked
      const { data: contractAfter, error: verifyError } = await supabase
        .from('contracts')
        .select('status, workflow_stage')
        .eq('id', contractId)
        .single();
        
      if (verifyError) {
        console.error('Error verifying contract after signing:', verifyError);
      } else {
        console.log('Contract status after signing:', contractAfter);
      }

      toast({
        title: "Success",
        description: "Contract signed successfully",
      });

      return true;
    } catch (error) {
      console.error('Error signing contract:', error);
      toast({
        title: "Error",
        description: "Failed to sign contract",
        variant: "destructive",
      });
      return false;
    }
  }

  // Reject contract (Viewer action)
  async rejectContractByViewer(contractId: string, reason: string): Promise<boolean> {
    try {
      // Validate UUID
      if (!contractId || contractId === 'undefined') {
        throw new Error('Invalid contract ID');
      }

      console.log(`Rejecting contract ${contractId} by viewer with reason: ${reason}`);

      const { error } = await supabase
        .from('contracts')
        .update({
          status: 'pending_review',
          workflow_stage: 'legal_review',
          rejection_reason: reason,
          rejected_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          // Reset these fields since we're going back to legal review
          signed_at: null,
          sent_for_signature_at: null
        })
        .eq('id', contractId);

      if (error) {
        console.error('Supabase error in rejectContractByViewer:', error);
        throw error;
      }

      console.log(`Successfully rejected contract ${contractId} by viewer`);

      toast({
        title: "Success",
        description: "Contract rejected and sent back to legal reviewer",
      });

      return true;
    } catch (error) {
      console.error('Error rejecting contract by viewer:', error);
      toast({
        title: "Error",
        description: "Failed to reject contract",
        variant: "destructive",
      });
      return false;
    }
  }

  // Get contracts for legal review
  async getContractsForLegalReview(userId: string): Promise<WorkflowContract[]> {
    try {
      // Validate UUID
      if (!userId || userId === 'undefined') {
        throw new Error('Invalid user ID');
      }

      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('legal_reviewer_id', userId)
        .eq('status', 'pending_review')
        .order('sent_for_review_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching contracts for legal review:', error);
      return [];
    }
  }

  // Get contracts for viewer signature
  async getContractsForSignature(userId: string): Promise<WorkflowContract[]> {
    try {
      // Validate UUID
      if (!userId || userId === 'undefined') {
        throw new Error('Invalid user ID');
      }

      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('viewer_id', userId)
        .eq('status', 'pending_signature')
        .order('sent_for_signature_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching contracts for signature:', error);
      return [];
    }
  }

  // Get rejected contracts for admin
  async getRejectedContracts(userId: string): Promise<WorkflowContract[]> {
    try {
      // Validate UUID
      if (!userId || userId === 'undefined') {
        throw new Error('Invalid user ID');
      }

      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('created_by', userId)
        .eq('status', 'rejected')
        .order('rejected_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching rejected contracts:', error);
      return [];
    }
  }

  // Reset contract to draft (Admin action for rejected contracts)
  async resetContractToDraft(contractId: string): Promise<boolean> {
    try {
      // Validate UUID
      if (!contractId || contractId === 'undefined') {
        throw new Error('Invalid contract ID');
      }

      console.log(`Resetting contract ${contractId} to draft state`);

      const { error } = await supabase
        .from('contracts')
        .update({
          status: 'draft',
          workflow_stage: 'draft',
          rejection_reason: null,
          rejected_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', contractId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Contract reset to draft status",
      });

      return true;
    } catch (error) {
      console.error('Error resetting contract:', error);
      toast({
        title: "Error",
        description: "Failed to reset contract",
        variant: "destructive",
      });
      return false;
    }
  }
}

export const documentWorkflowService = new DocumentWorkflowService();