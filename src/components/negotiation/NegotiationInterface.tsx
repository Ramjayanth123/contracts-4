
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Split, MessageSquare, History, TrendingUp } from 'lucide-react';
import ContractComparison from './ContractComparison';
import NegotiationChat from './NegotiationChat';
import VersionHistory from './VersionHistory';
import NegotiationSummary from './NegotiationSummary';

const NegotiationInterface = () => {
  const [activeContract, setActiveContract] = useState('contract-1');

  const activeNegotiations = [
    {
      id: 'contract-1',
      title: 'Service Agreement - TechCorp',
      status: 'in-progress',
      parties: ['Our Company', 'TechCorp'],
      lastActivity: '2 hours ago',
      version: '3.2',
      changes: 12,
      priority: 'high'
    },
    {
      id: 'contract-2',
      title: 'License Agreement - SoftwareCo',
      status: 'pending-review',
      parties: ['Our Company', 'SoftwareCo'],
      lastActivity: '1 day ago',
      version: '2.1',
      changes: 8,
      priority: 'medium'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Contract Negotiation</h2>
          <p className="text-muted-foreground">Collaborate on contract terms and track changes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Split className="w-4 h-4 mr-2" />
            Compare Versions
          </Button>
          <Button>
            <MessageSquare className="w-4 h-4 mr-2" />
            Start Discussion
          </Button>
        </div>
      </div>

      {/* Active Negotiations */}
      <div className="grid gap-4 md:grid-cols-2">
        {activeNegotiations.map((negotiation) => (
          <Card 
            key={negotiation.id}
            className={`glass-card border-white/10 cursor-pointer transition-all duration-200 hover:bg-white/10 ${
              activeContract === negotiation.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setActiveContract(negotiation.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{negotiation.title}</CardTitle>
                <Badge variant={negotiation.status === 'in-progress' ? 'default' : 'secondary'}>
                  {negotiation.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Version:</span>
                  <span>v{negotiation.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Changes:</span>
                  <span>{negotiation.changes} pending</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Activity:</span>
                  <span>{negotiation.lastActivity}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Negotiation Workspace */}
      <Tabs defaultValue="comparison" className="space-y-6">
        <TabsList className="glass-card border-white/10">
          <TabsTrigger value="comparison">
            <Split className="w-4 h-4 mr-2" />
            Document Comparison
          </TabsTrigger>
          <TabsTrigger value="chat">
            <MessageSquare className="w-4 h-4 mr-2" />
            Discussion
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="w-4 h-4 mr-2" />
            Version History
          </TabsTrigger>
          <TabsTrigger value="summary">
            <TrendingUp className="w-4 h-4 mr-2" />
            Summary
          </TabsTrigger>
        </TabsList>

        <TabsContent value="comparison">
          <ContractComparison contractId={activeContract} />
        </TabsContent>

        <TabsContent value="chat">
          <NegotiationChat contractId={activeContract} />
        </TabsContent>

        <TabsContent value="history">
          <VersionHistory contractId={activeContract} />
        </TabsContent>

        <TabsContent value="summary">
          <NegotiationSummary contractId={activeContract} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NegotiationInterface;
