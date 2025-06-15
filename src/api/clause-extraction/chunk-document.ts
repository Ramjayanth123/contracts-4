import openai from './openai-client';

interface ChunkResult {
  chunk_id: number;
  heading: string;
  text: string;
  token_count: number;
}

// Function to chunk a structured document based on numbering patterns
function chunkStructuredDocument(text: string): ChunkResult[] {
  console.log('Chunking structured document...');
  
  // Regular expressions for common numbering patterns
  const patterns = [
    /(?:^|\n)(\d+\.\d+(?:\.\d+)*)\s+([^\n]+)/g, // 1.1, 1.2.3
    /(?:^|\n)(Article\s+\d+|Section\s+\d+(?:\.\d+)*)\s+([^\n]+)/gi, // Article 1, Section 1.2
  ];
  
  const chunks: ChunkResult[] = [];
  let chunkId = 0;
  
  // Try each pattern to find clause headings
  for (const pattern of patterns) {
    let match;
    let lastIndex = 0;
    let foundMatches = false;
    
    // Reset the regex state
    pattern.lastIndex = 0;
    
    // Find all matches
    const matches = [];
    while ((match = pattern.exec(text)) !== null) {
      matches.push({
        index: match.index,
        number: match[1],
        title: match[2],
        fullMatch: match[0]
      });
      foundMatches = true;
    }
    
    // If we found matches with this pattern, create chunks
    if (foundMatches) {
      console.log(`Found ${matches.length} matches with pattern: ${pattern}`);
      
      for (let i = 0; i < matches.length; i++) {
        const current = matches[i];
        const next = matches[i + 1];
        
        const startIndex = current.index;
        const endIndex = next ? next.index : text.length;
        
        const chunkText = text.substring(startIndex, endIndex).trim();
        const heading = `${current.number} ${current.title}`.trim();
        
        chunks.push({
          chunk_id: chunkId++,
          heading,
          text: chunkText,
          token_count: estimateTokenCount(chunkText)
        });
      }
      
      // If we found matches with this pattern, no need to try others
      break;
    }
  }
  
  // If no patterns matched, fall back to semantic chunking
  if (chunks.length === 0) {
    console.log('No structured patterns found, falling back to semantic chunking');
    return semanticChunkDocument(text);
  }
  
  console.log(`Created ${chunks.length} structured chunks`);
  return chunks;
}

// Function to chunk an unstructured document using OpenAI
async function semanticChunkDocument(text: string): Promise<ChunkResult[]> {
  try {
    console.log('Chunking unstructured document semantically...');
    
    // For long documents, we need to split into manageable pieces first
    const maxChunkSize = 10000; // characters
    const textChunks = [];
    
    for (let i = 0; i < text.length; i += maxChunkSize) {
      textChunks.push(text.substring(i, i + maxChunkSize));
    }
    
    console.log(`Split document into ${textChunks.length} large chunks for processing`);
    
    const allChunks: ChunkResult[] = [];
    let chunkId = 0;
    
    // Process each large chunk to find semantic sections
    for (let i = 0; i < textChunks.length; i++) {
      const textChunk = textChunks[i];
      console.log(`Processing large chunk ${i+1}/${textChunks.length} (${textChunk.length} chars)`);
      
      const prompt = `
You are a document chunking specialist. Your task is to divide the following contract text into logical, semantically coherent sections.

INSTRUCTIONS:
1. Identify natural section breaks in the text
2. Each section should be 400-700 tokens (roughly 300-500 words)
3. Try to keep related content together
4. Each section should have a clear topic or purpose

OUTPUT FORMAT:
Please return a JSON array where each item represents a chunk:
[
  {
    "heading": "Brief title describing this section",
    "text": "The full text of this section"
  }
]
`;

      // Explicitly tell the model to return JSON
      const userContent = 'Please divide this text into logical sections and return the result as a JSON array:\n\n' + textChunk;

      console.log(`Calling OpenAI API for semantic chunking of large chunk ${i+1}...`);
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
        
        if (Array.isArray(result)) {
          console.log(`Received ${result.length} semantic chunks from API`);
          for (const chunk of result) {
            allChunks.push({
              chunk_id: chunkId++,
              heading: chunk.heading,
              text: chunk.text,
              token_count: estimateTokenCount(chunk.text)
            });
          }
        } else {
          console.log('API response is not an array, checking for array property');
          // Try to find an array property in the result
          const arrayProp = Object.keys(result).find(key => Array.isArray(result[key]));
          if (arrayProp) {
            console.log(`Found array property: ${arrayProp} with ${result[arrayProp].length} items`);
            for (const chunk of result[arrayProp]) {
              allChunks.push({
                chunk_id: chunkId++,
                heading: chunk.heading || 'Untitled Section',
                text: chunk.text || '',
                token_count: estimateTokenCount(chunk.text || '')
              });
            }
          } else {
            console.error('Could not find array in API response:', result);
          }
        }
      } catch (parseError) {
        console.error('Failed to parse OpenAI response as JSON:', parseError);
        console.log('Raw response:', response.choices[0].message.content);
      }
    }
    
    console.log(`Created ${allChunks.length} total semantic chunks`);
    return allChunks;
  } catch (error) {
    console.error('Error in semantic chunking:', error);
    throw error;
  }
}

// Simple function to estimate token count (4 chars ~= 1 token)
function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}

export async function chunkDocument(text: string, isStructured: boolean): Promise<ChunkResult[]> {
  try {
    console.log(`Starting document chunking (isStructured: ${isStructured})...`);
    
    if (isStructured) {
      return chunkStructuredDocument(text);
    } else {
      return await semanticChunkDocument(text);
    }
  } catch (error) {
    console.error('Error chunking document:', error);
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
    console.log('Document chunking API called');
    const { text, isStructured } = await req.json();
    
    if (!text) {
      console.error('Invalid request: text is required');
      return new Response(JSON.stringify({ error: 'Text is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log(`Processing document text of length ${text.length}, isStructured: ${isStructured}`);
    const result = await chunkDocument(text, isStructured);
    
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in chunk-document API:', error);
    return new Response(JSON.stringify({ error: 'Failed to chunk document' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 