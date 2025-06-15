import React, { useEffect, useState } from 'react';

const EnvTest: React.FC = () => {
  const [envApiKey, setEnvApiKey] = useState<boolean>(false);
  const [keyPrefix, setKeyPrefix] = useState<string>('');
  
  useEffect(() => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    setEnvApiKey(!!apiKey);
    
    if (apiKey) {
      // Only show first few characters for security
      const maskedKey = apiKey.substring(0, 5) + '...' + apiKey.substring(apiKey.length - 4);
      setKeyPrefix(maskedKey);
    }
    
    // Log all available environment variables (except the actual values)
    console.log('Available environment variables:', 
      Object.keys(import.meta.env).map(key => ({ key }))
    );
  }, []);
  
  return (
    <div className="p-4 border rounded-md">
      <h2 className="text-lg font-bold mb-2">API Configuration Status</h2>
      <div>
        <p>OpenAI API Key in Environment: {envApiKey ? 
          <span className="text-green-500">Found ({keyPrefix})</span> : 
          <span className="text-red-500">Not found - Please add to environment variables</span>}
        </p>
        {!envApiKey && (
          <p className="text-xs text-muted-foreground mt-2">
            Add VITE_OPENAI_API_KEY to your .env.local file to use OpenAI features
          </p>
        )}
      </div>
    </div>
  );
};

export default EnvTest; 