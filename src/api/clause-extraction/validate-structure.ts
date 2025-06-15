import { getOpenAIClient } from './openai-client';

export interface ValidationResult {
  is_structured: boolean;
  structure_type?: string;
  confidence?: number;
  suggested_approach?: string;
}

export async function validateDocumentStructure(text: string): Promise<ValidationResult> {
  try {
    console.log('Validating document structure...');
    
    // Use a sample of the document to determine structure
    const maxSampleLength = 5000;
    const sample = text.length > maxSampleLength ? text.substring(0, maxSampleLength) : text;
    
    console.log('Calling OpenAI API for structure validation...');
    
    // Get the OpenAI client only when needed
    const openai = getOpenAIClient();
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: "You are a document structure analyzer. Your task is to analyze the structure of legal documents and determine if they follow a clear, structured format with numbered sections or if they are unstructured."
        },
        { 
          role: "user", 
          content: `Analyze the structure of this document sample and determine if it follows a structured format with numbered sections, headings, etc. Return a JSON object with:
          - is_structured: boolean indicating if the document has clear structure
          - structure_type: description of structure (e.g., "numbered sections", "article-based", "unstructured")
          - confidence: number between 0-1 indicating confidence in assessment
          - suggested_approach: recommended approach for processing ("semantic" or "pattern-based")
          
          Document sample:
          ${sample}`
        }
      ],
      response_format: { type: "json_object" }
    });
    
    console.log('OpenAI API response received');
    
    try {
      const result = JSON.parse(response.choices[0].message.content);
      console.log('Document structure validation result:', result);
      return result;
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', parseError);
      console.log('Raw response:', response.choices[0].message.content);
      throw new Error('Failed to parse OpenAI response as JSON');
    }
  } catch (error) {
    console.error('Error validating document structure:', error);
    return {
      is_structured: false,
      structure_type: 'unknown',
      confidence: 0,
      suggested_approach: 'semantic'
    };
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
    console.log('Document structure validation API called');
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