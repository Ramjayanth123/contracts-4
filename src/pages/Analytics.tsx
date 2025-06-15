
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, TrendingUp, TrendingDown, Users, FileText, Clock, Target, Download, Filter, BarChart } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart as RechartsBarChart, LineChart, Bar, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useContracts } from '@/hooks/useContracts';
import { useToast } from '@/hooks/use-toast';

const Analytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('3months');
  const [kpiData, setKpiData] = useState<any[]>([]);
  const [contractVolumeData, setContractVolumeData] = useState<any[]>([]);
  const [approvalCycleData, setApprovalCycleData] = useState<any[]>([]);
  const [contractStatusData, setContractStatusData] = useState<any[]>([]);
  const [contractTypeData, setContractTypeData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { contracts } = useContracts();
  const { toast } = useToast();

  useEffect(() => {
    if (contracts.length > 0) {
      generateAnalyticsData();
    }
  }, [contracts]);

  const generateAnalyticsData = () => {
    try {
      // Generate KPI Data
      const totalContracts = contracts.length;
      const activeNegotiations = contracts.filter(c => c.status === 'negotiation').length;
      const totalValue = contracts.reduce((sum, c) => sum + (c.value || 0), 0);
      
      const kpis = [
        { title: 'Total Contracts', value: totalContracts.toLocaleString(), change: '+12%', trend: 'up', icon: FileText },
        { title: 'Active Negotiations', value: activeNegotiations.toString(), change: '+5%', trend: 'up', icon: Users },
        { title: 'Avg. Approval Time', value: '4.2 days', change: '-8%', trend: 'down', icon: Clock },
        { title: 'Contract Value', value: `$${(totalValue / 1000000).toFixed(1)}M`, change: '+15%', trend: 'up', icon: TrendingUp },
      ];
      setKpiData(kpis);

      // Generate Contract Volume Data (last 6 months)
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const volumeData = [];
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const month = monthNames[date.getMonth()];
        
        const monthContracts = contracts.filter(contract => {
          const contractDate = new Date(contract.created_at);
          return contractDate.getMonth() === date.getMonth() && contractDate.getFullYear() === date.getFullYear();
        });
        
        const contractCount = monthContracts.length;
        const monthValue = monthContracts.reduce((sum, c) => sum + (c.value || 0), 0) / 1000000;
        
        volumeData.push({ month, contracts: contractCount, value: parseFloat(monthValue.toFixed(1)) });
      }
      setContractVolumeData(volumeData);

      // Generate Contract Status Data
      const statusCounts = contracts.reduce((acc: any, contract) => {
        const status = contract.status || 'unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});
      
      const statusColors: any = {
        'active': '#3b82f6',
        'review': '#f59e0b',
        'negotiation': '#ef4444',
        'expired': '#6b7280',
        'signed': '#10b981',
        'draft': '#8b5cf6',
        'executed': '#10b981'
      };
      
      const statusData = Object.entries(statusCounts).map(([status, count]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value: count as number,
        color: statusColors[status] || '#6b7280'
      }));
      setContractStatusData(statusData);

      // Generate Contract Type Data
      const typeCounts = contracts.reduce((acc: any, contract) => {
        const type = contract.type || 'Other';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});
      
      const typeData = Object.entries(typeCounts).map(([type, count]) => ({
        type,
        count: count as number
      }));
      setContractTypeData(typeData);

      // Generate Approval Cycle Data (placeholder with realistic data)
      const approvalData = [
        { stage: 'Draft', avgDays: 1.2, target: 1.0 },
        { stage: 'Legal Review', avgDays: 3.5, target: 3.0 },
        { stage: 'Negotiation', avgDays: 8.2, target: 7.0 },
        { stage: 'Final Approval', avgDays: 2.1, target: 2.0 },
        { stage: 'Execution', avgDays: 1.0, target: 1.0 },
      ];
      setApprovalCycleData(approvalData);
      
    } catch (error: any) {
      console.error('Error generating analytics data:', error);
      toast({
        title: "Error",
        description: "Failed to generate analytics data",
        variant: "destructive",
      });
      // Set fallback data
      setKpiData([
        { title: 'Total Contracts', value: '0', change: '+0%', trend: 'up', icon: FileText },
        { title: 'Active Negotiations', value: '0', change: '+0%', trend: 'up', icon: Users },
        { title: 'Avg. Approval Time', value: '0 days', change: '+0%', trend: 'down', icon: Clock },
        { title: 'Contract Value', value: '$0', change: '+0%', trend: 'up', icon: TrendingUp },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderKPICard = (kpi: any) => (
    <Card key={kpi.title} className="glass-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{kpi.title}</p>
            <p className="text-2xl font-bold">{kpi.value}</p>
            <div className="flex items-center gap-1 mt-1">
              {kpi.trend === 'up' ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span className={`text-sm ${kpi.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {kpi.change}
              </span>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-primary/10">
            <kpi.icon className="w-6 h-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive insights into your contract management performance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map(renderKPICard)}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="glass-card">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="contracts">Contract Analysis</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="lifecycle">Lifecycle</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Contract Volume Trends */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Contract Volume Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{ contracts: { label: 'Contracts', color: '#3b82f6' } }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsBarChart data={contractVolumeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="contracts" fill="var(--color-contracts)" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Contract Status Distribution */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Contract Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{ status: { label: 'Status', color: '#3b82f6' } }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={contractStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {contractStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Approval Cycle Analysis */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Approval Cycle Performance vs Targets</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{ 
                avgDays: { label: 'Actual Days', color: '#ef4444' },
                target: { label: 'Target Days', color: '#10b981' }
              }}>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsBarChart data={approvalCycleData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="stage" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="avgDays" fill="var(--color-avgDays)" name="Actual" />
                    <Bar dataKey="target" fill="var(--color-target)" name="Target" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contracts" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Contract Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {contractTypeData.slice(0, 5).map((item, index) => (
                    <div key={item.type} className="flex items-center justify-between">
                      <span className="text-sm">{item.type}</span>
                      <Badge variant="secondary">{item.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Risk Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">High Risk</span>
                    <Badge variant="destructive">23</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Medium Risk</span>
                    <Badge className="bg-yellow-500">67</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Low Risk</span>
                    <Badge className="bg-green-500">892</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Upcoming Renewals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Next 30 days</span>
                    <Badge variant="destructive">15</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Next 60 days</span>
                    <Badge className="bg-yellow-500">32</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Next 90 days</span>
                    <Badge variant="secondary">48</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Team Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Legal Team', 'Sales Team', 'Procurement', 'Operations'].map((team) => (
                    <div key={team} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{team}</span>
                        <span className="text-sm text-muted-foreground">
                          {Math.floor(Math.random() * 40) + 60}%
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${Math.floor(Math.random() * 40) + 60}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>SLA Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { metric: 'Response Time', value: '94%', status: 'good' },
                    { metric: 'Review Completion', value: '87%', status: 'warning' },
                    { metric: 'Document Quality', value: '96%', status: 'good' },
                    { metric: 'Client Satisfaction', value: '92%', status: 'good' }
                  ].map((item) => (
                    <div key={item.metric} className="flex items-center justify-between">
                      <span className="text-sm">{item.metric}</span>
                      <Badge 
                        variant={item.status === 'good' ? 'default' : 'secondary'}
                        className={item.status === 'warning' ? 'bg-yellow-500' : ''}
                      >
                        {item.value}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="lifecycle" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Contract Lifecycle Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { stage: 'Initial Request', count: 245, percentage: 100 },
                  { stage: 'Draft Created', count: 220, percentage: 90 },
                  { stage: 'Under Review', count: 195, percentage: 80 },
                  { stage: 'In Negotiation', count: 156, percentage: 64 },
                  { stage: 'Final Approval', count: 134, percentage: 55 },
                  { stage: 'Executed', count: 128, percentage: 52 }
                ].map((stage) => (
                  <div key={stage.stage} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{stage.stage}</span>
                      <div className="flex gap-2">
                        <span className="text-sm text-muted-foreground">{stage.count}</span>
                        <span className="text-sm font-medium">{stage.percentage}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-primary to-primary/70 h-3 rounded-full transition-all duration-500" 
                        style={{ width: `${stage.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
