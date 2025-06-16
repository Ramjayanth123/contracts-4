import { getOpenAIClient } from './openai-client';

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
}

interface ChunkAnalysis {
  chunk_id: number;
  commercial?: ClauseAnalysis;
  legal?: ClauseAnalysis;
  compliance?: ClauseAnalysis;
  operational?: ClauseAnalysis;
}

// Screening prompt for initial relevance check
const screeningPrompt = `
You are a contract screening assistant. Your task is to quickly identify if this text contains clauses related to:
1. Commercial aspects (payment, pricing, exclusivity, renewal, termination)
2. Legal aspects (liability, indemnification, warranties, IP, confidentiality)
3. Compliance aspects (data protection, regulations, audit rights)
4. Operational aspects (implementation, support, training, timelines)

Return a JSON object with true/false values for each category:
{
  "commercial_relevant": true/false,
  "legal_relevant": true/false,
  "compliance_relevant": true/false,
  "operational_relevant": true/false
}
`;

// Function to analyze a chunk with the tiered approach
async function analyzeChunk(chunk: ChunkResult): Promise<ChunkAnalysis> {
  try {
    console.log(`Starting analysis of chunk ${chunk.chunk_id}: "${chunk.heading}"`);
    
    // Get the OpenAI client only when needed
    const openai = getOpenAIClient();
    
    // STEP 1: Initial screening with GPT-3.5 Turbo
    console.log(`Performing initial screening of chunk ${chunk.chunk_id} with GPT-3.5 Turbo`);
    const screeningResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: screeningPrompt },
        { role: "user", content: chunk.text }
      ],
      response_format: { type: "json_object" }
    });
    
    // Parse the screening results
    let relevanceCheck;
    try {
      relevanceCheck = JSON.parse(screeningResponse.choices[0].message.content);
      console.log(`Screening results for chunk ${chunk.chunk_id}:`, relevanceCheck);
    } catch (parseError) {
      console.error(`Failed to parse screening response as JSON:`, parseError);
      // Default to analyzing all aspects if parsing fails
      relevanceCheck = {
        commercial_relevant: true,
        legal_relevant: true,
        compliance_relevant: true,
        operational_relevant: true
      };
    }
    
    // If no relevant clauses found in any category, return early
    if (!relevanceCheck.commercial_relevant && 
        !relevanceCheck.legal_relevant && 
        !relevanceCheck.compliance_relevant && 
        !relevanceCheck.operational_relevant) {
      console.log(`No relevant clauses found in chunk ${chunk.chunk_id}, skipping detailed analysis`);
      return {
        chunk_id: chunk.chunk_id,
        commercial: { found: false },
        legal: { found: false },
        compliance: { found: false },
        operational: { found: false }
      };
    }
    
    // STEP 2: Detailed analysis with GPT-4o-mini, but only for relevant categories
    // Modify the prompt to focus only on relevant categories
    let detailedPrompt = `
You are a comprehensive contract analysis specialist capable of analyzing contract text from multiple perspectives.
Your task is to identify and extract key clauses related to the following aspects:

FOCUS AREAS:
`;

    // Only include relevant categories in the prompt
    if (relevanceCheck.commercial_relevant) {
      detailedPrompt += `
COMMERCIAL:
- Payment terms
- Pricing structures
- Exclusivity clauses
- Volume commitments
- Renewal conditions
- Termination rights
- Service levels
- Performance metrics
`;
    }
    
    if (relevanceCheck.legal_relevant) {
      detailedPrompt += `
LEGAL:
- Liability limitations
- Indemnification
- Warranties
- Intellectual property
- Confidentiality
- Dispute resolution
- Governing law
- Force majeure
`;
    }
    
    if (relevanceCheck.compliance_relevant) {
      detailedPrompt += `
COMPLIANCE:
- Data protection/GDPR
- Industry-specific regulations
- Audit rights
- Reporting requirements
- Certification requirements
- Compliance representations
- Anti-corruption/FCPA
- Record keeping obligations
`;
    }
    
    if (relevanceCheck.operational_relevant) {
      detailedPrompt += `
OPERATIONAL:
- Implementation timelines
- Support and maintenance
- Training requirements
- Change management procedures
- Acceptance criteria
- Resource commitments
- Reporting cadence
- Operational constraints
`;
    }
    
    detailedPrompt += `
INSTRUCTIONS:
Analyze the provided contract chunk and identify clauses related to each category.

OUTPUT FORMAT:
Please return a JSON object with the following structure:
{`;

    // Only include relevant categories in the output format
    if (relevanceCheck.commercial_relevant) {
      detailedPrompt += `
  "commercial": {
    "found": true/false,
    "clause_type": "Payment"/"Pricing"/"Exclusivity"/etc.,
    "summary": "2-3 sentence summary of the clause's key points",
    "importance": "High"/"Medium"/"Low",
    "rationale": "Why this clause matters from a commercial perspective"
  },`;
    }
    
    if (relevanceCheck.legal_relevant) {
      detailedPrompt += `
  "legal": {
    "found": true/false,
    "clause_type": "Liability"/"Indemnity"/"Warranty"/etc.,
    "summary": "2-3 sentence summary of the clause's key points",
    "importance": "High"/"Medium"/"Low",
    "rationale": "Why this clause matters from a legal risk perspective"
  },`;
    }
    
    if (relevanceCheck.compliance_relevant) {
      detailedPrompt += `
  "compliance": {
    "found": true/false,
    "clause_type": "Data Protection"/"Audit Rights"/etc.,
    "summary": "2-3 sentence summary of the clause's key points",
    "importance": "High"/"Medium"/"Low",
    "rationale": "Why this clause matters from a compliance perspective"
  },`;
    }
    
    if (relevanceCheck.operational_relevant) {
      detailedPrompt += `
  "operational": {
    "found": true/false,
    "clause_type": "Implementation"/"Support"/"Training"/etc.,
    "summary": "2-3 sentence summary of the clause's key points",
    "importance": "High"/"Medium"/"Low",
    "rationale": "Why this clause matters from an operational perspective"
  },`;
    }
    
    // Remove the trailing comma and close the JSON
    detailedPrompt = detailedPrompt.replace(/,$/,`
}

If no relevant clause is found for a category, return {"found": false} for that category.
`);

    console.log(`Performing detailed analysis of chunk ${chunk.chunk_id} with GPT-4o-mini for relevant categories`);
    // Second pass - detailed analysis with GPT-4o-mini, but only for relevant categories
    const userContent = `Please analyze this contract text and return a JSON response with analyses for the requested aspects:\n\n${chunk.text}`;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: detailedPrompt },
        { role: "user", content: userContent }
      ],
      response_format: { type: "json_object" }
    });

    try {
      const result = JSON.parse(response.choices[0].message.content);
      console.log(`Detailed analysis for chunk ${chunk.chunk_id} complete`);
      
      // Create the full response, setting non-relevant categories to { found: false }
      const fullResult: ChunkAnalysis = {
        chunk_id: chunk.chunk_id,
        commercial: relevanceCheck.commercial_relevant ? result.commercial : { found: false },
        legal: relevanceCheck.legal_relevant ? result.legal : { found: false },
        compliance: relevanceCheck.compliance_relevant ? result.compliance : { found: false },
        operational: relevanceCheck.operational_relevant ? result.operational : { found: false }
      };
      
      // Log results for each category
      if (fullResult.commercial?.found) console.log(`Commercial analysis: Found ${fullResult.commercial.clause_type}`);
      if (fullResult.legal?.found) console.log(`Legal analysis: Found ${fullResult.legal.clause_type}`);
      if (fullResult.compliance?.found) console.log(`Compliance analysis: Found ${fullResult.compliance.clause_type}`);
      if (fullResult.operational?.found) console.log(`Operational analysis: Found ${fullResult.operational.clause_type}`);
      
      return fullResult;
    } catch (parseError) {
      console.error(`Failed to parse analysis response as JSON:`, parseError);
      console.log('Raw response:', response.choices[0].message.content);
      return {
        chunk_id: chunk.chunk_id
      };
    }
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