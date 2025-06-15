import openai from './openai-client';

interface MacroSummary {
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

export async function generateMacroSummary(analyses: any[]): Promise<MacroSummary> {
  try {
    console.log('Starting macro summary generation...');
    
    // Filter out chunks with no findings
    const relevantAnalyses = analyses.filter(analysis => {
      return (
        (analysis.commercial && analysis.commercial.found) ||
        (analysis.legal && analysis.legal.found) ||
        (analysis.compliance && analysis.compliance.found) ||
        (analysis.operational && analysis.operational.found)
      );
    });
    
    console.log(`Found ${relevantAnalyses.length} relevant analyses out of ${analyses.length} total`);

    // Extract all found clauses
    const allClauses = [];
    
    for (const analysis of relevantAnalyses) {
      if (analysis.commercial && analysis.commercial.found) {
        allClauses.push({
          ...analysis.commercial,
          department: 'Commercial'
        });
      }
      
      if (analysis.legal && analysis.legal.found) {
        allClauses.push({
          ...analysis.legal,
          department: 'Legal'
        });
      }
      
      if (analysis.compliance && analysis.compliance.found) {
        allClauses.push({
          ...analysis.compliance,
          department: 'Compliance'
        });
      }
      
      if (analysis.operational && analysis.operational.found) {
        allClauses.push({
          ...analysis.operational,
          department: 'Operational'
        });
      }
    }
    
    console.log(`Extracted ${allClauses.length} total clauses`);

    const prompt = `
You are a contract analysis expert. Synthesize the findings from multiple specialized agents to provide a comprehensive overview of a contract's key clauses.

INSTRUCTIONS:
Review the extracted clauses from commercial, legal, compliance, and operational analyses. Create a consolidated summary that:
1. Highlights the most important clauses (especially those marked "High" importance)
2. Removes any duplicates
3. Groups related clauses
4. Identifies any potential gaps or unusual aspects

OUTPUT FORMAT:
Please return your response as a JSON object with the following structure:
{
  "executive_summary": "3-5 sentence overview of the contract's most significant aspects",
  "key_findings": [
    {
      "category": "Commercial"/"Legal"/"Compliance"/"Operational",
      "highlights": "1-2 sentences on the most important aspects in this category"
    }
  ],
  "clauses": [
    {
      "clause_type": "Termination",
      "department": "Legal",
      "summary": "Clear summary of the clause",
      "importance": "High"/"Medium"/"Low"
    }
  ],
  "potential_issues": ["Any concerning terms or missing elements"]
}
`;

    console.log('Calling OpenAI API for macro summary...');
    
    // Explicitly tell the model to return JSON
    const userContent = 'Please analyze these clauses and return a JSON summary according to the format specified:\n\n' + 
                        JSON.stringify(allClauses);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: userContent }
      ],
      response_format: { type: "json_object" }
    });

    console.log('OpenAI API response received');
    
    try {
      const result = JSON.parse(response.choices[0].message.content);
      console.log('Successfully parsed JSON response');
      return result;
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', parseError);
      console.log('Raw response:', response.choices[0].message.content);
      throw new Error('Failed to parse OpenAI response as JSON');
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
    const { analyses } = await req.json();
    
    if (!analyses || !Array.isArray(analyses)) {
      console.error('Invalid request: analyses array is required');
      return new Response(JSON.stringify({ error: 'Analyses array is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log(`Processing ${analyses.length} analyses`);
    const result = await generateMacroSummary(analyses);
    
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