
import React from 'react';
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
  Users
} from 'lucide-react';

const navigationItems = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Contracts', href: '/contracts', icon: FileText },
  { name: 'Workflows', href: '/workflows', icon: Workflow },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Reports', href: '/reports', icon: Database },
  { name: 'Administration', href: '/administration', icon: Shield },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const Sidebar = () => {
  return (
    <aside className="w-64 glass-card border-r border-white/10 h-full flex flex-col">
      <div className="p-6 border-b border-white/10">
        <h1 className="text-xl font-bold text-primary">ContractFlow</h1>
      </div>
      <nav className="flex-1 p-6 overflow-y-auto">
        <div className="space-y-2">
          {navigationItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''}`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
