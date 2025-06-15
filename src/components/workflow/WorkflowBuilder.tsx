
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { X, Save, Play, Square, Circle, Diamond, ArrowRight } from 'lucide-react';
import WorkflowNode from './WorkflowNode';
import WorkflowCanvas from './WorkflowCanvas';
import PropertiesPanel from './PropertiesPanel';

interface WorkflowBuilderProps {
  onClose: () => void;
}

const WorkflowBuilder = ({ onClose }: WorkflowBuilderProps) => {
  const [workflowName, setWorkflowName] = useState('');
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [nodes, setNodes] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);

  const componentPalette = [
    { type: 'start', icon: Circle, label: 'Start', color: 'text-green-500' },
    { type: 'approval', icon: Square, label: 'Approval', color: 'text-blue-500' },
    { type: 'review', icon: Diamond, label: 'Review', color: 'text-yellow-500' },
    { type: 'conditional', icon: Diamond, label: 'Conditional', color: 'text-purple-500' },
    { type: 'end', icon: Circle, label: 'End', color: 'text-red-500' },
  ];

  const handleDragStart = (e: React.DragEvent, nodeType: string) => {
    e.dataTransfer.setData('nodeType', nodeType);
  };

  const handleSaveWorkflow = () => {
    // Save workflow logic
    console.log('Saving workflow:', { workflowName, nodes, connections });
  };

  const handleActivateWorkflow = () => {
    // Activate workflow logic
    console.log('Activating workflow');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Component Palette */}
      <div className="w-64 glass-card border-r border-white/10 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Components</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="workflow-name">Workflow Name</Label>
          <Input
            id="workflow-name"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            placeholder="Enter workflow name"
            className="glass-card border-white/10"
          />
        </div>

        <Separator className="bg-white/10" />

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Drag components to canvas</h4>
          {componentPalette.map((component) => (
            <div
              key={component.type}
              draggable
              onDragStart={(e) => handleDragStart(e, component.type)}
              className="flex items-center gap-3 p-3 rounded-lg glass-card border border-white/10 cursor-grab hover:bg-white/10 transition-all duration-200"
            >
              <component.icon className={`w-4 h-4 ${component.color}`} />
              <span className="text-sm">{component.label}</span>
            </div>
          ))}
        </div>

        <Separator className="bg-white/10" />

        <div className="space-y-2">
          <Button onClick={handleSaveWorkflow} className="w-full" variant="outline">
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          <Button onClick={handleActivateWorkflow} className="w-full">
            <Play className="w-4 h-4 mr-2" />
            Activate Workflow
          </Button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 flex">
        <WorkflowCanvas
          nodes={nodes}
          connections={connections}
          onNodesChange={setNodes}
          onConnectionsChange={setConnections}
          onNodeSelect={setSelectedNode}
        />
        
        {/* Properties Panel */}
        {selectedNode && (
          <PropertiesPanel
            node={selectedNode}
            onNodeUpdate={(updatedNode) => {
              setNodes(nodes.map(node => 
                node.id === updatedNode.id ? updatedNode : node
              ));
            }}
            onClose={() => setSelectedNode(null)}
          />
        )}
      </div>
    </div>
  );
};

export default WorkflowBuilder;
