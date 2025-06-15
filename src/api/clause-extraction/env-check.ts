// This file helps validate that environment variables are being loaded correctly

/**
 * Utility function to check if the OpenAI API key is properly configured
 */
export function checkEnvironment(): boolean {
  console.log('Checking environment variables for OpenAI API key...');
  
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    console.warn('⚠️ VITE_OPENAI_API_KEY not found in environment variables');
    console.warn('⚠️ Please add VITE_OPENAI_API_KEY to your .env.local file');
    return false;
  }
  
  console.log('✅ VITE_OPENAI_API_KEY found in environment variables');
  return true;
}

export default checkEnvironment; 