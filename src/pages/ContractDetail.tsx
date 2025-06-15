import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  Edit, 
  Share2, 
  ZoomIn, 
  ZoomOut, 
  ChevronLeft, 
  ChevronRight,
  MessageSquare,
  Clock,
  User,
  Calendar,
  DollarSign,
  Building,
  FileText,
  CheckCircle,
  AlertCircle,
  Save,
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import StatusBadge from '@/components/StatusBadge';
import VersionHistory from '@/components/negotiation/VersionHistory';
import VersionChangeModal from '@/components/contract-detail/VersionChangeModal';
import ContractTags from '@/components/organization/ContractTags';
import AuditTrail from '@/components/audit/AuditTrail';
import ClauseExtraction from '@/components/contract-detail/ClauseExtraction';
import ContractQAAssistant from '@/components/contract-detail/ContractQAAssistant';
import { AccessControlProvider, useAccessControl } from '@/components/access/RoleBasedAccess';
import { useContracts } from '@/hooks/useContracts';
import { useDocumentUpload } from '@/hooks/useDocumentUpload';
import { useToast } from '@/hooks/use-toast';
import RiskDetection from '@/components/contract-detail/RiskDetection';

// Mock data will be replaced with real contract data

const activityTimeline = [
  {
    id: 1,
    action: 'Contract executed',
    user: 'Sarah Johnson',
    timestamp: '2024-01-15 14:30',
    icon: CheckCircle,
    color: 'text-green-400'
  },
  {
    id: 2,
    action: 'Final approval granted',
    user: 'Michael Chen',
    timestamp: '2024-01-15 10:15',
    icon: CheckCircle,
    color: 'text-green-400'
  },
  {
    id: 3,
    action: 'Legal review completed',
    user: 'Legal Team',
    timestamp: '2024-01-12 16:45',
    icon: FileText,
    color: 'text-blue-400'
  },
  {
    id: 4,
    action: 'Contract submitted for review',
    user: 'John Smith',
    timestamp: '2024-01-10 09:20',
    icon: AlertCircle,
    color: 'text-yellow-400'
  }
];

const comments = [
  {
    id: 1,
    user: 'Sarah Johnson',
    content: 'Payment terms look good. Ready for final approval.',
    timestamp: '2024-01-14 11:30',
    avatar: 'SJ'
  },
  {
    id: 2,
    user: 'Legal Team',
    content: 'Reviewed liability clauses. No issues found.',
    timestamp: '2024-01-12 15:20',
    avatar: 'LT'
  }
];

