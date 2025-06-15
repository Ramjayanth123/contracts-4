import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDocumentUpload } from '@/hooks/useDocumentUpload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, ArrowRight, Diff, FileText } from 'lucide-react';

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
  const [comparisonResult, setComparisonResult] = useState<{
    version1?: Version;
    version2?: Version;
    differences?: string[];
  } | null>(null);
  
  const { getDocumentVersions, compareVersions } = useDocumentUpload();

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
    try {
      const result = await compareVersions(
        contractId, 
        compareV1, 
        compareV2
      );
      
      if (result) {
        // Simple diff implementation - in a real app, you'd use a proper diff algorithm
        const differences = findDifferences(
          result.version1?.extracted_content || '',
          result.version2?.extracted_content || ''
        );
        
        setComparisonResult({
          version1: result.version1,
          version2: result.version2,
          differences
        });
      }
    } catch (error) {
      console.error('Error comparing versions:', error);
    } finally {
      setComparing(false);
    }
  };

  // Simple difference finder - in a real app, you'd use a proper diff library
  const findDifferences = (text1: string, text2: string): string[] => {
    const lines1 = text1.split('\n');
    const lines2 = text2.split('\n');
    const differences: string[] = [];
    
    // Find lines that are in version2 but not in version1
    for (let i = 0; i < lines2.length; i++) {
      if (!lines1.includes(lines2[i])) {
        differences.push(`+ ${lines2[i]}`);
      }
    }
    
    // Find lines that are in version1 but not in version2
    for (let i = 0; i < lines1.length; i++) {
      if (!lines2.includes(lines1[i])) {
        differences.push(`- ${lines1[i]}`);
      }
    }
    
    return differences;
  };

  if (loading) {
    return (
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle>Compare Versions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading versions...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (versions.length < 2) {
    return (
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle>Compare Versions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-center">
            <p className="text-muted-foreground">At least two versions are required for comparison</p>
            <Button onClick={onClose} className="mt-4">Close</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Diff className="w-5 h-5" />
          Compare Versions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">From Version</label>
              <Select
                value={version1}
                onValueChange={setVersion1}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select version" />
                </SelectTrigger>
                <SelectContent>
                  {versions.map(version => (
                    <SelectItem 
                      key={version.id} 
                      value={String(version.version_number)}
                    >
                      Version {version.version_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-center">
              <ArrowRight className="w-6 h-6 text-muted-foreground" />
            </div>
            
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">To Version</label>
              <Select
                value={version2}
                onValueChange={setVersion2}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select version" />
                </SelectTrigger>
                <SelectContent>
                  {versions.map(version => (
                    <SelectItem 
                      key={version.id} 
                      value={String(version.version_number)}
                    >
                      Version {version.version_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-center gap-4">
            <Button onClick={() => handleCompare()} disabled={!version1 || !version2 || comparing}>
              {comparing ? 'Comparing...' : 'Compare Versions'}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
          
          {comparisonResult && (
            <div className="mt-6">
              <Tabs defaultValue="diff">
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="diff" className="flex items-center gap-2">
                    <Diff className="w-4 h-4" />
                    Differences
                  </TabsTrigger>
                  <TabsTrigger value="v1" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Version {version1}
                  </TabsTrigger>
                  <TabsTrigger value="v2" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Version {version2}
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="diff">
                  <div className="glass-card border-white/10 p-4 rounded-md max-h-96 overflow-auto font-mono text-sm">
                    {comparisonResult.differences && comparisonResult.differences.length > 0 ? (
                      <pre>
                        {comparisonResult.differences.map((line, i) => (
                          <div 
                            key={i} 
                            className={
                              line.startsWith('+') 
                                ? 'text-green-400 bg-green-900/20 py-1 px-2' 
                                : line.startsWith('-') 
                                  ? 'text-red-400 bg-red-900/20 py-1 px-2' 
                                  : ''
                            }
                          >
                            {line}
                          </div>
                        ))}
                      </pre>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-8 text-center">
                        <p className="text-muted-foreground mb-2">No differences found</p>
                        <p className="text-xs text-muted-foreground">The selected versions appear to be identical</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="v1">
                  <div className="glass-card border-white/10 p-4 rounded-md max-h-96 overflow-auto">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="font-medium">Version {version1} Content</h3>
                      <span className="text-xs text-muted-foreground">
                        {comparisonResult.version1?.extracted_content?.length || 0} characters
                      </span>
                    </div>
                    <pre className="text-sm whitespace-pre-wrap">
                      {comparisonResult.version1?.extracted_content || 'No content available'}
                    </pre>
                  </div>
                </TabsContent>
                
                <TabsContent value="v2">
                  <div className="glass-card border-white/10 p-4 rounded-md max-h-96 overflow-auto">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="font-medium">Version {version2} Content</h3>
                      <span className="text-xs text-muted-foreground">
                        {comparisonResult.version2?.extracted_content?.length || 0} characters
                      </span>
                    </div>
                    <pre className="text-sm whitespace-pre-wrap">
                      {comparisonResult.version2?.extracted_content || 'No content available'}
                    </pre>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VersionCompare; 