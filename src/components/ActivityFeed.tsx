
import React, { useState, useEffect } from 'react';
import { Clock, User, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Activity {
  id: string;
  user: string;
  action: string;
  target: string;
  time: string;
  icon: any;
  color: string;
  created_at?: string;
}

const ActivityFeed = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchRecentActivities();
  }, []);

  const fetchRecentActivities = async () => {
    try {
      // For now, we'll use placeholder data since the audit_logs table
      // would need proper joins and formatting for activity feed
      // TODO: Replace with actual database query from audit_logs table
      const placeholderActivities: Activity[] = [
        {
          id: '1',
          user: 'John Smith',
          action: 'approved contract',
          target: 'Software License Agreement #SLA-2024-001',
          time: '2 minutes ago',
          icon: CheckCircle,
          color: 'text-green-400',
        },
        {
          id: '2',
          user: 'Emily Davis',
          action: 'submitted for review',
          target: 'Vendor Agreement #VA-2024-042',
          time: '15 minutes ago',
          icon: FileText,
          color: 'text-blue-400',
        },
        {
          id: '3',
          user: 'Mike Johnson',
          action: 'flagged for renewal',
          target: 'Service Contract #SC-2023-089',
          time: '1 hour ago',
          icon: AlertCircle,
          color: 'text-yellow-400',
        },
        {
          id: '4',
          user: 'Lisa Chen',
          action: 'created new template',
          target: 'NDA Template v2.1',
          time: '3 hours ago',
          icon: FileText,
          color: 'text-purple-400',
        },
      ];
      
      setActivities(placeholderActivities);
    } catch (error: any) {
      console.error('Error fetching activities:', error);
      toast({
        title: "Error",
        description: "Failed to fetch recent activities",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5" />
        Recent Activity
      </h3>
      
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
            <div className="p-1.5 bg-white/10 rounded-full">
              <activity.icon className={`w-4 h-4 ${activity.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm">
                <span className="font-medium">{activity.user}</span>
                <span className="text-muted-foreground"> {activity.action} </span>
                <span className="font-medium">{activity.target}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
            </div>
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityFeed;
