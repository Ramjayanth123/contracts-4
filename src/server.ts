import { handleApiRequest } from './api/routes';

// Create a function to handle fetch events for API routes
export async function handleFetch(request: Request): Promise<Response> {
  const url = new URL(request.url);
  
  // Check if the request is for an API endpoint
  if (url.pathname.startsWith('/api/')) {
    console.log(`🔄 API Request: ${url.pathname}`);
    
    try {
      const response = await handleApiRequest(url.pathname, request);
      console.log(`✅ API Response: ${url.pathname} - Status: ${response.status}`);
      return response;
    } catch (error) {
      console.error(`❌ API Error: ${url.pathname}`, error);
      return new Response(JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
  
  // For non-API requests, pass through to the original fetch
  return fetch(request);
}

// Patch the global fetch function to intercept API requests
const originalFetch = window.fetch;
window.fetch = async function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  // If input is a Request object, extract the URL
  const url = typeof input === 'string' ? input : input.url;
  
  // If this is an API request, handle it with our custom handler
  if (url.startsWith('/api/')) {
    const request = input instanceof Request ? input : new Request(input, init);
    return handleFetch(request);
  }
  
  // Otherwise, use the original fetch
  return originalFetch(input, init);
};

console.log('🚀 Mock API server initialized');

export default handleFetch; 