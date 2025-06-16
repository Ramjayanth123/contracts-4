import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import KPICard from '@/components/KPICard';
import ActivityFeed from '@/components/ActivityFeed';
import ContractTrendsChart from '@/components/charts/ContractTrendsChart';
import ESignatureStorage from '@/components/signature/ESignatureStorage';
import { useAccessControl } from '@/components/access/RoleBasedAccess';
import { useContracts } from '@/hooks/useContracts';

import { FileText, Clock, CheckCircle, DollarSign } from 'lucide-react';

const Dashboard = () => {
  const { hasPermission } = useAccessControl();
  const { contracts, loading: contractsLoading } = useContracts();

  const [kpiData, setKpiData] = useState({
    totalContracts: 0,
    pendingReview: 0,
    executedThisMonth: 0,
    contractValue: 0
  });

  // Force a re-render when component mounts to ensure it loads properly
  useEffect(() => {
    // Clear any "lastVisitedPath" that could be causing redirection issues
    localStorage.setItem('lastVisitedPath', '/');
    
    // Component mounted successfully
    console.log("Dashboard mounted successfully");
  }, []);

  useEffect(() => {
    if (!contractsLoading && contracts.length > 0) {
      calculateKPIs();
    }
  }, [contracts, contractsLoading]);

  const calculateKPIs = () => {
    const totalContracts = contracts.length;
    
    // Consider any review-like status for pending review count
    const pendingReview = contracts.filter(c => 
      c.status === 'review' || 
      c.status?.includes('review') || 
      c.status?.includes('pending')
    ).length;
    
    // Calculate executed this month - consider all completed-like statuses
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const executedThisMonth = contracts.filter(c => {
      if (c.status === 'executed' || 
          c.status === 'signed' || 
          c.status?.includes('complete') ||
          c.status?.includes('execute')) {
        const contractDate = new Date(c.updated_at);
        return contractDate.getMonth() === currentMonth && contractDate.getFullYear() === currentYear;
      }
      return false;
    }).length;
    
    // Calculate total contract value
    const contractValue = contracts.reduce((total, contract) => {
      return total + (contract.value || 0);
    }, 0);
    
    setKpiData({
      totalContracts,
      pendingReview,
      executedThisMonth,
      contractValue
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Total Contracts" 
          value={contractsLoading ? "Loading..." : kpiData.totalContracts.toString()}
          change="+12%" 
          changeType="positive"
          icon={FileText}
        />
        <KPICard 
          title="Pending Review" 
          value={contractsLoading ? "Loading..." : kpiData.pendingReview.toString()}
          change="-8%" 
          changeType="negative"
          icon={Clock}
        />
        <KPICard 
          title="Executed This Month" 
          value={contractsLoading ? "Loading..." : kpiData.executedThisMonth.toString()}
          change="+15%" 
          changeType="positive"
          icon={CheckCircle}
        />
        <KPICard 
          title="Contract Value" 
          value={contractsLoading ? "Loading..." : `$${(kpiData.contractValue / 1000000).toFixed(1)}M`} 
          change="+23%" 
          changeType="positive"
          icon={DollarSign}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contract Trends Chart */}
        <ContractTrendsChart />

        {/* E-Signature Management */}
        {hasPermission('edit') && (
          <ESignatureStorage />
        )}

        {/* Activity Feed */}
        <div className="lg:col-span-2">
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
