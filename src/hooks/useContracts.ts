
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/access/AuthProvider';
import { useToast } from '@/hooks/use-toast';

export interface Contract {
  id: string;
  title: string;
  description: string | null;
  contract_number: string | null;
  status: 'draft' | 'review' | 'approved' | 'signed' | 'executed' | 'expired' | 'terminated';
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

  const fetchContracts = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select(`
          *,
          profiles_created_by:profiles!contracts_created_by_fkey(full_name, email),
          profiles_assigned_to:profiles!contracts_assigned_to_fkey(full_name, email)
        `)
        .order('created_at', { ascending: false });

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
      // First, get the document upload record for this contract
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
