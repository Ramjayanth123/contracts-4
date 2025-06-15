import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { History, Download, Eye, GitBranch, MoreVertical, GitCompare, RotateCcw, AlertCircle } from 'lucide-react';
import { useDocumentUpload } from '@/hooks/useDocumentUpload';
import { formatDistanceToNow, format } from 'date-fns';
import VersionCompare from '@/components/contract-detail/VersionCompare';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';

interface VersionHistoryProps {
  contractId: string;
}

interface Version {
  id: string;
  version_number: number;
  file_name: string;
  file_size: number;
  created_at: string;
  uploaded_by: string;
  profiles?: {
    full_name: string | null;
    email: string | null;
  };
}

const VersionHistory = ({ contractId }: VersionHistoryProps) => {
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [reverting, setReverting] = useState(false);
  const [revertVersion, setRevertVersion] = useState<Version | null>(null);
  const { getDocumentVersions, getDocumentUrl, revertToVersion } = useDocumentUpload();
  const [showCompare, setShowCompare] = useState(false);
  const [compareVersions, setCompareVersions] = useState<{v1: number, v2: number} | null>(null);
  const [showCompareWithDialog, setShowCompareWithDialog] = useState(false);
  const [selectedCompareVersion, setSelectedCompareVersion] = useState<Version | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchVersions();
  }, [contractId]);

  const fetchVersions = async () => {
    setLoading(true);
    try {
      const data = await getDocumentVersions(contractId);
      setVersions(data);
    } catch (error) {
      console.error('Error fetching document versions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownloadVersion = async (version: Version) => {
    try {
      // Implementation would depend on how your storage is set up
      console.log(`Downloading version ${version.version_number}`);
      // Simulate download
      const link = document.createElement('a');
      link.href = '#';
      link.download = `contract-${contractId}-v${version.version_number}.pdf`;
      link.click();
    } catch (error) {
      console.error('Error downloading version:', error);
    }
  };

  const handleViewVersion = (version: Version) => {
    console.log(`Viewing version ${version.version_number}`);
    setSelectedVersion(selectedVersion === version.id ? null : version.id);
  };

  const handleCompareVersion = (version: Version) => {
    console.log(`Comparing version ${version.version_number} with previous`);
    // Find the previous version
    const currentIndex = versions.findIndex(v => v.id === version.id);
    if (currentIndex >= 0 && currentIndex < versions.length - 1) {
      const previousVersion = versions[currentIndex + 1]; // Versions are ordered newest first
      setCompareVersions({
        v1: previousVersion.version_number,
        v2: version.version_number
      });
      setShowCompare(true);
      
      // Show a toast to indicate the comparison is starting
      toast({
        title: "Starting Comparison",
        description: `Comparing version ${previousVersion.version_number} with version ${version.version_number}`,
      });
    } else {
      toast({
        title: "Cannot Compare",
        description: "No previous version found to compare with.",
        variant: "destructive"
      });
    }
  };

  const handleCompareWith = (version: Version) => {
    setSelectedCompareVersion(version);
    setShowCompareWithDialog(true);
  };

  const handleSelectCompareVersion = (otherVersion: Version) => {
    if (selectedCompareVersion) {
      setCompareVersions({
        v1: otherVersion.version_number,
        v2: selectedCompareVersion.version_number
      });
      setShowCompare(true);
      setShowCompareWithDialog(false);
      setSelectedCompareVersion(null);
    }
  };

  const handleRevertToVersion = (version: Version) => {
    setRevertVersion(version);
    setReverting(true);
  };

  const confirmRevert = async () => {
    if (!revertVersion) return;
    
    try {
      const success = await revertToVersion(contractId, revertVersion.version_number);
      if (success) {
        // Refresh the version list
        await fetchVersions();
      }
    } catch (error) {
      console.error('Error reverting to version:', error);
      toast({
        title: "Error",
        description: "Failed to revert to the selected version",
        variant: "destructive",
      });
    } finally {
      setReverting(false);
      setRevertVersion(null);
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading version history...</p>
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground">No version history available</p>
      </div>
    );
  }

  return (
    <>
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Version History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {versions.map((version, index) => (
              <div key={version.id} className="space-y-2">
                <div className="flex items-center gap-4 p-4 glass-card border border-white/10 rounded-lg hover:bg-white/5 transition-all duration-200">
                  {/* Version Icon */}
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20">
                    <GitBranch className="w-5 h-5 text-primary" />
                  </div>

                  {/* Version Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">Version {version.version_number}</h3>
                      {index === 0 && (
                        <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                          Latest
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{version.file_name}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Avatar className="w-4 h-4">
                          <AvatarFallback className="text-xs">
                            {version.profiles?.full_name 
                              ? version.profiles.full_name.split(' ').map(n => n.charAt(0)).join('')
                              : version.profiles?.email?.charAt(0) || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <span>{version.profiles?.full_name || version.profiles?.email || 'Unknown user'}</span>
                      </div>
                      <span>{format(new Date(version.created_at), 'yyyy-MM-dd HH:mm')}</span>
                      <span>{formatFileSize(version.file_size)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewVersion(version)}>
                        <Eye className="w-4 h-4 mr-2" />
                        {selectedVersion === version.id ? 'Hide Details' : 'View Details'}
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator />
                      
                      {/* Compare options */}
                      {version.version_number !== 1 && (
                        <DropdownMenuItem onClick={() => handleCompareVersion(version)}>
                          <GitCompare className="w-4 h-4 mr-2" />
                          Compare with Previous
                        </DropdownMenuItem>
                      )}
                      
                      <DropdownMenuItem onClick={() => handleCompareWith(version)}>
                        <GitCompare className="w-4 h-4 mr-2" />
                        Compare with...
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator />
                      
                      {/* Download option */}
                      <DropdownMenuItem onClick={() => handleDownloadVersion(version)}>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      
                      {/* Revert option - only show for non-latest versions */}
                      {index !== 0 && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleRevertToVersion(version)}>
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Revert to This Version
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Expanded Details */}
                {selectedVersion === version.id && (
                  <div className="ml-14 p-4 glass-card border border-white/10 rounded-lg bg-white/5">
                    <h4 className="font-medium mb-2">Version Details:</h4>
                    <ul className="space-y-1">
                      <li className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                        File: {version.file_name}
                      </li>
                      <li className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                        Size: {formatFileSize(version.file_size)}
                      </li>
                      <li className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                        Uploaded: {formatDistanceToNow(new Date(version.created_at), { addSuffix: true })}
                      </li>
                      <li className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                        Uploaded by: {version.profiles?.full_name || version.profiles?.email || 'Unknown user'}
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Version Compare Dialog */}
      <Dialog open={showCompare} onOpenChange={setShowCompare}>
        <DialogContent className="max-w-4xl">
          {compareVersions && (
            <VersionCompare 
              contractId={contractId} 
              onClose={() => setShowCompare(false)} 
              initialVersion1={compareVersions.v1}
              initialVersion2={compareVersions.v2}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Compare With Dialog */}
      <Dialog open={showCompareWithDialog} onOpenChange={setShowCompareWithDialog}>
        <DialogContent>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">
              Compare with Version {selectedCompareVersion?.version_number}
            </h2>
            <p className="text-sm text-muted-foreground">
              Select another version to compare with:
            </p>
            <div className="max-h-96 overflow-y-auto">
              {versions
                .filter(v => selectedCompareVersion && v.id !== selectedCompareVersion.id)
                .map(version => (
                  <div 
                    key={version.id}
                    className="flex items-center justify-between p-3 border-b border-white/10 hover:bg-white/5 cursor-pointer"
                    onClick={() => handleSelectCompareVersion(version)}
                  >
                    <div>
                      <div className="font-medium">Version {version.version_number}</div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(version.created_at), 'yyyy-MM-dd HH:mm')}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <GitCompare className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowCompareWithDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Revert Confirmation Dialog */}
      <AlertDialog open={reverting} onOpenChange={setReverting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revert to Previous Version</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revert to Version {revertVersion?.version_number}?
              This will create a new version based on the selected version.
              The current version will still be available in the history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setReverting(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRevert}>
              Revert to Version {revertVersion?.version_number}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default VersionHistory;
