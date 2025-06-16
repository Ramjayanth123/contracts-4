-- Add workflow-related fields to contracts table
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS workflow_stage text;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS legal_reviewer_id uuid REFERENCES auth.users(id);
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS viewer_id uuid REFERENCES auth.users(id);
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS rejection_reason text;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS sent_for_review_at timestamp with time zone;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS reviewed_at timestamp with time zone;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS sent_for_signature_at timestamp with time zone;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS signed_at timestamp with time zone;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS rejected_at timestamp with time zone;

-- Add restriction for document uploads to admin users only
DROP POLICY IF EXISTS "Users can upload documents" ON storage.objects;

-- Add workflow fields to contracts table for document approval process
ALTER TABLE public.contracts 
ADD COLUMN legal_reviewer_id UUID REFERENCES public.profiles(id),
ADD COLUMN viewer_id UUID REFERENCES public.profiles(id),
ADD COLUMN rejection_reason TEXT,
ADD COLUMN workflow_stage TEXT DEFAULT 'draft',
ADD COLUMN sent_for_review_at TIMESTAMPTZ,
ADD COLUMN reviewed_at TIMESTAMPTZ,
ADD COLUMN sent_for_signature_at TIMESTAMPTZ,
ADD COLUMN signed_at TIMESTAMPTZ,
ADD COLUMN rejected_at TIMESTAMPTZ;

-- Update contract_status enum to include new workflow statuses
ALTER TYPE contract_status ADD VALUE IF NOT EXISTS 'pending_review';
ALTER TYPE contract_status ADD VALUE IF NOT EXISTS 'pending_signature';
ALTER TYPE contract_status ADD VALUE IF NOT EXISTS 'rejected';
ALTER TYPE contract_status ADD VALUE IF NOT EXISTS 'completed';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_contracts_legal_reviewer ON public.contracts(legal_reviewer_id);
CREATE INDEX IF NOT EXISTS idx_contracts_viewer ON public.contracts(viewer_id);
CREATE INDEX IF NOT EXISTS idx_contracts_workflow_stage ON public.contracts(workflow_stage);

-- Add RLS policies for workflow access
CREATE POLICY "Legal reviewers can view assigned contracts" ON public.contracts
    FOR SELECT USING (
        legal_reviewer_id = auth.uid() OR 
        created_by = auth.uid() OR
        assigned_to = auth.uid()
    );

CREATE POLICY "Viewers can view assigned contracts" ON public.contracts
    FOR SELECT USING (
        viewer_id = auth.uid() OR 
        created_by = auth.uid() OR
        assigned_to = auth.uid()
    );

-- Add function to automatically update workflow timestamps
CREATE OR REPLACE FUNCTION update_workflow_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  -- Set timestamps based on status changes
  IF NEW.status = 'pending_review' AND (OLD.status IS NULL OR OLD.status != 'pending_review') THEN
    NEW.sent_for_review_at = NOW();
  END IF;
  
  IF NEW.status = 'pending_signature' AND (OLD.status IS NULL OR OLD.status != 'pending_signature') THEN
    NEW.reviewed_at = NOW();
    NEW.sent_for_signature_at = NOW();
  END IF;
  
  IF NEW.status = 'signed' AND (OLD.status IS NULL OR OLD.status != 'signed') THEN
    NEW.signed_at = NOW();
  END IF;
  
  IF (NEW.status = 'rejected' OR NEW.workflow_stage = 'rejected' OR NEW.workflow_stage = 'rejected_by_viewer') AND
     (OLD.status IS NULL OR (OLD.status != 'rejected' AND OLD.workflow_stage != 'rejected' AND OLD.workflow_stage != 'rejected_by_viewer')) THEN
    NEW.rejected_at = NOW();
  END IF;
  
  -- Always update the updated_at timestamp
  NEW.updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for workflow timestamps
CREATE TRIGGER trigger_update_workflow_timestamps
    BEFORE UPDATE ON public.contracts
    FOR EACH ROW
    EXECUTE FUNCTION update_workflow_timestamps();

