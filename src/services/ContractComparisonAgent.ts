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
const DEPARTMENTS = ['legal', 'commercial', 'compliance', 'operational'];

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

// Tool: Diff Tool
async function generateDepartmentalDiff(
  v1Summary: DepartmentalSummary, 
  v2Summary: DepartmentalSummary
): Promise<DepartmentalDiff> {
  console.log(`🔄 Comparing ${v1Summary.department} summaries between versions...`);
  try {
    const openai = getOpenAIClient();
    
    // Define base options
    const options: any = {
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a contract diff analysis agent specializing in identifying meaningful changes between contract versions.
          
You MUST respond with a valid JSON object. Do not include any explanatory text, markdown formatting, or code blocks in your response.`
        },
        {
          role: "user",
          content: `Compare these two versions of ${v1Summary.department} summaries and identify meaningful differences. Return a JSON object with:
          - department: "${v1Summary.department}"
          - changed: boolean indicating if there are meaningful changes
          - v1_summary: summary of version 1
          - v2_summary: summary of version 2
          - diff: description of key differences
          - impact: business impact of these changes
          
          V1: ${JSON.stringify(v1Summary)}
          V2: ${JSON.stringify(v2Summary)}`
        }
      ]
    };
    
    // Only add response_format for models that support it
    if (options.model === 'gpt-3.5-turbo' || options.model.includes('gpt-4o')) {
      options.response_format = { type: "json_object" };
    }
    
    const response = await withTimeout(
      openai.chat.completions.create(options),
      API_TIMEOUT,
      `Diff generation for ${v1Summary.department} timed out`
    );
    
    // Parse JSON from the response text
    const resultText = response.choices[0].message.content || `{"department": "${v1Summary.department}", "changed": false, "v1_summary": "${v1Summary.summary}", "v2_summary": "${v2Summary.summary}", "diff": "Error generating diff", "impact": "Unknown"}`;
    
    // Add better error handling for JSON parsing
    let result;
    try {
      // Remove any markdown formatting that might be present
      const cleanedText = resultText
        .replace(/```json\s*/g, '')
        .replace(/```\s*$/g, '')
        .replace(/```\s*/g, '')
        .trim();
      
      result = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error(`Failed to parse JSON response for ${v1Summary.department} diff:`, parseError);
      console.log('Raw response:', resultText);
      return {
        department: v1Summary.department,
        changed: false,
        v1_summary: v1Summary.summary,
        v2_summary: v2Summary.summary,
        diff: `Error generating diff for ${v1Summary.department}`,
        impact: "Unknown"
      };
    }
    
    console.log(`✅ ${v1Summary.department} diff analysis complete: ${result.changed ? 'Changes detected' : 'No changes'}`);
    return result;
  } catch (error) {
    console.error(`❌ Error generating diff for ${v1Summary.department}:`, error);
    return {
      department: v1Summary.department,
      changed: false,
      v1_summary: v1Summary.summary,
      v2_summary: v2Summary.summary,
      diff: `Error generating diff for ${v1Summary.department}`,
      impact: "Unknown"
    };
  }
}

