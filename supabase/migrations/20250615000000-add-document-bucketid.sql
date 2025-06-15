-- Add document_bucketid column to document_uploads table
ALTER TABLE public.document_uploads 
ADD COLUMN IF NOT EXISTS document_bucketid TEXT;

-- Create index for better performance on document_bucketid
CREATE INDEX IF NOT EXISTS idx_document_uploads_bucketid ON public.document_uploads(document_bucketid);

-- Add comment to explain the column
COMMENT ON COLUMN public.document_uploads.document_bucketid IS 'Stores the unique file name/identifier used in the storage bucket';