import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const statusConfig: Record<string, { color: string, label: string }> = {
    draft: { color: 'bg-slate-500/20 text-slate-300', label: 'Draft' },
    'under-review': { color: 'bg-yellow-500/20 text-yellow-300', label: 'Under Review' },
    'review': { color: 'bg-yellow-500/20 text-yellow-300', label: 'Under Review' },
    'pending_review': { color: 'bg-yellow-500/20 text-yellow-300', label: 'Pending Review' },
    approved: { color: 'bg-blue-500/20 text-blue-300', label: 'Approved' },
    executed: { color: 'bg-green-500/20 text-green-300', label: 'Executed' },
    'signed': { color: 'bg-green-500/20 text-green-300', label: 'Signed' },
    'pending_signature': { color: 'bg-purple-500/20 text-purple-300', label: 'Pending Signature' },
    expired: { color: 'bg-red-500/20 text-red-300', label: 'Expired' },
    'terminated': { color: 'bg-red-500/20 text-red-300', label: 'Terminated' },
    'rejected': { color: 'bg-red-500/20 text-red-300', label: 'Rejected' },
    'completed': { color: 'bg-green-500/20 text-green-300', label: 'Completed' },
  };

  // Handle any status type not explicitly defined
  const getConfig = (statusStr: string) => {
    // Check for exact match
    if (statusConfig[statusStr]) {
      return statusConfig[statusStr];
    }
    
    // Check for partial matches using includes
    if (statusStr.includes('review')) {
      return { color: 'bg-yellow-500/20 text-yellow-300', label: 'Under Review' };
    }
    if (statusStr.includes('sign') || statusStr.includes('await')) {
      return { color: 'bg-purple-500/20 text-purple-300', label: 'Pending Signature' };
    }
    if (statusStr.includes('reject')) {
      return { color: 'bg-red-500/20 text-red-300', label: 'Rejected' };
    }
    if (statusStr.includes('complet') || statusStr.includes('execut')) {
      return { color: 'bg-green-500/20 text-green-300', label: 'Completed' };
    }
    if (statusStr.includes('draft')) {
      return { color: 'bg-slate-500/20 text-slate-300', label: 'Draft' };
    }
    
    // Default fallback
    return { color: 'bg-gray-500/20 text-gray-300', label: statusStr };
  };

  const config = getConfig(status);
  const sizeClass = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm';

  return (
    <span className={`status-badge ${config.color} ${sizeClass}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;
