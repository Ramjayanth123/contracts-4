import OpenAI from "openai";
import { checkEnvironment } from "../clause-extraction/env-check";

// Check if environment has API key
const hasEnvApiKey = checkEnvironment();

// Get API key from environment
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

if (!hasEnvApiKey) {
  console.warn('VITE_OPENAI_API_KEY not found in environment variables. Please add it to your .env.local file.');
}

// Create OpenAI client
const openai = new OpenAI({
  apiKey: apiKey || 'YOUR_OPENAI_API_KEY_HERE', // Replace with your API key in .env.local file
  dangerouslyAllowBrowser: true, // Only for client-side use in development
});

// Log success message
console.log("✅ OpenAI client initialized for risk detection");

export default openai; 