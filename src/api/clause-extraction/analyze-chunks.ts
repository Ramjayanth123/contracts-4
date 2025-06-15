import openai from './openai-client';

interface ChunkResult {
  chunk_id: number;
  heading: string;
  text: string;
  token_count: number;
}

interface ClauseAnalysis {
  found: boolean;
  clause_type?: string;
  summary?: string;
  importance?: 'High' | 'Medium' | 'Low';
  rationale?: string;
  extracted_text?: string;
}

interface ChunkAnalysis {
  chunk_id: number;
  commercial?: ClauseAnalysis;
  legal?: ClauseAnalysis;
  compliance?: ClauseAnalysis;
  operational?: ClauseAnalysis;
}

// Define specialized agent prompts
const agentPrompts = {
  commercial: `
You are a commercial terms specialist analyzing contract text. Extract and summarize clauses related to financial and commercial aspects.

FOCUS AREAS:
- Payment terms and conditions
- Pricing structures and models
- Invoicing requirements
- Delivery schedules
- Service level agreements
- Performance metrics
- Renewal terms
- Volume commitments

INSTRUCTIONS:
Analyze the provided contract chunk and identify any commercial clauses.

OUTPUT FORMAT:
Please return a JSON object with the following structure:
{
  "found": true/false,
  "clause_type": "Payment Terms"/"Pricing"/"Invoicing"/"Delivery"/"SLA"/"Other",
  "summary": "2-3 sentence summary of the clause's key points",
  "importance": "High"/"Medium"/"Low",
  "rationale": "Why this clause matters commercially",
  "extracted_text": "The exact text of the clause"
}

If no relevant clause is found, return {"found": false}
`,

  legal: `
You are a legal specialist analyzing contract text. Extract and summarize clauses related to legal rights, obligations, and risks.

FOCUS AREAS:
- Indemnification
- Limitation of liability
- Warranties
- Termination rights
- Intellectual property
- Confidentiality
- Dispute resolution
- Governing law
- Assignment rights

INSTRUCTIONS:
Analyze the provided contract chunk and identify any legal clauses.

OUTPUT FORMAT:
Please return a JSON object with the following structure:
{
  "found": true/false,
  "clause_type": "Indemnification"/"Liability"/"Termination"/"IP Rights"/"Confidentiality"/"Dispute Resolution"/"Other",
  "summary": "2-3 sentence summary of the clause's key points",
  "importance": "High"/"Medium"/"Low",
  "rationale": "Why this clause matters from a legal risk perspective",
  "extracted_text": "The exact text of the clause"
}

If no relevant clause is found, return {"found": false}
`,

  compliance: `
You are a compliance specialist analyzing contract text. Extract and summarize clauses related to regulatory compliance and governance.

FOCUS AREAS:
- Data protection/GDPR
- Industry-specific regulations
- Audit rights
- Reporting requirements
- Certification requirements
- Compliance representations
- Anti-corruption/FCPA
- Record keeping obligations

INSTRUCTIONS:
Analyze the provided contract chunk and identify any compliance-related clauses.

OUTPUT FORMAT:
Please return a JSON object with the following structure:
{
  "found": true/false,
  "clause_type": "Data Protection"/"Audit Rights"/"Regulatory Compliance"/"Certifications"/"Anti-corruption"/"Other",
  "summary": "2-3 sentence summary of the clause's key points",
  "importance": "High"/"Medium"/"Low",
  "rationale": "Why this clause matters from a compliance perspective",
  "extracted_text": "The exact text of the clause"
}

If no relevant clause is found, return {"found": false}
`,

  operational: `
You are an operations specialist analyzing contract text. Extract and summarize clauses related to operational execution and delivery.

FOCUS AREAS:
- Implementation timelines
- Support and maintenance
- Training requirements
- Change management procedures
- Acceptance criteria
- Resource commitments
- Reporting cadence
- Operational constraints

INSTRUCTIONS:
Analyze the provided contract chunk and identify any operations-related clauses.

OUTPUT FORMAT:
Please return a JSON object with the following structure:
{
  "found": true/false,
  "clause_type": "Implementation"/"Support"/"Training"/"Change Management"/"Reporting"/"Other",
  "summary": "2-3 sentence summary of the clause's key points",
  "importance": "High"/"Medium"/"Low",
  "rationale": "Why this clause matters from an operational perspective",
  "extracted_text": "The exact text of the clause"
}

If no relevant clause is found, return {"found": false}
`
};