-- Create function to check if a user has access to a contract
CREATE OR REPLACE FUNCTION public.user_has_contract_access(contract_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  is_associated BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.contracts
    WHERE id = contract_id AND (
      created_by = user_id OR
      assigned_to = user_id OR
      legal_reviewer_id = user_id OR
      viewer_id = user_id
    )
  ) INTO is_associated;
  
  RETURN is_associated;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update document_uploads RLS policies
DROP POLICY IF EXISTS "Users can view document uploads" ON public.document_uploads;
CREATE POLICY "Users can view document uploads" ON public.document_uploads 
FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) OR
  (
    contract_id IS NOT NULL AND 
    public.user_has_contract_access(contract_id, auth.uid())
  ) OR
  uploaded_by = auth.uid()
);

-- Update storage access policies
DROP POLICY IF EXISTS "Users can download contract documents" ON storage.objects;
CREATE POLICY "Users can download contract documents" 
ON storage.objects FOR SELECT 
TO authenticated
USING (
  bucket_id = 'contracts' AND (
    -- Admin can access all documents
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    ) OR
    -- Users can access documents they uploaded
    EXISTS (
      SELECT 1 FROM public.document_uploads
      WHERE storage_path = name AND uploaded_by = auth.uid()
    ) OR
    -- Users can access documents for contracts they're associated with
    EXISTS (
      SELECT 1 FROM public.document_uploads d
      JOIN public.contracts c ON d.contract_id = c.id
      WHERE d.storage_path = name AND (
        c.created_by = auth.uid() OR
        c.assigned_to = auth.uid() OR
        c.legal_reviewer_id = auth.uid() OR
        c.viewer_id = auth.uid()
      )
    )
  )
);

-- Update policy for document_uploads table for admin-only creation
DROP POLICY IF EXISTS "Legal and admin can manage document uploads" ON public.document_uploads;
CREATE POLICY "Only admins can create document uploads" ON public.document_uploads 
FOR INSERT TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Legal and admin can update document uploads" ON public.document_uploads 
FOR UPDATE TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND (role = 'legal' OR role = 'admin')
  )
);

-- Add function to check document access permission based on workflow state
CREATE OR REPLACE FUNCTION public.user_has_document_access(contract_id uuid, user_id uuid)
RETURNS boolean AS $$
DECLARE
  contract_record record;
  user_role text;
BEGIN
  -- Get the contract record
  SELECT * INTO contract_record FROM public.contracts WHERE id = contract_id;
  
  -- Get the user's role
  SELECT role INTO user_role FROM public.profiles WHERE id = user_id;
  
  -- Admin has access to all documents
  IF user_role = 'admin' THEN
    RETURN true;
  END IF;
  
  -- If contract doesn't exist, no access
  IF contract_record IS NULL THEN
    RETURN false;
  END IF;
  
  -- Draft state: only admin and creator have access
  IF contract_record.status = 'draft' THEN
    RETURN contract_record.created_by = user_id;
  END IF;
  
  -- Pending review: admin, creator, and assigned legal reviewer have access
  IF contract_record.status = 'pending_review' THEN
    RETURN contract_record.created_by = user_id OR contract_record.legal_reviewer_id = user_id;
  END IF;
  
  -- Pending signature: admin, creator, legal reviewer, and assigned viewer have access
  IF contract_record.status = 'pending_signature' THEN
    RETURN contract_record.created_by = user_id OR 
           contract_record.legal_reviewer_id = user_id OR 
           contract_record.viewer_id = user_id;
  END IF;
  
  -- Completed/signed: all participants have access
  IF contract_record.status = 'completed' OR contract_record.status = 'signed' THEN
    RETURN contract_record.created_by = user_id OR 
           contract_record.legal_reviewer_id = user_id OR 
           contract_record.viewer_id = user_id;
  END IF;
  
  -- Rejected: admin, creator and the assigned legal reviewer have access
  IF contract_record.status = 'rejected' THEN
    RETURN contract_record.created_by = user_id OR contract_record.legal_reviewer_id = user_id;
  END IF;
  
  -- Default: no access
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;