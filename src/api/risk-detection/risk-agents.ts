import { getOpenAIClient } from './openai-client';

// Define domain-specific risk agent roles
export const riskAgents = {
  legal: "Legal Risk Analyst: Detect clauses with legal risk such as unlimited liability, indemnity, or one-sided termination clauses.",
  compliance: "Compliance Risk Analyst: Detect clauses that could breach regulatory obligations like data protection or export restrictions.",
  commercial: "Commercial Risk Analyst: Detect vague or unfavorable payment, pricing, or exclusivity terms.",
  operational: "Operational Risk Analyst: Detect clauses with unclear SLAs, deliverables, or dependencies."
};

// Combined risk analysis function that analyzes all domains in a single call
export async function analyzeCombinedRisks(chunkText: string, chunkIndex: number) {
  console.log(`Analyzing chunk ${chunkIndex} with combined risk agent...`);
  
  // Combined prompt for all risk domains
  const prompt = `
Contract Text:
${chunkText}

TASK:
Analyze the contract text for ALL of the following risk domains simultaneously:
1. LEGAL RISKS: Unlimited liability, indemnity, one-sided termination clauses, etc.
2. COMPLIANCE RISKS: Data protection, export restrictions, regulatory obligations, etc.
3. COMMERCIAL RISKS: Vague/unfavorable payment terms, pricing, exclusivity, etc.
4. OPERATIONAL RISKS: Unclear SLAs, deliverables, dependencies, etc.

RESPONSE FORMAT:
Return a JSON object with a "risks" array containing risk objects across all domains. Each risk object should have:
- "phrase": The exact text from the contract that presents a risk
- "explanation": Why this phrase is risky
- "severity": "High", "Medium", or "Low"
- "risk_type": The specific type of risk (e.g., "Liability", "Payment Terms", "Data Protection")
- "domain": The domain of the risk ("legal", "compliance", "commercial", or "operational")
- "suggestion": A better alternative wording

Example response:
{
  "risks": [
    {
      "phrase": "Company shall have no liability whatsoever",
      "explanation": "This clause completely eliminates liability for the company",
      "severity": "High",
      "risk_type": "Liability",
      "domain": "legal",
      "suggestion": "Company's liability shall be limited to the fees paid under this agreement"
    },
    {
      "phrase": "Payment shall be made within 90 days of invoice receipt",
      "explanation": "Extended payment terms create cash flow risk",
      "severity": "Medium",
      "risk_type": "Payment Terms",
      "domain": "commercial",
      "suggestion": "Payment shall be made within 30 days of invoice receipt"
    }
  ]
}

If no risks are found, return {"risks": []}.
`;

  try {
    // Get the OpenAI client only when needed
    const openai = getOpenAIClient();
    
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: "You are a comprehensive Contract Risk Analyst capable of identifying legal, compliance, commercial, and operational risks in contract text. Provide detailed, precise risk analysis with specific phrase identification." 
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    const content = res.choices[0].message.content;
    console.log(`Raw response from combined risk agent:`, content);
    
    // Parse the JSON response
    const parsedResponse = JSON.parse(content);
    
    // Extract the risks array from the response
    const risks = parsedResponse.risks || [];
    
    console.log(`Combined agent found ${risks.length} risks`);
    
    // Return the risks with chunk information
    return risks.map(risk => ({
      ...risk,
      chunk: chunkText,
      chunkIndex
    }));
  } catch (error) {
    console.error(`Error in combined risk analysis:`, error);
    return [];
  }
}

// Analyze a document's chunks with the combined risk agent
export async function analyzeChunks(chunks: string[]) {
  console.log(`Starting risk analysis on ${chunks.length} chunks...`);
  
  const allRisks = [];
  
  for (const [index, chunk] of chunks.entries()) {
    console.log(`Processing chunk ${index + 1}/${chunks.length}`);
    
    // Use the combined risk analysis instead of separate agents
    const chunkRisks = await analyzeCombinedRisks(chunk, index);
    allRisks.push(...chunkRisks);
    
    console.log(`Found ${chunkRisks.length} risks in chunk ${index + 1}`);
  }
  
  console.log(`Completed risk analysis on all chunks, found ${allRisks.length} total risks`);
  return allRisks;
}

// Aggregate function is simplified since risks are already in the correct format
export function aggregateRisks(risks: any[]) {
  console.log(`Processing ${risks.length} risks...`);
  return risks;
}