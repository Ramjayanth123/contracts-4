import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import openai from '@/api/clause-extraction/openai-client';

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

const SYSTEM_PROMPT = `
You are ContractGPT, an expert legal assistant specialized in analyzing and answering questions about contracts. Your purpose is to help users understand specific contracts by providing accurate, evidence-based answers to their questions.

CONTEXT:
- You have been provided with relevant sections from a legal contract.
- These sections were retrieved based on the user's question using semantic search.
- You must ONLY use the provided contract sections to formulate your answer.

INSTRUCTIONS:
1. Answer ONLY questions related to the provided contract sections.
2. If the answer cannot be found in the provided sections, state clearly: "I cannot find information about this in the provided contract sections."
3. Do NOT make assumptions or inferences beyond what is explicitly stated in the contract.
4. Do NOT reference legal knowledge outside the provided contract sections.
5. Always cite the specific clause or section number when providing an answer.
6. Format your answers in plain language that non-legal professionals can understand.
7. When quoting the contract, use quotation marks and specify the exact section.
8. For questions about dates, payment terms, or specific obligations, quote the exact language.

ANSWER FORMAT:
1. Start with a direct answer to the question.
2. Provide supporting evidence from the contract, using direct quotes when appropriate.
3. If relevant, explain the practical implications of the clause in simple terms.
4. End with a citation of the specific section(s) or clause(s) referenced.

Remember: Your goal is to help users understand what is IN THIS SPECIFIC CONTRACT, not to provide general legal advice or information not contained in the provided sections.
`;

export function useContractQA(contractId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [contractChunks, setContractChunks] = useState<ContractChunk[]>([]);
  const [embeddingCache, setEmbeddingCache] = useState<EmbeddingCache>({});
  const { toast } = useToast();

  // Load from localStorage on mount
  useEffect(() => {
    try {
      console.log('Loading QA data from localStorage...');
      
      // Load messages
      const savedMessages = localStorage.getItem(`qa_messages_${contractId}`);
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
        console.log('Loaded saved messages from localStorage');
      }
      
      // Load chunks and embeddings
      const savedChunks = localStorage.getItem(`qa_chunks_${contractId}`);
      const savedEmbeddings = localStorage.getItem(`qa_embeddings_${contractId}`);
      
      if (savedChunks && savedEmbeddings) {
        setContractChunks(JSON.parse(savedChunks));
        setEmbeddingCache(JSON.parse(savedEmbeddings));
        setIsInitialized(true);
        console.log('Loaded saved chunks and embeddings from localStorage');
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  }, [contractId]);

  // Save messages to localStorage when they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`qa_messages_${contractId}`, JSON.stringify(messages));
    }
  }, [messages, contractId]);

  // Function to initialize the QA system with contract text
  const initialize = useCallback(async (documentText: string) => {
    try {
      console.log('Initializing Contract QA system...');
      setIsProcessing(true);
      
      // Check if we already have chunks and embeddings
      if (contractChunks.length > 0 && Object.keys(embeddingCache).length > 0) {
        console.log('Using cached chunks and embeddings');
        setIsInitialized(true);
        setIsProcessing(false);
        return;
      }
      
      // Step 1: Chunk the document
      console.log('Chunking document...');
      const chunks = chunkDocument(documentText);
      console.log(`Created ${chunks.length} chunks`);
      
      // Step 2: Generate embeddings for each chunk
      console.log('Generating embeddings...');
      const newEmbeddingCache: EmbeddingCache = {};
      
      // Process chunks in batches to avoid rate limits
      const batchSize = 5;
      for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize);
        const batchTexts = batch.map(chunk => chunk.text);
        
        try {
          const response = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: batchTexts,
          });
          
          batch.forEach((chunk, index) => {
            const embedding = response.data[index].embedding;
            newEmbeddingCache[chunk.id] = embedding;
            chunks[i + index].embedding = embedding;
          });
          
          console.log(`Processed embeddings batch ${i/batchSize + 1}/${Math.ceil(chunks.length/batchSize)}`);
        } catch (error) {
          console.error('Error generating embeddings for batch:', error);
          throw new Error('Failed to generate embeddings');
        }
      }
      
      // Save to state and localStorage
      setContractChunks(chunks);
      setEmbeddingCache(newEmbeddingCache);
      localStorage.setItem(`qa_chunks_${contractId}`, JSON.stringify(chunks));
      localStorage.setItem(`qa_embeddings_${contractId}`, JSON.stringify(newEmbeddingCache));
      
      console.log('Contract QA system initialized successfully');
      setIsInitialized(true);
    } catch (error) {
      console.error('Error initializing Contract QA system:', error);
      toast({
        title: "Initialization Failed",
        description: "Could not initialize the QA system. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [contractId, contractChunks, embeddingCache, toast]);

  // Function to chunk document text
  const chunkDocument = (text: string): ContractChunk[] => {
    if (!text) return [];
    
    // Split by paragraphs first
    const paragraphs = text.split(/\n\s*\n/);
    
    // Create chunks with some overlap
    const chunks: ContractChunk[] = [];
    let chunkId = 0;
    
    paragraphs.forEach((paragraph) => {
      // Skip empty paragraphs
      if (paragraph.trim().length === 0) return;
      
      // For longer paragraphs, split into smaller chunks
      if (paragraph.length > 1000) {
        // Split by sentences
        const sentences = paragraph.match(/[^.!?]+[.!?]+/g) || [paragraph];
        
        let currentChunk = '';
        for (const sentence of sentences) {
          if ((currentChunk + sentence).length <= 1000) {
            currentChunk += sentence;
          } else {
            if (currentChunk) {
              chunks.push({
                id: `chunk_${chunkId++}`,
                text: currentChunk.trim()
              });
            }
            currentChunk = sentence;
          }
        }
        
        if (currentChunk) {
          chunks.push({
            id: `chunk_${chunkId++}`,
            text: currentChunk.trim()
          });
        }
      } else {
        // Add paragraph as a single chunk
        chunks.push({
          id: `chunk_${chunkId++}`,
          text: paragraph.trim()
        });
      }
    });
    
    console.log(`Created ${chunks.length} chunks from document`);
    return chunks;
  };

  // Function to generate query embeddings
  const generateQueryEmbedding = async (query: string): Promise<number[]> => {
    try {
      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: query,
      });
      
      return response.data[0].embedding;
    } catch (error) {
      console.error('Error generating query embedding:', error);
      throw new Error('Failed to generate query embedding');
    }
  };

  // Function to generate multiple query variations
  const generateQueryVariations = (query: string): string[] => {
    // Simple variations for now
    return [
      query,
      `What does the contract say about ${query.toLowerCase()}?`,
      `Find information about ${query.toLowerCase()} in the contract`
    ];
  };

  // Function to calculate cosine similarity
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
      
      // Generate embeddings for each variation
      const queryEmbeddings: number[][] = [];
      for (const variation of queryVariations) {
        const embedding = await generateQueryEmbedding(variation);
        queryEmbeddings.push(embedding);
      }
      
      // Calculate similarity scores for each chunk against each query variation
      const chunkScores: {chunk: ContractChunk, score: number}[] = [];
      
      for (const chunk of contractChunks) {
        if (!chunk.embedding) continue;
        
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
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
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