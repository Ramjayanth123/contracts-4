import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, FileText, AlertCircle, CheckCircle2, Upload } from 'lucide-react';
import useClauseExtraction from '@/hooks/useClauseExtraction';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface ClauseExtractionProps {
  contractId: string;
  documentText: string | null;
}

export default function ClauseExtraction({ contractId, documentText }: ClauseExtractionProps) {
  const [activeTab, setActiveTab] = useState('summary');
  const { toast } = useToast();
  const { extractClauses, isLoading, error, result } = useClauseExtraction({
    onComplete: (data) => {
      console.log('Clause extraction completed successfully', data);
    },
    onError: (err) => {
      console.error('Clause extraction failed', err);
    }
  });

  const handleExtractClauses = async () => {
    if (!documentText) {
      toast({
        title: "Error",
        description: "No document text available for analysis",
        variant: "destructive",
      });
      return;
    }
    
    console.log('Starting clause extraction for contract:', contractId);
    try {
      await extractClauses(documentText);
    } catch (err) {
      console.error('Error handling clause extraction:', err);
    }
  };

  // Helper function to determine badge color based on importance
  const getImportanceBadgeVariant = (importance: string) => {
    switch (importance) {
      case 'High': return 'destructive';
      case 'Medium': return 'default';
      case 'Low': return 'secondary';
      default: return 'outline';
    }
  };

  // Helper function to determine department badge color
  const getDepartmentBadgeVariant = (department: string) => {
    switch (department) {
      case 'Commercial': return 'default';
      case 'Legal': return 'destructive';
      case 'Compliance': return 'warning';
      case 'Operational': return 'secondary';
      default: return 'outline';
    }
  };

  // Check if document text is available
  const isDocumentTextAvailable = !!documentText && documentText.trim().length > 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>AI Clause Extraction</CardTitle>
        <CardDescription>
          Automatically identify and categorize key clauses from this contract
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to extract clauses: {error.message}
            </AlertDescription>
          </Alert>
        )}

        {!isDocumentTextAvailable && (
          <div className="flex flex-col items-center justify-center py-8">
            <AlertCircle className="h-12 w-12 text-yellow-500 mb-4" />
            <p className="text-muted-foreground text-center mb-2">
              No document text available for analysis
            </p>
            <p className="text-sm text-muted-foreground text-center mb-6">
              Please upload a document or ensure the contract has extracted content
            </p>
          </div>
        )}

        {isDocumentTextAvailable && !result && !isLoading && (
          <div className="flex flex-col items-center justify-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center mb-6">
              Use AI to analyze this contract and extract key clauses by category
            </p>
            <Button onClick={handleExtractClauses} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Extract Clauses'
              )}
            </Button>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin mb-4 text-primary" />
            <p className="text-center font-medium">Analyzing contract...</p>
            <p className="text-center text-muted-foreground mt-2">
              This may take a minute or two depending on the contract length
            </p>
          </div>
        )}

        {result && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="commercial">Commercial</TabsTrigger>
              <TabsTrigger value="legal">Legal</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Executive Summary</h3>
                  <p className="text-sm text-muted-foreground">
                    {result.summary.executive_summary}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Key Findings</h3>
                  <div className="grid gap-2">
                    {result.summary.key_findings.map((finding: any, index: number) => (
                      <Card key={index}>
                        <CardHeader className="py-2 px-4">
                          <Badge variant={getDepartmentBadgeVariant(finding.category)}>
                            {finding.category}
                          </Badge>
                        </CardHeader>
                        <CardContent className="py-2 px-4">
                          <p className="text-sm">{finding.highlights}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
                
                {result.summary.potential_issues.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Potential Issues</h3>
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Issues to Consider</AlertTitle>
                      <AlertDescription>
                        <ul className="list-disc pl-5 space-y-1">
                          {result.summary.potential_issues.map((issue: string, index: number) => (
                            <li key={index} className="text-sm">{issue}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="commercial">
              <div className="space-y-4">
                <h3 className="text-lg font-medium mb-2">Commercial Clauses</h3>
                {renderClausesByDepartment('Commercial')}
              </div>
            </TabsContent>
            
            <TabsContent value="legal">
              <div className="space-y-4">
                <h3 className="text-lg font-medium mb-2">Legal Clauses</h3>
                {renderClausesByDepartment('Legal')}
              </div>
            </TabsContent>
            
            <TabsContent value="compliance">
              <div className="space-y-4">
                <h3 className="text-lg font-medium mb-2">Compliance Clauses</h3>
                {renderClausesByDepartment('Compliance')}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
      
      {result && (
        <CardFooter className="flex justify-between border-t px-6 py-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 mr-1" />
            Analysis complete
          </div>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            Export Report
          </Button>
        </CardFooter>
      )}
    </Card>
  );

  // Helper function to render clauses by department
  function renderClausesByDepartment(department: string) {
    const clauses = result?.summary?.clauses?.filter((clause: any) => 
      clause.department === department
    ) || [];

    if (clauses.length === 0) {
      return (
        <p className="text-sm text-muted-foreground">
          No {department.toLowerCase()} clauses found in this contract.
        </p>
      );
    }

    return (
      <div className="grid gap-4">
        {clauses.map((clause: any, index: number) => (
          <Card key={index}>
            <CardHeader className="py-3 px-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base">{clause.clause_type}</CardTitle>
                </div>
                <Badge variant={getImportanceBadgeVariant(clause.importance)}>
                  {clause.importance}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="py-2 px-4">
              <p className="text-sm">{clause.summary}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
} 