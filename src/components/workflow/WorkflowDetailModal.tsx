
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Edit, Settings } from 'lucide-react';
import WorkflowCanvas from './WorkflowCanvas';

interface WorkflowDetailModalProps {
  workflow: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WorkflowDetailModal = ({ workflow, open, onOpenChange }: WorkflowDetailModalProps) => {
  const [nodes, setNodes] = useState([
    {
      id: 'start-1',
      type: 'start',
      x: 100,
      y: 100,
      data: { label: 'Start' }
    },
    {
      id: 'approval-1',
      type: 'approval',
      x: 300,
      y: 100,
      data: { label: 'Legal Review' }
    },
    {
      id: 'conditional-1',
      type: 'conditional',
      x: 500,
      y: 100,
      data: { label: 'Budget Check' }
    },
    {
      id: 'approval-2',
      type: 'approval',
      x: 700,
      y: 50,
      data: { label: 'Final Approval' }
    },
    {
      id: 'end-1',
      type: 'end',
      x: 900,
      y: 100,
      data: { label: 'Complete' }
    }
  ]);

  const [connections, setConnections] = useState([
    { source: 'start-1', target: 'approval-1' },
    { source: 'approval-1', target: 'conditional-1' },
    { source: 'conditional-1', target: 'approval-2' },
    { source: 'approval-2', target: 'end-1' }
  ]);

  const [selectedNode, setSelectedNode] = useState<any>(null);

  if (!workflow) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[80vh] glass-card">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">{workflow.title}</DialogTitle>
              <Badge variant={workflow.status === 'active' ? 'default' : 'secondary'}>
                {workflow.status}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Configure
              </Button>
              <Button size="sm">
                <Play className="w-4 h-4 mr-2" />
                Execute
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 min-h-0 border rounded-lg">
          <WorkflowCanvas
            nodes={nodes}
            connections={connections}
            onNodesChange={setNodes}
            onConnectionsChange={setConnections}
            onNodeSelect={setSelectedNode}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WorkflowDetailModal;
