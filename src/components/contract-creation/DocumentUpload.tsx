import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useDocumentUpload } from '@/hooks/useDocumentUpload';
import { useAccessControl } from '@/components/access/RoleBasedAccess';
import {
  Upload,
  File,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Loader2,
  FileText,
  DownloadCloud,
  X,
  RefreshCcw
} from 'lucide-react';

interface ExtractedData {
  title?: string;
  extractedText?: string;
  originalFileName?: string;
  fileSize?: number;
  processingStatus?: string;
  storageUrl?: string;
}

interface DocumentUploadProps {
  onDocumentUpload: (file: File | null, extractedData: ExtractedData) => void;
  uploadedDocument: File | null;
  extractedData: ExtractedData;
  contractId?: string;
}

const DocumentUpload = ({ onDocumentUpload, uploadedDocument, extractedData, contractId }: DocumentUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { uploadDocument, uploading, validateFile, retryDocumentProcessing } = useDocumentUpload();
  const { hasRole, hasPermission } = useAccessControl();
  
  // Check if user has permission to upload documents
  const canUploadDocuments = hasPermission('create_document');

  const handleFile = async (file: File) => {
    console.log('Processing file:', file.name, 'Type:', file.type);
    setUploadError(null);
    setUploadProgress(0);
    
    // Validate file before processing
    const validation = validateFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid file');
      return;
    }

    try {
      // Simulate progress during upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const result = await uploadDocument(file, contractId);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (result) {
        const extractedData: ExtractedData = {
          title: file.name.replace(/\.[^/.]+$/, ""),
          extractedText: result.extractedContent,
          originalFileName: file.name,
          fileSize: file.size,
          processingStatus: result.documentUpload.processing_status,
          storageUrl: result.storageUrl
        };
        
        console.log('File uploaded and processed:', extractedData);
        onDocumentUpload(file, extractedData);
        
        // Reset progress after success
        setTimeout(() => setUploadProgress(0), 1000);
      } else {
        setUploadError('Failed to upload document. Please try again.');
        setUploadProgress(0);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadError('An error occurred while processing the document. Please try again.');
      setUploadProgress(0);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files[0]) {
      console.log('File dropped:', files[0].name);
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.[0]) {
      console.log('File selected:', files[0].name);
      handleFile(files[0]);
    }
  };

  const removeDocument = () => {
    console.log('Removing document');
    setUploadError(null);
    setUploadProgress(0);
    onDocumentUpload(null, {});
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'extraction_error':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Loader2 className="w-4 h-4 animate-spin" />;
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'Processed Successfully';
      case 'processing':
        return 'Processing';
      case 'extraction_error':
        return 'Extraction Failed (File uploaded)';
      case 'error':
        return 'Processing Error';
      default:
        return 'Processing';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Upload Contract Document</CardTitle>
          {!canUploadDocuments && (
            <CardDescription className="text-amber-500">
              Only administrators can upload documents
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {uploadError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{uploadError}</AlertDescription>
            </Alert>
          )}
          
          {!uploadedDocument ? (
            <>
              {!canUploadDocuments ? (
                <div className="border-2 border-dashed rounded-lg p-8 text-center opacity-50 border-muted-foreground/25">
                  <AlertCircle className="mx-auto h-12 w-12 text-amber-500 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Permission Restricted</h3>
                  <p className="text-muted-foreground mb-4">
                    Only administrators have permission to upload documents
                  </p>
                </div>
              ) : (
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                    dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
                  } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
                  onDragEnter={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => !uploading && document.getElementById('file-upload')?.click()}
                >
                  {uploading ? (
                    <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin mb-4" />
                  ) : (
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  )}
                  <h3 className="text-lg font-medium mb-2">
                    {uploading ? 'Processing Document...' : 'Upload Contract Document'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {uploading 
                      ? 'Please wait while we extract the content from your document. This may take a few moments for large files.'
                      : 'Drag and drop your PDF, DOC, DOCX, or TXT document here, or click to browse'
                    }
                  </p>
                  
                  {uploading && uploadProgress > 0 && (
                    <div className="max-w-xs mx-auto mb-4">
                      <Progress value={uploadProgress} className="w-full" />
                      <p className="text-sm text-muted-foreground mt-2">
                        {uploadProgress < 90 ? 'Uploading...' : 'Processing content...'}
                      </p>
                    </div>
                  )}
                  
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                    onChange={handleFileInput}
                    className="hidden"
                    id="file-upload"
                    disabled={uploading}
                  />
                  {!uploading && (
                    <Button variant="outline" className="cursor-pointer">
                      Choose File
                    </Button>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">{uploadedDocument.name}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{(uploadedDocument.size / 1024 / 1024).toFixed(2)} MB</span>
                    {extractedData.processingStatus && (
                      <div className="flex items-center gap-1">
                        {getStatusIcon(extractedData.processingStatus)}
                        <span className="capitalize">{getStatusText(extractedData.processingStatus)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={removeDocument}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {Object.keys(extractedData).length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Extracted Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Contract Title</Label>
              <Input value={extractedData.title || ''} readOnly />
            </div>
            {extractedData.originalFileName && (
              <div>
                <Label>Original File Name</Label>
                <Input value={extractedData.originalFileName} readOnly />
              </div>
            )}
            {extractedData.processingStatus && (
              <div>
                <Label>Processing Status</Label>
                <div className="flex items-center gap-2">
                  <Input value={getStatusText(extractedData.processingStatus)} readOnly className="flex-1" />
                  {getStatusIcon(extractedData.processingStatus)}
                </div>
              </div>
            )}
            {extractedData.extractedText && !extractedData.extractedText.startsWith('Content extraction failed') && (
              <div>
                <Label>Extracted Content (Preview)</Label>
                <div className="p-3 border rounded-md bg-muted/10 max-h-40 overflow-y-auto">
                  <p className="text-sm whitespace-pre-wrap">
                    {extractedData.extractedText.substring(0, 500)}
                    {extractedData.extractedText.length > 500 && '...'}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total content length: {extractedData.extractedText.length} characters
                </p>
              </div>
            )}
            {extractedData.extractedText && extractedData.extractedText.startsWith('Content extraction failed') && (
              <div>
                <Label>Processing Issue</Label>
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    {extractedData.extractedText}
                  </AlertDescription>
                </Alert>
                <p className="text-xs text-muted-foreground mt-1">
                  The file was uploaded successfully but content extraction encountered issues. You can still proceed with the contract creation.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DocumentUpload;
