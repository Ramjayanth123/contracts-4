
import React from 'react';

interface StatusBadgeProps {
  status: 'draft' | 'under-review' | 'approved' | 'executed' | 'expired';
  size?: 'sm' | 'md';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const statusConfig = {
    draft: { color: 'bg-slate-500/20 text-slate-300', label: 'Draft' },
    'under-review': { color: 'bg-yellow-500/20 text-yellow-300', label: 'Under Review' },
    approved: { color: 'bg-blue-500/20 text-blue-300', label: 'Approved' },
    executed: { color: 'bg-green-500/20 text-green-300', label: 'Executed' },
    expired: { color: 'bg-red-500/20 text-red-300', label: 'Expired' },
  };

  const config = statusConfig[status];
  const sizeClass = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm';

  return (
    <span className={`status-badge ${config.color} ${sizeClass}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;
