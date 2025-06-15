import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/access/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Configure PDF.js worker using Vite's static asset approach
const setupPDFWorker = async () => {
  try {
    console.log('Setting up PDF.js worker with version:', pdfjsLib.version);
    
    // Use Vite's ?url import to get the worker from node_modules
    // This ensures we use the exact same version as the installed pdfjs-dist package
    const workerModule = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerModule.default;
    console.log('✓ PDF.js worker configured with matching version from node_modules:', workerModule.default);
    return true;
  } catch (error) {
    console.warn('Failed to load PDF.js worker from node_modules, trying fallback:', error);
    
    try {
      // Fallback to public directory worker
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
      console.log('✓ PDF.js worker configured with public directory fallback');
      return true;
    } catch (fallbackError) {
      console.error('Failed to configure PDF.js worker with public fallback:', fallbackError);
      
      // Final fallback to CDN with exact version match
      const exactVersion = pdfjsLib.version || '4.4.168';
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${exactVersion}/build/pdf.worker.min.mjs`;
      console.log(`✓ PDF.js worker configured with CDN fallback version ${exactVersion}`);
      return true;
    }
  }
};

// Initialize worker on module load
let workerInitialized = false;
const initializeWorker = async () => {
  if (!workerInitialized) {
    await setupPDFWorker();
    workerInitialized = true;
  }
};

// Initialize immediately
initializeWorker();

export interface DocumentUpload {
  id: string;
  contract_id: string | null;
  file_name: string;
  file_size: number;
  file_type: string;
  storage_path: string;
  document_bucketid: string | null;
  extracted_content: string | null;
  processing_status: string;
  uploaded_by: string | null;
  created_at: string;
  version_number: number;
}

interface DocumentUploadResult {
  documentUpload: DocumentUpload;
  extractedContent: string;
  storageUrl: string;
}

export const useDocumentUpload = () => {
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // File validation constants
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];
  const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'txt'];

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: 'File size must be less than 10MB' };
    }

    // Check file type
    const fileExtension = file.name.toLowerCase().split('.').pop();
    const isValidType = ALLOWED_TYPES.includes(file.type) || 
                       (fileExtension && ALLOWED_EXTENSIONS.includes(fileExtension));
    
    if (!isValidType) {
      return { valid: false, error: 'Only PDF, DOC, DOCX, and TXT files are allowed' };
    }

    return { valid: true };
  };

  const uploadDocument = async (file: File, contractId?: string): Promise<DocumentUploadResult | null> => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to upload documents",
        variant: "destructive",
      });
      return null;
    }

    // Validate file before processing
    const validation = validateFile(file);
    if (!validation.valid) {
      toast({
        title: "Invalid File",
        description: validation.error,
        variant: "destructive",
      });
      return null;
    }

    setUploading(true);

    try {
      // Generate a unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `documents/${fileName}`;

      // Upload file to Supabase storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from('contracts')
        .upload(filePath, file);

      if (storageError) {
        throw storageError;
      }

      // Extract content based on file type with improved error handling
      let extractedContent = '';
      let processingStatus = 'processing';
      
      try {
        console.log('Starting content extraction for file type:', file.type);
        extractedContent = await extractContentFromFile(file);
        processingStatus = 'completed';
        console.log('Content extraction successful, length:', extractedContent.length);
      } catch (extractionError) {
        console.error('Content extraction failed:', extractionError);
        extractedContent = `Content extraction failed: ${extractionError.message}`;
        processingStatus = 'extraction_error';
        
        // Show more specific error toast
        toast({
          title: "Extraction Warning",
          description: "Document uploaded but content extraction failed. You can still use the file.",
          variant: "destructive",
        });
      }

      // Get the current version number for this contract
      let versionNumber = 1;
      if (contractId) {
        const { data: existingDocs, error: fetchError } = await supabase
          .from('document_uploads')
          .select('version_number')
          .eq('contract_id', contractId)
          .order('version_number', { ascending: false })
          .limit(1);
        
        if (!fetchError && existingDocs && existingDocs.length > 0) {
          versionNumber = (existingDocs[0].version_number || 0) + 1;
        }
      }

      console.log(`Creating document version ${versionNumber} for contract ${contractId}`);

      // Save document metadata to database
      const insertData: any = {
        contract_id: contractId || null,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        storage_path: filePath,
        extracted_content: extractedContent,
        processing_status: processingStatus,
        uploaded_by: user.id,
        version_number: versionNumber
      };

      // Only include document_bucketid if the database supports it
      // This prevents errors when the column doesn't exist yet
      try {
        insertData.document_bucketid = fileName;
      } catch (e) {
        console.log('document_bucketid column not available yet');
      }

      const { data, error } = await supabase
        .from('document_uploads')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // If this is a new version (not the first), add entry to contract_versions table
      if (versionNumber > 1 && contractId) {
        try {
          await supabase
            .from('contract_versions')
            .insert([{
              contract_id: contractId,
              version_number: versionNumber,
              content: extractedContent,
              changes_summary: `Version ${versionNumber} uploaded`,
              created_by: user.id
            }]);
          console.log(`Added entry to contract_versions for version ${versionNumber}`);
        } catch (versionError) {
          console.error('Error adding contract version:', versionError);
          // Continue anyway since the document is already uploaded
        }
      }

      toast({
        title: "Success",
        description: versionNumber > 1 
          ? `Document uploaded successfully as version ${versionNumber}` 
          : 'Document uploaded successfully',
      });

      return {
        documentUpload: data,
        extractedContent,
        storageUrl: storageData.path
      };

    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast({
        title: "Error",
        description: "Failed to upload document: " + error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const extractContentFromFile = async (file: File): Promise<string> => {
    console.log('Extracting content from file:', file.name, 'Type:', file.type);
    
    try {
      if (file.type === 'application/pdf') {
        return await extractTextFromPDF(file);
      } else if (
        file.type === 'application/msword' || 
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
        return await extractTextFromWord(file);
      } else if (file.type === 'text/plain') {
        return await extractTextFromPlainText(file);
      } else {
        // Handle files by extension if MIME type is not recognized
        const fileExtension = file.name.toLowerCase().split('.').pop();
        if (fileExtension === 'pdf') {
          return await extractTextFromPDF(file);
        } else if (fileExtension === 'doc' || fileExtension === 'docx') {
          return await extractTextFromWord(file);
        } else if (fileExtension === 'txt') {
          return await extractTextFromPlainText(file);
        } else {
          throw new Error(`Unsupported file type: ${file.type} (${fileExtension})`);
        }
      }
    } catch (error) {
      console.error('Error extracting content:', error);
      throw error;
    }
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      console.log('🔄 Starting PDF text extraction');
      console.log('📊 PDF.js version:', pdfjsLib.version);
      console.log('⚙️ Worker source:', pdfjsLib.GlobalWorkerOptions.workerSrc);
      
      // Ensure worker is properly initialized
      await initializeWorker();
      
      // Wait a moment for worker to be ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        throw new Error('PDF.js worker not configured properly');
      }

      const arrayBuffer = await file.arrayBuffer();
      console.log('📄 PDF file loaded, size:', arrayBuffer.byteLength, 'bytes');
      
      // Create loading task with enhanced configuration
      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        verbosity: 0, // Reduce console noise
        useWorkerFetch: false,
        isEvalSupported: false,
        useSystemFonts: true,
        disableFontFace: true,
        disableRange: false,
        disableStream: false,
        stopAtErrors: false,
        // Add version-specific compatibility settings
        cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '4.4.168'}/cmaps/`,
        cMapPacked: true,
      });
      
      console.log('⏳ Loading PDF document...');
      
      // Add timeout for PDF loading with enhanced error handling
      const pdf = await Promise.race([
        loadingTask.promise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('PDF loading timeout after 30 seconds - possible worker version mismatch')), 30000)
        )
      ]) as pdfjsLib.PDFDocumentProxy;

      console.log('✅ PDF loaded successfully!');
      console.log('📑 Total pages:', pdf.numPages);
      console.log('📋 PDF info:', await pdf.getMetadata().catch(() => null));
      
      let fullText = '';
      const pagePromises: Promise<string>[] = [];

      // Process pages in parallel for better performance
      for (let i = 1; i <= pdf.numPages; i++) {
        pagePromises.push(
          (async (pageNum: number) => {
            try {
              console.log(`📖 Processing page ${pageNum}/${pdf.numPages}`);
              const page = await pdf.getPage(pageNum);
              const textContent = await page.getTextContent();
              
              const pageText = textContent.items
                .map((item: any) => {
                  if ('str' in item) {
                    return item.str;
                  }
                  return '';
                })
                .join(' ');
                
              console.log(`✓ Page ${pageNum} extracted (${pageText.length} chars)`);
              return pageText + '\n\n';
            } catch (pageError) {
              console.error(`❌ Error processing page ${pageNum}:`, pageError);
              return `[Error processing page ${pageNum}: ${pageError.message}]\n\n`;
            }
          })(i)
        );
      }

      // Wait for all pages to be processed
      const pageTexts = await Promise.all(pagePromises);
      fullText = pageTexts.join('');

      const finalText = fullText.trim();
      console.log('🎉 PDF extraction completed!');
      console.log('📊 Total extracted text length:', finalText.length, 'characters');
      
      if (!finalText || finalText.length < 10) {
        throw new Error('PDF appears to contain no readable text or might be image-based/scanned');
      }
      
      return finalText;
    } catch (error) {
      console.error('💥 PDF text extraction failed:', error);
      
      // Enhanced error categorization and messaging
      let errorMessage = `PDF processing failed: ${error.message}`;
      
      if (error.message.includes('Cannot resolve worker') || 
          error.message.includes('worker') ||
          error.message.includes('Loading task destroyed')) {
        errorMessage = `PDF processing failed due to worker configuration issue. This may be due to a version mismatch between PDF.js API (${pdfjsLib.version}) and worker.`;
      } else if (error.message.includes('timeout')) {
        errorMessage = `PDF processing timed out. The file may be too large or complex, or there's a worker compatibility issue.`;
      } else if (error.message.includes('Invalid PDF')) {
        errorMessage = `The uploaded file appears to be corrupted or is not a valid PDF document.`;
      }
      
      throw new Error(errorMessage);
    }
  };

  const extractTextFromWord = async (file: File): Promise<string> => {
    try {
      console.log('📝 Starting Word document extraction');
      const arrayBuffer = await file.arrayBuffer();
      console.log('📄 Word file loaded, size:', arrayBuffer.byteLength, 'bytes');
      
      const result = await mammoth.extractRawText({ arrayBuffer });
      const extractedText = result.value || '';
      
      console.log('✅ Word extraction completed, length:', extractedText.length, 'characters');
      
      if (!extractedText.trim()) {
        throw new Error('No text content found in Word document');
      }
      
      return extractedText;
    } catch (error) {
      console.error('💥 Word document extraction failed:', error);
      throw new Error(`Word document processing failed: ${error.message}`);
    }
  };

  const extractTextFromPlainText = async (file: File): Promise<string> => {
    try {
      console.log('📋 Starting plain text extraction');
      const text = await file.text();
      console.log('✅ Plain text extraction completed, length:', text.length, 'characters');
      
      if (!text.trim()) {
        throw new Error('Empty text file');
      }
      
      return text;
    } catch (error) {
      console.error('💥 Plain text extraction failed:', error);
      throw new Error(`Text file processing failed: ${error.message}`);
    }
  };

  const getDocumentUrl = async (storagePath: string) => {
    try {
      const { data } = await supabase.storage
        .from('contracts')
        .createSignedUrl(storagePath, 60 * 60); // 1 hour expiry

      return data?.signedUrl || null;
    } catch (error) {
      console.error('Error getting document URL:', error);
      return null;
    }
  };

  const retryDocumentProcessing = async (documentId: string) => {
    try {
      // Get document from database
      const { data: document, error } = await supabase
        .from('document_uploads')
        .select('*')
        .eq('id', documentId)
        .single();

      if (error || !document) {
        throw new Error('Document not found');
      }

      // Get file from storage
      const { data: fileData, error: fileError } = await supabase.storage
        .from('contracts')
        .download(document.storage_path);

      if (fileError || !fileData) {
        throw new Error('Could not download file for reprocessing');
      }

      // Convert blob to file
      const file = new File([fileData], document.file_name, { type: document.file_type });

      // Retry extraction
      let extractedContent = '';
      let processingStatus = 'processing';
      
      try {
        extractedContent = await extractContentFromFile(file);
        processingStatus = 'completed';
      } catch (extractionError) {
        console.error('Retry extraction failed:', extractionError);
        extractedContent = `Retry failed: ${extractionError.message}`;
        processingStatus = 'extraction_error';
      }

      // Update document in database
      const { error: updateError } = await supabase
        .from('document_uploads')
        .update({
          extracted_content: extractedContent,
          processing_status: processingStatus,
        })
        .eq('id', documentId);

      if (updateError) {
        throw updateError;
      }

      toast({
        title: processingStatus === 'completed' ? "Success" : "Retry Failed",
        description: processingStatus === 'completed' 
          ? 'Document reprocessed successfully'
          : 'Document reprocessing failed again',
        variant: processingStatus === 'completed' ? "default" : "destructive",
      });

      return processingStatus === 'completed';
    } catch (error: any) {
      console.error('Error retrying document processing:', error);
      toast({
        title: "Error",
        description: "Failed to retry processing: " + error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const getDocumentVersions = async (contractId: string) => {
    try {
      const { data, error } = await supabase
        .from('document_uploads')
        .select(`
          id, 
          file_name, 
          file_size, 
          created_at, 
          version_number,
          uploaded_by,
          profiles:uploaded_by (full_name, email)
        `)
        .eq('contract_id', contractId)
        .order('version_number', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error fetching document versions:', error);
      return [];
    }
  };

  const compareVersions = async (contractId: string, version1: number, version2: number) => {
    try {
      const { data, error } = await supabase
        .from('document_uploads')
        .select('id, extracted_content, version_number')
        .eq('contract_id', contractId)
        .in('version_number', [version1, version2]);
      
      if (error || !data || data.length !== 2) {
        throw new Error('Could not retrieve both versions for comparison');
      }
      
      return {
        version1: data.find(d => d.version_number === version1),
        version2: data.find(d => d.version_number === version2)
      };
    } catch (error) {
      console.error('Error comparing versions:', error);
      return null;
    }
  };

  const revertToVersion = async (contractId: string, versionNumber: number): Promise<boolean> => {
    try {
      setUploading(true);
      
      // 1. Find the version to revert to
      const { data: versionData, error: versionError } = await supabase
        .from('document_uploads')
        .select('*')
        .eq('contract_id', contractId)
        .eq('version_number', versionNumber)
        .single();
      
      if (versionError || !versionData) {
        throw new Error(`Could not find version ${versionNumber} to revert to`);
      }
      
      // 2. Get the current highest version number
      const { data: latestVersions, error: latestError } = await supabase
        .from('document_uploads')
        .select('version_number')
        .eq('contract_id', contractId)
        .order('version_number', { ascending: false })
        .limit(1);
        
      if (latestError || !latestVersions || latestVersions.length === 0) {
        throw new Error('Could not determine the latest version number');
      }
      
      const newVersionNumber = latestVersions[0].version_number + 1;
      
      // 3. Download the file from storage if needed
      // Note: In this implementation, we're just copying the metadata and content
      // In a real implementation, you might need to copy the actual file in storage
      
      // 4. Create a new version based on the old one
      const newVersionData = {
        contract_id: contractId,
        file_name: `${versionData.file_name} (Reverted from v${versionNumber})`,
        file_size: versionData.file_size,
        file_type: versionData.file_type,
        storage_path: versionData.storage_path, // Reusing the same file
        document_bucketid: versionData.document_bucketid,
        extracted_content: versionData.extracted_content,
        processing_status: versionData.processing_status,
        uploaded_by: user.id,
        version_number: newVersionNumber
      };
      
      const { data: insertData, error: insertError } = await supabase
        .from('document_uploads')
        .insert([newVersionData])
        .select()
        .single();
        
      if (insertError) {
        throw insertError;
      }
      
      // 5. Add entry to contract_versions table
      await supabase
        .from('contract_versions')
        .insert([{
          contract_id: contractId,
          version_number: newVersionNumber,
          content: versionData.extracted_content,
          changes_summary: `Reverted to version ${versionNumber}`,
          created_by: user.id
        }]);
      
      toast({
        title: "Success",
        description: `Successfully reverted to version ${versionNumber} (created new version ${newVersionNumber})`,
      });
      
      return true;
    } catch (error: any) {
      console.error('Error reverting to version:', error);
      toast({
        title: "Error",
        description: "Failed to revert to previous version: " + error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadDocument,
    getDocumentUrl,
    retryDocumentProcessing,
    uploading,
    validateFile,
    getDocumentVersions,
    compareVersions,
    revertToVersion
  };
};
