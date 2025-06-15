
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useContracts } from '@/hooks/useContracts';
import { useToast } from '@/hooks/use-toast';

interface ChartData {
  month: string;
  created: number;
  executed: number;
  pending: number;
}

const ContractTrendsChart = () => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const { contracts } = useContracts();
  const { toast } = useToast();

  useEffect(() => {
    if (contracts.length > 0) {
      generateChartData();
    }
  }, [contracts]);

  const generateChartData = () => {
    try {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentYear = new Date().getFullYear();
      const data: ChartData[] = [];

      // Generate data for the last 6 months
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();

        const monthContracts = contracts.filter(contract => {
          const contractDate = new Date(contract.created_at);
          return contractDate.getMonth() === date.getMonth() && contractDate.getFullYear() === year;
        });

        const created = monthContracts.length;
        const executed = monthContracts.filter(c => c.status === 'executed' || c.status === 'signed').length;
        const pending = monthContracts.filter(c => c.status === 'review' || c.status === 'draft').length;

        data.push({ month, created, executed, pending });
      }

      setChartData(data);
    } catch (error: any) {
      console.error('Error generating chart data:', error);
      toast({
        title: "Error",
        description: "Failed to generate chart data",
        variant: "destructive",
      });
      // Fallback to placeholder data
      setChartData([
        { month: 'Jan', created: 12, executed: 8, pending: 4 },
        { month: 'Feb', created: 15, executed: 11, pending: 4 },
        { month: 'Mar', created: 18, executed: 14, pending: 4 },
        { month: 'Apr', created: 22, executed: 16, pending: 6 },
        { month: 'May', created: 25, executed: 19, pending: 6 },
        { month: 'Jun', created: 28, executed: 22, pending: 6 },
      ]);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Card className="glass-card border-white/10">
      <CardHeader>
        <CardTitle>Contract Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="month" 
                className="text-xs"
                tick={{ fill: 'currentColor' }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fill: 'currentColor' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="created" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Created"
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="executed" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Executed"
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="pending" 
                stroke="#f59e0b" 
                strokeWidth={2}
                name="Pending"
                dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContractTrendsChart;
