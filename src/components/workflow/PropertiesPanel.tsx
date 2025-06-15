
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';

interface PropertiesPanelProps {
  node: any;
  onNodeUpdate: (node: any) => void;
  onClose: () => void;
}

const PropertiesPanel = ({ node, onNodeUpdate, onClose }: PropertiesPanelProps) => {
  const [nodeData, setNodeData] = useState(node.data);

  const handleUpdate = (field: string, value: any) => {
    const updatedData = { ...nodeData, [field]: value };
    setNodeData(updatedData);
    onNodeUpdate({ ...node, data: updatedData });
  };

  const renderNodeSpecificFields = () => {
    switch (node.type) {
      case 'approval':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="approver">Approver Role</Label>
              <Select onValueChange={(value) => handleUpdate('approver', value)}>
                <SelectTrigger className="glass-card border-white/10">
                  <SelectValue placeholder="Select approver role" />
                </SelectTrigger>
                <SelectContent className="glass-card border-white/10">
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="director">Director</SelectItem>
                  <SelectItem value="legal">Legal Team</SelectItem>
                  <SelectItem value="finance">Finance Team</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="deadline">Deadline (hours)</Label>
              <Input
                id="deadline"
                type="number"
                placeholder="24"
                className="glass-card border-white/10"
                onChange={(e) => handleUpdate('deadline', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="escalation">Escalation Rule</Label>
              <Select onValueChange={(value) => handleUpdate('escalation', value)}>
                <SelectTrigger className="glass-card border-white/10">
                  <SelectValue placeholder="Select escalation rule" />
                </SelectTrigger>
                <SelectContent className="glass-card border-white/10">
                  <SelectItem value="auto">Auto-escalate</SelectItem>
                  <SelectItem value="manual">Manual escalation</SelectItem>
                  <SelectItem value="none">No escalation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      
      case 'conditional':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="condition">Condition</Label>
              <Select onValueChange={(value) => handleUpdate('condition', value)}>
                <SelectTrigger className="glass-card border-white/10">
                  <SelectValue placeholder="Select condition type" />
                </SelectTrigger>
                <SelectContent className="glass-card border-white/10">
                  <SelectItem value="amount">Contract Amount</SelectItem>
                  <SelectItem value="type">Contract Type</SelectItem>
                  <SelectItem value="duration">Contract Duration</SelectItem>
                  <SelectItem value="custom">Custom Field</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="operator">Operator</Label>
              <Select onValueChange={(value) => handleUpdate('operator', value)}>
                <SelectTrigger className="glass-card border-white/10">
                  <SelectValue placeholder="Select operator" />
                </SelectTrigger>
                <SelectContent className="glass-card border-white/10">
                  <SelectItem value="equals">Equals</SelectItem>
                  <SelectItem value="greater">Greater than</SelectItem>
                  <SelectItem value="less">Less than</SelectItem>
                  <SelectItem value="contains">Contains</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="value">Value</Label>
              <Input
                id="value"
                placeholder="Enter value"
                className="glass-card border-white/10"
                onChange={(e) => handleUpdate('value', e.target.value)}
              />
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="w-80 glass-card border-l border-white/10 p-4 space-y-4 overflow-y-auto">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Node Properties</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="label">Label</Label>
          <Input
            id="label"
            value={nodeData.label || ''}
            onChange={(e) => handleUpdate('label', e.target.value)}
            className="glass-card border-white/10"
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={nodeData.description || ''}
            onChange={(e) => handleUpdate('description', e.target.value)}
            className="glass-card border-white/10"
            rows={3}
          />
        </div>

        {renderNodeSpecificFields()}
      </div>
    </div>
  );
};

export default PropertiesPanel;
