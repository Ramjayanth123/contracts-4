-- Add version_number column to document_uploads table
ALTER TABLE public.document_uploads 
ADD COLUMN IF NOT EXISTS version_number INTEGER DEFAULT 1;

-- Create index for better performance on version_number
CREATE INDEX IF NOT EXISTS idx_document_uploads_version_number ON public.document_uploads(version_number);

-- Add comment to explain the column
COMMENT ON COLUMN public.document_uploads.version_number IS 'Tracks the version number of document uploads for the same contract';

-- Update existing documents to have version 1
UPDATE public.document_uploads
SET version_number = 1
WHERE version_number IS NULL; 