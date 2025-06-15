
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Folder, FolderOpen, Plus, Edit, Trash2, ChevronRight, ChevronDown, Clock, CalendarDays } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

interface FolderItem {
  id: string;
  name: string;
  type: 'folder' | 'contract';
  parentId?: string;
  contractCount?: number;
  children?: FolderItem[];
  isExpanded?: boolean;
}

interface FolderOrganizationProps {
  onFolderSelect?: (folderId: string) => void;
  selectedFolderId?: string;
}

const FolderOrganization = ({ onFolderSelect, selectedFolderId }: FolderOrganizationProps) => {
  const [folders, setFolders] = useState<FolderItem[]>([
    {
      id: '1',
      name: 'Legal Contracts',
      type: 'folder',
      contractCount: 12,
      isExpanded: true,
      children: [
        { id: '1-1', name: 'NDAs', type: 'folder', parentId: '1', contractCount: 5 },
        { id: '1-2', name: 'Employment', type: 'folder', parentId: '1', contractCount: 7 }
      ]
    },
    {
      id: '2',
      name: 'Vendor Agreements',
      type: 'folder',
      contractCount: 8,
      isExpanded: false,
      children: [
        { id: '2-1', name: 'Software Licenses', type: 'folder', parentId: '2', contractCount: 4 },
        { id: '2-2', name: 'Service Contracts', type: 'folder', parentId: '2', contractCount: 4 }
      ]
    },
    {
      id: '3',
      name: 'Partnership Deals',
      type: 'folder',
      contractCount: 3,
      isExpanded: false
    }
  ]);

  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const toggleFolder = (folderId: string) => {
    setFolders(prev => prev.map(folder => 
      folder.id === folderId 
        ? { ...folder, isExpanded: !folder.isExpanded }
        : folder
    ));
  };

  const createFolder = () => {
    if (newFolderName.trim()) {
      const newFolder: FolderItem = {
        id: `new-${Date.now()}`,
        name: newFolderName.trim(),
        type: 'folder',
        contractCount: 0,
        isExpanded: false
      };
      
      setFolders(prev => [...prev, newFolder]);
      setNewFolderName('');
      setShowNewFolder(false);
      
      toast({
        title: "Folder Created",
        description: `Created new folder: ${newFolderName.trim()}`,
      });
    }
  };

  const deleteFolder = (folderId: string, folderName: string) => {
    setFolders(prev => prev.filter(folder => folder.id !== folderId));
    toast({
      title: "Folder Deleted",
      description: `Deleted folder: ${folderName}`,
      variant: "destructive"
    });
  };

  const startEditing = (folderId: string, currentName: string) => {
    setEditingFolderId(folderId);
    setEditingName(currentName);
  };

  const saveEdit = () => {
    if (editingName.trim() && editingFolderId) {
      setFolders(prev => prev.map(folder =>
        folder.id === editingFolderId
          ? { ...folder, name: editingName.trim() }
          : folder
      ));
      setEditingFolderId(null);
      setEditingName('');
      
      toast({
        title: "Folder Renamed",
        description: `Folder renamed to: ${editingName.trim()}`,
      });
    }
  };

  const renderFolder = (folder: FolderItem, level: number = 0) => {
    const isSelected = selectedFolderId === folder.id;
    const hasChildren = folder.children && folder.children.length > 0;
    const isEditing = editingFolderId === folder.id;

    return (
      <div key={folder.id} className={`${level > 0 ? 'ml-6' : ''}`}>
        <div 
          className={`group flex items-center gap-2 p-3 rounded-lg cursor-pointer hover:bg-white/5 transition-all duration-200 ${
            isSelected ? 'bg-primary/20 border border-primary/30 shadow-sm' : 'hover:shadow-sm'
          }`}
          onClick={() => !isEditing && onFolderSelect?.(folder.id)}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {hasChildren && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-white/10"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFolder(folder.id);
                }}
              >
                {folder.isExpanded ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
              </Button>
            )}
            
            <div className="flex items-center gap-2 min-w-0">
              {folder.isExpanded ? (
                <FolderOpen className="w-4 h-4 text-yellow-400 flex-shrink-0" />
              ) : (
                <Folder className="w-4 h-4 text-yellow-400 flex-shrink-0" />
              )}
              
              {isEditing ? (
                <Input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                  onBlur={saveEdit}
                  className="h-6 text-sm bg-background/50"
                  autoFocus
                />
              ) : (
                <span className="text-sm font-medium truncate">{folder.name}</span>
              )}
            </div>
            
            {folder.contractCount !== undefined && !isEditing && (
              <Badge variant="secondary" className="ml-auto flex-shrink-0 text-xs">
                {folder.contractCount}
              </Badge>
            )}
          </div>

          {!isEditing && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-white/10"
                onClick={(e) => {
                  e.stopPropagation();
                  startEditing(folder.id, folder.name);
                }}
              >
                <Edit className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-red-500/20 hover:text-red-400"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteFolder(folder.id, folder.name);
                }}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>

        {folder.isExpanded && hasChildren && (
          <div className="mt-1">
            {folder.children?.map(child => renderFolder(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const handleSetRenewal = () => {
    toast({
      title: "Set Renewal",
      description: "Renewal settings have been configured for selected contracts",
    });
  };

  const handleBulkOrganization = () => {
    toast({
      title: "Bulk Organization",
      description: "Bulk organization options are now available",
    });
  };

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleSetRenewal}
          className="glass-card border-white/10"
        >
          <Clock className="w-4 h-4 mr-2" />
          Set Renewal
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleBulkOrganization}
          className="glass-card border-white/10"
        >
          <CalendarDays className="w-4 h-4 mr-2" />
          Bulk Organization
        </Button>
      </div>

      <Card className="glass-card border-white/10">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Folder className="w-5 h-5" />
              Folders
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNewFolder(true)}
              className="hover:bg-white/10"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Add New Folder */}
          {showNewFolder && (
            <div className="flex gap-2 p-3 rounded-lg bg-white/5 border border-white/10">
              <Input
                placeholder="Folder name..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && createFolder()}
                className="flex-1 h-8 bg-background/50"
                autoFocus
              />
              <Button size="sm" onClick={createFolder} className="h-8">Add</Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowNewFolder(false)}
                className="h-8"
              >
                Cancel
              </Button>
            </div>
          )}

          {/* Folder Tree */}
          <div className="space-y-1">
            {folders.map(folder => renderFolder(folder))}
          </div>

          {folders.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Folder className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm mb-3">No folders created yet</p>
              <Button
                variant="outline"
                size="sm"
                className="glass-card border-white/10"
                onClick={() => setShowNewFolder(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Folder
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FolderOrganization;
