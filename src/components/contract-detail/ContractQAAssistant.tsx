import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, Bot, User, FileText, Info, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useContractQA } from '@/hooks/useContractQA';

interface ContractQAAssistantProps {
  contractId: string;
  documentText: string | null;
}

export default function ContractQAAssistant({ contractId, documentText }: ContractQAAssistantProps) {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { 
    messages, 
    isProcessing, 
    askQuestion, 
    clearHistory,
    isInitialized,
    initialize
  } = useContractQA(contractId);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Initialize QA system when component mounts
  useEffect(() => {
    if (documentText && !isInitialized) {
      console.log('Initializing Contract QA system...');
      initialize(documentText);
    }
  }, [documentText, isInitialized, initialize]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    if (!documentText) {
      toast({
        title: "Error",
        description: "No document text available for analysis",
        variant: "destructive",
      });
      return;
    }

    if (!isInitialized) {
      toast({
        title: "Please wait",
        description: "Contract QA system is still initializing",
      });
      return;
    }
    
    console.log('Submitting question:', query);
    await askQuestion(query);
    setQuery('');
    
    // Focus the input field after sending
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // Format evidence with highlighted text
  const formatEvidence = (evidence: any) => {
    if (!evidence || !evidence.text) return null;
    
    const text = evidence.text;
    const highlight = evidence.highlight;
    
    if (!highlight) return text;
    
    // Split text by highlight to add highlighting
    const parts = text.split(highlight);
    if (parts.length === 1) return text;
    
    return (
      <>
        {parts[0]}
        <span className="bg-yellow-500/20 px-1 rounded">{highlight}</span>
        {parts[1]}
      </>
    );
  };

  // Example questions
  const exampleQuestions = [
    "What is the payment schedule?",
    "When does this contract expire?",
    "Who can terminate the agreement?",
    "What are the confidentiality terms?",
    "What are my obligations under this contract?"
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Contract QA Assistant</CardTitle>
        <CardDescription>
          Ask questions about this contract and get AI-powered answers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="help">Help & Examples</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat" className="space-y-4">
            {!isInitialized && !isProcessing ? (
              <div className="flex flex-col items-center justify-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center mb-2">
                  Initializing Contract QA system...
                </p>
                <p className="text-sm text-muted-foreground text-center">
                  This may take a moment while we analyze the contract
                </p>
              </div>
            ) : (
              <>
                <ScrollArea className="h-[350px] pr-4">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                      <Bot className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="font-medium mb-2">Contract QA Assistant</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Ask me questions about this contract and I'll provide evidence-based answers.
                      </p>
                      <div className="grid grid-cols-1 gap-2 w-full max-w-md">
                        {exampleQuestions.slice(0, 3).map((q, i) => (
                          <Button 
                            key={i} 
                            variant="outline" 
                            className="justify-start text-left h-auto py-2"
                            onClick={() => setQuery(q)}
                          >
                            {q}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg, idx) => (
                        <div 
                          key={idx} 
                          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div 
                            className={`max-w-[80%] rounded-lg p-3 ${
                              msg.role === 'user' 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-muted'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              {msg.role === 'user' ? (
                                <User className="h-4 w-4" />
                              ) : (
                                <Bot className="h-4 w-4" />
                              )}
                              <span className="text-xs font-medium">
                                {msg.role === 'user' ? 'You' : 'Assistant'}
                              </span>
                            </div>
                            <div className="text-sm">{msg.content}</div>
                            
                            {/* Evidence section */}
                            {msg.evidence && (
                              <div className="mt-2 pt-2 border-t border-white/10">
                                <div className="flex items-center gap-1 mb-1">
                                  <Info className="h-3 w-3" />
                                  <span className="text-xs font-medium">Evidence</span>
                                  {msg.evidence.clause_type && (
                                    <Badge variant="outline" className="ml-1 text-xs">
                                      {msg.evidence.clause_type}
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-xs bg-black/20 p-2 rounded">
                                  {formatEvidence(msg.evidence)}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>
                
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Input
                    ref={inputRef}
                    placeholder="Ask a question about this contract..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    disabled={isProcessing || !isInitialized}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={isProcessing || !query.trim() || !isInitialized}>
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="help">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">How to Use</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  The Contract QA Assistant helps you quickly find information in this contract.
                  Simply ask questions in plain English and get evidence-based answers.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Example Questions</h3>
                <div className="grid grid-cols-1 gap-2">
                  {exampleQuestions.map((q, i) => (
                    <Button 
                      key={i} 
                      variant="outline" 
                      className="justify-start text-left h-auto py-2"
                      onClick={() => {
                        setQuery(q);
                        setActiveTab('chat');
                        setTimeout(() => {
                          inputRef.current?.focus();
                        }, 100);
                      }}
                    >
                      {q}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Tips</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                  <li>Be specific in your questions</li>
                  <li>You can ask follow-up questions</li>
                  <li>The assistant only knows about this specific contract</li>
                  <li>All answers are based on the actual contract text</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      {messages.length > 0 && (
        <CardFooter className="flex justify-between border-t px-6 py-4">
          <div className="text-xs text-muted-foreground">
            Answers are AI-generated based on this contract only
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearHistory}
            disabled={isProcessing}
          >
            <X className="h-4 w-4 mr-1" />
            Clear Chat
          </Button>
        </CardFooter>
      )}
    </Card>
  );
} 