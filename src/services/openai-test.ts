import OpenAI from 'openai';

// Test function to verify OpenAI connection
export async function testOpenAI() {
  console.log('🧪 Testing OpenAI connection...');
  
  try {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    console.log('API Key available:', apiKey ? 'Yes' : 'No');
    
    if (!apiKey) {
      throw new Error('OpenAI API key is missing. Please set VITE_OPENAI_API_KEY in your .env file.');
    }
    
    const openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true
    });
    
    console.log('📡 Making test request to OpenAI API...');
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Say hello!' }
      ]
    });
    
    console.log('✅ OpenAI API connection successful!');
    console.log('📝 Response:', response.choices[0].message.content);
    
    return {
      success: true,
      message: 'OpenAI API connection successful!'
    };
  } catch (error: any) {
    console.error('❌ OpenAI API connection failed:', error);
    return {
      success: false,
      message: error.message || 'Unknown error'
    };
  }
}