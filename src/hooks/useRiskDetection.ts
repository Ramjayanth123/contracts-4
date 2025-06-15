import { useState } from 'react';
import { useToast } from './use-toast';

export interface Risk {
  phrase: string;
  explanation: string;
  severity: 'High' | 'Medium' | 'Low';
  risk_type: string;
  suggestion: string;
  chunk?: string;
  chunkIndex?: number;
  domain?: string;
}

export interface RiskAnalysisResult {
  risks: Risk[];
  risksBySeverity: {
    High: Risk[];
    Medium: Risk[];
    Low: Risk[];
  };
  riskScore: number;
  executiveSummary: string;
  sampleText?: string;
  stats: {
    totalRisks: number;
    highRisks: number;
    mediumRisks: number;
    lowRisks: number;
  };
}

export const useRiskDetection = () => {
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [result, setResult] = useState<RiskAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Analyze document for risks
  const analyzeDocument = async (text: string) => {
    try {
      setAnalyzing(true);
      setError(null);
      
      console.log('Sending document for risk analysis...');
      
      // Make API request to analyze risks
      const response = await fetch('/api/risk-detection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Risk analysis failed');
      }
      
      const data = await response.json();
      console.log('Risk analysis completed:', data);
      
      // Check if we got any risks
      if (data.risks.length === 0) {
        toast({
          title: "Analysis Complete",
          description: "No risks were detected in this document.",
        });
      } else {
        toast({
          title: "Analysis Complete",
          description: `Detected ${data.stats.totalRisks} risks (${data.stats.highRisks} high, ${data.stats.mediumRisks} medium, ${data.stats.lowRisks} low)`,
        });
      }
      
      setResult(data);
    } catch (err) {
      console.error('Error in risk detection:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      
      toast({
        title: "Risk Analysis Failed",
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };
  
  // Clear analysis results
  const clearResults = () => {
    setResult(null);
    setError(null);
  };
  
  return {
    analyzeDocument,
    clearResults,
    analyzing,
    result,
    error,
  };
}; 