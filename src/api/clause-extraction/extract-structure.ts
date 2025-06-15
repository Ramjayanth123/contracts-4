import { getOpenAIClient } from './openai-client';

interface DocumentStructure {
  title: string;
  sections: Array<{
    heading: string;
    level: number;
    text: string;
  }>;
}

async function extractDocumentStructure(text: string): Promise<DocumentStructure> {
  try {
    console.log('Extracting document structure');
    
    // Get the OpenAI client
    const openai = getOpenAIClient();
    
    // Use only the first ~200 words of the document for structure extraction
    const words = text.split(/\s+/);
    const sampleWords = words.slice(0, 200).join(' ');
    
    console.log(`Using sample of ~200 words (${sampleWords.length} characters) for structure extraction`);
    
    // Create a system prompt for structure extraction
    const systemPrompt = `
You are a document structure specialist. Your task is to extract the hierarchical structure of a contract document.

Please analyze the document and identify:
1. The document title
2. All sections and subsections with their headings
3. The hierarchical level of each section (1 for top-level, 2 for subsections, etc.)
4. The text content of each section

Return the result as a JSON object with the following structure:
{
  "title": "Document Title",
  "sections": [
    {
      "heading": "Section 1",
      "level": 1,
      "text": "Content of section 1"
    },
    {
      "heading": "Section 1.1",
      "level": 2,
      "text": "Content of section 1.1"
    },
    ...
  ]
}

If the document doesn't have a clear structure, create a reasonable structure based on the content.
`;
    
    // Call the OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Please extract the structure of this document:\n\n${sampleWords}` }
      ],
      response_format: { type: "json_object" }
    });
    
    // Parse the response
    try {
      const result = JSON.parse(response.choices[0].message.content);
      console.log(`Structure extraction complete. Found ${result.sections.length} sections`);
      return result;
    } catch (parseError) {
      console.error('Failed to parse structure extraction response as JSON:', parseError);
      console.log('Raw response:', response.choices[0].message.content);
      
      // Return a fallback structure
      return {
        title: "Document",
        sections: [
          {
            heading: "Main Content",
            level: 1,
            text: text
          }
        ]
      };
    }
  } catch (error) {
    console.error('Error extracting document structure:', error);
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
    console.log('Extract structure API called');
    const { text } = await req.json();
    
    if (!text || typeof text !== 'string') {
      console.error('Invalid request: text is required');
      return new Response(JSON.stringify({ error: 'Text is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log(`Processing document text of length ${text.length}`);
    const result = await extractDocumentStructure(text);
    
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in extract-structure API:', error);
    return new Response(JSON.stringify({ error: 'Failed to extract document structure' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 