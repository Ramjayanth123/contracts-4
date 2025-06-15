
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Circle, Square, Diamond } from 'lucide-react';

interface WorkflowNodeProps {
  node: any;
  onDrag: (nodeId: string, x: number, y: number) => void;
  onSelect: (node: any) => void;
  onConnect: (sourceId: string, targetId: string) => void;
  onStartConnection?: (nodeId: string) => void;
  onCompleteConnection?: (nodeId: string) => void;
  isConnecting?: boolean;
  canConnectTo?: boolean;
}

const WorkflowNode = ({ 
  node, 
  onDrag, 
  onSelect, 
  onConnect, 
  onStartConnection, 
  onCompleteConnection,
  isConnecting = false,
  canConnectTo = false
}: WorkflowNodeProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'start':
      case 'end':
        return Circle;
      case 'approval':
      case 'review':
        return Square;
      case 'conditional':
        return Diamond;
      default:
        return Circle;
    }
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'start':
        return 'text-green-500 border-green-500/30 bg-green-500/10';
      case 'approval':
        return 'text-blue-500 border-blue-500/30 bg-blue-500/10';
      case 'review':
        return 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10';
      case 'conditional':
        return 'text-purple-500 border-purple-500/30 bg-purple-500/10';
      case 'end':
        return 'text-red-500 border-red-500/30 bg-red-500/10';
      default:
        return 'text-gray-500 border-gray-500/30 bg-gray-500/10';
    }
  };

  const Icon = getNodeIcon(node.type);
  const colorClass = getNodeColor(node.type);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - node.x,
      y: e.clientY - node.y
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      onDrag(node.id, e.clientX - dragOffset.x, e.clientY - dragOffset.y);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleConnectionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canConnectTo && onCompleteConnection) {
      onCompleteConnection(node.id);
    } else if (!isConnecting && onStartConnection) {
      onStartConnection(node.id);
    }
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  return (
    <Card
      className={`absolute w-24 h-12 cursor-move border-2 transition-all duration-200 hover:scale-105 hover:shadow-lg ${colorClass} ${
        isDragging ? 'shadow-2xl scale-110' : ''
      } ${isConnecting ? 'ring-2 ring-blue-500' : ''} ${canConnectTo ? 'ring-2 ring-green-500' : ''}`}
      style={{ left: node.x, top: node.y }}
      onMouseDown={handleMouseDown}
      onClick={() => onSelect(node)}
    >
      <CardContent className="flex items-center justify-center p-2 h-full">
        <Icon className="w-4 h-4 mr-1" />
        <span className="text-xs font-medium truncate">{node.data.label}</span>
      </CardContent>
      
      {/* Connection points */}
      <div 
        className={`absolute -right-2 top-1/2 w-4 h-4 bg-primary rounded-full transform -translate-y-1/2 cursor-pointer transition-all duration-200 ${
          isConnecting || canConnectTo ? 'opacity-100 scale-110' : 'opacity-0 hover:opacity-100'
        }`}
        onClick={handleConnectionClick}
        title={canConnectTo ? 'Connect here' : isConnecting ? 'Connecting...' : 'Start connection'}
      />
      <div 
        className={`absolute -left-2 top-1/2 w-4 h-4 bg-primary rounded-full transform -translate-y-1/2 cursor-pointer transition-all duration-200 ${
          canConnectTo ? 'opacity-100 scale-110' : 'opacity-0 hover:opacity-100'
        }`}
        onClick={handleConnectionClick}
        title={canConnectTo ? 'Connect here' : 'Connection point'}
      />
    </Card>
  );
};

export default WorkflowNode;
