
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Search, Filter, X, Calendar, Building, FileText } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-picker';

interface SearchFilters {
  searchTerm: string;
  contractType: string;
  status: string;
  counterparty: string;
  dateRange: {
    from?: Date;
    to?: Date;
  };
  tags: string[];
  valueRange: {
    min?: number;
    max?: number;
  };
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onClear: () => void;
}

const AdvancedSearch = ({ onSearch, onClear }: AdvancedSearchProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: '',
    contractType: '',
    status: '',
    counterparty: '',
    dateRange: {},
    tags: [],
    valueRange: {}
  });

  const contractTypes = [
    'Software License',
    'Service Agreement',
    'Employment',
    'NDA',
    'Maintenance Contract',
    'Partnership Agreement'
  ];

  const statuses = [
    'draft',
    'under-review',
    'approved',
    'executed',
    'expired'
  ];

  const counterparties = [
    'TechCorp Inc.',
    'DataSoft Solutions',
    'Global Services Ltd.',
    'Acme Corp',
    'MaintenancePro',
    'Startup Innovations'
  ];

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    onSearch(filters);
    console.log('Searching with filters:', filters);
  };

  const handleClear = () => {
    setFilters({
      searchTerm: '',
      contractType: '',
      status: '',
      counterparty: '',
      dateRange: {},
      tags: [],
      valueRange: {}
    });
    onClear();
    setIsExpanded(false);
  };

  const hasActiveFilters = Object.values(filters).some(value => {
    if (typeof value === 'string') return value !== '';
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(v => v !== undefined && v !== '');
    }
    return false;
  });

  return (
    <Card className="glass-card border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Advanced Search
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <Filter className="w-4 h-4 mr-2" />
            {isExpanded ? 'Simple' : 'Advanced'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Search */}
        <div className="flex gap-2">
          <Input
            placeholder="Search contracts, parties, or content..."
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleSearch}>
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>

        {/* Advanced Filters */}
        {isExpanded && (
          <div className="space-y-4 pt-4 border-t border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Contract Type</Label>
                <Select value={filters.contractType} onValueChange={(value) => handleFilterChange('contractType', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    {contractTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Status</Label>
                <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    {statuses.map(status => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Counterparty</Label>
                <Select value={filters.counterparty} onValueChange={(value) => handleFilterChange('counterparty', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="All parties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Parties</SelectItem>
                    {counterparties.map(party => (
                      <SelectItem key={party} value={party}>{party}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Value Range</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    placeholder="Min"
                    type="number"
                    value={filters.valueRange.min || ''}
                    onChange={(e) => handleFilterChange('valueRange', { 
                      ...filters.valueRange, 
                      min: e.target.value ? Number(e.target.value) : undefined 
                    })}
                  />
                  <Input
                    placeholder="Max"
                    type="number"
                    value={filters.valueRange.max || ''}
                    onChange={(e) => handleFilterChange('valueRange', { 
                      ...filters.valueRange, 
                      max: e.target.value ? Number(e.target.value) : undefined 
                    })}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSearch} className="flex-1">
                Apply Filters
              </Button>
              {hasActiveFilters && (
                <Button variant="outline" onClick={handleClear}>
                  <X className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="pt-2 border-t border-white/10">
            <div className="flex flex-wrap gap-2">
              {filters.contractType && (
                <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
                  Type: {filters.contractType}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => handleFilterChange('contractType', '')}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
              {filters.status && (
                <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs">
                  Status: {filters.status.replace('-', ' ')}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => handleFilterChange('status', '')}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
              {filters.counterparty && (
                <div className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
                  Party: {filters.counterparty}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => handleFilterChange('counterparty', '')}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdvancedSearch;