async function generateExecutiveSummary(diffs: DepartmentalDiff[]) {
  console.log('📊 Generating executive summary...');
  try {
    const openai = getOpenAIClient();
    
    // Define base options
    const options: any = {
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an executive summary generator for contract version comparisons.
          
You MUST respond with a valid JSON object. Do not include any explanatory text, markdown formatting, or code blocks in your response.`
        },
        {
          role: "user",
          content: `Generate an executive summary of the differences between these contract versions. Return a JSON object with:
          - summary: a concise overview of key changes
          - favorability_shift: whether changes favor "buyer", "vendor", or "neutral"
          - risk_score_delta: number from -10 to 10 indicating change in risk (negative = less risky)
          - flagged_departments: array of departments with significant changes
          
          Diffs: ${JSON.stringify(diffs)}`
        }
      ]
    };
    
    // Only add response_format for models that support it
    if (options.model === 'gpt-3.5-turbo' || options.model.includes('gpt-4o')) {
      options.response_format = { type: "json_object" };
    }
    
    const response = await withTimeout(
      openai.chat.completions.create(options),
      API_TIMEOUT,
      `Executive summary generation timed out`
    );
    
    // Parse JSON from the response text
    const resultText = response.choices[0].message.content || '{"summary": "Error generating executive summary", "favorability_shift": "neutral", "risk_score_delta": 0, "flagged_departments": []}';
    
    // Add better error handling for JSON parsing
    let result;
    try {
      // Remove any markdown formatting that might be present
      const cleanedText = resultText
        .replace(/```json\s*/g, '')
        .replace(/```\s*$/g, '')
        .replace(/```\s*/g, '')
        .trim();
      
      result = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse JSON response for executive summary:', parseError);
      console.log('Raw response:', resultText);
      return {
        summary: "Error generating executive summary",
        favorability_shift: "neutral",
        risk_score_delta: 0,
        flagged_departments: []
      };
    }
    
    console.log('✅ Executive summary generated successfully');
    return result;
  } catch (error) {
    console.error('❌ Error generating executive summary:', error);
    return {
      summary: "Error generating executive summary",
      favorability_shift: "neutral",
      risk_score_delta: 0,
      flagged_departments: []
    };
  }
}

