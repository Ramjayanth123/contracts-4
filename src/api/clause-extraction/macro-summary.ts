import { getOpenAIClient } from './openai-client';

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

interface MacroSummary {
  key_points: string[];
  recommendations: string[];
  risk_assessment: string;
}

async function generateMacroSummary(analyses: ChunkAnalysis[], originalText: string): Promise<MacroSummary> {
  try {
    console.log('Generating macro summary from analyses');
    
    // Get the OpenAI client
    const openai = getOpenAIClient();
    
    // Extract relevant clauses from all analyses
    const relevantClauses = {
      commercial: analyses
        .filter(a => a.commercial?.found)
        .map(a => ({
          chunk_id: a.chunk_id,
          clause_type: a.commercial?.clause_type,
          summary: a.commercial?.summary,
          importance: a.commercial?.importance
        })),
      legal: analyses
        .filter(a => a.legal?.found)
        .map(a => ({
          chunk_id: a.chunk_id,
          clause_type: a.legal?.clause_type,
          summary: a.legal?.summary,
          importance: a.legal?.importance
        })),
      compliance: analyses
        .filter(a => a.compliance?.found)
        .map(a => ({
          chunk_id: a.chunk_id,
          clause_type: a.compliance?.clause_type,
          summary: a.compliance?.summary,
          importance: a.compliance?.importance
        })),
      operational: analyses
        .filter(a => a.operational?.found)
        .map(a => ({
          chunk_id: a.chunk_id,
          clause_type: a.operational?.clause_type,
          summary: a.operational?.summary,
          importance: a.operational?.importance
        })),
    };
    
    // Count clauses by type
    const commercialCount = relevantClauses.commercial.length;
    const legalCount = relevantClauses.legal.length;
    const complianceCount = relevantClauses.compliance.length;
    const operationalCount = relevantClauses.operational.length;
    
    console.log(`Found ${commercialCount} commercial, ${legalCount} legal, ${complianceCount} compliance, and ${operationalCount} operational clauses`);
    
    // Create a system prompt for the macro summary
    const systemPrompt = `
You are a contract analysis expert. Your task is to create a comprehensive macro summary of a contract based on the extracted clauses.

The input will contain:
1. A list of extracted clauses from the contract, organized by category (commercial, legal, compliance, operational)
2. Each clause has a type, summary, and importance level

Please provide a macro summary with the following sections:
1. KEY POINTS: A bulleted list of 5-7 key points from the contract
2. RECOMMENDATIONS: A bulleted list of 3-5 specific recommendations based on the contract analysis
3. RISK ASSESSMENT: A brief paragraph assessing the overall risk level of the contract

Focus on the most important clauses (marked as "High" importance) and identify any potential issues, gaps, or areas of concern.

OUTPUT FORMAT:
Please return your response as a JSON object with the following structure:
{
  "key_points": ["point 1", "point 2", ...],
  "recommendations": ["recommendation 1", "recommendation 2", ...],
  "risk_assessment": "risk assessment text"
}
`;
    
    // Create a user prompt with the relevant clauses
    const userPrompt = `
Please analyze the following contract clauses and generate a macro summary:

COMMERCIAL CLAUSES (${commercialCount}):
${relevantClauses.commercial.map(c => `- ${c.clause_type} (${c.importance}): ${c.summary}`).join('\n')}

LEGAL CLAUSES (${legalCount}):
${relevantClauses.legal.map(c => `- ${c.clause_type} (${c.importance}): ${c.summary}`).join('\n')}

COMPLIANCE CLAUSES (${complianceCount}):
${relevantClauses.compliance.map(c => `- ${c.clause_type} (${c.importance}): ${c.summary}`).join('\n')}

OPERATIONAL CLAUSES (${operationalCount}):
${relevantClauses.operational.map(c => `- ${c.clause_type} (${c.importance}): ${c.summary}`).join('\n')}

Please provide a macro summary with KEY POINTS, RECOMMENDATIONS, and RISK ASSESSMENT sections.
`;
    
    // Call the OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" }
    });

    // Parse the response
    try {
      const result = JSON.parse(response.choices[0].message.content);
      console.log('Macro summary generated successfully');
      return result;
    } catch (parseError) {
      console.error('Failed to parse macro summary response as JSON:', parseError);
      console.log('Raw response:', response.choices[0].message.content);
      
      // Return a fallback summary
      return {
        key_points: ['Error generating key points'],
        recommendations: ['Error generating recommendations'],
        risk_assessment: 'Error generating risk assessment'
      };
    }
  } catch (error) {
    console.error('Error generating macro summary:', error);
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
    console.log('Macro summary API called');
    const { analyses, text } = await req.json();
    
    if (!analyses || !Array.isArray(analyses)) {
      console.error('Invalid request: analyses array is required');
      return new Response(JSON.stringify({ error: 'Analyses array is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!text || typeof text !== 'string') {
      console.error('Invalid request: original text is required');
      return new Response(JSON.stringify({ error: 'Original text is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log(`Generating macro summary from ${analyses.length} analyses`);
    const result = await generateMacroSummary(analyses, text);
    
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in macro-summary API:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate macro summary' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 