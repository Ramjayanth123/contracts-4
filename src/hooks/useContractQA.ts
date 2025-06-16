import { useState, useEffect } from 'react';
import { getOpenAIClient } from '@/api/clause-extraction/openai-client';
import { useToast } from '@/hooks/use-toast';

// Define types for messages and evidence
interface Evidence {
  clause_type?: string;
  text: string;
  highlight?: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  evidence?: Evidence;
}

interface EmbeddingCache {
  [chunkId: string]: number[];
}

interface ContractChunk {
  id: string;
  text: string;
  embedding?: number[];
  metadata?: {
    clause_type?: string;
    section?: string;
  };
}

// System prompt for the QA assistant
const SYSTEM_PROMPT = `
You are a Contract QA Assistant, specialized in answering questions about legal contracts.

GUIDELINES:
1. Answer questions based ONLY on the contract sections provided
2. If you can't find the answer in the provided sections, say so clearly
3. Be precise and factual, citing specific clauses when possible
4. Avoid making assumptions beyond what's stated in the contract
5. For questions about legal interpretation, note that you're providing information, not legal advice

FORMAT YOUR ANSWERS:
- Start with a direct answer to the question
- Include relevant quotes from the contract as evidence
- If applicable, note the section/clause where the information was found
`;

// Constants for batching
const MAX_BATCH_SIZE = 20; // Maximum number of texts to embed in a single API call