// Optimized version of compareContractVersions (now the only implementation)
export async function compareContractVersions(v1: ContractVersionData, v2: ContractVersionData): Promise<ComparisonResult> {
  console.log(`🚀 Starting optimized comparison of contract versions ${v1.version_number} and ${v2.version_number}...`);
  
  try {
    // Step 1: Use text-diff to identify changed sections
    console.log('Step 1: Identifying changed sections with text-diff...');
    const changedSections = identifyChangedSections(v1.extracted_content, v2.extracted_content);
    
    // Filter out formatting-only changes
    const significantChanges = changedSections.filter(section => 
      !isFormattingChangeOnly(section.oldText, section.newText));
    
    console.log(`Found ${changedSections.length} changed sections, ${significantChanges.length} with significant changes`);
    
    // If no significant changes, return early with a simplified result
    if (significantChanges.length === 0) {
      console.log('No significant changes detected, returning simplified result');
      
      // Create departmental summaries and diffs
      const departmentalSummaries = DEPARTMENTS.map(dept => ({
        department: dept,
        summary: `No significant changes detected in ${dept} clauses`,
        key_clauses: []
      }));
      
      const diffs = DEPARTMENTS.map(dept => ({
        department: dept,
        changed: false,
        v1_summary: `No significant changes in ${dept} clauses`,
        v2_summary: `No significant changes in ${dept} clauses`,
        diff: `No significant differences detected in ${dept} clauses`,
        impact: 'No impact'
      }));
      
      return {
        v1: {
          version_number: v1.version_number,
          departmental_summaries: departmentalSummaries
        },
        v2: {
          version_number: v2.version_number,
          departmental_summaries: departmentalSummaries
        },
        diffs,
        executive_summary: {
          summary: 'No significant changes detected between versions',
          favorability_shift: 'neutral',
          risk_score_delta: 0,
          flagged_departments: []
        }
      };
    }
    
    // Step 2: Create synthetic chunks from the changed sections
    console.log('Step 2: Creating synthetic chunks from changed sections...');
    const v1Chunks = significantChanges.map((change, index) => ({
      id: `v1_change_${index}`,
      text: change.oldText,
      type: "changed_section"
    }));
    
    const v2Chunks = significantChanges.map((change, index) => ({
      id: `v2_change_${index}`,
      text: change.newText,
      type: "changed_section"
    }));
    
    // Step 3: Classify changes to determine which need deep analysis
    console.log('Step 3: Classifying changes for two-tier analysis...');
    const openai = getOpenAIClient();
    const classifications = await Promise.all(
      significantChanges.map(section => classifyChangeComplexity(section, openai))
    );
    
    console.log('Change classifications:', classifications.map(c => `${c.complexity}/${c.impact}`).join(', '));
    
    // Step 4: Process chunks with appropriate models based on classification
    console.log('Step 4: Processing chunks with two-tier model strategy...');
    
    // Split chunks by complexity
    const highComplexityIndices = classifications
      .map((c, i) => c.complexity === 'high' || c.impact === 'significant' ? i : -1)
      .filter(i => i !== -1);
    
    const standardComplexityIndices = classifications
      .map((c, i) => (c.complexity === 'medium' || c.impact === 'moderate') ? i : -1)
      .filter(i => i !== -1);
    
    const lowComplexityIndices = classifications
      .map((c, i) => c.complexity === 'low' && c.impact === 'minimal' ? i : -1)
      .filter(i => i !== -1);
    
    console.log(`Complexity breakdown: ${highComplexityIndices.length} high, ${standardComplexityIndices.length} standard, ${lowComplexityIndices.length} low`);
    
    // Process chunks by complexity level
    const v1HighChunks = highComplexityIndices.map(i => v1Chunks[i]);
    const v2HighChunks = highComplexityIndices.map(i => v2Chunks[i]);
    const v1StandardChunks = standardComplexityIndices.map(i => v1Chunks[i]);
    const v2StandardChunks = standardComplexityIndices.map(i => v2Chunks[i]);
    const v1LowChunks = lowComplexityIndices.map(i => v1Chunks[i]);
    const v2LowChunks = lowComplexityIndices.map(i => v2Chunks[i]);
    
    // Process high complexity chunks with GPT-4
    const [v1HighSummaries, v2HighSummaries] = await Promise.all([
      v1HighChunks.length > 0 ? processChunksWithModel(v1HighChunks, 'gpt-4') : [],
      v2HighChunks.length > 0 ? processChunksWithModel(v2HighChunks, 'gpt-4') : []
    ]);
    
    // Process standard complexity chunks with GPT-3.5-Turbo
    const [v1StandardSummaries, v2StandardSummaries] = await Promise.all([
      v1StandardChunks.length > 0 ? processChunksWithModel(v1StandardChunks, 'gpt-3.5-turbo') : [],
      v2StandardChunks.length > 0 ? processChunksWithModel(v2StandardChunks, 'gpt-3.5-turbo') : []
    ]);
    
    // Process low complexity chunks with simplified analysis
    const [v1LowSummaries, v2LowSummaries] = await Promise.all([
      v1LowChunks.length > 0 ? processLowComplexityChunks(v1LowChunks) : [],
      v2LowChunks.length > 0 ? processLowComplexityChunks(v2LowChunks) : []
    ]);
    
    // Combine all summaries
    const v1Summaries = [...v1HighSummaries, ...v1StandardSummaries, ...v1LowSummaries];
    const v2Summaries = [...v2HighSummaries, ...v2StandardSummaries, ...v2LowSummaries];
    
    // Step 5: Generate diffs for each department
    console.log('Step 5: Generating departmental diffs...');
    const diffPromises = DEPARTMENTS.map((department) => {
      const v1DeptSummary = v1Summaries.find(s => s.department === department) || {
        department,
        summary: `No ${department} analysis available`,
        key_clauses: []
      };
      
      const v2DeptSummary = v2Summaries.find(s => s.department === department) || {
        department,
        summary: `No ${department} analysis available`,
        key_clauses: []
      };
      
      return generateDepartmentalDiff(v1DeptSummary, v2DeptSummary);
    });
    
    const diffs = await Promise.all(diffPromises);
    
    // Step 6: Generate executive summary
    console.log('Step 6: Generating executive summary...');
    // Always use GPT-4 for the executive summary as it's critical
    const executiveSummary = await generateExecutiveSummary(diffs);
    
    // Step 7: Compile final result
    console.log('Step 7: Compiling final comparison result...');
    const result: ComparisonResult = {
      v1: {
        version_number: v1.version_number,
        departmental_summaries: v1Summaries
      },
      v2: {
        version_number: v2.version_number,
        departmental_summaries: v2Summaries
      },
      diffs,
      executive_summary: executiveSummary
    };
    
    console.log('✅ Contract comparison completed successfully');
    return result;
  } catch (error) {
    console.error('❌ Error in comparison:', error);
    throw new Error(`Contract comparison failed: ${error.message}`);
  }
}

