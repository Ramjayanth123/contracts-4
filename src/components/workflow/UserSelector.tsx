import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Users, UserCheck, Send } from 'lucide-react';
import { documentWorkflowService, UserProfile } from '@/services/documentWorkflowService';
import { toast } from '@/hooks/use-toast';

interface UserSelectorProps {
  // For standalone mode (contract detail page)
  contractId?: string;
  contractTitle?: string;
  onWorkflowStarted?: () => void;
  
  // For integrated mode (contract creation page)
  selectedLegalReviewer?: string;
  selectedViewer?: string;
  onLegalReviewerChange?: (id: string) => void;
  onViewerChange?: (id: string) => void;
  
  disabled?: boolean;
}

const UserSelector: React.FC<UserSelectorProps> = ({
  contractId,
  contractTitle,
  onWorkflowStarted,
  selectedLegalReviewer: externalLegalReviewer,
  selectedViewer: externalViewer,
  onLegalReviewerChange,
  onViewerChange,
  disabled = false
}) => {
  // Determine if we're in standalone or integrated mode
  const isStandaloneMode = Boolean(contractId);
  
  const [legalUsers, setLegalUsers] = useState<UserProfile[]>([]);
  const [viewerUsers, setViewerUsers] = useState<UserProfile[]>([]);
  const [internalLegalReviewer, setInternalLegalReviewer] = useState<string>('');
  const [internalViewer, setInternalViewer] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  
  // Use either the external or internal state depending on mode
  const currentLegalReviewer = isStandaloneMode ? internalLegalReviewer : externalLegalReviewer || '';
  const currentViewer = isStandaloneMode ? internalViewer : externalViewer || '';
  
  // Handle selection changes
  const handleLegalReviewerChange = (value: string) => {
    if (isStandaloneMode) {
      setInternalLegalReviewer(value);
    } else if (onLegalReviewerChange) {
      onLegalReviewerChange(value);
    }
  };
  
  const handleViewerChange = (value: string) => {
    if (isStandaloneMode) {
      setInternalViewer(value);
    } else if (onViewerChange) {
      onViewerChange(value);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const [legal, viewers] = await Promise.all([
        documentWorkflowService.getUsersByRole('legal'),
        documentWorkflowService.getUsersByRole('viewer')
      ]);
      
      setLegalUsers(legal);
      setViewerUsers(viewers);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSendForReview = async () => {
    // Only allow sending for review in standalone mode
    if (!isStandaloneMode) return;
    
    if (!currentLegalReviewer || !currentViewer) {
      toast({
        title: "Validation Error",
        description: "Please select both a legal reviewer and a viewer",
        variant: "destructive",
      });
      return;
    }

    // Validate contractId
    if (!contractId || contractId === 'undefined') {
      toast({
        title: "Error",
        description: "Invalid contract ID",
        variant: "destructive",
      });
      return;
    }

    // Validate UUIDs to prevent the 'invalid input syntax for type uuid: undefined' error
    if (currentLegalReviewer === 'undefined') {
      toast({
        title: "Error",
        description: "Invalid legal reviewer selection. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (currentViewer === 'undefined') {
      toast({
        title: "Error",
        description: "Invalid viewer selection. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const success = await documentWorkflowService.sendForReview(
        contractId,
        currentLegalReviewer,
        currentViewer
      );

      if (success && onWorkflowStarted) {
        onWorkflowStarted();
      }
    } catch (error) {
      console.error('Error sending for review:', error);
      toast({
        title: "Error",
        description: `Failed to send contract for review: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = currentLegalReviewer && currentViewer && !loading && !disabled;

  if (loadingUsers) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Assign Team Members
          </CardTitle>
          <CardDescription>
            Loading available team members...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Assign Team Members
        </CardTitle>
        <CardDescription>
          {isStandaloneMode && contractTitle ? (
            <>Select legal reviewer and viewer for: <strong>{contractTitle}</strong></>
          ) : (
            'Select legal reviewer and viewer'
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Legal Reviewer Selection */}
        <div className="space-y-2">
          <Label htmlFor="legal-reviewer" className="flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            Legal Reviewer
          </Label>
          <Select
            value={currentLegalReviewer}
            onValueChange={handleLegalReviewerChange}
            disabled={disabled}
          >
            <SelectTrigger id="legal-reviewer">
              <SelectValue placeholder="Select a legal team member" />
            </SelectTrigger>
            <SelectContent>
              {legalUsers.length === 0 ? (
                <SelectItem value="" disabled>
                  No legal team members available
                </SelectItem>
              ) : (
                legalUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex flex-col">
                      <span>{user.full_name || user.email}</span>
                      {user.full_name && (
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                      )}
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Viewer Selection */}
        <div className="space-y-2">
          <Label htmlFor="viewer" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Document Viewer
          </Label>
          <Select
            value={currentViewer}
            onValueChange={handleViewerChange}
            disabled={disabled}
          >
            <SelectTrigger id="viewer">
              <SelectValue placeholder="Select a viewer" />
            </SelectTrigger>
            <SelectContent>
              {viewerUsers.length === 0 ? (
                <SelectItem value="" disabled>
                  No viewers available
                </SelectItem>
              ) : (
                viewerUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex flex-col">
                      <span>{user.full_name || user.email}</span>
                      {user.full_name && (
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                      )}
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Only show Send button in standalone mode */}
        {isStandaloneMode && (
          <Button 
            onClick={handleSendForReview} 
            disabled={!isFormValid}
            className="w-full"
          >
            <Send className="w-4 h-4 mr-2" />
            Send for Review
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default UserSelector;