const ContractDetailContent = () => {
  const { id } = useParams();
  const { hasPermission, canEdit } = useAccessControl();
  const { contracts, loading, getContractDocumentUrl, updateContract } = useContracts();
  const { uploadDocument, uploading } = useDocumentUpload();
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [newComment, setNewComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [documentLoading, setDocumentLoading] = useState(false);
  const [documentError, setDocumentError] = useState<string | null>(null);
  const totalPages = 8;

  // Find the current contract from the contracts list
  const currentContract = contracts.find(contract => contract.id === id);
  const [editableContract, setEditableContract] = useState(currentContract);

  // Fetch document URL when contract is found
  useEffect(() => {
    const fetchDocument = async () => {
      if (!currentContract?.id) return;
      
      setDocumentLoading(true);
      setDocumentError(null);
      
      try {
        const documentData = await getContractDocumentUrl(currentContract.id);
        if (documentData) {
          setDocumentUrl(documentData.url);
        } else {
          setDocumentError('No document found for this contract');
        }
      } catch (error) {
        setDocumentError('Failed to load document');
      } finally {
        setDocumentLoading(false);
      }
    };

    fetchDocument();
  }, [currentContract?.id]);

  // Update editable contract when current contract changes
  useEffect(() => {
    if (currentContract) {
      setEditableContract(currentContract);
    }
  }, [currentContract]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading contract...</div>
      </div>
    );
  }

  if (!currentContract) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-lg">Contract not found</div>
      </div>
    );
  }

  const handleAddComment = () => {
    if (newComment.trim()) {
      setNewComment('');
    }
  };

  const handleStartEditing = () => {
    setIsEditing(true);
    console.log('Started editing contract');
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
    setEditableContract(currentContract); // Reset to original
    setHasUnsavedChanges(false);
    console.log('Cancelled editing');
  };

  const handleSaveChanges = () => {
    if (hasUnsavedChanges) {
      setShowVersionModal(true);
    } else {
      setIsEditing(false);
    }
  };

  const handleVersionSave = (versionName: string, changeDescription: string) => {
    console.log('Creating new version:', versionName, 'with changes:', changeDescription);
    setIsEditing(false);
    setHasUnsavedChanges(false);
    // Here you would typically save to backend
  };

  const handleFieldChange = (field: string, value: string) => {
    setEditableContract(prev => prev ? {
      ...prev,
      [field]: value
    } : prev);
    setHasUnsavedChanges(true);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentContract?.id) return;

    try {
      setDocumentLoading(true);
      const result = await uploadDocument(file, currentContract.id);
      
      if (result) {
        // Update the contract with document information
        await updateContract(currentContract.id, {
          original_file_name: file.name,
          original_file_size: file.size,
          extracted_content: result.extractedContent,
          processing_status: result.documentUpload.processing_status
        });

        // Refresh the document URL
        const url = await getContractDocumentUrl(currentContract.id);
        setDocumentUrl(url);
        setDocumentError(null);
        
        toast({
          title: "Success",
          description: "Document uploaded successfully",
        });
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive",
      });
    } finally {
      setDocumentLoading(false);
      // Reset the file input
      event.target.value = '';
    }
  };

  const handleDownloadContract = () => {
    console.log('Downloading contract:', editableContract?.title);
    // Simulate download
    const link = document.createElement('a');
    link.href = '#';
    link.download = `${editableContract?.title || 'contract'}-${editableContract?.id || 'unknown'}.pdf`;
    link.click();
  };

  return (
    <div className="container mx-auto py-6 animate-fade-in">
      {/* Breadcrumb and Actions */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Link to="/contracts" className="text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-medium">{currentContract.title}</span>
        </div>
        <div className="flex items-center gap-2">
          {hasPermission('download') && (
            <Button variant="outline" size="sm" onClick={handleDownloadContract}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          )}
          {hasPermission('share') && (
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          )}
          {canEdit && !isEditing && (
            <Button size="sm" onClick={handleStartEditing}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          {isEditing && (
            <>
              <Button variant="outline" size="sm" onClick={handleCancelEditing}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveChanges}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Contract Details */}
        <div className="lg:col-span-1 space-y-6">
          {/* Contract Info Card */}
          <div className="glass-card rounded-xl p-6">
            <h1 className="text-2xl font-bold mb-2">{currentContract.title}</h1>
            <div className="mb-4">
              <StatusBadge status={currentContract.status} />
            </div>
            <div className="space-y-4">
              {isEditing ? (
                <>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={editableContract?.description || ''}
                      onChange={(e) => handleFieldChange('description', e.target.value)}
                      className="mt-1"
                      placeholder="Enter contract description"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contract_number">Contract Number</Label>
                    <Input
                      id="contract_number"
                      value={editableContract?.contract_number || ''}
                      onChange={(e) => handleFieldChange('contract_number', e.target.value)}
                      className="mt-1"
                      placeholder="Enter contract number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="counterparty">Counterparty</Label>
                    <Input
                      id="counterparty"
                      value={editableContract?.counterparty || ''}
                      onChange={(e) => handleFieldChange('counterparty', e.target.value)}
                      className="mt-1"
                      placeholder="Enter counterparty"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">Description</div>
                      <div>{currentContract.description || 'No description'}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">Contract Number</div>
                      <div>{currentContract.contract_number || 'Not specified'}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Building className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">Counterparty</div>
                      <div>{currentContract.counterparty || 'Not specified'}</div>
                    </div>
                  </div>
                </>
              )}
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground">Start Date</div>
                  <div>{currentContract.start_date || 'Not specified'}</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground">End Date</div>
                  <div>{currentContract.end_date || 'Not specified'}</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <DollarSign className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground">Contract Value</div>
                  <div>{currentContract.value ? `${currentContract.currency || '$'}${currentContract.value.toLocaleString()}` : 'Not specified'}</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <User className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground">Created By</div>
                  <div>{currentContract.profiles_created_by?.full_name || currentContract.profiles_created_by?.email || 'Unknown'}</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground">Last Updated</div>
                  <div>{new Date(currentContract.updated_at).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          <ContractTags contractId={currentContract.id} tags={currentContract.tags || []} />

          {/* Upload New Version */}
          <div className="glass-card rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Upload New Version</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-white/5 hover:bg-white/10 border-white/10">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">PDF or DOCX (MAX. 10MB)</p>
                  </div>
                  <input 
                    id="dropzone-file" 
                    type="file" 
                    className="hidden" 
                    onChange={handleFileUpload}
                    accept=".pdf,.docx,.doc"
                  />
                </label>
              </div>
              {uploading && (
                <div className="text-center text-sm text-muted-foreground">
                  Uploading document...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Document and Tabs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Document Viewer */}
          {documentLoading ? (
            <div className="glass-card rounded-xl p-6 flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading document...</p>
              </div>
            </div>
          ) : documentError ? (
            <div className="glass-card rounded-xl p-6 flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-red-400 mb-2">{documentError}</p>
                <p className="text-sm text-muted-foreground">Upload a document to view it here.</p>
              </div>
            </div>
          ) : documentUrl ? (
            <div className="glass-card rounded-xl overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="text-sm font-medium">Document Preview</div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={() => setZoom(Math.max(50, zoom - 10))}>
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-xs w-12 text-center">{zoom}%</span>
                  <Button variant="outline" size="icon" onClick={() => setZoom(Math.min(200, zoom + 10))}>
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="p-4 h-[600px] overflow-auto">
                <iframe 
                  src={documentUrl} 
                  className="w-full h-full" 
                  title="Contract Document"
                />
              </div>
              <div className="flex items-center justify-between p-4 border-t border-white/10">
                <Button variant="outline" size="sm" disabled={currentPage === 1}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous Page
                </Button>
                <div className="text-sm">
                  Page {currentPage} of {totalPages}
                </div>
                <Button variant="outline" size="sm" disabled={currentPage === totalPages}>
                  Next Page
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-xl p-6 flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-muted-foreground mb-2">No document available</p>
                <p className="text-sm text-muted-foreground">Upload a document to view it here.</p>
              </div>
            </div>
          )}

          {/* Tabs */}
          <Tabs defaultValue="details">
            <TabsList className="grid grid-cols-6 mb-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="clauses">Clauses</TabsTrigger>
              <TabsTrigger value="risks">Risks</TabsTrigger>
              <TabsTrigger value="qa">QA Assistant</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            <TabsContent value="details">
              <div className="glass-card rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Contract Details</h3>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    {currentContract.description || 'No detailed description available for this contract.'}
                  </p>
                  
                  {/* Additional contract details would go here */}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="clauses">
              <ClauseExtraction contractId={currentContract.id} documentText={currentContract.extracted_content} />
            </TabsContent>
            <TabsContent value="risks">
              <RiskDetection contractId={currentContract.id} documentText={currentContract.extracted_content} />
            </TabsContent>
            <TabsContent value="qa">
              <ContractQAAssistant contractId={currentContract.id} documentText={currentContract.extracted_content} />
            </TabsContent>
            <TabsContent value="comments">
              <div className="glass-card rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Comments</h3>
                <div className="space-y-4">
                  {comments.map(comment => (
                    <div key={comment.id} className="flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium">
                        {comment.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{comment.user}</span>
                          <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                        </div>
                        <p className="text-sm mt-1">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                  
                  {/* Add comment form */}
                  <div className="mt-6">
                    <Textarea
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="mb-2"
                    />
                    <Button size="sm" onClick={handleAddComment} disabled={!newComment.trim()}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Add Comment
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="history">
              <div className="glass-card rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">History & Audit Trail</h3>
                
                {/* Version History */}
                <div className="mb-6">
                  <h4 className="text-md font-medium mb-3">Version History</h4>
                  <VersionHistory contractId={currentContract.id} />
                </div>
                
                {/* Activity Timeline */}
                <div>
                  <h4 className="text-md font-medium mb-3">Activity Timeline</h4>
                  <AuditTrail contractId={currentContract.id} />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Version Change Modal */}
      <VersionChangeModal 
        isOpen={showVersionModal} 
        onClose={() => setShowVersionModal(false)}
        onSave={handleVersionSave}
      />
    </div>
  );
};

const ContractDetail = () => {
  return (
    <AccessControlProvider>
      <ContractDetailContent />
    </AccessControlProvider>
  );
};

export default ContractDetail;
