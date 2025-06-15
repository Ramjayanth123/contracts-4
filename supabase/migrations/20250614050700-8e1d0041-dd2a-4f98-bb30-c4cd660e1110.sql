
-- Add document-related columns to contracts table
ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS original_file_name TEXT,
ADD COLUMN IF NOT EXISTS original_file_size BIGINT,
ADD COLUMN IF NOT EXISTS extracted_content TEXT,
ADD COLUMN IF NOT EXISTS processing_status TEXT DEFAULT 'pending';

-- Create document_uploads table for tracking uploads
CREATE TABLE IF NOT EXISTS public.document_uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    file_type TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    extracted_content TEXT,
    processing_status TEXT DEFAULT 'pending',
    uploaded_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on document_uploads
ALTER TABLE public.document_uploads ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for document_uploads
CREATE POLICY "Users can view document uploads" ON public.document_uploads 
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Legal and admin can manage document uploads" ON public.document_uploads 
FOR ALL TO authenticated USING (
  public.has_role(auth.uid(), 'legal') OR public.has_role(auth.uid(), 'admin')
);

-- Update storage bucket policies to allow document uploads
CREATE POLICY "Users can upload documents" ON storage.objects 
FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'contracts' AND auth.role() = 'authenticated');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_document_uploads_contract_id ON public.document_uploads(contract_id);
CREATE INDEX IF NOT EXISTS idx_document_uploads_status ON public.document_uploads(processing_status);
CREATE INDEX IF NOT EXISTS idx_contracts_processing_status ON public.contracts(processing_status);
