
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, MessageSquare, Highlighter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ContractChange {
  id: string;
  type: 'addition' | 'deletion' | 'modification';
  section: string;
  original: string;
  modified: string;
  comment: string;
  author: string;
  timestamp: string;
  created_at?: string;
}

interface ContractComparisonProps {
  contractId: string;
}

const ContractComparison = ({ contractId }: ContractComparisonProps) => {
  const [selectedChange, setSelectedChange] = useState<string | null>(null);
  const [changes, setChanges] = useState<ContractChange[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchContractChanges();
  }, [contractId]);

  const fetchContractChanges = async () => {
    try {
      // For now, we'll use placeholder data since the contract_changes table
      // would need to be created in the database schema
      // TODO: Replace with actual database query when contract_changes table is available
      const placeholderChanges: ContractChange[] = [
        {
          id: '1',
          type: 'addition',
          section: 'Section 2.1 - Payment Terms',
          original: '',
          modified: 'Payment shall be due within 45 days of invoice receipt.',
          comment: 'Extended payment terms requested by client',
          author: 'John Smith (TechCorp)',
          timestamp: '2 hours ago'
        },
        {
          id: '2',
          type: 'deletion',
          section: 'Section 3.4 - Termination',
          original: 'Either party may terminate this agreement with 30 days written notice.',
          modified: '',
          comment: 'Removing standard termination clause per legal review',
          author: 'Sarah Johnson (Our Company)',
          timestamp: '4 hours ago'
        },
        {
          id: '3',
          type: 'modification',
          section: 'Section 1.2 - Scope of Work',
          original: 'Services shall include software development and maintenance.',
          modified: 'Services shall include software development, maintenance, and 24/7 technical support.',
          comment: 'Added support requirements',
          author: 'Mike Chen (TechCorp)',
          timestamp: '1 day ago'
        }
      ];
      
      setChanges(placeholderChanges);
    } catch (error: any) {
      console.error('Error fetching contract changes:', error);
      toast({
        title: "Error",
        description: "Failed to fetch contract changes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getChangeColor = (type: string) => {
    switch (type) {
      case 'addition':
        return 'bg-green-500/20 border-green-500/30 text-green-400';
      case 'deletion':
        return 'bg-red-500/20 border-red-500/30 text-red-400';
      case 'modification':
        return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400';
      default:
        return 'bg-gray-500/20 border-gray-500/30 text-gray-400';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Changes List */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Highlighter className="w-5 h-5" />
            Pending Changes
            <Badge variant="secondary">{changes.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-96">
            {changes.map((change, index) => (
              <div key={change.id}>
                <div
                  className={`p-4 cursor-pointer transition-all duration-200 hover:bg-white/5 ${
                    selectedChange === change.id ? 'bg-white/10' : ''
                  }`}
                  onClick={() => setSelectedChange(change.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={`${getChangeColor(change.type)} border text-xs`}>
                      {change.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{change.timestamp}</span>
                  </div>
                  <h4 className="font-medium text-sm mb-1">{change.section}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">{change.comment}</p>
                  <p className="text-xs text-muted-foreground mt-1">by {change.author}</p>
                </div>
                {index < mockChanges.length - 1 && <Separator className="bg-white/10" />}
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Document Comparison */}
      <Card className="lg:col-span-2 glass-card border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Document Comparison
            {selectedChange && (
              <div className="flex gap-2">
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Accept
                </Button>
                <Button size="sm" variant="destructive">
                  <XCircle className="w-4 h-4 mr-1" />
                  Reject
                </Button>
                <Button size="sm" variant="outline">
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Comment
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-96">
            {/* Original Version */}
            <div className="space-y-2">
              <h3 className="font-medium text-sm text-muted-foreground">Original Version</h3>
              <ScrollArea className="h-80 p-4 glass-card border border-white/10 rounded-lg">
                {selectedChange ? (
                  <div className="space-y-4">
                    <div className="text-sm">
                      <h4 className="font-medium mb-2">
                        {mockChanges.find(c => c.id === selectedChange)?.section}
                      </h4>
                      <div className="bg-red-500/20 border border-red-500/30 p-3 rounded">
                        <p className="text-red-400">
                          {mockChanges.find(c => c.id === selectedChange)?.original || 
                           '[Content to be removed]'}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Select a change to view comparison</p>
                )}
              </ScrollArea>
            </div>

            {/* Modified Version */}
            <div className="space-y-2">
              <h3 className="font-medium text-sm text-muted-foreground">Modified Version</h3>
              <ScrollArea className="h-80 p-4 glass-card border border-white/10 rounded-lg">
                {selectedChange ? (
                  <div className="space-y-4">
                    <div className="text-sm">
                      <h4 className="font-medium mb-2">
                        {mockChanges.find(c => c.id === selectedChange)?.section}
                      </h4>
                      <div className="bg-green-500/20 border border-green-500/30 p-3 rounded">
                        <p className="text-green-400">
                          {mockChanges.find(c => c.id === selectedChange)?.modified || 
                           '[Content removed]'}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Select a change to view comparison</p>
                )}
              </ScrollArea>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContractComparison;
