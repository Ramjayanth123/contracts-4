import { analyzeChunks, aggregateRisks } from './risk-agents';

// Sample risky contract text for testing
const SAMPLE_RISKY_TEXT = `
AGREEMENT BETWEEN ACME CORPORATION AND CONTRACTOR

1. SERVICES
Contractor shall perform services at the sole discretion of the Company, with no guaranteed minimum hours or compensation.

2. PAYMENT TERMS
Payment shall be made within 90 days of invoice receipt, subject to Company's approval at its sole discretion.

3. LIABILITY
3.1 Contractor shall indemnify and hold Company harmless from any and all claims, damages, losses, liabilities, costs, and expenses, including attorney's fees, arising out of or related to Contractor's performance under this Agreement, regardless of Company's negligence or fault.
3.2 Company shall have no liability whatsoever for any indirect, special, incidental, or consequential damages.
3.3 Contractor waives all rights to seek injunctive or equitable relief.

4. INTELLECTUAL PROPERTY
All work product, ideas, inventions, and intellectual property created by Contractor shall be the exclusive property of Company, with no additional compensation due to Contractor.

5. TERMINATION
5.1 Company may terminate this Agreement at any time for any reason without notice.
5.2 Upon termination, Contractor shall immediately cease all work and return all materials.
5.3 Contractor shall not be entitled to any compensation for work in progress at the time of termination.

6. CONFIDENTIALITY
6.1 Contractor shall keep all information confidential in perpetuity with no time limitation.
6.2 Breach of confidentiality shall result in liquidated damages of $100,000 per occurrence.

7. NON-COMPETE
Contractor shall not engage in any similar business activities worldwide for a period of 10 years after termination.

8. DISPUTE RESOLUTION
8.1 All disputes shall be resolved through binding arbitration in a location chosen solely by Company.
8.2 Contractor waives right to jury trial and class action participation.
8.3 The prevailing party shall be entitled to recover all legal costs and attorney's fees.

9. GOVERNING LAW
This Agreement shall be governed by the laws of a jurisdiction to be determined by Company at the time of any dispute.
`;

