
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Plus, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface ContractTagsProps {
  contractId: string;
  initialTags?: Tag[];
  onTagsChange?: (tags: Tag[]) => void;
  readonly?: boolean;
}

const ContractTags = ({ contractId, initialTags = [], onTagsChange, readonly = false }: ContractTagsProps) => {
  const [tags, setTags] = useState<Tag[]>(initialTags);
  const [newTagName, setNewTagName] = useState('');
  const [showAddTag, setShowAddTag] = useState(false);

  const predefinedTags: Tag[] = [
    { id: '1', name: 'High Priority', color: 'bg-red-500/20 text-red-300' },
    { id: '2', name: 'Legal Review', color: 'bg-blue-500/20 text-blue-300' },
    { id: '3', name: 'Vendor Contract', color: 'bg-green-500/20 text-green-300' },
    { id: '4', name: 'Employment', color: 'bg-purple-500/20 text-purple-300' },
    { id: '5', name: 'NDA', color: 'bg-yellow-500/20 text-yellow-300' },
    { id: '6', name: 'Software License', color: 'bg-indigo-500/20 text-indigo-300' }
  ];

  const addTag = (tag: Tag) => {
    if (!tags.find(t => t.id === tag.id)) {
      const newTags = [...tags, tag];
      setTags(newTags);
      onTagsChange?.(newTags);
    }
  };

  const removeTag = (tagId: string) => {
    const newTags = tags.filter(t => t.id !== tagId);
    setTags(newTags);
    onTagsChange?.(newTags);
  };

  const createCustomTag = () => {
    if (newTagName.trim()) {
      const customTag: Tag = {
        id: `custom-${Date.now()}`,
        name: newTagName.trim(),
        color: 'bg-gray-500/20 text-gray-300'
      };
      addTag(customTag);
      setNewTagName('');
      setShowAddTag(false);
    }
  };

  return (
    <Card className="glass-card border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Tag className="w-4 h-4" />
          Tags & Categories
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Current Tags */}
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag.id} className={tag.color}>
              {tag.name}
              {!readonly && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-auto p-0 hover:bg-transparent"
                  onClick={() => removeTag(tag.id)}
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </Badge>
          ))}
        </div>

        {/* Add Tags Section */}
        {!readonly && (
          <div className="space-y-2">
            {!showAddTag ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddTag(true)}
                className="glass-card border-white/10"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Tag
              </Button>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Custom tag name..."
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    className="flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && createCustomTag()}
                  />
                  <Button size="sm" onClick={createCustomTag}>Add</Button>
                  <Button variant="outline" size="sm" onClick={() => setShowAddTag(false)}>
                    Cancel
                  </Button>
                </div>
                
                {/* Predefined Tags */}
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Quick tags:</p>
                  <div className="flex flex-wrap gap-1">
                    {predefinedTags
                      .filter(tag => !tags.find(t => t.id === tag.id))
                      .map((tag) => (
                        <Button
                          key={tag.id}
                          variant="ghost"
                          size="sm"
                          className="h-auto py-1 px-2 text-xs"
                          onClick={() => addTag(tag)}
                        >
                          {tag.name}
                        </Button>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContractTags;
