import { getOpenAIClient } from './openai-client';

interface DocumentStructure {
  title: string;
  sections: Array<{
    heading: string;
    level: number;
    text: string;
  }>;
}

interface ChunkResult {
  chunk_id: number;
  heading: string;
  text: string;
  token_count: number;
}

// Utility function to estimate token count
function estimateTokenCount(text: string): number {
  // A rough estimate: 1 token ≈ 4 characters for English text
  return Math.ceil(text.length / 4);
}

async function chunkDocument(structure: DocumentStructure): Promise<ChunkResult[]> {
  try {
    console.log('Chunking document based on structure');
    
    const chunks: ChunkResult[] = [];
    let chunkId = 0;
    
    // Process each section as a potential chunk
    for (const section of structure.sections) {
      // Skip empty sections
      if (!section.text || section.text.trim() === '') {
        continue;
      }
      
      const tokenCount = estimateTokenCount(section.text);
      const maxTokensPerChunk = 4000; // Keep chunks reasonably sized for analysis
      
      // If the section is small enough, add it as a single chunk
      if (tokenCount <= maxTokensPerChunk) {
        chunks.push({
          chunk_id: chunkId++,
          heading: section.heading,
          text: section.text,
          token_count: tokenCount
        });
      } 
      // Otherwise, split the section into smaller chunks
      else {
        console.log(`Section "${section.heading}" is too large (${tokenCount} tokens). Splitting into smaller chunks.`);
        
        // Split by paragraphs to preserve some context
        const paragraphs = section.text.split(/\n\s*\n/);
        let currentChunk = '';
        let currentTokens = 0;
        let subChunkIndex = 1;
        
        for (const paragraph of paragraphs) {
          const paragraphTokens = estimateTokenCount(paragraph);
          
          // If adding this paragraph would exceed the limit, create a new chunk
          if (currentTokens + paragraphTokens > maxTokensPerChunk && currentChunk !== '') {
            chunks.push({
              chunk_id: chunkId++,
              heading: `${section.heading} (part ${subChunkIndex})`,
              text: currentChunk,
              token_count: currentTokens
            });
            
            currentChunk = paragraph;
            currentTokens = paragraphTokens;
            subChunkIndex++;
          } 
          // Otherwise, add the paragraph to the current chunk
          else {
            if (currentChunk !== '') {
              currentChunk += '\n\n';
            }
            currentChunk += paragraph;
            currentTokens += paragraphTokens;
          }
        }
        
        // Add the last chunk if there's anything left
        if (currentChunk !== '') {
          chunks.push({
            chunk_id: chunkId++,
            heading: `${section.heading} (part ${subChunkIndex})`,
            text: currentChunk,
            token_count: currentTokens
          });
        }
      }
    }
    
    console.log(`Document chunked into ${chunks.length} parts`);
    return chunks;
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
    console.log('Chunk document API called');
    const { structure } = await req.json();
    
    if (!structure || !structure.sections || !Array.isArray(structure.sections)) {
      console.error('Invalid request: document structure is required');
      return new Response(JSON.stringify({ error: 'Document structure is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log(`Processing document with ${structure.sections.length} sections`);
    const result = await chunkDocument(structure);
    
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