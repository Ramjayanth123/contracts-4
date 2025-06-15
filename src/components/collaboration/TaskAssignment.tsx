
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Plus, Calendar, User, AlertCircle, CheckCircle } from 'lucide-react';

const TaskAssignment = () => {
  const [tasks, setTasks] = useState([
    {
      id: '1',
      title: 'Review payment terms in Service Agreement',
      description: 'Check if 45-day payment terms align with company policy',
      assignee: 'Sarah Johnson',
      assigneeAvatar: '/placeholder.svg',
      dueDate: '2024-06-15',
      priority: 'high',
      status: 'in-progress',
      progress: 60,
      contract: 'Service Agreement - TechCorp'
    },
    {
      id: '2',
      title: 'Legal review of termination clause',
      description: 'Ensure termination clause protects company interests',
      assignee: 'Legal Team',
      assigneeAvatar: '/placeholder.svg',
      dueDate: '2024-06-16',
      priority: 'medium',
      status: 'pending',
      progress: 0,
      contract: 'Vendor Contract - SupplyChain Inc'
    },
    {
      id: '3',
      title: 'Finalize scope of work details',
      description: 'Add specific deliverables and timelines',
      assignee: 'Mike Chen',
      assigneeAvatar: '/placeholder.svg',
      dueDate: '2024-06-14',
      priority: 'high',
      status: 'completed',
      progress: 100,
      contract: 'Service Agreement - TechCorp'
    }
  ]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'in-progress':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'pending':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'overdue':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const handleUpdateProgress = (taskId: string, newProgress: number) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, progress: newProgress, status: newProgress === 100 ? 'completed' : 'in-progress' }
        : task
    ));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Task Management</h3>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Task
        </Button>
      </div>

      <div className="grid gap-4">
        {tasks.map((task) => (
          <Card key={task.id} className="glass-card border-white/10">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">{task.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">Contract: {task.contract}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={`${getPriorityColor(task.priority)} border text-xs`}>
                      {task.priority}
                    </Badge>
                    <Badge className={`${getStatusColor(task.status)} border text-xs`}>
                      {task.status}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={task.assigneeAvatar} />
                        <AvatarFallback className="text-xs">{task.assignee.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{task.assignee}</span>
                    </div>
                    
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Due {task.dueDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {task.status === 'completed' ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{task.progress}%</span>
                        <Progress value={task.progress} className="w-20 h-2" />
                      </div>
                    )}
                  </div>
                </div>

                {task.status !== 'completed' && (
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleUpdateProgress(task.id, Math.min(task.progress + 25, 100))}
                    >
                      Update Progress
                    </Button>
                    <Button size="sm" variant="outline">
                      Add Comment
                    </Button>
                    <Button size="sm" variant="outline">
                      Reassign
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TaskAssignment;
