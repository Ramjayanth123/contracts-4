
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Users, 
  Settings, 
  Shield, 
  Database, 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Plus, 
  Edit, 
  Trash2,
  Key,
  Monitor,
  Cloud,
  HardDrive
} from 'lucide-react';

const Administration = () => {
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const users = [
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@company.com',
      role: 'Administrator',
      department: 'Legal',
      status: 'Active',
      lastLogin: '2024-01-15 09:30',
      avatar: 'SJ'
    },
    {
      id: 2,
      name: 'Michael Chen',
      email: 'michael.chen@company.com',
      role: 'Manager',
      department: 'Procurement',
      status: 'Active',
      lastLogin: '2024-01-15 08:45',
      avatar: 'MC'
    },
    {
      id: 3,
      name: 'Emily Davis',
      email: 'emily.davis@company.com',
      role: 'User',
      department: 'Sales',
      status: 'Inactive',
      lastLogin: '2024-01-10 16:20',
      avatar: 'ED'
    }
  ];

  const systemHealth = [
    { component: 'Database', status: 'Healthy', uptime: '99.9%', lastCheck: '2 min ago' },
    { component: 'API Services', status: 'Healthy', uptime: '99.8%', lastCheck: '1 min ago' },
    { component: 'Storage', status: 'Warning', uptime: '98.5%', lastCheck: '3 min ago' },
    { component: 'Authentication', status: 'Healthy', uptime: '99.9%', lastCheck: '1 min ago' },
    { component: 'Email Service', status: 'Healthy', uptime: '99.7%', lastCheck: '2 min ago' }
  ];

  const integrations = [
    {
      name: 'Salesforce',
      type: 'CRM',
      status: 'Connected',
      lastSync: '2024-01-15 10:30',
      syncStatus: 'Success'
    },
    {
      name: 'DocuSign',
      type: 'E-Signature',
      status: 'Connected',
      lastSync: '2024-01-15 09:15',
      syncStatus: 'Success'
    },
    {
      name: 'Microsoft Teams',
      type: 'Communication',
      status: 'Connected',
      lastSync: '2024-01-15 10:45',
      syncStatus: 'Success'
    },
    {
      name: 'SAP',
      type: 'ERP',
      status: 'Disconnected',
      lastSync: '2024-01-14 15:30',
      syncStatus: 'Failed'
    }
  ];

  const auditLogs = [
    {
      id: 1,
      action: 'User Login',
      user: 'sarah.johnson@company.com',
      timestamp: '2024-01-15 10:45:32',
      ip: '192.168.1.100',
      status: 'Success'
    },
    {
      id: 2,
      action: 'Contract Created',
      user: 'michael.chen@company.com',
      timestamp: '2024-01-15 10:30:15',
      ip: '192.168.1.101',
      status: 'Success'
    },
    {
      id: 3,
      action: 'Permission Modified',
      user: 'admin@company.com',
      timestamp: '2024-01-15 09:15:45',
      ip: '192.168.1.102',
      status: 'Success'
    },
    {
      id: 4,
      action: 'Failed Login Attempt',
      user: 'unknown@company.com',
      timestamp: '2024-01-15 08:45:12',
      ip: '203.0.113.1',
      status: 'Failed'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Administration</h1>
          <p className="text-muted-foreground">Manage users, system settings, and monitor performance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Activity className="w-4 h-4 mr-2" />
            System Status
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="glass-card">
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="system">System Health</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User List */}
            <div className="lg:col-span-2">
              <Card className="glass-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Users</CardTitle>
                    <div className="flex gap-2">
                      <Input placeholder="Search users..." className="w-64" />
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Invite User
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {users.map(user => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg glass-hover cursor-pointer"
                           onClick={() => setSelectedUser(user)}>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>{user.avatar}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium">{user.name}</h4>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <Badge variant={user.status === 'Active' ? 'default' : 'secondary'}>
                              {user.status}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">{user.role}</p>
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* User Details */}
            <div className="lg:col-span-1">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>User Details</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedUser ? (
                    <div className="space-y-4">
                      <div className="text-center">
                        <Avatar className="w-16 h-16 mx-auto mb-4">
                          <AvatarFallback className="text-lg">{selectedUser.avatar}</AvatarFallback>
                        </Avatar>
                        <h3 className="font-medium">{selectedUser.name}</h3>
                        <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Role:</span>
                          <span className="text-sm font-medium">{selectedUser.role}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Department:</span>
                          <span className="text-sm font-medium">{selectedUser.department}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Status:</span>
                          <Badge variant={selectedUser.status === 'Active' ? 'default' : 'secondary'}>
                            {selectedUser.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Last Login:</span>
                          <span className="text-sm font-medium">{selectedUser.lastLogin}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Permissions</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">View Contracts</span>
                            <Switch checked />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Create Contracts</span>
                            <Switch checked />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Approve Contracts</span>
                            <Switch checked={selectedUser.role !== 'User'} />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">System Admin</span>
                            <Switch checked={selectedUser.role === 'Administrator'} />
                          </div>
                        </div>
                      </div>

                      <Button className="w-full">Update Permissions</Button>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <Users className="w-12 h-12 mx-auto mb-4" />
                      <p>Select a user to view details</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* System Health Overview */}
            <Card className="glass-card lg:col-span-3">
              <CardHeader>
                <CardTitle>System Health Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {systemHealth.map(component => (
                    <div key={component.component} className="text-center p-4 border rounded-lg">
                      <div className="flex justify-center mb-2">
                        {component.status === 'Healthy' ? (
                          <CheckCircle className="w-8 h-8 text-green-500" />
                        ) : (
                          <AlertCircle className="w-8 h-8 text-yellow-500" />
                        )}
                      </div>
                      <h4 className="font-medium mb-1">{component.component}</h4>
                      <Badge variant={component.status === 'Healthy' ? 'default' : 'secondary'}>
                        {component.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-2">
                        Uptime: {component.uptime}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Last check: {component.lastCheck}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Resource Usage */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  CPU Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Current:</span>
                    <span className="text-sm font-medium">34%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '34%' }}></div>
                  </div>
                  <p className="text-xs text-muted-foreground">Average over 24h: 28%</p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="w-5 h-5" />
                  Memory Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Current:</span>
                    <span className="text-sm font-medium">68%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '68%' }}></div>
                  </div>
                  <p className="text-xs text-muted-foreground">12.8 GB / 18.9 GB</p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Storage Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Current:</span>
                    <span className="text-sm font-medium">45%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                  <p className="text-xs text-muted-foreground">450 GB / 1 TB</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>System Integrations</CardTitle>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Integration
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {integrations.map(integration => (
                  <div key={integration.name} className="p-4 border rounded-lg glass-hover">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Cloud className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{integration.name}</h4>
                          <p className="text-sm text-muted-foreground">{integration.type}</p>
                        </div>
                      </div>
                      <Badge variant={integration.status === 'Connected' ? 'default' : 'destructive'}>
                        {integration.status}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Sync:</span>
                        <span>{integration.lastSync}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge variant={integration.syncStatus === 'Success' ? 'default' : 'destructive'} className="text-xs">
                          {integration.syncStatus}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" className="flex-1">Configure</Button>
                      <Button size="sm" variant="outline" className="flex-1">Test</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-muted-foreground">Require 2FA for all users</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Password Policy</h4>
                    <p className="text-sm text-muted-foreground">Enforce strong passwords</p>
                  </div>
                  <Switch checked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Session Timeout</h4>
                    <p className="text-sm text-muted-foreground">Auto-logout after inactivity</p>
                  </div>
                  <Switch checked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">IP Whitelist</h4>
                    <p className="text-sm text-muted-foreground">Restrict access by IP</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  API Keys
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    { name: 'Production API', created: '2024-01-01', lastUsed: '2024-01-15' },
                    { name: 'Development API', created: '2024-01-05', lastUsed: '2024-01-14' },
                    { name: 'Integration API', created: '2024-01-10', lastUsed: '2024-01-15' }
                  ].map((apiKey, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium text-sm">{apiKey.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          Created: {apiKey.created} • Last used: {apiKey.lastUsed}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline">Edit</Button>
                        <Button size="sm" variant="outline">Revoke</Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Generate New API Key
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Audit Trail</CardTitle>
                <div className="flex gap-2">
                  <Select>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Actions</SelectItem>
                      <SelectItem value="login">Login Events</SelectItem>
                      <SelectItem value="contract">Contract Events</SelectItem>
                      <SelectItem value="user">User Events</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm">Export</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {auditLogs.map(log => (
                  <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${log.status === 'Success' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <div>
                        <h4 className="font-medium text-sm">{log.action}</h4>
                        <p className="text-xs text-muted-foreground">
                          {log.user} • {log.timestamp} • IP: {log.ip}
                        </p>
                      </div>
                    </div>
                    <Badge variant={log.status === 'Success' ? 'default' : 'destructive'}>
                      {log.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Administration;
