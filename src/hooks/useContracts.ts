import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/access/AuthProvider';
import { useToast } from '@/hooks/use-toast';

export interface Contract {
  id: string;
  title: string;
  description: string | null;
  contract_number: string | null;
  status: 'draft' | 'review' | 'approved' | 'signed' | 'executed' | 'expired' | 'terminated' | 'pending_review' | 'pending_signature' | 'rejected' | 'completed';
  workflow_stage?: string | null; // draft, legal_review, awaiting_signature, rejected, rejected_by_viewer, completed
  counterparty: string | null;
  counterparty_email: string | null;
  start_date: string | null;
  end_date: string | null;
  value: number | null;
  currency: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  assigned_to: string | null;
  legal_reviewer_id?: string | null;
  viewer_id?: string | null;
  rejection_reason?: string | null;
  sent_for_review_at?: string | null;
  reviewed_at?: string | null;
  sent_for_signature_at?: string | null;
  signed_at?: string | null;
  rejected_at?: string | null;
  tags: string[] | null;
  original_file_name: string | null;
  original_file_size: number | null;
  extracted_content: string | null;
  processing_status: string | null;
  profiles_created_by?: {
    full_name: string | null;
    email: string;
  };
  profiles_assigned_to?: {
    full_name: string | null;
    email: string;
  };
}

export const useContracts = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Helper function to check if user is associated with a contract
  const isUserAssociatedWithContract = (contract: Contract, userId: string) => {
    return (
      contract.created_by === userId ||
      contract.assigned_to === userId ||
      contract.legal_reviewer_id === userId ||
      contract.viewer_id === userId
    );
  };

  const fetchContracts = async () => {
    if (!user) return;
    
    try {
      // First, get the user's role
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
        
      if (profileError) {
        throw profileError;
      }
      
      const userRole = profileData?.role;
      
      // Query contracts based on role
      const query = supabase
        .from('contracts')
        .select(`
          *,
          profiles_created_by:profiles!contracts_created_by_fkey(full_name, email),
          profiles_assigned_to:profiles!contracts_assigned_to_fkey(full_name, email)
        `)
        .order('created_at', { ascending: false });
      
      // Admin can see all contracts
      // Legal and viewer roles can only see contracts they're associated with
      if (userRole !== 'admin') {
        query.or(`created_by.eq.${user.id},assigned_to.eq.${user.id},legal_reviewer_id.eq.${user.id},viewer_id.eq.${user.id}`);
      }
      
      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setContracts(data || []);
    } catch (error: any) {
      console.error('Error fetching contracts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch contracts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getContractDocumentUrl = async (contractId: string) => {
    if (!user) return null;

    try {
      // First, check if user has permission to access this contract
      const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      const userRole = profileData?.role;
      
      // Get the contract to check permissions
      const { data: contractData, error: contractError } = await supabase
        .from('contracts')
        .select('*')
        .eq('id', contractId)
        .single();
        
      if (contractError || !contractData) {
        console.error('Contract not found or error:', contractError);
        return null;
      }
      
      // Check if user has permission to access this document
      const hasPermission = 
        userRole === 'admin' || 
        isUserAssociatedWithContract(contractData, user.id);
      
      if (!hasPermission) {
        console.error('User does not have permission to access this document');
        toast({
          title: "Access Denied",
          description: "You don't have permission to access this document",
          variant: "destructive",
        });
        return null;
      }

      // Now get the document upload record for this contract
      const { data: documentData, error: docError } = await supabase
        .from('document_uploads')
        .select('storage_path, file_name')
        .eq('contract_id', contractId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (docError || !documentData) {
        console.log('No document found for contract:', contractId);
        return null;
      }

      // Get the signed URL for the document
      const { data: urlData, error: urlError } = await supabase.storage
        .from('contracts')
        .createSignedUrl(documentData.storage_path, 3600); // 1 hour expiry

      if (urlError) {
        throw urlError;
      }

      return {
        url: urlData.signedUrl,
        fileName: documentData.file_name,
        storagePath: documentData.storage_path
      };
    } catch (error: any) {
      console.error('Error fetching contract document:', error);
      toast({
        title: "Error",
        description: "Failed to fetch contract document",
        variant: "destructive",
      });
      return null;
    }
  };

  const createContract = async (contractData: Partial<Contract>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('contracts')
        .insert([{
          title: contractData.title || 'Untitled Contract',
          description: contractData.description,
          contract_number: contractData.contract_number,
          status: contractData.status || 'draft',
          counterparty: contractData.counterparty,
          counterparty_email: contractData.counterparty_email,
          start_date: contractData.start_date,
          end_date: contractData.end_date,
          value: contractData.value,
          currency: contractData.currency,
          tags: contractData.tags,
          original_file_name: contractData.original_file_name,
          original_file_size: contractData.original_file_size,
          extracted_content: contractData.extracted_content,
          processing_status: contractData.processing_status,
          created_by: user.id,
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // If a document was uploaded during contract creation, link it to the contract
      if (contractData.original_file_name) {
        const { error: updateError } = await supabase
          .from('document_uploads')
          .update({ contract_id: data.id })
          .eq('file_name', contractData.original_file_name)
          .eq('uploaded_by', user.id)
          .is('contract_id', null)
          .order('created_at', { ascending: false })
          .limit(1);

        if (updateError) {
          console.warn('Failed to link document to contract:', updateError);
        } else {
          console.log('Successfully linked document to contract:', data.id);
        }
      }

      await fetchContracts(); // Refresh the list
      toast({
        title: "Success",
        description: "Contract created successfully",
      });

      return data;
    } catch (error: any) {
      console.error('Error creating contract:', error);
      toast({
        title: "Error",
        description: "Failed to create contract",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateContract = async (id: string, updates: Partial<Contract>) => {
    try {
      const { error } = await supabase
        .from('contracts')
        .update(updates)
        .eq('id', id);

      if (error) {
        throw error;
      }

      await fetchContracts(); // Refresh the list
      toast({
        title: "Success",
        description: "Contract updated successfully",
      });
    } catch (error: any) {
      console.error('Error updating contract:', error);
      toast({
        title: "Error",
        description: "Failed to update contract",
        variant: "destructive",
      });
    }
  };

  const deleteContract = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contracts')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      await fetchContracts(); // Refresh the list
      toast({
        title: "Success",
        description: "Contract deleted successfully",
      });
    } catch (error: any) {
      console.error('Error deleting contract:', error);
      toast({
        title: "Error",
        description: "Failed to delete contract",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchContracts();
    }
  }, [user]);

  return {
    contracts,
    loading,
    createContract,
    updateContract,
    deleteContract,
    refetch: fetchContracts,
    getContractDocumentUrl,
  };
};