// Function to analyze a chunk with a specific agent
async function analyzeChunkWithAgent(
  chunk: ChunkResult,
  agentType: 'commercial' | 'legal' | 'compliance' | 'operational'
): Promise<ClauseAnalysis> {
  try {
    console.log(`Analyzing chunk ${chunk.chunk_id} with ${agentType} agent...`);
    
    const prompt = agentPrompts[agentType];
    
    // Explicitly tell the model to return JSON
    const userContent = `Please analyze this contract text for ${agentType} clauses and return a JSON response:\n\n${chunk.text}`;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: userContent }
      ],
      response_format: { type: "json_object" }
    });

    try {
      const result = JSON.parse(response.choices[0].message.content);
      console.log(`${agentType} analysis for chunk ${chunk.chunk_id}: ${result.found ? 'Found ' + result.clause_type : 'No clauses found'}`);
      return result;
    } catch (parseError) {
      console.error(`Failed to parse ${agentType} agent response as JSON:`, parseError);
      console.log('Raw response:', response.choices[0].message.content);
      return { found: false };
    }
  } catch (error) {
    console.error(`Error analyzing chunk with ${agentType} agent:`, error);
    return { found: false };
  }
}

// Function to analyze a chunk with all agents in parallel
async function analyzeChunk(chunk: ChunkResult): Promise<ChunkAnalysis> {
  try {
    console.log(`Starting analysis of chunk ${chunk.chunk_id}: "${chunk.heading}"`);
    
    // Run all agents in parallel
    const [commercial, legal, compliance, operational] = await Promise.all([
      analyzeChunkWithAgent(chunk, 'commercial'),
      analyzeChunkWithAgent(chunk, 'legal'),
      analyzeChunkWithAgent(chunk, 'compliance'),
      analyzeChunkWithAgent(chunk, 'operational')
    ]);

    console.log(`Completed analysis of chunk ${chunk.chunk_id}`);
    
    return {
      chunk_id: chunk.chunk_id,
      commercial,
      legal,
      compliance,
      operational
    };
  } catch (error) {
    console.error('Error analyzing chunk:', error);
    return {
      chunk_id: chunk.chunk_id
    };
  }
}

// Main function to analyze all chunks
export async function analyzeChunks(chunks: ChunkResult[]): Promise<ChunkAnalysis[]> {
  try {
    console.log(`Starting analysis of ${chunks.length} chunks...`);
    
    // Process chunks in batches to avoid overwhelming the API
    const batchSize = 3;
    const results: ChunkAnalysis[] = [];
    
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(chunks.length/batchSize)}, chunks ${i+1}-${Math.min(i+batchSize, chunks.length)}`);
      
      const batchPromises = batch.map(chunk => analyzeChunk(chunk));
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      console.log(`Completed batch ${Math.floor(i/batchSize) + 1}`);
    }
    
    console.log(`Analysis complete for all ${chunks.length} chunks`);
    return results;
  } catch (error) {
    console.error('Error analyzing chunks:', error);
    throw error;
  }
}

// Express-like handler for API routes
export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    console.log('Chunk analysis API called');
    const { chunks } = await req.json();
    
    if (!chunks || !Array.isArray(chunks)) {
      console.error('Invalid request: chunks array is required');
      return new Response(JSON.stringify({ error: 'Chunks array is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log(`Processing ${chunks.length} chunks`);
    const result = await analyzeChunks(chunks);
    
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in analyze-chunks API:', error);
    return new Response(JSON.stringify({ error: 'Failed to analyze document chunks' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 