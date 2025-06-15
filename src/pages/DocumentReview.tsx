
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/components/access/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { useDocumentUpload } from '@/hooks/useDocumentUpload';
import { supabase } from '@/integrations/supabase/client';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Calendar, 
  User,
  AlertCircle,
  CheckCircle,
  Clock,
  Grid3X3,
  List,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

interface DocumentUpload {
  id: string;
  contract_id: string | null;
  file_name: string;
  file_size: number;
  file_type: string;
  storage_path: string;
  extracted_content: string | null;
  processing_status: string;
  uploaded_by: string | null;
  created_at: string;
}

const DocumentReview = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { retryDocumentProcessing } = useDocumentUpload();
  const [documents, setDocuments] = useState<DocumentUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [retryingDocuments, setRetryingDocuments] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('document_uploads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error: any) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Error",
        description: "Failed to fetch documents",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRetryProcessing = async (documentId: string) => {
    setRetryingDocuments(prev => new Set(prev).add(documentId));
    
    try {
      const success = await retryDocumentProcessing(documentId);
      if (success) {
        // Refresh the documents list
        await fetchDocuments();
      }
    } finally {
      setRetryingDocuments(prev => {
        const newSet = new Set(prev);
        newSet.delete(documentId);
        return newSet;
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'extraction_error':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'extraction_error':
        return 'bg-orange-100 text-orange-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Processed';
      case 'processing':
        return 'Processing';
      case 'pending':
        return 'Pending';
      case 'extraction_error':
        return 'Extraction Failed';
      case 'error':
        return 'Error';
      default:
        return status;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const canRetry = (status: string) => {
    return status === 'extraction_error' || status === 'error';
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (doc.extracted_content && doc.extracted_content.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || doc.processing_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const DocumentCard = ({ document }: { document: DocumentUpload }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <h3 className="font-medium text-sm truncate">{document.file_name}</h3>
          </div>
          <div className="flex items-center gap-1">
            {getStatusIcon(document.processing_status)}
          </div>
        </div>
        <Badge className={`w-fit text-xs ${getStatusColor(document.processing_status)}`}>
          {getStatusLabel(document.processing_status)}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(document.created_at).toLocaleDateString()}
          </div>
          <div>
            {formatFileSize(document.file_size)}
          </div>
        </div>
        
        {document.extracted_content && !document.extracted_content.startsWith('Content extraction failed') && (
          <div className="bg-muted/10 p-2 rounded text-xs">
            <p className="text-muted-foreground mb-1">Extracted Content:</p>
            <p className="line-clamp-3">
              {document.extracted_content.substring(0, 150)}...
            </p>
          </div>
        )}
        
        {document.extracted_content && document.extracted_content.startsWith('Content extraction failed') && (
          <div className="bg-orange-50 p-2 rounded text-xs border border-orange-200">
            <p className="text-orange-600 mb-1">Processing Issue:</p>
            <p className="line-clamp-2 text-orange-800">
              {document.extracted_content}
            </p>
          </div>
        )}
        
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1">
            <Eye className="w-3 h-3 mr-1" />
            View
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            <Download className="w-3 h-3 mr-1" />
            Download
          </Button>
          {canRetry(document.processing_status) && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleRetryProcessing(document.id)}
              disabled={retryingDocuments.has(document.id)}
              className="flex-1"
            >
              {retryingDocuments.has(document.id) ? (
                <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
              ) : (
                <RefreshCw className="w-3 h-3 mr-1" />
              )}
              Retry
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const DocumentListItem = ({ document }: { document: DocumentUpload }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <FileText className="w-8 h-8 text-primary" />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate">{document.file_name}</h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                <span>{formatFileSize(document.file_size)}</span>
                <span>{new Date(document.created_at).toLocaleDateString()}</span>
                <Badge className={`text-xs ${getStatusColor(document.processing_status)}`}>
                  {getStatusLabel(document.processing_status)}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline">
              <Eye className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline">
              <Download className="w-4 h-4" />
            </Button>
            {canRetry(document.processing_status) && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleRetryProcessing(document.id)}
                disabled={retryingDocuments.has(document.id)}
              >
                {retryingDocuments.has(document.id) ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </Button>
            )}
          </div>
        </div>
        
        {document.extracted_content && !document.extracted_content.startsWith('Content extraction failed') && (
          <div className="mt-3 bg-muted/10 p-3 rounded text-sm">
            <p className="text-muted-foreground mb-2">Extracted Content Preview:</p>
            <p className="line-clamp-2">
              {document.extracted_content.substring(0, 200)}...
            </p>
          </div>
        )}
        
        {document.extracted_content && document.extracted_content.startsWith('Content extraction failed') && (
          <div className="mt-3 bg-orange-50 p-3 rounded text-sm border border-orange-200">
            <p className="text-orange-600 mb-2">Processing Issue:</p>
            <p className="line-clamp-2 text-orange-800">
              {document.extracted_content}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Document Review</h1>
          <p className="text-muted-foreground">
            Review and manage uploaded documents
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background text-foreground"
              >
                <option value="all">All Status</option>
                <option value="completed">Processed</option>
                <option value="processing">Processing</option>
                <option value="pending">Pending</option>
                <option value="extraction_error">Extraction Failed</option>
                <option value="error">Error</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total</p>
                <p className="text-2xl font-bold">{documents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Processed</p>
                <p className="text-2xl font-bold">
                  {documents.filter(d => d.processing_status === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold">
                  {documents.filter(d => d.processing_status === 'pending' || d.processing_status === 'processing').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Failed</p>
                <p className="text-2xl font-bold">
                  {documents.filter(d => d.processing_status === 'extraction_error').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm font-medium">Errors</p>
                <p className="text-2xl font-bold">
                  {documents.filter(d => d.processing_status === 'error').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Document List */}
      {filteredDocuments.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No documents found</h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Upload some documents to get started'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
            : 'space-y-4'
        }>
          {filteredDocuments.map((document) => (
            viewMode === 'grid' 
              ? <DocumentCard key={document.id} document={document} />
              : <DocumentListItem key={document.id} document={document} />
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentReview;
