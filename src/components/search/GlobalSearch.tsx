
import React, { useState, useEffect } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Search, FileText, Workflow, Users, Settings, BarChart, Database, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useContracts } from '@/hooks/useContracts';


const GlobalSearch = () => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { contracts } = useContracts();


  useEffect(() => {
    // Contracts will be fetched by their respective hooks
  }, []);

  const searchItems = [
    { id: 'contracts', label: 'Contracts', icon: FileText, route: '/contracts' },

    { id: 'workflows', label: 'Workflows', icon: Workflow, route: '/workflows' },
    { id: 'create-contract', label: 'Create New Contract', icon: FileText, route: '/contracts/create' },
    { id: 'analytics', label: 'Analytics Dashboard', icon: BarChart, route: '/analytics' },
    { id: 'reports', label: 'Advanced Reports', icon: Database, route: '/reports' },
    { id: 'administration', label: 'System Administration', icon: Shield, route: '/administration' },
    { id: 'settings', label: 'Settings & Configuration', icon: Settings, route: '/settings' },
  ];

  const filteredItems = searchItems.filter(item =>
    item.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredContracts = contracts.filter(contract =>
    contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (contract.counterparty && contract.counterparty.toLowerCase().includes(searchTerm.toLowerCase()))
  ).slice(0, 5); // Limit to 5 results for performance



  const handleSelect = (route: string) => {
    navigate(route);
    setOpen(false);
    setSearchTerm('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-64 justify-start text-muted-foreground glass-card">
          <Search className="w-4 h-4 mr-2" />
          Search anything...
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0 glass-card" align="start">
        <Command>
          <CommandInput 
            placeholder="Search..." 
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {filteredContracts.length > 0 && (
              <CommandGroup heading="Contracts">
                {filteredContracts.map((contract) => (
                  <CommandItem
                    key={contract.id}
                    onSelect={() => handleSelect(`/contracts/${contract.id}`)}
                    className="flex items-center space-x-2 p-2 hover:bg-accent cursor-pointer"
                  >
                    <FileText className="h-4 w-4 text-blue-600" />
                    <div>
                      <div className="font-medium">{contract.title}</div>
                      <div className="text-sm text-muted-foreground">{contract.id}</div>
                      {contract.counterparty && (
                        <div className="text-xs text-muted-foreground">{contract.counterparty}</div>
                      )}
                    </div>
                  </CommandItem>
                ))}

              </CommandGroup>
            )}
            <CommandGroup heading="Navigation">
              {filteredItems.map((item) => (
                <CommandItem
                  key={item.id}
                  onSelect={() => handleSelect(item.route)}
                  className="cursor-pointer"
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default GlobalSearch;