// Main handler for risk detection
export default async function analyzeRisks(request: Request): Promise<Response> {
  console.log('Risk detection analysis started');
  
  try {
    // Parse the request body
    const body = await request.json();
    const { text, chunks } = body;
    
    // Validate input
    if (!chunks && !text) {
      return new Response(JSON.stringify({ error: 'No text or chunks provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Use provided chunks or split the text into chunks
    const textToAnalyze = text || SAMPLE_RISKY_TEXT; // Use sample text for testing if needed
    const textChunks = chunks || splitTextIntoChunks(textToAnalyze);
    
    // Analyze the chunks
    console.log(`Analyzing ${textChunks.length} chunks for risks...`);
    const analysisResults = await analyzeChunks(textChunks);
    
    // Aggregate the risks
    const aggregatedRisks = aggregateRisks(analysisResults);
    
    // Group risks by severity
    const risksBySeverity = {
      High: aggregatedRisks.filter(risk => risk.severity === 'High'),
      Medium: aggregatedRisks.filter(risk => risk.severity === 'Medium'),
      Low: aggregatedRisks.filter(risk => risk.severity === 'Low')
    };
    
    // Calculate risk score (1-10)
    const riskScore = calculateRiskScore(risksBySeverity);
    
    // Generate executive summary
    const executiveSummary = generateExecutiveSummary(risksBySeverity, riskScore);
    
    console.log('Risk detection analysis completed');
    
    // Include the sample text in the response if it was used
    const isSampleText = !text || text.trim() === '';
    
    return new Response(JSON.stringify({
      risks: aggregatedRisks,
      risksBySeverity,
      riskScore,
      executiveSummary,
      sampleText: isSampleText ? SAMPLE_RISKY_TEXT : null,
      stats: {
        totalRisks: aggregatedRisks.length,
        highRisks: risksBySeverity.High.length,
        mediumRisks: risksBySeverity.Medium.length,
        lowRisks: risksBySeverity.Low.length
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in risk detection:', error);
    return new Response(JSON.stringify({ error: 'Risk detection failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Helper function to split text into chunks (if not already chunked)
function splitTextIntoChunks(text: string): string[] {
  // Improved chunking strategy
  // First try to split by sections (numbered headings)
  const sectionRegex = /\n\s*(\d+\.(?:\d+)?)\s+([A-Z][A-Z\s]+)/g;
  let matches = [...text.matchAll(sectionRegex)];
  
  if (matches.length > 1) {
    // We found section headings, chunk by sections
    console.log('Chunking by section headings');
    const chunks: string[] = [];
    
    for (let i = 0; i < matches.length; i++) {
      const currentMatch = matches[i];
      const nextMatch = matches[i + 1];
      
      const startPos = currentMatch.index;
      const endPos = nextMatch ? nextMatch.index : text.length;
      
      if (startPos !== undefined) {
        const chunk = text.substring(startPos, endPos).trim();
        if (chunk) chunks.push(chunk);
      }
    }
    
    // If we couldn't extract sections properly, fall back to paragraph chunking
    if (chunks.length === 0) {
      return chunkByParagraphs(text);
    }
    
    return chunks;
  } else {
    // No clear section structure, chunk by paragraphs
    return chunkByParagraphs(text);
  }
}

// Helper function to chunk by paragraphs
function chunkByParagraphs(text: string): string[] {
  console.log('Chunking by paragraphs');
  const paragraphs = text.split(/\n\s*\n/);
  const chunks: string[] = [];
  
  let currentChunk = '';
  const maxChunkLength = 1500; // Increased from 1000 for better context
  
  for (const paragraph of paragraphs) {
    const trimmedParagraph = paragraph.trim();
    if (!trimmedParagraph) continue;
    
    // If adding this paragraph would make the chunk too large, start a new chunk
    if ((currentChunk.length + trimmedParagraph.length) > maxChunkLength && currentChunk.length > 0) {
      chunks.push(currentChunk);
      currentChunk = trimmedParagraph;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + trimmedParagraph;
    }
  }
  
  if (currentChunk) chunks.push(currentChunk);
  
  return chunks;
}

// Calculate risk score based on severity counts
function calculateRiskScore(risksBySeverity: { High: any[], Medium: any[], Low: any[] }): number {
  const highCount = risksBySeverity.High.length;
  const mediumCount = risksBySeverity.Medium.length;
  const lowCount = risksBySeverity.Low.length;
  
  // Simple weighted score calculation
  const score = (highCount * 3 + mediumCount * 1.5 + lowCount * 0.5) / 2;
  
  // Clamp between 1-10
  return Math.min(10, Math.max(1, Math.round(score)));
}

// Generate a simple executive summary
function generateExecutiveSummary(risksBySeverity: { High: any[], Medium: any[], Low: any[] }, riskScore: number): string {
  const highCount = risksBySeverity.High.length;
  const mediumCount = risksBySeverity.Medium.length;
  const lowCount = risksBySeverity.Low.length;
  const totalRisks = highCount + mediumCount + lowCount;
  
  if (totalRisks === 0) {
    return 'No significant risks were detected in this contract.';
  }
  
  let summary = `This contract has a risk score of ${riskScore}/10 with ${totalRisks} identified risks `;
  summary += `(${highCount} high, ${mediumCount} medium, ${lowCount} low). `;
  
  if (highCount > 0) {
    const topHighRisks = risksBySeverity.High.slice(0, 2).map(r => `"${r.phrase}"`).join(', ');
    summary += `Key concerns include ${topHighRisks}.`;
  } else if (mediumCount > 0) {
    summary += 'No high-severity risks were found, but there are some medium-level concerns.';
  } else {
    summary += 'Only low-severity risks were identified.';
  }
  
  return summary;
} 