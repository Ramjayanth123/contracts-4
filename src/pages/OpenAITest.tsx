import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { testOpenAI } from '@/services/openai-test';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const OpenAITest = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestConnection = async () => {
    setLoading(true);
    try {
      const testResult = await testOpenAI();
      setResult(testResult);
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || 'Unknown error occurred'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">OpenAI API Connection Test</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test OpenAI Connection</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            This page tests the connection to the OpenAI API.
            Click the button below to run the test.
          </p>
          <Button 
            onClick={handleTestConnection} 
            disabled={loading}
          >
            {loading ? 'Testing Connection...' : 'Test OpenAI Connection'}
          </Button>
          
          {result && (
            <div className="mt-6">
              {result.success ? (
                <Alert className="bg-green-500/10 border-green-500">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>{result.message}</AlertDescription>
                </Alert>
              ) : (
                <Alert className="bg-red-500/10 border-red-500">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{result.message}</AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Environment Variables</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Make sure you have the following environment variables set in your <code>.env</code> file:
          </p>
          <pre className="bg-secondary p-4 rounded-md mt-2 overflow-x-auto">
            <code>VITE_OPENAI_API_KEY=your_api_key_here</code>
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};

export default OpenAITest; 