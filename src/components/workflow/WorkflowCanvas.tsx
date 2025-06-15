
import React, { useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import WorkflowNode from './WorkflowNode';

interface WorkflowCanvasProps {
  nodes: any[];
  connections: any[];
  onNodesChange: (nodes: any[]) => void;
  onConnectionsChange: (connections: any[]) => void;
  onNodeSelect: (node: any) => void;
}

const WorkflowCanvas = ({ 
  nodes, 
  connections, 
  onNodesChange, 
  onConnectionsChange, 
  onNodeSelect 
}: WorkflowCanvasProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [connectingNode, setConnectingNode] = useState<string | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<number | null>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const nodeType = e.dataTransfer.getData('nodeType');
    const rect = canvasRef.current?.getBoundingClientRect();
    
    if (rect) {
      const x = e.clientX - rect.left - 50;
      const y = e.clientY - rect.top - 25;
      
      const newNode = {
        id: `${nodeType}-${Date.now()}`,
        type: nodeType,
        x: Math.max(0, x),
        y: Math.max(0, y),
        data: {
          label: nodeType.charAt(0).toUpperCase() + nodeType.slice(1),
          config: {}
        }
      };
      
      onNodesChange([...nodes, newNode]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleNodeDrag = (nodeId: string, newX: number, newY: number) => {
    onNodesChange(nodes.map(node => 
      node.id === nodeId ? { ...node, x: newX, y: newY } : node
    ));
  };

  const handleNodeConnect = (sourceId: string, targetId: string) => {
    if (sourceId === targetId) return;
    
    const existingConnection = connections.find(
      conn => (conn.source === sourceId && conn.target === targetId) ||
              (conn.source === targetId && conn.target === sourceId)
    );
    
    if (!existingConnection) {
      const newConnection = { source: sourceId, target: targetId };
      onConnectionsChange([...connections, newConnection]);
    }
  };

  const handleStartConnection = (nodeId: string) => {
    setConnectingNode(nodeId);
  };

  const handleCompleteConnection = (targetNodeId: string) => {
    if (connectingNode && connectingNode !== targetNodeId) {
      handleNodeConnect(connectingNode, targetNodeId);
    }
    setConnectingNode(null);
  };

  const handleConnectionClick = (index: number, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedConnection(selectedConnection === index ? null : index);
  };

  const deleteConnection = (index: number) => {
    const newConnections = connections.filter((_, i) => i !== index);
    onConnectionsChange(newConnections);
    setSelectedConnection(null);
  };

  const getConnectionPath = (sourceNode: any, targetNode: any) => {
    const sourceX = sourceNode.x + 96;
    const sourceY = sourceNode.y + 24;
    const targetX = targetNode.x;
    const targetY = targetNode.y + 24;
    
    const midX = (sourceX + targetX) / 2;
    
    return `M ${sourceX} ${sourceY} Q ${midX} ${sourceY} ${midX} ${(sourceY + targetY) / 2} Q ${midX} ${targetY} ${targetX} ${targetY}`;
  };

  return (
    <div className="flex-1 relative">
      <div
        ref={canvasRef}
        className="w-full h-full bg-gradient-to-br from-background to-muted/20 relative overflow-hidden"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => setSelectedConnection(null)}
        style={{ 
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      >
        <svg className="absolute inset-0 pointer-events-none w-full h-full">
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="hsl(var(--primary))"
              />
            </marker>
            <marker
              id="arrowhead-selected"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="hsl(var(--destructive))"
              />
            </marker>
          </defs>
          
          {connections.map((connection, index) => {
            const sourceNode = nodes.find(n => n.id === connection.source);
            const targetNode = nodes.find(n => n.id === connection.target);
            
            if (!sourceNode || !targetNode) return null;
            
            const isSelected = selectedConnection === index;
            const path = getConnectionPath(sourceNode, targetNode);
            
            return (
              <g key={index}>
                <path
                  d={path}
                  stroke={isSelected ? "hsl(var(--destructive))" : "hsl(var(--primary))"}
                  strokeWidth="3"
                  fill="none"
                  markerEnd={`url(#${isSelected ? 'arrowhead-selected' : 'arrowhead'})`}
                  className="cursor-pointer drop-shadow-sm pointer-events-auto"
                  onClick={(e) => handleConnectionClick(index, e)}
                />
                {isSelected && (
                  <foreignObject
                    x={(sourceNode.x + targetNode.x + 96) / 2 - 15}
                    y={(sourceNode.y + targetNode.y + 24) / 2 - 15}
                    width="30"
                    height="30"
                  >
                    <Button
                      size="icon"
                      variant="destructive"
                      className="w-6 h-6 pointer-events-auto"
                      onClick={() => deleteConnection(index)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </foreignObject>
                )}
              </g>
            );
          })}
          
          {connectingNode && (
            <line
              x1={nodes.find(n => n.id === connectingNode)?.x + 96 || 0}
              y1={nodes.find(n => n.id === connectingNode)?.y + 24 || 0}
              x2={nodes.find(n => n.id === connectingNode)?.x + 150 || 50}
              y2={nodes.find(n => n.id === connectingNode)?.y + 24 || 0}
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          )}
        </svg>

        {nodes.map(node => (
          <WorkflowNode
            key={node.id}
            node={node}
            onDrag={handleNodeDrag}
            onSelect={onNodeSelect}
            onConnect={handleNodeConnect}
            onStartConnection={handleStartConnection}
            onCompleteConnection={handleCompleteConnection}
            isConnecting={connectingNode === node.id}
            canConnectTo={connectingNode !== null && connectingNode !== node.id}
          />
        ))}

        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Card className="glass-card p-8 text-center">
              <h3 className="text-lg font-semibold mb-2">Start Building Your Workflow</h3>
              <p className="text-muted-foreground">
                Drag components from the palette to begin creating your workflow
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowCanvas;