// Process chunks with specified model
async function processChunksWithModel(chunks: any[], model: string) {
  console.log(`Processing ${chunks.length} chunks with ${model}...`);
  
  // Extract clauses from all chunks using the specified model
  const allClausesPromises = chunks.map(chunk => 
    extractAllDepartmentClausesWithModel(chunk, model));
  const allClausesResults = await Promise.all(allClausesPromises);
  
  // Flatten and organize by department
  const flattenedClauses = allClausesResults.flat();
  const clausesByDepartment: Record<string, any[]> = {};
  
  // Initialize department arrays
  DEPARTMENTS.forEach(dept => {
    clausesByDepartment[dept] = [];
  });
  
  // Sort clauses into departments
  flattenedClauses.forEach(clause => {
    const dept = clause.department;
    if (DEPARTMENTS.includes(dept)) {
      clausesByDepartment[dept].push(clause);
    }
  });
  
  // Generate summaries for each department
  const summaries: DepartmentalSummary[] = [];
  
  for (const department of DEPARTMENTS) {
    const departmentClauses = clausesByDepartment[department];
    
    if (departmentClauses.length === 0) {
      summaries.push({
        department,
        summary: `No relevant ${department} clauses found`,
        key_clauses: []
      });
    } else {
      // Use the same model for summarization
      const summary = await generateDepartmentalSummaryWithModel(
        departmentClauses, 
        department,
        model
      );
      summaries.push(summary);
    }
  }
  
  return summaries;
}

// Simplified analysis for low complexity chunks
async function processLowComplexityChunks(chunks: any[]) {
  console.log(`Processing ${chunks.length} low complexity chunks with simplified analysis...`);
  
  // For low complexity chunks, use a very simple approach
  const summaries: DepartmentalSummary[] = DEPARTMENTS.map(department => ({
    department,
    summary: `Minor changes detected in ${department} clauses, no significant impact`,
    key_clauses: []
  }));
  
  return summaries;
}

