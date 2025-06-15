
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Workflow, Clock, CheckCircle, AlertCircle, Users, Eye, Edit, Settings, Play } from 'lucide-react';
import WorkflowBuilder from '@/components/workflow/WorkflowBuilder';
import ApprovalDashboard from '@/components/approval/ApprovalDashboard';
import NegotiationInterface from '@/components/negotiation/NegotiationInterface';
import CollaborationPanel from '@/components/collaboration/CollaborationPanel';
import WorkflowDetailModal from '@/components/workflow/WorkflowDetailModal';
import CreateWorkspaceModal from '@/components/workspace/CreateWorkspaceModal';
import { toast } from '@/hooks/use-toast';

const Workflows = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showWorkflowBuilder, setShowWorkflowBuilder] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<any>(null);
  const [showWorkflowDetail, setShowWorkflowDetail] = useState(false);
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [workspaces] = useState([
    { id: '1', name: 'SRM Legal Practice', description: 'Legal practice workspace', members: 5, created: '2024-01-15' }
  ]);

  const workflowStats = [
    { title: 'Active Workflows', value: '12', icon: Workflow, color: 'text-blue-500', filter: 'active' },
    { title: 'Pending Approvals', value: '8', icon: Clock, color: 'text-yellow-500', filter: 'pending' },
    { title: 'Completed Today', value: '24', icon: CheckCircle, color: 'text-green-500', filter: 'completed' },
    { title: 'Overdue', value: '3', icon: AlertCircle, color: 'text-red-500', filter: 'overdue' },
  ];

  const allContracts = [
    { id: 'SLA-2024-001', name: 'Software License Agreement', status: 'active', type: 'approval' },
    { id: 'VA-2024-042', name: 'Vendor Service Agreement', status: 'pending', type: 'approval' },
    { id: 'SC-2023-089', name: 'Maintenance Contract', status: 'completed', type: 'approval' },
    { id: 'NDA-2024-018', name: 'Non-Disclosure Agreement', status: 'overdue', type: 'approval' },
    { id: 'EMP-2024-003', name: 'Employment Contract', status: 'active', type: 'workflow' },
  ];

  const activeWorkflows = [
    {
      id: '1',
      title: 'Contract Approval Workflow',
      description: 'Standard workflow for contract approvals',
      status: 'active',
      steps: 5,
      completedSteps: 3
    },
    {
      id: '2',
      title: 'Vendor Onboarding',
      description: 'Process for new vendor registration',
      status: 'active',
      steps: 7,
      completedSteps: 2
    }
  ];

  const handleWorkflowClick = (workflow: any) => {
    setSelectedWorkflow(workflow);
    setShowWorkflowDetail(true);
  };

  const handleStatClick = (filter: string) => {
    setSelectedFilter(filter);
  };

  const handleWorkspaceCreate = () => {
    setShowCreateWorkspace(true);
  };

  const handleWorkflowAction = (action: string, workflowId: string) => {
    toast({
      title: `Workflow ${action}`,
      description: `${action} action performed on workflow ${workflowId}`,
    });
  };

  const getFilteredContracts = () => {
    if (!selectedFilter) return allContracts;
    return allContracts.filter(contract => contract.status === selectedFilter);
  };

  if (showWorkflowBuilder) {
    return <WorkflowBuilder onClose={() => setShowWorkflowBuilder(false)} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workflow Management</h1>
          <p className="text-muted-foreground">Manage approvals, negotiations, and collaboration</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={handleWorkspaceCreate}
            className="glass-hover"
          >
            <Users className="w-4 h-4 mr-2" />
            Create Workspace
          </Button>
          <Button onClick={() => setShowWorkflowBuilder(true)} className="glass-hover">
            <Plus className="w-4 h-4 mr-2" />
            Create Workflow
          </Button>
        </div>
      </div>

      {/* Workspace Demo */}
      {workspaces.length > 0 && (
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle>Active Workspaces</CardTitle>
            <CardDescription>Your created workspaces</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {workspaces.map((workspace) => (
                <div key={workspace.id} className="p-4 rounded-lg glass-card border border-white/10">
                  <h3 className="font-semibold">{workspace.name}</h3>
                  <p className="text-sm text-muted-foreground">{workspace.description}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-muted-foreground">{workspace.members} members</span>
                    <span className="text-xs text-muted-foreground">Created: {workspace.created}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {workflowStats.map((stat) => (
          <Card 
            key={stat.title} 
            className="glass-card hover:bg-white/10 transition-all duration-300 cursor-pointer"
            onClick={() => handleStatClick(stat.filter)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filtered Contracts */}
      {selectedFilter && (
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle>
              {workflowStats.find(s => s.filter === selectedFilter)?.title} Contracts
            </CardTitle>
            <CardDescription>
              Contracts matching the selected filter
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getFilteredContracts().map((contract) => (
                <div key={contract.id} className="flex items-center justify-between p-3 rounded-lg glass-card border border-white/10">
                  <div>
                    <h4 className="font-medium">{contract.name}</h4>
                    <p className="text-sm text-muted-foreground">{contract.id}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            {getFilteredContracts().length === 0 && (
              <p className="text-muted-foreground text-center py-8">No contracts found for this filter.</p>
            )}
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Active Workflows</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {activeWorkflows.map((workflow) => (
            <Card 
              key={workflow.id}
              className="glass-card border-white/10 cursor-pointer transition-all duration-200 hover:bg-white/10"
              onClick={() => handleWorkflowClick(workflow)}
            >
              <CardHeader>
                <CardTitle className="text-lg">{workflow.title}</CardTitle>
                <CardDescription>{workflow.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">
                    {workflow.completedSteps}/{workflow.steps} steps completed
                  </span>
                  <div className="w-20 bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(workflow.completedSteps / workflow.steps) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleWorkflowAction('Edit', workflow.id);
                    }}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleWorkflowAction('Configure', workflow.id);
                    }}
                  >
                    <Settings className="w-4 h-4 mr-1" />
                    Configure
                  </Button>
                  <Button 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleWorkflowAction('Execute', workflow.id);
                    }}
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Execute
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="glass-card border-white/10">
          <TabsTrigger value="dashboard">Approval Dashboard</TabsTrigger>
          <TabsTrigger value="negotiation">Contract Negotiation</TabsTrigger>
          <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <ApprovalDashboard />
        </TabsContent>

        <TabsContent value="negotiation" className="space-y-6">
          <NegotiationInterface />
        </TabsContent>

        <TabsContent value="collaboration" className="space-y-6">
          <CollaborationPanel />
        </TabsContent>
      </Tabs>

      <WorkflowDetailModal
        workflow={selectedWorkflow}
        open={showWorkflowDetail}
        onOpenChange={setShowWorkflowDetail}
      />

      <CreateWorkspaceModal
        open={showCreateWorkspace}
        onOpenChange={setShowCreateWorkspace}
      />
    </div>
  );
};

export default Workflows;
