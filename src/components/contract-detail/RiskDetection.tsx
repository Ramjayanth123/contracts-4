import React, { useState, useEffect } from 'react';
import { AlertTriangle, Loader2, Upload, Beaker } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRiskDetection, Risk } from '@/hooks/useRiskDetection';
import RiskHighlighter from './RiskHighlighter';
import RiskSummaryPanel from './RiskSummaryPanel';
import { useToast } from '@/hooks/use-toast';

interface RiskDetectionProps {
  contractId: string;
  documentText: string | null;
}

export const RiskDetection: React.FC<RiskDetectionProps> = ({ contractId, documentText }) => {
  const { analyzeDocument, clearResults, analyzing, result, error } = useRiskDetection();
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);
  const [viewMode, setViewMode] = useState<'summary' | 'document'>('summary');
  const { toast } = useToast();

  // Check if document text is available
  const isDocumentTextAvailable = !!documentText && documentText.trim().length > 0;

  // Handle risk analysis
  const handleAnalyzeRisks = async () => {
    if (!isDocumentTextAvailable) {
      toast({
        title: "Error",
        description: "No document text available for analysis",
        variant: "destructive",
      });
      return;
    }
    
    console.log('Starting risk analysis for contract:', contractId);
    await analyzeDocument(documentText);
  };

  // Handle sample risk analysis (using empty string to trigger sample text on backend)
  const handleAnalyzeSample = async () => {
    console.log('Starting risk analysis with sample text');
    await analyzeDocument("");
  };

  // Handle risk click in summary panel
  const handleRiskClick = (risk: Risk) => {
    setSelectedRisk(risk);
    setViewMode('document');
    
    // Scroll to the risk in the document (simple implementation for MVP)
    setTimeout(() => {
      const elements = document.querySelectorAll('.risk-highlight');
      for (const element of elements) {
        if (element.textContent?.includes(risk.phrase)) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          break;
        }
      }
    }, 100);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          <h3 className="text-lg font-semibold">Risk Detection</h3>
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {!analyzing && !result && isDocumentTextAvailable && (
            <Button 
              variant="outline" 
              onClick={handleAnalyzeRisks}
              disabled={analyzing}
            >
              Analyze Risks
            </Button>
          )}
          
          {!analyzing && !result && (
            <Button 
              variant="outline" 
              onClick={handleAnalyzeSample}
              disabled={analyzing}
            >
              <Beaker className="h-4 w-4 mr-2" />
              Test with Sample
            </Button>
          )}
          
          {result && (
            <>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setViewMode(viewMode === 'summary' ? 'document' : 'summary')}
              >
                {viewMode === 'summary' ? 'View Document' : 'View Summary'}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={clearResults}
              >
                Clear Results
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Document text not available message */}
      {!isDocumentTextAvailable && !analyzing && !result && (
        <div className="glass-card rounded-lg p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4 opacity-50" />
          <h4 className="text-lg font-medium mb-2">No Document Text Available</h4>
          <p className="text-muted-foreground mb-4">
            Please upload a document or ensure the contract has extracted content before analyzing risks.
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Alternatively, you can test the risk detection with a sample contract containing known risks.
          </p>
          <Button 
            onClick={handleAnalyzeSample}
            disabled={analyzing}
          >
            <Beaker className="h-4 w-4 mr-2" />
            Test with Sample Contract
          </Button>
        </div>
      )}

      {/* Loading state */}
      {analyzing && (
        <div className="flex flex-col items-center justify-center p-8">
          <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
          <p className="text-muted-foreground">Analyzing document for risks...</p>
          <p className="text-xs text-muted-foreground mt-1">This may take a minute for larger documents.</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 text-center">
          <p className="text-red-400">{error}</p>
          <div className="flex justify-center gap-2 mt-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleAnalyzeRisks()}
              disabled={!isDocumentTextAvailable}
            >
              Retry Analysis
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleAnalyzeSample()}
            >
              Try Sample Contract
            </Button>
          </div>
        </div>
      )}

      {/* Results */}
      {result && !analyzing && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left panel - Risk summary (always visible) */}
          <div className={viewMode === 'summary' ? 'lg:col-span-3' : 'lg:col-span-1'}>
            <RiskSummaryPanel 
              result={result} 
              onRiskClick={handleRiskClick}
            />
          </div>
          
          {/* Right panel - Document with highlighted risks */}
          {viewMode === 'document' && (
            <div className="lg:col-span-2">
              <div className="glass-card rounded-lg p-4 max-h-[600px] overflow-y-auto">
                <RiskHighlighter 
                  documentText={documentText || result.sampleText || "No document text available"} 
                  risks={result.risks} 
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!analyzing && !result && !error && isDocumentTextAvailable && (
        <div className="glass-card rounded-lg p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4 opacity-50" />
          <h4 className="text-lg font-medium mb-2">Risk Detection</h4>
          <p className="text-muted-foreground mb-4">
            Automatically identify potentially risky, non-compliant, or ambiguous language in this contract.
          </p>
          <div className="flex justify-center gap-2">
            <Button 
              onClick={handleAnalyzeRisks}
              disabled={analyzing}
            >
              Analyze Risks
            </Button>
            <Button 
              variant="outline"
              onClick={handleAnalyzeSample}
              disabled={analyzing}
            >
              <Beaker className="h-4 w-4 mr-2" />
              Test with Sample
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskDetection; 