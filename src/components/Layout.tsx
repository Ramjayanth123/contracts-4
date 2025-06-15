
import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import CollapsibleSidebar from './CollapsibleSidebar';
import Header from './Header';

const Layout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();
  
  // Auto-collapse sidebar when viewing contract details
  const isContractDetail = location.pathname.includes('/contracts/') && location.pathname !== '/contracts';
  const shouldCollapseSidebar = isContractDetail || isSidebarCollapsed;

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      <CollapsibleSidebar 
        isCollapsed={shouldCollapseSidebar}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
