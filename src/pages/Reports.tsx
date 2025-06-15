
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Filter, Download, Share, Calendar as CalendarIcon, Search, BarChart, Settings, Clock } from 'lucide-react';
import { format } from 'date-fns';

const Reports = () => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const reportTemplates = [
    {
      id: 1,
      name: 'Financial Impact Report',
      description: 'Comprehensive analysis of contract values and financial impact',
      category: 'Financial',
      lastRun: '2024-01-15',
      frequency: 'Monthly',
      status: 'Active'
    },
    {
      id: 2,
      name: 'Compliance Status Report',
      description: 'Overview of regulatory compliance across all contracts',
      category: 'Compliance',
      lastRun: '2024-01-14',
      frequency: 'Weekly',
      status: 'Active'
    },
    {
      id: 3,
      name: 'Team Performance Report',
      description: 'Analysis of team productivity and approval times',
      category: 'Performance',
      lastRun: '2024-01-13',
      frequency: 'Bi-weekly',
      status: 'Active'
    },
    {
      id: 4,
      name: 'Contract Risk Assessment',
      description: 'Risk analysis and mitigation recommendations',
      category: 'Risk',
      lastRun: '2024-01-12',
      frequency: 'Monthly',
      status: 'Draft'
    }
  ];

  const recentReports = [
    {
      id: 1,
      name: 'Q4 2023 Financial Summary',
      type: 'Financial Impact',
      createdAt: '2024-01-15 09:30',
      createdBy: 'Sarah Johnson',
      status: 'Completed',
      size: '2.4 MB'
    },
    {
      id: 2,
      name: 'Weekly Compliance Check',
      type: 'Compliance Status',
      createdAt: '2024-01-14 16:45',
      createdBy: 'Michael Chen',
      status: 'Completed',
      size: '892 KB'
    },
    {
      id: 3,
      name: 'Team Performance - January',
      type: 'Team Performance',
      createdAt: '2024-01-13 11:20',
      createdBy: 'Emily Davis',
      status: 'In Progress',
      size: '1.1 MB'
    }
  ];

  const availableFields = [
    { id: 'contract_id', name: 'Contract ID', category: 'Basic' },
    { id: 'contract_title', name: 'Contract Title', category: 'Basic' },
    { id: 'contract_value', name: 'Contract Value', category: 'Financial' },
    { id: 'start_date', name: 'Start Date', category: 'Dates' },
    { id: 'end_date', name: 'End Date', category: 'Dates' },
    { id: 'approval_time', name: 'Approval Time', category: 'Performance' },
    { id: 'risk_level', name: 'Risk Level', category: 'Risk' },
    { id: 'department', name: 'Department', category: 'Organization' },
    { id: 'contract_type', name: 'Contract Type', category: 'Classification' },
    { id: 'vendor_name', name: 'Vendor Name', category: 'Parties' }
  ];

  const fieldCategories = [...new Set(availableFields.map(field => field.category))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Advanced Reporting</h1>
          <p className="text-muted-foreground">Create custom reports and analyze contract data</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Share className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Report
          </Button>
        </div>
      </div>

      <Tabs defaultValue="builder" className="space-y-4">
        <TabsList className="glass-card">
          <TabsTrigger value="builder">Report Builder</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
          <TabsTrigger value="recent">Recent Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Field Selection Panel */}
            <div className="lg:col-span-1">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg">Available Fields</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input placeholder="Search fields..." className="glass-card" />
                  
                  {fieldCategories.map(category => (
                    <div key={category} className="space-y-2">
                      <h4 className="font-medium text-sm text-muted-foreground">{category}</h4>
                      <div className="space-y-1">
                        {availableFields
                          .filter(field => field.category === category)
                          .map(field => (
                            <div key={field.id} className="flex items-center space-x-2">
                              <Checkbox id={field.id} />
                              <label htmlFor={field.id} className="text-sm cursor-pointer">
                                {field.name}
                              </label>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Report Configuration */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg">Report Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Report Name</label>
                      <Input placeholder="Enter report name" className="glass-card" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Report Type</label>
                      <Select>
                        <SelectTrigger className="glass-card">
                          <SelectValue placeholder="Select report type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="table">Table Report</SelectItem>
                          <SelectItem value="chart">Chart Report</SelectItem>
                          <SelectItem value="dashboard">Dashboard</SelectItem>
                          <SelectItem value="summary">Summary Report</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Filters</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Date Range</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start glass-card">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={selectedDate}
                              onSelect={setSelectedDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Department</label>
                        <Select>
                          <SelectTrigger className="glass-card">
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="legal">Legal</SelectItem>
                            <SelectItem value="sales">Sales</SelectItem>
                            <SelectItem value="procurement">Procurement</SelectItem>
                            <SelectItem value="operations">Operations</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Contract Status</label>
                        <Select>
                          <SelectTrigger className="glass-card">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="expired">Expired</SelectItem>
                            <SelectItem value="under-review">Under Review</SelectItem>
                            <SelectItem value="negotiating">Negotiating</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Risk Level</label>
                        <Select>
                          <SelectTrigger className="glass-card">
                            <SelectValue placeholder="Select risk level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high">High Risk</SelectItem>
                            <SelectItem value="medium">Medium Risk</SelectItem>
                            <SelectItem value="low">Low Risk</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1">
                      <BarChart className="w-4 h-4 mr-2" />
                      Generate Report
                    </Button>
                    <Button variant="outline">
                      <Settings className="w-4 h-4 mr-2" />
                      Save Template
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Preview Panel */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg">Report Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
                    <BarChart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Select fields and configure filters to preview your report
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportTemplates.map(template => (
              <Card key={template.id} className="glass-card glass-hover cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Badge variant={template.status === 'Active' ? 'default' : 'secondary'}>
                      {template.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Category:</span>
                      <span className="font-medium">{template.category}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Frequency:</span>
                      <span className="font-medium">{template.frequency}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Last Run:</span>
                      <span className="font-medium">{template.lastRun}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" className="flex-1">Use Template</Button>
                    <Button size="sm" variant="outline">Edit</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage automated report generation and delivery
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportTemplates
                  .filter(template => template.status === 'Active')
                  .map(template => (
                    <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Runs {template.frequency.toLowerCase()} • Last run: {template.lastRun}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          <Clock className="w-3 h-3 mr-1" />
                          {template.frequency}
                        </Badge>
                        <Button size="sm" variant="outline">Configure</Button>
                        <Button size="sm">Run Now</Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Reports</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentReports.map(report => (
                  <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg glass-hover">
                    <div className="space-y-1">
                      <h4 className="font-medium">{report.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Type: {report.type}</span>
                        <span>Created: {report.createdAt}</span>
                        <span>By: {report.createdBy}</span>
                        <span>Size: {report.size}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={report.status === 'Completed' ? 'default' : 'secondary'}>
                        {report.status}
                      </Badge>
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button size="sm" variant="outline">
                        <Share className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>
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

export default Reports;
