
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Download, 
  Share2, 
  Eye, 
  Edit, 
  ChevronDown,
  Calendar,
  DollarSign,
  Building,
  MoreHorizontal,
  Plus,
  FolderOpen,
  Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import StatusBadge from '@/components/StatusBadge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Import new components
import ExpiryNotifications from '@/components/notifications/ExpiryNotifications';
import AdvancedSearch from '@/components/search/AdvancedSearch';
import FolderOrganization from '@/components/organization/FolderOrganization';
import { AccessControlProvider, useAccessControl } from '@/components/access/RoleBasedAccess';
import { useContracts } from '@/hooks/useContracts';

// Using database contracts instead of mock data

const ContractsContent = () => {
  const [selectedContracts, setSelectedContracts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const { contracts, loading } = useContracts();
  const [filteredContracts, setFilteredContracts] = useState(contracts);
  const navigate = useNavigate();
  const { hasPermission, canEdit, canDelete } = useAccessControl();
  
  // Contracts are automatically fetched by the useContracts hook
  
  useEffect(() => {
    setFilteredContracts(contracts);
  }, [contracts]);
  
  const handleSelectContract = (contractId: string) => {
    setSelectedContracts(prev => 
      prev.includes(contractId) 
        ? prev.filter(id => id !== contractId)
        : [...prev, contractId]
    );
  };

  const handleSelectAll = () => {
    setSelectedContracts(
      selectedContracts.length === contracts.length ? [] : contracts.map(c => c.id)
    );
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleAdvancedSearch = (filters: any) => {
    let filtered = contracts;

    // Apply search term
    if (filters.searchTerm) {
      filtered = filtered.filter(contract =>
        contract.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        (contract.counterparty && contract.counterparty.toLowerCase().includes(filters.searchTerm.toLowerCase())) ||
        (contract.contract_type && contract.contract_type.toLowerCase().includes(filters.searchTerm.toLowerCase()))
      );
    }

    // Apply other filters
    if (filters.contractType) {
      filtered = filtered.filter(contract => contract.contract_type === filters.contractType);
    }

    if (filters.status) {
      filtered = filtered.filter(contract => contract.status === filters.status);
    }

    if (filters.counterparty) {
      filtered = filtered.filter(contract => 
        contract.counterparty && contract.counterparty.includes(filters.counterparty)
      );
    }

    setFilteredContracts(filtered);
  };

  const handleFolderSelect = (folderId: string) => {
    setSelectedFolderId(folderId);
    const folderContracts = contracts.filter(contract => contract.folderId === folderId);
    setFilteredContracts(folderContracts);
  };

  const handleExport = () => {
    if (!hasPermission('download')) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to export contracts.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Export Started",
      description: `Exporting ${selectedContracts.length} contract(s)...`,
    });
  };

  const handleShare = () => {
    toast({
      title: "Share Link Generated",
      description: `Share link generated for ${selectedContracts.length} contract(s)`,
    });
  };

  const handleDownloadPDF = (contractId: string) => {
    toast({
      title: "Download Started",
      description: `Downloading PDF for contract ${contractId}`,
    });
  };

  const handleDuplicate = (contractId: string) => {
    toast({
      title: "Contract Duplicated",
      description: `Contract ${contractId} has been duplicated`,
    });
  };

  // Apply basic filters to the state-managed filteredContracts
  const displayedContracts = filteredContracts.filter(contract => {
    const matchesSearch = contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contract.counterparty && contract.counterparty.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (contract.contract_type && contract.contract_type.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'All Statuses' || contract.status === statusFilter.toLowerCase().replace(' ', '-');
    const matchesType = typeFilter === 'All Types' || contract.contract_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contract Repository</h1>
          <p className="text-muted-foreground mt-1">
            Manage and organize all your contracts
          </p>
        </div>
        {hasPermission('create') && (
          <Button className="bg-primary hover:bg-primary/90" onClick={() => navigate('/contracts/create')}>
            <Plus className="w-4 h-4 mr-2" />
            Create New Contract
          </Button>
        )}
      </div>

      {/* Notifications and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ExpiryNotifications />
        </div>
        <div className="space-y-4">
          <Button variant="outline" className="w-full glass-card border-white/10">
            <Bell className="w-4 h-4 mr-2" />
            Set Renewal Alerts
          </Button>
          <Button variant="outline" className="w-full glass-card border-white/10">
            <FolderOpen className="w-4 h-4 mr-2" />
            Bulk Organization
          </Button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <FolderOrganization 
            onFolderSelect={handleFolderSelect}
            selectedFolderId={selectedFolderId}
          />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Advanced Search */}
          <AdvancedSearch 
            onSearch={handleAdvancedSearch}
            onClear={() => setFilteredContracts(contracts)}
          />

          {/* Bulk Actions */}
          {selectedContracts.length > 0 && (
            <div className="glass-card rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {selectedContracts.length} contract(s) selected
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="glass-card border-white/10" onClick={handleExport}>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  {hasPermission('share') && (
                    <Button variant="outline" size="sm" className="glass-card border-white/10">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Contracts Table */}
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="p-4 text-left">
                      <Checkbox 
                        checked={selectedContracts.length === displayedContracts.length}
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    <th className="p-4 text-left font-semibold">Contract Name</th>
                    <th className="p-4 text-left font-semibold">Parties</th>
                    <th className="p-4 text-left font-semibold">Type</th>
                    <th className="p-4 text-left font-semibold">Status</th>
                    <th className="p-4 text-left font-semibold">Created</th>
                    <th className="p-4 text-left font-semibold">Expiry</th>
                    <th className="p-4 text-left font-semibold">Value</th>
                    <th className="p-4 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedContracts.map((contract) => (
                    <tr 
                      key={contract.id} 
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="p-4">
                        <Checkbox 
                          checked={selectedContracts.includes(contract.id)}
                          onCheckedChange={() => handleSelectContract(contract.id)}
                        />
                      </td>
                      <td className="p-4">
                        <Link 
                          to={`/contracts/${contract.id}`}
                          className="font-medium text-primary hover:text-primary/80 transition-colors"
                        >
                          {contract.title}
                        </Link>
                        <div className="text-xs text-muted-foreground mt-1">
                          {contract.id}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          {contract.counterparty && (
                            <div className="text-sm">
                              {contract.counterparty}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-medium">{contract.contract_type}</span>
                      </td>
                      <td className="p-4">
                        <StatusBadge status={contract.status} />
                      </td>
                      <td className="p-4">
                        <div className="text-sm">{new Date(contract.created_at).toLocaleDateString()}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">{contract.end_date ? new Date(contract.end_date).toLocaleDateString() : 'N/A'}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-medium">
                          {contract.value ? `${contract.currency || '$'}${contract.value.toLocaleString()}` : 'N/A'}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/contracts/${contract.id}`}>
                              <Eye className="w-4 h-4" />
                            </Link>
                          </Button>
                          {canEdit && (
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="glass-card border-white/10">
                              {hasPermission('download') && (
                                <DropdownMenuItem>
                                  <Download className="w-4 h-4 mr-2" />
                                  Download PDF
                                </DropdownMenuItem>
                              )}
                              {hasPermission('share') && (
                                <DropdownMenuItem>
                                  <Share2 className="w-4 h-4 mr-2" />
                                  Share Link
                                </DropdownMenuItem>
                              )}
                              {canEdit && (
                                <DropdownMenuItem>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Duplicate
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Contracts = () => {
  return (
    <AccessControlProvider>
      <ContractsContent />
    </AccessControlProvider>
  );
};

export default Contracts;
