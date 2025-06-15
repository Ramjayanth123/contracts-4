import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

// Define the types for our clause extraction
export interface DocumentStructure {
  title: string;
  sections: Array<{
    heading: string;
    level: number;
    text: string;
  }>;
}

export interface ChunkResult {
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
}

export interface ChunkAnalysis {
  chunk_id: number;
  commercial?: ClauseAnalysis;
  legal?: ClauseAnalysis;
  compliance?: ClauseAnalysis;
  operational?: ClauseAnalysis;
}

export interface MacroSummary {
  key_points: string[];
  recommendations: string[];
  risk_assessment: string;
}

export interface ExtractionResult {
  structure?: DocumentStructure;
  chunks?: ChunkResult[];
  analyses?: ChunkAnalysis[];
  macro_summary?: MacroSummary;
}

interface ClauseExtractionOptions {
  onComplete?: (result: ExtractionResult) => void;
  onError?: (error: Error) => void;
}

export default function useClauseExtraction(options: ClauseExtractionOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExtractionResult>({});
  const [progress, setProgress] = useState<string>('');
  const [stage, setStage] = useState<string>('');
  const { toast } = useToast();

  const extractClauses = async (text: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setResult({});
      setProgress('Starting document analysis...');
      setStage('structure');

      // Step 1: Extract document structure
      const structureResponse = await fetch('/api/clause-extraction/extract-structure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!structureResponse.ok) {
        throw new Error(`Failed to extract document structure: ${structureResponse.statusText}`);
      }

      const structure = await structureResponse.json();
      setResult(prev => ({ ...prev, structure }));
      setProgress('Document structure extracted. Chunking document...');
      setStage('chunking');

      // Step 2: Chunk the document
      const chunkResponse = await fetch('/api/clause-extraction/chunk-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ structure }),
      });

      if (!chunkResponse.ok) {
        throw new Error(`Failed to chunk document: ${chunkResponse.statusText}`);
      }

      const chunks = await chunkResponse.json();
      setResult(prev => ({ ...prev, chunks }));
      setProgress(`Document chunked into ${chunks.length} sections. Analyzing chunks...`);
      setStage('analysis');

      // Step 3: Analyze chunks
      const analysisResponse = await fetch('/api/clause-extraction/analyze-chunks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chunks }),
      });

      if (!analysisResponse.ok) {
        throw new Error(`Failed to analyze chunks: ${analysisResponse.statusText}`);
      }

      const analyses = await analysisResponse.json();
      setResult(prev => ({ ...prev, analyses }));
      setProgress('Chunk analysis complete. Generating macro summary...');
      setStage('summary');

      // Step 4: Generate macro summary
      const summaryResponse = await fetch('/api/clause-extraction/macro-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          analyses,
          text // Send the original text to ensure the API has all necessary context
        }),
      });

      if (!summaryResponse.ok) {
        throw new Error(`Failed to generate macro summary: ${summaryResponse.statusText}`);
      }

      const macro_summary = await summaryResponse.json();
      setResult(prev => ({ ...prev, macro_summary }));
      setProgress('Analysis complete!');
      setStage('complete');

      // Compile final result
      const finalResult = {
        structure,
        chunks,
        analyses,
        macro_summary
      };
      
      // Call onComplete callback if provided
      if (options.onComplete) {
        options.onComplete(finalResult);
      }
      
      console.log('Clause extraction process completed successfully');
      return finalResult;
    } catch (err) {
      console.error('Clause extraction error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error during clause extraction');
      setProgress('Error during analysis');
      setStage('error');
      
      // Call onError callback if provided
      if (options.onError) {
        options.onError(err instanceof Error ? err : new Error('Unknown error occurred'));
      }
      
      toast({
        title: "Error",
        description: "Failed to extract clauses from the document",
        variant: "destructive",
      });
      
      throw err instanceof Error ? err : new Error('Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    extractClauses,
    isLoading,
    error,
    result,
    progress,
    stage,
  };
} 