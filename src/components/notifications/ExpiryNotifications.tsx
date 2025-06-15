import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Calendar, AlertTriangle, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { differenceInDays, parseISO } from 'date-fns';
import { useAuth } from '@/components/access/AuthProvider';
import { Link } from 'react-router-dom';

interface ExpiryNotification {
  id: string;
  contractId: string;
  contractName: string;
  expiryDate: string;
  daysUntilExpiry: number;
  type: 'warning' | 'urgent' | 'expired';
}

const ExpiryNotifications = () => {
  const [notifications, setNotifications] = useState<ExpiryNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchExpiringContracts();
    }
  }, [user]);

  const fetchExpiringContracts = async () => {
    setLoading(true);
    try {
      // Get all active contracts
      const { data: contracts, error } = await supabase
        .from('contracts')
        .select('id, title, contract_number, end_date')
        .in('status', ['approved', 'signed', 'executed'])
        .not('end_date', 'is', null);

      if (error) {
        console.error('Error fetching contracts:', error);
        setLoading(false);
        return;
      }

      if (!contracts || contracts.length === 0) {
        setNotifications([]);
        setLoading(false);
        return;
      }

      // Calculate days until expiry and filter for upcoming expirations
      const today = new Date();
      const expiringContracts = contracts
        .map(contract => {
          if (!contract.end_date) return null;
          
          const endDate = parseISO(contract.end_date);
          const daysUntilExpiry = differenceInDays(endDate, today);
          
          // Only include contracts expiring within the next 30 days or already expired (up to 7 days)
          if (daysUntilExpiry > 30 || daysUntilExpiry < -7) return null;
          
          let type: 'warning' | 'urgent' | 'expired' = 'warning';
          if (daysUntilExpiry < 0) type = 'expired';
          else if (daysUntilExpiry <= 7) type = 'urgent';
          
          return {
            id: contract.id,
            contractId: contract.contract_number || contract.id.substring(0, 8),
            contractName: contract.title,
            expiryDate: contract.end_date,
            daysUntilExpiry,
            type
          };
        })
        .filter(Boolean) as ExpiryNotification[];
      
      // Sort by days until expiry (ascending)
      expiringContracts.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
      
      setNotifications(expiringContracts);
    } catch (error) {
      console.error('Error in fetchExpiringContracts:', error);
    } finally {
      setLoading(false);
    }
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'urgent': return 'bg-red-500/20 text-red-300';
      case 'warning': return 'bg-yellow-500/20 text-yellow-300';
      case 'expired': return 'bg-gray-500/20 text-gray-300';
      default: return 'bg-blue-500/20 text-blue-300';
    }
  };

  return (
    <Card className="glass-card border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Contract Expiry Notifications
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-muted-foreground text-sm">Loading notifications...</p>
        ) : notifications.length === 0 ? (
          <p className="text-muted-foreground text-sm">No pending notifications</p>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div key={notification.id} className="flex items-center justify-between p-3 glass-card border border-white/10 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertTriangle className={`w-4 h-4 ${notification.type === 'urgent' ? 'text-red-400' : notification.type === 'expired' ? 'text-gray-400' : 'text-yellow-400'}`} />
                  <div>
                    <Link to={`/contracts/${notification.id}`} className="font-medium text-sm hover:underline">
                      {notification.contractName}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {notification.daysUntilExpiry < 0 
                        ? `Expired ${Math.abs(notification.daysUntilExpiry)} days ago (${notification.expiryDate})`
                        : `Expires in ${notification.daysUntilExpiry} days (${notification.expiryDate})`}
                    </p>
                  </div>
                  <Badge className={getNotificationColor(notification.type)}>
                    {notification.type}
                  </Badge>
                </div>
                <Button variant="ghost" size="sm" onClick={() => dismissNotification(notification.id)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpiryNotifications;
