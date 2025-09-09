'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Filter, CheckCircle, Circle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { tasksAPI, projectsAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import TaskForm from '@/components/tasks/task-form';

export default function TasksPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [projectId, setProjectId] = useState('');
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const queryClient = useQueryClient();

  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['tasks', search, status, projectId],
    queryFn: () => tasksAPI.getAll({ search, status, projectId }),
  });

  const { data: projectsData } = useQuery({
    queryKey: ['projects-for-tasks'],
    queryFn: () => projectsAPI.getAll({ limit: 100 }),
  });

  const tasks = tasksData?.data?.items || [];
  const projects = projectsData?.data?.items || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DONE':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'IN_PROGRESS':
        return <Circle className="h-4 w-4 text-blue-500 fill-current" />;
      case 'IN_REVIEW':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'destructive';
      case 'HIGH':
        return 'warning';
      case 'MEDIUM':
        return 'info';
      case 'LOW':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TODO':
        return 'secondary';
      case 'IN_PROGRESS':
        return 'info';
      case 'IN_REVIEW':
        return 'warning';
      case 'DONE':
        return 'success';
      default:
        return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="grid gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold">Tasks</h1>
          <div className="flex items-center space-x-2">
            <Button
              variant={view === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('list')}
            >
              List
            </Button>
            <Button
              variant={view === 'kanban' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('kanban')}
            >
              Kanban
            </Button>
          </div>
        </div>
        
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
              <DialogDescription>
                Add a new task to track work and progress.
              </DialogDescription>
            </DialogHeader>
            <TaskForm 
              onSuccess={() => {
                setIsCreateModalOpen(false);
                queryClient.invalidateQueries({ queryKey: ['tasks'] });
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            <SelectItem value="TODO">To Do</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="IN_REVIEW">In Review</SelectItem>
            <SelectItem value="DONE">Done</SelectItem>
          </SelectContent>
        </Select>

        <Select value={projectId} onValueChange={setProjectId}>
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
      </div>

      {/* Task Content */}
      {view === 'list' ? (
        <TaskListView tasks={tasks} />
      ) : (
        <TaskKanbanView projectId={projectId} />
      )}
    </div>
  );
}

function TaskListView({ tasks }: { tasks: any[] }) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'destructive';
      case 'HIGH':
        return 'warning';
      case 'MEDIUM':
        return 'info';
      case 'LOW':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DONE':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'IN_PROGRESS':
        return <Circle className="h-4 w-4 text-blue-500 fill-current" />;
      case 'IN_REVIEW':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TODO':
        return 'secondary';
      case 'IN_PROGRESS':
        return 'info';
      case 'IN_REVIEW':
        return 'warning';
      case 'DONE':
        return 'success';
      default:
        return 'secondary';
    }
  };

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No tasks found</h3>
          <p className="text-gray-500 mt-2">Create your first task to get started.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task: any) => (
        <Card key={task.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                {getStatusIcon(task.status)}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{task.title}</h3>
                      {task.description && (
                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      )}
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-sm text-gray-500">
                          {task.project.name} ({task.project.code})
                        </span>
                        {task.dueDate && (
                          <span className="text-sm text-gray-500">
                            Due {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                  {task.priority}
                </Badge>
                <Badge variant={getStatusColor(task.status)} className="text-xs">
                  {task.status.replace('_', ' ')}
                </Badge>
                
                {task.assignees?.length > 0 && (
                  <div className="flex -space-x-2">
                    {task.assignees.slice(0, 3).map((assignee: any) => (
                      <div
                        key={assignee.id}
                        className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white border-2 border-white"
                      >
                        {assignee.name.charAt(0).toUpperCase()}
                      </div>
                    ))}
                    {task.assignees.length > 3 && (
                      <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center text-xs text-white border-2 border-white">
                        +{task.assignees.length - 3}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function TaskKanbanView({ projectId }: { projectId: string }) {
  const { data: kanbanData, isLoading } = useQuery({
    queryKey: ['kanban', projectId],
    queryFn: () => projectId ? tasksAPI.getKanban(projectId) : null,
    enabled: !!projectId,
  });

  if (!projectId) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="text-gray-500">
            <CheckCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p>Please select a project to view the Kanban board.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'].map((status) => (
          <div key={status} className="bg-gray-50 rounded-lg p-4">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded mb-2"></div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  const kanbanColumns = kanbanData?.data || {};
  const statusLabels = {
    TODO: 'To Do',
    IN_PROGRESS: 'In Progress',
    IN_REVIEW: 'In Review',
    DONE: 'Done'
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {Object.entries(statusLabels).map(([status, label]) => (
        <div key={status} className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">{label}</h3>
            <span className="text-sm text-gray-500">
              {kanbanColumns[status]?.length || 0}
            </span>
          </div>
          
          <div className="space-y-3">
            {(kanbanColumns[status] || []).map((task: any) => (
              <Card key={task.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-3">
                  <h4 className="font-medium text-sm mb-2">{task.title}</h4>
                  
                  <div className="flex items-center justify-between">
                    <Badge variant={
                      task.priority === 'URGENT' ? 'destructive' :
                      task.priority === 'HIGH' ? 'warning' :
                      task.priority === 'MEDIUM' ? 'info' : 'secondary'
                    } className="text-xs">
                      {task.priority}
                    </Badge>
                    
                    {task.assignees?.length > 0 && (
                      <div className="flex -space-x-1">
                        {task.assignees.slice(0, 2).map((assignee: any) => (
                          <div
                            key={assignee.id}
                            className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white"
                          >
                            {assignee.name.charAt(0).toUpperCase()}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {task.dueDate && (
                    <p className="text-xs text-gray-500 mt-2">
                      Due {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
            
            {(!kanbanColumns[status] || kanbanColumns[status].length === 0) && (
              <div className="text-center py-8 text-gray-500 text-sm">
                No tasks
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}