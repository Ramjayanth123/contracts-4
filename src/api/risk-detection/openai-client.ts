import OpenAI from "openai";

let openaiInstance: OpenAI | null = null;

/**
 * Creates and returns an OpenAI client instance only when explicitly requested.
 * This prevents automatic API key usage on page load.
 */
export function getOpenAIClient(): OpenAI {
  if (openaiInstance) {
    return openaiInstance;
  }
  
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    console.warn('VITE_OPENAI_API_KEY not found in environment variables. Please add it to your .env.local file.');
  }
  
  openaiInstance = new OpenAI({
    apiKey: apiKey || 'YOUR_OPENAI_API_KEY_HERE', // Replace with your API key in .env.local file
    dangerouslyAllowBrowser: true, // Only for client-side use in development
  });
  
  console.log("✅ OpenAI client initialized for risk detection on demand");
  return openaiInstance;
}

// Export a dummy object that will be replaced with the actual client when getOpenAIClient is called
export default {
  chat: {
    completions: {
      create: () => {
        throw new Error('OpenAI client not initialized. Call getOpenAIClient() first.');
      }
    }
  }
} as unknown as OpenAI; 