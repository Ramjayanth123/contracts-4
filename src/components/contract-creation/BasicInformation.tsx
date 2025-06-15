
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BasicInformationProps {
  data: any;
  onChange: (data: any) => void;
}

const BasicInformation: React.FC<BasicInformationProps> = ({ data, onChange }) => {
  const updateField = (field: string, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Basic Information</h2>
        <p className="text-muted-foreground">
          Provide the essential details for your contract
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Contract Title</Label>
          <Input
            id="title"
            placeholder="e.g., Software Development Agreement"
            value={data.title || ''}
            onChange={(e) => updateField('title', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Contract Type</Label>
          <Select value={data.type || ''} onValueChange={(value) => updateField('type', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select contract type" />
            </SelectTrigger>
            <SelectContent className="glass-card">
              <SelectItem value="nda">Non-Disclosure Agreement</SelectItem>
              <SelectItem value="service">Service Agreement</SelectItem>
              <SelectItem value="employment">Employment Contract</SelectItem>
              <SelectItem value="vendor">Vendor Agreement</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="party1">First Party</Label>
          <Input
            id="party1"
            placeholder="Your organization name"
            value={data.party1 || ''}
            onChange={(e) => updateField('party1', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="party2">Second Party</Label>
          <Input
            id="party2"
            placeholder="Counterparty name"
            value={data.party2 || ''}
            onChange={(e) => updateField('party2', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Priority Level</Label>
          <Select value={data.priority || ''} onValueChange={(value) => updateField('priority', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent className="glass-card">
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="effectiveDate">Effective Date</Label>
          <Input
            id="effectiveDate"
            type="date"
            value={data.effectiveDate || ''}
            onChange={(e) => updateField('effectiveDate', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Brief description of the contract purpose and scope..."
          rows={4}
          value={data.description || ''}
          onChange={(e) => updateField('description', e.target.value)}
        />
      </div>
    </div>
  );
};

export default BasicInformation;
