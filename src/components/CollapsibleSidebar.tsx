
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  Layout, 
  Settings, 
  BarChart3,
  Workflow,
  Database,
  Shield,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/access/AuthProvider';
import { useAccessControl } from '@/components/access/RoleBasedAccess';

const navigationItems = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Contracts', href: '/contracts', icon: FileText },
  { name: 'Workflows', href: '/workflows', icon: Workflow },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Reports', href: '/reports', icon: Database },
  { name: 'Administration', href: '/administration', icon: Shield, requiredRoles: ['admin'] },
  { name: 'Settings', href: '/settings', icon: Settings },
];

interface CollapsibleSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const CollapsibleSidebar = ({ isCollapsed, onToggle }: CollapsibleSidebarProps) => {
  const { logout } = useAuth();
  const { userProfile, canAccess } = useAccessControl();

  const filteredNavItems = navigationItems.filter(item => 
    !item.requiredRoles || canAccess(item.requiredRoles)
  );

  return (
    <aside className={`${isCollapsed ? 'w-16' : 'w-64'} glass-card border-r border-white/10 h-full flex flex-col transition-all duration-300`}>
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
        {!isCollapsed && <h1 className="text-xl font-bold text-primary">ContractFlow</h1>}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="text-muted-foreground hover:text-foreground"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>
      
      <nav className="flex-1 p-6 overflow-y-auto">
        <div className="space-y-2">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''} ${isCollapsed ? 'justify-center px-3' : ''}`
              }
              title={isCollapsed ? item.name : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="font-medium">{item.name}</span>}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="p-6 border-t border-white/10">
        {!isCollapsed && userProfile && (
          <div className="mb-4">
            <NavLink
              to="/profile"
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <User className="w-5 h-5" />
              <div>
                <p className="text-sm font-medium">{userProfile.full_name || userProfile.email}</p>
                <p className="text-xs text-muted-foreground capitalize">{userProfile.role}</p>
              </div>
            </NavLink>
          </div>
        )}
        
        {isCollapsed && userProfile && (
          <div className="mb-4">
            <NavLink
              to="/profile"
              className="flex items-center justify-center p-2 rounded-lg hover:bg-white/5 transition-colors"
              title="Profile"
            >
              <User className="w-5 h-5" />
            </NavLink>
          </div>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={logout}
          className={`glass-card border-white/10 ${isCollapsed ? 'w-full justify-center px-3' : 'w-full'}`}
          title={isCollapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && <span className="ml-2">Logout</span>}
        </Button>
      </div>
    </aside>
  );
};

export default CollapsibleSidebar;
