
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Save } from 'lucide-react';

interface VersionChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (versionName: string, changeDescription: string) => void;
}

const VersionChangeModal = ({ isOpen, onClose, onSave }: VersionChangeModalProps) => {
  const [versionName, setVersionName] = useState('');
  const [changeDescription, setChangeDescription] = useState('');

  const handleSave = () => {
    if (versionName.trim() && changeDescription.trim()) {
      onSave(versionName, changeDescription);
      setVersionName('');
      setChangeDescription('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-white/10">
        <DialogHeader>
          <DialogTitle>Save Contract Changes</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="version-name">Version Name</Label>
            <Input
              id="version-name"
              value={versionName}
              onChange={(e) => setVersionName(e.target.value)}
              placeholder="e.g., v3.3"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="change-description">Change Description</Label>
            <Textarea
              id="change-description"
              value={changeDescription}
              onChange={(e) => setChangeDescription(e.target.value)}
              placeholder="Describe what changes were made in this version..."
              className="mt-1"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!versionName.trim() || !changeDescription.trim()}>
            <Save className="w-4 h-4 mr-2" />
            Save Version
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VersionChangeModal;
