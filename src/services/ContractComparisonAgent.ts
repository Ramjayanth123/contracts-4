import OpenAI from 'openai';
import { identifyChangedSections, isFormattingChangeOnly, classifyChangeComplexity } from './OptimizedComparisonUtils';

// Define types
export interface ContractVersionData {
  id: string;
  version_number: number;
  extracted_content: string;
}

export interface DepartmentalSummary {
  department: string;
  summary: string;
  key_clauses: Array<{
    type: string;
    summary: string;
    impact: string;
    risk_tags: string[];
    favorability: 'buyer' | 'vendor' | 'mutual' | 'unclear';
  }>;
}

export interface DepartmentalDiff {
  department: string;
  changed: boolean;
  v1_summary: string;
  v2_summary: string;
  diff: string;
  impact: string;
}

export interface ComparisonResult {
  v1: {
    version_number: number;
    departmental_summaries: DepartmentalSummary[];
  };
  v2: {
    version_number: number;
    departmental_summaries: DepartmentalSummary[];
  };
  diffs: DepartmentalDiff[];
  executive_summary: {
    summary: string;
    favorability_shift: string;
    risk_score_delta: number;
    flagged_departments: string[];
  };
}

// Constants
const API_TIMEOUT = 60000; // 60 seconds

// Create OpenAI client only when needed
let openaiInstance: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (openaiInstance) {
    return openaiInstance;
  }
  
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    console.warn('VITE_OPENAI_API_KEY not found in environment variables. Please add it to your .env.local file.');
  }
  
  openaiInstance = new OpenAI({
    apiKey: apiKey || 'YOUR_OPENAI_API_KEY_HERE',
    dangerouslyAllowBrowser: true,
  });
  
  console.log("✅ OpenAI client initialized for contract comparison");
  return openaiInstance;
}

// Utility function to handle timeouts
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    )
  ]);
}

// Note: Removed generateDepartmentalDiff and generateExecutiveSummary functions
// The simplified comparison approach handles differences directly without separate departmental analysis

// Simplified and cost-effective contract version comparison
export async function compareContractVersions(v1: ContractVersionData, v2: ContractVersionData): Promise<ComparisonResult> {
  console.log(`🚀 Starting simple comparison of contract versions ${v1.version_number} and ${v2.version_number}...`);
  
  try {
    // Step 1: Use text-diff to identify changed sections
    console.log('Step 1: Identifying changed sections...');
    const changedSections = identifyChangedSections(v1.extracted_content, v2.extracted_content);
    
    // Filter out formatting-only changes
    const significantChanges = changedSections.filter(section => 
      !isFormattingChangeOnly(section.oldText, section.newText));
    
    console.log(`Found ${changedSections.length} changed sections, ${significantChanges.length} with significant changes`);
    
    // If no significant changes, return early
    if (significantChanges.length === 0) {
      console.log('No significant changes detected');
      
      return {
        v1: {
          version_number: v1.version_number,
          departmental_summaries: []
        },
        v2: {
          version_number: v2.version_number,
          departmental_summaries: []
        },
        diffs: [],
        executive_summary: {
          summary: 'No significant changes detected between versions',
          favorability_shift: 'neutral',
          risk_score_delta: 0,
          flagged_departments: []
        }
      };
    }
    
    // Step 2: Generate a single comprehensive diff using AI
    console.log('Step 2: Generating comprehensive difference analysis...');
    const openai = getOpenAIClient();
    
    const options: any = {
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a contract comparison specialist. Your task is to analyze two contract versions and identify ONLY the differences between them. Be concise and focus only on what changed.
          
You MUST respond with a valid JSON object. Do not include any explanatory text, markdown formatting, or code blocks in your response.`
        },
        {
          role: "user",
          content: `Compare these two contract versions and identify the differences. Return a JSON object with:
          - summary: A brief overview of what changed
          - changes: An array of specific changes, each with:
            - section: The section/clause that changed
            - old_text: The original text (first 200 chars)
            - new_text: The new text (first 200 chars)
            - change_type: "added", "removed", "modified"
            - description: Brief description of the change
          
          Version 1 Content:
          ${v1.extracted_content.substring(0, 8000)}
          
          Version 2 Content:
          ${v2.extracted_content.substring(0, 8000)}
          
          Focus only on meaningful differences, ignore formatting changes.`
        }
      ]
    };
    
    // Add response format for GPT-4o-mini
    if (options.model === 'gpt-4o-mini' || options.model.includes('gpt-4o')) {
      options.response_format = { type: "json_object" };
    }
    
    const response = await withTimeout(
      openai.chat.completions.create(options),
      API_TIMEOUT,
      'Contract comparison timed out'
    );
    
    // Parse the response
    const resultText = response.choices[0].message.content || '{"summary": "Error analyzing differences", "changes": []}';
    
    let comparisonResult;
    try {
      const cleanedText = resultText
        .replace(/```json\s*/g, '')
        .replace(/```\s*$/g, '')
        .replace(/```\s*/g, '')
        .trim();
      
      comparisonResult = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse comparison result:', parseError);
      comparisonResult = {
        summary: 'Error analyzing differences',
        changes: []
      };
    }
    
    // Step 3: Format the result to match the expected interface
    console.log('Step 3: Formatting comparison result...');
    
    // Create a single departmental diff that contains all changes
    const mainDiff: DepartmentalDiff = {
      department: 'general',
      changed: comparisonResult.changes && comparisonResult.changes.length > 0,
      v1_summary: `Version ${v1.version_number}`,
      v2_summary: `Version ${v2.version_number}`,
      diff: comparisonResult.summary || 'No differences found',
      impact: comparisonResult.changes && comparisonResult.changes.length > 0 ? 'Changes detected' : 'No impact'
    };
    
    const result: ComparisonResult = {
      v1: {
        version_number: v1.version_number,
        departmental_summaries: []
      },
      v2: {
        version_number: v2.version_number,
        departmental_summaries: []
      },
      diffs: [mainDiff],
      executive_summary: {
        summary: comparisonResult.summary || 'No significant changes detected',
        favorability_shift: 'neutral',
        risk_score_delta: 0,
        flagged_departments: comparisonResult.changes && comparisonResult.changes.length > 0 ? ['general'] : []
      }
    };
    
    console.log('✅ Contract comparison completed successfully');
    return result;
  } catch (error) {
    console.error('❌ Error in comparison:', error);
    throw new Error(`Contract comparison failed: ${error.message}`);
  }
}

// Note: Removed unused helper functions to simplify the codebase
// The new compareContractVersions function handles comparison directly

// Note: Removed extractAllDepartmentClausesWithModel function as it's no longer needed
// The simplified comparison approach doesn't require departmental clause extraction

// Note: Removed generateDepartmentalSummaryWithModel function as it's no longer needed
// The simplified comparison approach provides direct differences without departmental summaries