
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Clock, Users, FileText, CheckCircle, AlertTriangle } from 'lucide-react';

interface NegotiationSummaryProps {
  contractId: string;
}

const NegotiationSummary = ({ contractId }: NegotiationSummaryProps) => {
  const summaryData = {
    overallProgress: 75,
    totalChanges: 23,
    acceptedChanges: 17,
    pendingChanges: 6,
    rejectedChanges: 0,
    timeSpent: '2 days 4 hours',
    participantsCount: 4,
    versionsCount: 8,
    keyMetrics: [
      { label: 'Payment Terms', status: 'agreed', progress: 100 },
      { label: 'Scope of Work', status: 'in-progress', progress: 60 },
      { label: 'Termination Clause', status: 'pending', progress: 20 },
      { label: 'Liability Terms', status: 'agreed', progress: 100 },
      { label: 'Confidentiality', status: 'agreed', progress: 100 }
    ],
    timeline: [
      { date: '2024-06-11', event: 'Initial draft shared', type: 'milestone' },
      { date: '2024-06-12', event: '8 changes proposed by TechCorp', type: 'activity' },
      { date: '2024-06-12', event: 'Legal review completed', type: 'milestone' },
      { date: '2024-06-13', event: '5 changes accepted', type: 'activity' },
      { date: '2024-06-13', event: 'Payment terms finalized', type: 'milestone' }
    ]
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agreed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'in-progress':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'pending':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Overview Cards */}
      <div className="lg:col-span-2 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="glass-card border-white/10">
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{summaryData.acceptedChanges}</div>
              <div className="text-xs text-muted-foreground">Accepted Changes</div>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/10">
            <CardContent className="p-4 text-center">
              <Clock className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{summaryData.pendingChanges}</div>
              <div className="text-xs text-muted-foreground">Pending Changes</div>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/10">
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{summaryData.participantsCount}</div>
              <div className="text-xs text-muted-foreground">Participants</div>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/10">
            <CardContent className="p-4 text-center">
              <FileText className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{summaryData.versionsCount}</div>
              <div className="text-xs text-muted-foreground">Versions</div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Overview */}
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Negotiation Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>{summaryData.overallProgress}%</span>
              </div>
              <Progress value={summaryData.overallProgress} className="h-2" />
            </div>

            <div className="space-y-3">
              {summaryData.keyMetrics.map((metric, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{metric.label}</span>
                    <Badge className={`${getStatusColor(metric.status)} border text-xs`}>
                      {metric.status}
                    </Badge>
                  </div>
                  <Progress value={metric.progress} className="h-1" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-lg">Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {summaryData.timeline.map((item, index) => (
              <div key={index} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-2 h-2 rounded-full ${
                    item.type === 'milestone' ? 'bg-primary' : 'bg-muted-foreground'
                  }`} />
                  {index < summaryData.timeline.length - 1 && (
                    <div className="w-px h-8 bg-border mt-2" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="text-sm font-medium">{item.event}</div>
                  <div className="text-xs text-muted-foreground">{item.date}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NegotiationSummary;
