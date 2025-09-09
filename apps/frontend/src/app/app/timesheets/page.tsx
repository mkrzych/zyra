'use client';

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { 
  Plus, 
  Clock, 
  Play, 
  Pause, 
  Square, 
  Calendar,
  Download,
  Filter
} from 'lucide-react';
import { timesheetsAPI, projectsAPI, tasksAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import TimerWidget from '@/components/timesheets/timer-widget';
import TimesheetEntryForm from '@/components/timesheets/timesheet-entry-form';

export default function TimesheetsPage() {
  const [view, setView] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const searchParams = useSearchParams();
  const preSelectedProject = searchParams?.get('project') || '';
  
  const queryClient = useQueryClient();

  // Set preselected project on mount
  useEffect(() => {
    if (preSelectedProject) {
      setSelectedProject(preSelectedProject);
    }
  }, [preSelectedProject]);

  const { data: timesheetsData, isLoading } = useQuery({
    queryKey: ['timesheets', selectedProject, selectedDate, view],
    queryFn: () => {
      const params: any = {};
      if (selectedProject) params.projectId = selectedProject;
      
      // Calculate date range based on view
      const date = new Date(selectedDate);
      if (view === 'weekly') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        params.from = weekStart.toISOString();
        params.to = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
      } else if (view === 'monthly') {
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        params.from = monthStart.toISOString();
        params.to = monthEnd.toISOString();
      } else {
        params.from = new Date(selectedDate).toISOString();
        params.to = new Date(new Date(selectedDate).getTime() + 24 * 60 * 60 * 1000).toISOString();
      }
      
      return timesheetsAPI.getAll(params);
    },
  });

  const { data: weeklyData } = useQuery({
    queryKey: ['weekly-summary'],
    queryFn: () => timesheetsAPI.getWeekly(),
  });

  const { data: projectsData } = useQuery({
    queryKey: ['projects-for-timesheets'],
    queryFn: () => projectsAPI.getAll({ limit: 100 }),
  });

  const entries = timesheetsData?.data?.items || [];
  const projects = projectsData?.data?.items || [];
  const weeklyStats = weeklyData?.data;

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  // Group entries by date
  const entriesByDate = entries.reduce((acc: any, entry: any) => {
    const date = entry.date.split('T')[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(entry);
    return acc;
  }, {});

  const totalHours = entries.reduce((sum: number, entry: any) => sum + entry.minutes, 0) / 60;
  const billableHours = entries.filter((e: any) => e.billable).reduce((sum: number, entry: any) => sum + entry.minutes, 0) / 60;

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="grid gap-6">
            <div className="h-40 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold">Timesheets</h1>
          <div className="flex items-center space-x-2">
            <Button
              variant={view === 'daily' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('daily')}
            >
              Daily
            </Button>
            <Button
              variant={view === 'weekly' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('weekly')}
            >
              Weekly
            </Button>
            <Button
              variant={view === 'monthly' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('monthly')}
            >
              Monthly
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Time Entry</DialogTitle>
                <DialogDescription>
                  Log time for a project or task.
                </DialogDescription>
              </DialogHeader>
              <TimesheetEntryForm 
                projectId={selectedProject}
                onSuccess={() => {
                  setIsAddModalOpen(false);
                  queryClient.invalidateQueries({ queryKey: ['timesheets'] });
                  queryClient.invalidateQueries({ queryKey: ['weekly-summary'] });
                }}
              />
            </DialogContent>
          </Dialog>
          
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Timer Widget - Placeholder for now */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Time Tracker</CardTitle>
              <CardDescription>Track time on projects and tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select project to track time" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project: any) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name} ({project.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button disabled={!selectedProject}>
                  <Play className="mr-2 h-4 w-4" />
                  Start Timer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">This Week Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Hours</span>
              <span className="font-medium">
                {weeklyStats ? Math.round((weeklyStats.totalMinutes / 60) * 100) / 100 : 0}h
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Billable Hours</span>
              <span className="font-medium">
                {weeklyStats ? Math.round((weeklyStats.billableMinutes / 60) * 100) / 100 : 0}h
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Projects</span>
              <span className="font-medium">
                {weeklyStats?.projectSummary?.length || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Average/Day</span>
              <span className="font-medium">
                {weeklyStats ? Math.round((weeklyStats.totalMinutes / 60 / 7) * 100) / 100 : 0}h
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-40"
        />
        
        <Select value={selectedProject} onValueChange={setSelectedProject}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Projects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Projects</SelectItem>
            {projects.map((project: any) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Period Total:</span>
          <Badge variant="outline">{Math.round(totalHours * 100) / 100}h</Badge>
          <span className="text-sm text-gray-500">
            ({Math.round(billableHours * 100) / 100}h billable)
          </span>
        </div>
      </div>

      {/* Time Entries */}
      {Object.keys(entriesByDate).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No time entries</h3>
            <p className="text-gray-500 mt-2">
              Start tracking time or add manual entries to see them here.
            </p>
            <div className="mt-6">
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Entry
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(entriesByDate)
            .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
            .map(([date, dayEntries]: [string, any]) => {
              const dayTotal = dayEntries.reduce((sum: number, entry: any) => sum + entry.minutes, 0);
              const dayBillable = dayEntries.filter((e: any) => e.billable).reduce((sum: number, entry: any) => sum + entry.minutes, 0);
              
              return (
                <Card key={date}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {formatDate(date)}
                      </CardTitle>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">
                          Total: {formatDuration(dayTotal)}
                        </span>
                        <span className="text-sm text-gray-600">
                          Billable: {formatDuration(dayBillable)}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {dayEntries.map((entry: any) => (
                        <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-center space-x-4">
                            <div className="text-sm font-medium">
                              {formatDuration(entry.minutes)}
                            </div>
                            <div>
                              <div className="font-medium">{entry.project.name}</div>
                              {entry.task && (
                                <div className="text-sm text-gray-600">{entry.task.title}</div>
                              )}
                              {entry.notes && (
                                <div className="text-sm text-gray-500 mt-1">{entry.notes}</div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {entry.billable && (
                              <Badge variant="success" className="text-xs">Billable</Badge>
                            )}
                            {entry.hourlyRate && (
                              <span className="text-sm text-gray-500">
                                ${entry.hourlyRate}/hr
                              </span>
                            )}
                            <span className="text-xs text-gray-400">
                              {formatTime(entry.createdAt)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </div>
      )}
    </div>
  );
}