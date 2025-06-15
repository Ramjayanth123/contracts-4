import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDocumentUpload } from '@/hooks/useDocumentUpload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, ArrowRight, Diff, FileText, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { compareContractVersions, ComparisonResult } from '@/services/ContractComparisonAgent';
import { useToast } from '@/hooks/use-toast';

interface VersionCompareProps {
  contractId: string;
  onClose: () => void;
  initialVersion1?: number;
  initialVersion2?: number;
}

interface Version {
  id: string;
  version_number: number;
  extracted_content: string;
}

const VersionCompare = ({ contractId, onClose, initialVersion1, initialVersion2 }: VersionCompareProps) => {
  const [versions, setVersions] = useState<{ id: string; version_number: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);
  const [version1, setVersion1] = useState<string>('');
  const [version2, setVersion2] = useState<string>('');
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [comparisonError, setComparisonError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('executive');
  const [progress, setProgress] = useState<{step: number, total: number, message: string} | null>(null);
  
  const { getDocumentVersions, compareVersions } = useDocumentUpload();
  const { toast } = useToast();

  useEffect(() => {
    const fetchVersions = async () => {
      setLoading(true);
      try {
        const data = await getDocumentVersions(contractId);
        setVersions(data.map(v => ({ id: v.id, version_number: v.version_number })));
        
        // Set defaults based on props or latest versions
        if (initialVersion1 && initialVersion2) {
          setVersion1(String(initialVersion1));
          setVersion2(String(initialVersion2));
          // Auto-compare if initial versions are provided
          setTimeout(() => {
            handleCompare(initialVersion1, initialVersion2);
          }, 500);
        } else if (data.length >= 2) {
          setVersion1(String(data[1].version_number)); // Second latest
          setVersion2(String(data[0].version_number)); // Latest
        } else if (data.length === 1) {
          setVersion1(String(data[0].version_number));
        }
      } catch (error) {
        console.error('Error fetching document versions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVersions();
  }, [contractId, initialVersion1, initialVersion2]);

  const handleCompare = async (v1?: number, v2?: number) => {
    const compareV1 = v1 || parseInt(version1);
    const compareV2 = v2 || parseInt(version2);
    
    if (!compareV1 || !compareV2) return;
    
    setComparing(true);
    setComparisonResult(null);
    setComparisonError(null);
    setProgress({step: 1, total: 5, message: 'Retrieving contract versions...'});
    
    try {
      // Get the raw version data
      const result = await compareVersions(
        contractId, 
        compareV1, 
        compareV2
      );
      
      if (!result) {
        throw new Error("Failed to retrieve version data");
      }
      
      // Check if we have content for both versions
      if (!result.version1?.extracted_content) {
        throw new Error(`Version ${compareV1} has no content to compare`);
      }
      
      if (!result.version2?.extracted_content) {
        throw new Error(`Version ${compareV2} has no content to compare`);
      }
      
      // Start the AI-powered comparison
      toast({
        title: "Analysis Started",
        description: "AI is analyzing contract differences. This may take a few minutes.",
      });
      
      // Use the agent-based comparison service
      // Set up progress tracking with a simple interval
      let currentStep = 1;
      const progressInterval = setInterval(() => {
        // Simulate progress updates
        if (currentStep < 5) {
          currentStep++;
          const messages = [
            'Retrieving contract versions...',
            'Chunking contracts into sections...',
            'Analyzing clauses by department...',
            'Generating departmental summaries...',
            'Comparing versions and creating executive summary...'
          ];
          setProgress({
            step: currentStep,
            total: 5,
            message: messages[currentStep - 1]
          });
        }
      }, 15000); // Update every 15 seconds
      
      const aiComparison = await compareContractVersions(
        result.version1,
        result.version2
      );
      
      // Clear the interval once done
      clearInterval(progressInterval);
      
      setComparisonResult(aiComparison);
      
      toast({
        title: "Analysis Complete",
        description: "Contract comparison analysis is ready to view.",
      });
    } catch (error: any) {
      console.error('Error comparing versions:', error);
      setComparisonError(error.message || 'Failed to compare versions. Please try again.');
      
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to complete contract comparison.",
        variant: "destructive"
      });
    } finally {
      setComparing(false);
      setProgress(null);
    }
  };

  // Render the progress indicator
  const renderProgress = () => {
    if (!progress) return null;
    
    return (
      <div className="space-y-4">
        <div className="text-center">
          <p className="text-lg font-medium">{progress.message}</p>
          <p className="text-sm text-muted-foreground">Step {progress.step} of {progress.total}</p>
        </div>
        
        <div className="w-full bg-secondary rounded-full h-2.5">
          <div 
            className="bg-primary h-2.5 rounded-full transition-all duration-500" 
            style={{ width: `${(progress.step / progress.total) * 100}%` }}
          ></div>
        </div>
        
        <div className="flex justify-center mt-4">
          <div className="animate-pulse flex space-x-4">
            <div className="h-3 w-3 bg-primary rounded-full"></div>
            <div className="h-3 w-3 bg-primary rounded-full"></div>
            <div className="h-3 w-3 bg-primary rounded-full"></div>
          </div>
        </div>
      </div>
    );
  };

  // Render the comparison results
  const renderComparisonResults = () => {
    if (comparing || progress) {
      return renderProgress();
    }

    if (comparisonError) {
      return (
        <div className="p-4 border border-destructive/20 bg-destructive/10 rounded-md">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle size={16} />
            <p>Error: {comparisonError}</p>
          </div>
        </div>
      );
    }

    if (!comparisonResult) {
      return null;
    }

    // Debug check to ensure we're not rendering objects directly
    const safeRender = (value: any): string => {
      if (value === null || value === undefined) return '';
      if (typeof value === 'object') return JSON.stringify(value);
      return String(value);
    };

    return (
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="executive">Executive Summary</TabsTrigger>
          <TabsTrigger value="legal">Legal</TabsTrigger>
          <TabsTrigger value="commercial">Commercial</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="operational">Operational</TabsTrigger>
        </TabsList>

        <TabsContent value="executive" className="space-y-4">
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Executive Summary</span>
                <Badge variant={
                  comparisonResult.executive_summary.risk_score_delta > 0 ? "destructive" : 
                  comparisonResult.executive_summary.risk_score_delta < 0 ? "outline" : "outline"
                }>
                  Risk Δ: {comparisonResult.executive_summary.risk_score_delta > 0 ? '+' : ''}
                  {safeRender(comparisonResult.executive_summary.risk_score_delta)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Summary</h4>
                <p className="whitespace-pre-wrap">{safeRender(comparisonResult.executive_summary.summary)}</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Favorability Shift</h4>
                <Badge variant={
                  comparisonResult.executive_summary.favorability_shift.toLowerCase().includes('vendor') ? "destructive" :
                  comparisonResult.executive_summary.favorability_shift.toLowerCase().includes('buyer') ? "secondary" : "outline"
                }>
                  {safeRender(comparisonResult.executive_summary.favorability_shift)}
                </Badge>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Flagged Departments</h4>
                <div className="flex gap-2 flex-wrap">
                  {comparisonResult.executive_summary.flagged_departments.length > 0 ? (
                    comparisonResult.executive_summary.flagged_departments.map(dept => (
                      <Badge key={dept} variant="secondary" className="cursor-pointer" 
                        onClick={() => setActiveTab(dept)}>
                        {dept.charAt(0).toUpperCase() + dept.slice(1)}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground">No departments flagged</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Department tabs */}
        {comparisonResult.diffs.map(diff => (
          <TabsContent key={diff.department} value={diff.department} className="space-y-4">
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{diff.department.charAt(0).toUpperCase() + diff.department.slice(1)} Changes</span>
                  <Badge variant={diff.changed ? "default" : "outline"}>
                    {diff.changed ? "Changes Detected" : "No Changes"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {diff.changed ? (
                  <>
                    <div>
                      <h4 className="font-medium mb-2">Key Differences</h4>
                      <p className="whitespace-pre-wrap">{safeRender(diff.diff)}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Business Impact</h4>
                      <p className="whitespace-pre-wrap">{safeRender(diff.impact)}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="border p-3 rounded-md bg-background/50">
                        <h5 className="text-sm font-medium mb-1 flex items-center">
                          <span className="mr-2">Version {safeRender(comparisonResult.v1.version_number)}</span>
                        </h5>
                        <p className="text-sm whitespace-pre-wrap">{safeRender(diff.v1_summary)}</p>
                      </div>
                      <div className="border p-3 rounded-md bg-background/50">
                        <h5 className="text-sm font-medium mb-1 flex items-center">
                          <span className="mr-2">Version {safeRender(comparisonResult.v2.version_number)}</span>
                        </h5>
                        <p className="text-sm whitespace-pre-wrap">{safeRender(diff.v2_summary)}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle size={16} className="text-success" />
                    <p>No significant changes detected in {diff.department} terms between versions.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Compare Contract Versions</h2>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Version 1</label>
          <Select value={version1} onValueChange={setVersion1} disabled={comparing}>
            <SelectTrigger>
              <SelectValue placeholder="Select version..." />
            </SelectTrigger>
            <SelectContent>
              {versions.map(version => (
                <SelectItem key={version.id} value={String(version.version_number)}>
                  Version {version.version_number}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Version 2</label>
          <Select value={version2} onValueChange={setVersion2} disabled={comparing}>
            <SelectTrigger>
              <SelectValue placeholder="Select version..." />
            </SelectTrigger>
            <SelectContent>
              {versions.map(version => (
                <SelectItem key={version.id} value={String(version.version_number)}>
                  Version {version.version_number}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex justify-center">
        <Button 
          onClick={() => handleCompare()} 
          disabled={!version1 || !version2 || comparing || progress !== null}
          className="w-40"
        >
          {comparing ? 'Comparing...' : 'Compare'}
        </Button>
      </div>
      
      <div className="mt-6">
        {renderComparisonResults()}
      </div>
    </div>
  );
};

export default VersionCompare; 