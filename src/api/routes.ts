import validateStructure from './clause-extraction/validate-structure';
import chunkDocument from './clause-extraction/chunk-document';
import analyzeChunks from './clause-extraction/analyze-chunks';
import macroSummary from './clause-extraction/macro-summary';
import analyzeRisks from './risk-detection/analyze-risks';

// Define routes for API endpoints
const routes = {
  '/api/clause-extraction/validate-structure': validateStructure,
  '/api/clause-extraction/chunk-document': chunkDocument,
  '/api/clause-extraction/analyze-chunks': analyzeChunks,
  '/api/clause-extraction/macro-summary': macroSummary,
  '/api/risk-detection/analyze': analyzeRisks,
  '/api/risk-detection': analyzeRisks,  // Add direct endpoint for simplified access
};

// Handler function for API requests
export async function handleApiRequest(path: string, request: Request): Promise<Response> {
  const handler = routes[path];
  
  if (!handler) {
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  try {
    return await handler(request);
  } catch (error) {
    console.error(`Error handling request to ${path}:`, error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export default routes; 