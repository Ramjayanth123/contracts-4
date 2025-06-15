
import React from 'react';
import GlobalSearch from './search/GlobalSearch';
import { ThemeToggle } from './theme/ThemeToggle';

const Header = () => {
  return (
    <header className="h-16 glass-card border-b border-white/10 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold">Contract Management Platform</h2>
      </div>
      
      <div className="flex items-center gap-4">
        <GlobalSearch />
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Header;