export function useContractQA(contractId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [contractChunks, setContractChunks] = useState<ContractChunk[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const { toast } = useToast();
  
  // Load messages from localStorage on mount
  useEffect(() => {
    if (contractId) {
      const savedMessages = localStorage.getItem(`qa_messages_${contractId}`);
      if (savedMessages) {
        try {
          setMessages(JSON.parse(savedMessages));
        } catch (error) {
          console.error('Error parsing saved messages:', error);
        }
      }
    }
  }, [contractId]);
  
  // Save messages to localStorage when they change
  useEffect(() => {
    if (contractId && messages.length > 0) {
      localStorage.setItem(`qa_messages_${contractId}`, JSON.stringify(messages));
    }
  }, [messages, contractId]);
  
  // Initialize the QA system with contract text
  const initialize = async (contractText: string) => {
    try {
      console.log('Initializing QA system with contract text...');
      setIsProcessing(true);
      
      // Chunk the document
      const chunks = chunkDocument(contractText);
      console.log(`Created ${chunks.length} chunks from contract text`);
      
      // Create contract chunks
      const contractChunksWithoutEmbeddings = chunks.map(chunk => ({
        id: `chunk-${chunk.id}`,
        text: chunk.text,
        metadata: {
          section: chunk.heading
        }
      }));
      
      // Pre-generate embeddings for all chunks in batches for efficiency
      const chunksWithEmbeddings = await generateEmbeddingsForChunks(contractChunksWithoutEmbeddings);
      
      setContractChunks(chunksWithEmbeddings);
      setIsInitialized(true);
      console.log('QA system initialized successfully');
    } catch (error) {
      console.error('Error initializing QA system:', error);
      toast({
        title: "Error",
        description: "Failed to initialize QA system",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Pre-generate embeddings for all chunks in batches
  const generateEmbeddingsForChunks = async (chunks: ContractChunk[]): Promise<ContractChunk[]> => {
    console.log(`Generating embeddings for ${chunks.length} chunks in batches...`);
    
    // Process chunks in batches to avoid overwhelming the API
    const chunksWithEmbeddings: ContractChunk[] = [...chunks];
    
    // Process in batches of MAX_BATCH_SIZE
    for (let i = 0; i < chunks.length; i += MAX_BATCH_SIZE) {
      const batchChunks = chunks.slice(i, i + MAX_BATCH_SIZE);
      const batchTexts = batchChunks.map(chunk => chunk.text);
      
      try {
        console.log(`Processing batch ${Math.floor(i/MAX_BATCH_SIZE) + 1}/${Math.ceil(chunks.length/MAX_BATCH_SIZE)}`);
        const batchEmbeddings = await generateEmbeddings(batchTexts);
        
        // Assign embeddings to chunks
        for (let j = 0; j < batchChunks.length; j++) {
          const chunkIndex = i + j;
          if (chunkIndex < chunksWithEmbeddings.length) {
            chunksWithEmbeddings[chunkIndex].embedding = batchEmbeddings[j];
          }
        }
      } catch (error) {
        console.error(`Error generating embeddings for batch ${Math.floor(i/MAX_BATCH_SIZE) + 1}:`, error);
      }
    }
    
    return chunksWithEmbeddings;
  };
  
  interface ChunkResult {
    id: string;
    text: string;
    heading: string;
  }
  
  // Function to chunk document text
  const chunkDocument = (text: string): ChunkResult[] => {
    // Simple chunking by paragraphs and headings
    const chunks: ChunkResult[] = [];
    let id = 0;
    
    // Split by double newlines (paragraphs)
    const paragraphs = text.split(/\n\s*\n/);
    
    let currentHeading = "Introduction";
    for (const paragraph of paragraphs) {
      if (!paragraph.trim()) continue;
      
      // Check if this paragraph is a heading
      const headingMatch = paragraph.match(/^(#+\s+|[A-Z][A-Z\s]+:|[0-9]+\.[0-9]+\s+)(.+)$/m);
      
      if (headingMatch) {
        currentHeading = headingMatch[2].trim();
        // Add the heading as its own chunk
        chunks.push({
          id: `${id++}`,
          text: paragraph.trim(),
          heading: currentHeading
        });
      } else {
        // Add as regular paragraph
        chunks.push({
          id: `${id++}`,
          text: paragraph.trim(),
          heading: currentHeading
        });
      }
    }
    
    return chunks;
  };
  
  // Function to generate embeddings for multiple texts in a single API call
  const generateEmbeddings = async (texts: string[]): Promise<number[][]> => {
    try {
      // Get the OpenAI client only when needed
      const openai = getOpenAIClient();
      
      console.log(`Generating embeddings for ${texts.length} texts in a single API call`);
      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: texts,
        encoding_format: "float"
      });
      
      // Extract embeddings in the same order as input texts
      return response.data.map(item => item.embedding);
    } catch (error) {
      console.error('Error generating embeddings:', error);
      throw new Error('Failed to generate embeddings');
    }
  };
  
  // Function to generate variations of the query for better retrieval
  const generateQueryVariations = (query: string): string[] => {
    // Add some simple variations to improve retrieval
    const variations = [
      query,
      `What does the contract say about ${query}?`,
      `Find clauses related to ${query}`,
      `${query} according to the contract`
    ];
    
    return variations;
  };
  
  // Function to calculate cosine similarity between two vectors
  const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    
    if (normA === 0 || normB === 0) return 0;
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  };

  // Function to retrieve relevant chunks
  const retrieveRelevantChunks = async (query: string, topK: number = 3): Promise<ContractChunk[]> => {
    try {
      // Generate variations of the query
      const queryVariations = generateQueryVariations(query);
      console.log('Generated query variations:', queryVariations);
      
      // Generate embeddings for all query variations in a single API call
      const queryEmbeddings = await generateEmbeddings(queryVariations);
      console.log(`Generated ${queryEmbeddings.length} query embeddings`);
      
      // Identify chunks that need embeddings
      const chunksNeedingEmbeddings = contractChunks.filter(chunk => !chunk.embedding);
      
      // If any chunks need embeddings, generate them in batches
      if (chunksNeedingEmbeddings.length > 0) {
        console.log(`Generating embeddings for ${chunksNeedingEmbeddings.length} chunks that don't have them yet`);
        const updatedChunks = await generateEmbeddingsForChunks(chunksNeedingEmbeddings);
        
        // Update the chunks with their new embeddings
        for (const updatedChunk of updatedChunks) {
          const index = contractChunks.findIndex(c => c.id === updatedChunk.id);
          if (index !== -1 && updatedChunk.embedding) {
            contractChunks[index].embedding = updatedChunk.embedding;
          }
        }
      }
      
      // Calculate similarity scores for each chunk against each query variation
      const chunkScores: {chunk: ContractChunk, score: number}[] = [];
      
      for (const chunk of contractChunks) {
        // Skip chunks without embeddings (shouldn't happen after the above step)
        if (!chunk.embedding) {
          console.warn(`Chunk ${chunk.id} still has no embedding, skipping`);
          continue;
        }
        
        // Calculate max similarity across all query variations
        let maxScore = -1;
        for (const queryEmbedding of queryEmbeddings) {
          const similarity = cosineSimilarity(queryEmbedding, chunk.embedding);
          maxScore = Math.max(maxScore, similarity);
        }
        
        chunkScores.push({
          chunk,
          score: maxScore
        });
      }
      
      // Sort by score and take top K
      chunkScores.sort((a, b) => b.score - a.score);
      const topChunks = chunkScores.slice(0, topK).map(item => item.chunk);
      
      console.log(`Retrieved ${topChunks.length} relevant chunks`);
      return topChunks;
    } catch (error) {
      console.error('Error retrieving relevant chunks:', error);
      throw new Error('Failed to retrieve relevant chunks');
    }
  };

  // Function to ask a question
  const askQuestion = async (question: string) => {
    try {
      setIsProcessing(true);
      
      // Add user message
      const userMessage: Message = { role: 'user', content: question };
      setMessages(prev => [...prev, userMessage]);
      
      // Retrieve relevant chunks
      console.log('Retrieving relevant chunks for question:', question);
      const relevantChunks = await retrieveRelevantChunks(question);
      
      if (relevantChunks.length === 0) {
        const noContextMessage: Message = {
          role: 'assistant',
          content: "I couldn't find any relevant information in the contract to answer your question."
        };
        setMessages(prev => [...prev, noContextMessage]);
        return;
      }
      
      // Prepare context for the LLM
      const context = relevantChunks.map(chunk => chunk.text).join('\n\n');
      console.log('Using context:', context.substring(0, 100) + '...');
      
      // Call OpenAI for answer
      // Get the OpenAI client only when needed
      const openai = getOpenAIClient();
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.2,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `
            Here are relevant sections from the contract:
            
            ${context}
            
            User question: ${question}
            
            Please answer the question based ONLY on the provided contract sections.
            If you can't find the answer in these sections, say so clearly.
            Include specific quotes from the contract as evidence.
          `}
        ],
        functions: [
          {
            name: "format_answer",
            description: "Format the answer with evidence",
            parameters: {
              type: "object",
              properties: {
                answer: {
                  type: "string",
                  description: "The direct answer to the user's question"
                },
                evidence: {
                  type: "object",
                  properties: {
                    text: {
                      type: "string",
                      description: "The exact text from the contract that supports the answer"
                    },
                    highlight: {
                      type: "string",
                      description: "The most relevant part of the evidence to highlight"
                    },
                    clause_type: {
                      type: "string",
                      description: "The type of clause this evidence comes from (e.g., 'Payment Terms', 'Termination', etc.)"
                    }
                  },
                  required: ["text"]
                }
              },
              required: ["answer"]
            }
          }
        ],
        function_call: { name: "format_answer" }
      });
      
      // Parse the response
      const responseMessage = response.choices[0].message;
      const functionCall = responseMessage.function_call;
      
      if (functionCall && functionCall.name === "format_answer") {
        const functionArgs = JSON.parse(functionCall.arguments || "{}");
        const answer = functionArgs.answer;
        const evidence = functionArgs.evidence;
        
        const assistantMessage: Message = {
          role: 'assistant',
          content: answer,
          evidence: evidence
        };
        
        console.log('Generated answer:', answer);
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        // Fallback if function calling fails
        const content = responseMessage.content || "I couldn't generate an answer based on the contract.";
        const assistantMessage: Message = {
          role: 'assistant',
          content
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Error asking question:', error);
      toast({
        title: "Error",
        description: "Failed to generate an answer. Please try again.",
        variant: "destructive",
      });
      
      // Add error message
      const errorMessage: Message = {
        role: 'assistant',
        content: "I'm sorry, I encountered an error while processing your question. Please try again."
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Function to clear chat history
  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem(`qa_messages_${contractId}`);
    console.log('Chat history cleared');
  };

  return {
    messages,
    isProcessing,
    isInitialized,
    askQuestion,
    clearHistory,
    initialize
  };
}