// Extract clauses with specified model
async function extractAllDepartmentClausesWithModel(chunk: any, model: string) {
  console.log(`Analyzing chunk ${chunk.id} with ${model}...`);
  try {
    const openai = getOpenAIClient();
    
    // Define base options
    const options: any = {
      model: model,
      messages: [
        {
          role: "system",
          content: `You are a comprehensive contract analysis agent capable of analyzing contract clauses from multiple perspectives: legal, commercial, compliance, and operational. Identify relevant clauses for each department and provide detailed analysis.

You MUST respond with a valid JSON object containing an array called "departments" with objects for each department.
Do not include any explanatory text, markdown formatting, or code blocks in your response.`
        },
        {
          role: "user",
          content: `Analyze this contract chunk from all four perspectives: legal, commercial, compliance, and operational.

Return a JSON object with an array called "departments" containing objects for each department with:
- department: the department name (legal/commercial/compliance/operational)
- relevant: boolean indicating if this chunk is relevant to this department
- clause_type: the type of clause from this department's perspective
- clause_summary: brief summary relevant to this department
- impact: potential impact for this department
- risk_tags: array of risk factors for this department
- favorability: who this favors (buyer/vendor/mutual)

Contract chunk: "${chunk.text}"`
        }
      ]
    };
    
    // Only add response_format for models that support it
    if (model === 'gpt-3.5-turbo' || model.includes('gpt-4o')) {
      options.response_format = { type: "json_object" };
    }
    
    const response = await withTimeout(
      openai.chat.completions.create(options),
      API_TIMEOUT,
      `Clause extraction with ${model} timed out for chunk ${chunk.id}`
    );
    
    // Parse JSON from the response text
    const resultText = response.choices[0].message.content || '{"departments": []}';
    
    // Add better error handling for JSON parsing
    let analysis;
    try {
      // Remove any markdown formatting that might be present
      const cleanedText = resultText
        .replace(/```json\s*/g, '')
        .replace(/```\s*$/g, '')
        .replace(/```\s*/g, '')
        .trim();
      
      analysis = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error(`Failed to parse JSON response for chunk ${chunk.id}:`, parseError);
      console.log('Raw response:', resultText);
      return [];
    }
    
    if (!analysis.departments || !Array.isArray(analysis.departments)) {
      console.error(`Invalid response format for chunk ${chunk.id}`);
      return [];
    }
    
    // Process the results by department
    const relevantClauses = analysis.departments
      .filter(dept => dept.relevant)
      .map(dept => ({
        chunk_id: chunk.id,
        department: dept.department,
        clause_type: dept.clause_type,
        clause_summary: dept.clause_summary,
        impact: dept.impact,
        risk_tags: dept.risk_tags,
        favorability: dept.favorability
      }));
    
    console.log(`✅ Clause extraction with ${model} complete for chunk ${chunk.id}: Found ${relevantClauses.length} relevant clauses`);
    return relevantClauses;
  } catch (error) {
    console.error(`❌ Error analyzing chunk ${chunk.id} with ${model}:`, error);
    return [];
  }
}

// Generate department summary with specified model
async function generateDepartmentalSummaryWithModel(
  clauses: any[], 
  department: string, 
  model: string
): Promise<DepartmentalSummary> {
  console.log(`Generating ${department} summary with ${model} from ${clauses.length} clauses...`);
  try {
    const openai = getOpenAIClient();
    
    // Define base options
    const options: any = {
      model: model,
      messages: [
        {
          role: "system",
          content: `You are a contract summarization agent specializing in ${department} aspects.
          
You MUST respond with a valid JSON object. Do not include any explanatory text, markdown formatting, or code blocks in your response.`
        },
        {
          role: "user",
          content: `Generate a comprehensive summary of these ${department} clauses. Return a JSON object with:
          - department: "${department}"
          - summary: a paragraph summarizing all clauses
          - key_clauses: array of the most important clauses with their details
          
          Clauses: ${JSON.stringify(clauses)}`
        }
      ]
    };
    
    // Only add response_format for models that support it
    if (model === 'gpt-3.5-turbo' || model.includes('gpt-4o')) {
      options.response_format = { type: "json_object" };
    }
    
    const response = await withTimeout(
      openai.chat.completions.create(options),
      API_TIMEOUT,
      `Summary generation with ${model} for ${department} timed out`
    );
    
    // Parse JSON from the response text
    const resultText = response.choices[0].message.content || `{"department": "${department}", "summary": "Error generating summary", "key_clauses": []}`;
    
    // Add better error handling for JSON parsing
    let result;
    try {
      // Remove any markdown formatting that might be present
      const cleanedText = resultText
        .replace(/```json\s*/g, '')
        .replace(/```\s*$/g, '')
        .replace(/```\s*/g, '')
        .trim();
      
      result = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error(`Failed to parse JSON response for ${department} summary:`, parseError);
      console.log('Raw response:', resultText);
      return {
      department,
        summary: `Error generating summary for ${department}`,
      key_clauses: []
    };
    }
    
    console.log(`✅ ${department} summary generated successfully with ${model}`);
    return result;
  } catch (error) {
    console.error(`❌ Error generating summary for ${department} with ${model}:`, error);
    return {
      department,
      summary: `Error generating summary for ${department}`,
      key_clauses: []
    };
  }
} 