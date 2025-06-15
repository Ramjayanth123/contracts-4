import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

// Define the types for our clause extraction
export interface ClauseChunk {
  chunk_id: number;
  heading: string;
  text: string;
  token_count: number;
}

export interface ClauseAnalysis {
  found: boolean;
  clause_type?: string;
  summary?: string;
  importance?: 'High' | 'Medium' | 'Low';
  rationale?: string;
  extracted_text?: string;
  department?: 'Commercial' | 'Legal' | 'Compliance' | 'Operational';
}

export interface MacroSummary {
  executive_summary: string;
  key_findings: {
    category: 'Commercial' | 'Legal' | 'Compliance' | 'Operational';
    highlights: string;
  }[];
  clauses: {
    clause_type: string;
    department: 'Commercial' | 'Legal' | 'Compliance' | 'Operational';
    summary: string;
    importance: 'High' | 'Medium' | 'Low';
  }[];
  potential_issues: string[];
}

export interface ClauseExtractionResult {
  chunks: ClauseChunk[];
  analyses: {
    chunk_id: number;
    commercial?: ClauseAnalysis;
    legal?: ClauseAnalysis;
    compliance?: ClauseAnalysis;
    operational?: ClauseAnalysis;
  }[];
  macroSummary: MacroSummary;
}

interface ClauseExtractionOptions {
  onComplete?: (result: any) => void;
  onError?: (error: Error) => void;
}

export default function useClauseExtraction(options: ClauseExtractionOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const extractClauses = async (text: string) => {
    try {
      // Validate that text is not null or empty
      if (!text || text.trim() === '') {
        throw new Error('Text is required');
      }
      
      console.log('Starting clause extraction process...');
      setIsLoading(true);
      setError(null);
      
      // Step 1: Validate document structure
      console.log('Step 1: Validating document structure');
      const structureResponse = await fetch('/api/clause-extraction/validate-structure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      
      if (!structureResponse.ok) {
        const errorData = await structureResponse.json();
        throw new Error(errorData.error || 'Failed to validate document structure');
      }
      
      const structureResult = await structureResponse.json();
      console.log('Document structure validation result:', structureResult);
      
      // Step 2: Chunk the document
      console.log('Step 2: Chunking document');
      const chunkResponse = await fetch('/api/clause-extraction/chunk-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text,
          isStructured: structureResult.is_structured
        })
      });
      
      if (!chunkResponse.ok) {
        const errorData = await chunkResponse.json();
        throw new Error(errorData.error || 'Failed to chunk document');
      }
      
      const chunks = await chunkResponse.json();
      console.log(`Document chunked into ${chunks.length} sections`);
      
      // Step 3: Analyze chunks
      console.log('Step 3: Analyzing chunks');
      const analysisResponse = await fetch('/api/clause-extraction/analyze-chunks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chunks })
      });
      
      if (!analysisResponse.ok) {
        const errorData = await analysisResponse.json();
        throw new Error(errorData.error || 'Failed to analyze document chunks');
      }
      
      const analyses = await analysisResponse.json();
      console.log(`Completed analysis of ${analyses.length} chunks`);
      
      // Step 4: Generate macro summary
      console.log('Step 4: Generating macro summary');
      const summaryResponse = await fetch('/api/clause-extraction/macro-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analyses })
      });
      
      if (!summaryResponse.ok) {
        const errorData = await summaryResponse.json();
        throw new Error(errorData.error || 'Failed to generate macro summary');
      }
      
      const summary = await summaryResponse.json();
      console.log('Macro summary generated successfully');
      
      // Compile final result
      const finalResult = {
        structure: structureResult,
        chunks,
        analyses,
        summary
      };
      
      setResult(finalResult);
      
      // Call onComplete callback if provided
      if (options.onComplete) {
        options.onComplete(finalResult);
      }
      
      console.log('Clause extraction process completed successfully');
      return finalResult;
    } catch (err) {
      console.error('Error in clause extraction process:', err);
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      
      // Call onError callback if provided
      if (options.onError) {
        options.onError(error);
      }
      
      toast({
        title: "Error",
        description: "Failed to extract clauses from the document",
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    extractClauses,
    isLoading,
    error,
    result
  };
} 