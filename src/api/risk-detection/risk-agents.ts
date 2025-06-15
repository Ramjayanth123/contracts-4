import openai from './openai-client';

// Define domain-specific risk agent roles
export const riskAgents = {
  legal: "You are a Legal Risk Analyst. Detect clauses with legal risk such as unlimited liability, indemnity, or one-sided termination clauses.",
  compliance: "You are a Compliance Risk Analyst. Detect clauses that could breach regulatory obligations like data protection or export restrictions.",
  commercial: "You are a Commercial Risk Analyst. Detect vague or unfavorable payment, pricing, or exclusivity terms.",
  operational: "You are an Operational Risk Analyst. Detect clauses with unclear SLAs, deliverables, or dependencies."
};

// Analyze a chunk with a single risk agent
export async function analyzeWithAgent(role: string, chunkText: string) {
  console.log(`Analyzing chunk with ${role} agent...`);
  
  // Updated prompt to be more explicit about the expected response format
  const prompt = `
Contract Text:
${chunkText}

TASK:
Analyze the contract text for ${role} risks. Identify specific phrases that present risks.

RESPONSE FORMAT:
Return a JSON object with a "risks" array containing risk objects. Each risk object should have:
- "phrase": The exact text from the contract that presents a risk
- "explanation": Why this phrase is risky
- "severity": "High", "Medium", or "Low"
- "risk_type": "${role}"
- "suggestion": A better alternative wording

Example response:
{
  "risks": [
    {
      "phrase": "Company shall have no liability whatsoever",
      "explanation": "This clause completely eliminates liability for the company",
      "severity": "High",
      "risk_type": "${role}",
      "suggestion": "Company's liability shall be limited to the fees paid under this agreement"
    }
  ]
}

If no risks are found, return {"risks": []}.
`;

  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: riskAgents[role] },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    const content = res.choices[0].message.content;
    console.log(`Raw response from ${role} agent:`, content);
    
    // Parse the JSON response
    const parsedResponse = JSON.parse(content);
    
    // Extract the risks array from the response
    const risks = parsedResponse.risks || [];
    
    console.log(`${role} agent found ${risks.length} risks`);
    
    return { role, risks };
  } catch (error) {
    console.error(`Error in ${role} agent analysis:`, error);
    return { role, risks: [] };
  }
}

// Analyze a document's chunks with all risk agents in parallel
export async function analyzeChunks(chunks: string[]) {
  console.log(`Starting risk analysis on ${chunks.length} chunks...`);
  
  const results = [];
  for (const [index, chunk] of chunks.entries()) {
    console.log(`Processing chunk ${index + 1}/${chunks.length}`);
    
    const tasks = Object.keys(riskAgents).map(role => analyzeWithAgent(role, chunk));
    const chunkResults = await Promise.all(tasks);
    
    results.push({ 
      chunk, 
      chunkIndex: index,
      analyses: chunkResults 
    });
  }
  
  console.log(`Completed risk analysis on all chunks`);
  return results;
}

// Aggregate and deduplicate all risks from all chunks
export function aggregateRisks(results: any[]) {
  console.log(`Aggregating risks from all analyses...`);
  
  const allRisks = [];
  for (const result of results) {
    for (const analysis of result.analyses) {
      if (analysis.risks && Array.isArray(analysis.risks)) {
        for (const risk of analysis.risks) {
          allRisks.push({
            ...risk,
            chunk: result.chunk,
            chunkIndex: result.chunkIndex,
            domain: analysis.role
          });
        }
      }
    }
  }
  
  console.log(`Found a total of ${allRisks.length} risks`);
  return allRisks;
} 