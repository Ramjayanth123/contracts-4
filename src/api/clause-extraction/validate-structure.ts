import openai from './openai-client';

export async function validateDocumentStructure(text: string) {
  try {
    console.log('Starting document structure validation...');
    
    const prompt = `
You are a document structure analyzer. You need to determine if the provided contract text has a clear numbered structure.

TASK:
Examine the text and determine if it follows a formal numbered clause structure (e.g., sections labeled as 1.1, 1.2, 2.1, etc., or similar patterns like "Article 1", "Section 2", etc.).

RULES:
1. Look for consistent numbering patterns throughout the document
2. Check if major sections and subsections are clearly delineated with numbers
3. Determine if the document follows a hierarchical structure

OUTPUT FORMAT:
Please respond with a JSON object containing:
{
  "is_structured": true/false,
  "structure_type": "numbered_clauses"/"article_sections"/"unstructured"/"other",
  "confidence": 0-1 (decimal representing confidence in your assessment),
  "reasoning": "Brief explanation of why you made this determination"
}
`;

    // Get a sample of the text to analyze (first 2000 chars + middle 1000 chars + last 1000 chars)
    const textSample = getSampleText(text);
    console.log(`Created text sample of ${textSample.length} characters`);
    
    // Explicitly tell the model to return JSON
    const userContent = 'Please analyze this document text and return a JSON response about its structure:\n\n' + textSample;
    
    console.log('Calling OpenAI API for structure validation...');
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
      console.log(`Document structure validation result: ${result.is_structured ? 'structured' : 'unstructured'}, type: ${result.structure_type}, confidence: ${result.confidence}`);
      return result;
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', parseError);
      console.log('Raw response:', response.choices[0].message.content);
      throw new Error('Failed to parse OpenAI response as JSON');
    }
  } catch (error) {
    console.error('Error validating document structure:', error);
    throw error;
  }
}

// Helper function to get a representative sample of the document
function getSampleText(text: string): string {
  if (text.length <= 4000) return text;
  
  const start = text.substring(0, 2000);
  const middle = text.substring(Math.floor(text.length / 2) - 500, Math.floor(text.length / 2) + 500);
  const end = text.substring(text.length - 1000);
  
  return `${start}\n\n[...]\n\n${middle}\n\n[...]\n\n${end}`;
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
    console.log('Structure validation API called');
    const { text } = await req.json();
    
    if (!text) {
      console.error('Invalid request: text is required');
      return new Response(JSON.stringify({ error: 'Text is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log(`Processing document text of length ${text.length}`);
    const result = await validateDocumentStructure(text);
    
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in validate-structure API:', error);
    return new Response(JSON.stringify({ error: 'Failed to validate document structure' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 