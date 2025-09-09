'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Plus, 
  Calendar, 
  DollarSign, 
  Clock, 
  Users,
  CheckCircle,
  Circle,
  AlertCircle,
  Target,
  FileText,
  Settings
} from 'lucide-react';
import { projectsAPI, tasksAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import ProjectForm from '@/components/projects/project-form';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const projectId = params.id as string;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { data: projectData, isLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectsAPI.getById(projectId),
  });

  const { data: summaryData } = useQuery({
    queryKey: ['project-summary', projectId],
    queryFn: () => projectsAPI.getSummary(projectId),
  });

  const { data: tasksData } = useQuery({
    queryKey: ['project-tasks', projectId],
    queryFn: () => tasksAPI.getAll({ projectId, limit: 100 }),
  });

  const deleteProjectMutation = useMutation({
    mutationFn: () => projectsAPI.delete(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      router.push('/app/projects');
    },
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="grid gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-40 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const project = projectData?.data;
  const summary = summaryData?.data;
  const tasks = tasksData?.data?.items || [];

  if (!project) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Project Not Found</h1>
          <p className="text-gray-600 mt-2">The project you&apos;re looking for doesn&apos;t exist.</p>
          <Button asChild className="mt-4">
            <Link href="/app/projects">Back to Projects</Link>
          </Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANNED':
        return 'secondary';
      case 'ACTIVE':
        return 'success';
      case 'ON_HOLD':
        return 'warning';
      case 'COMPLETED':
        return 'info';
      case 'CANCELLED':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getTaskStatusIcon = (status: string) => {
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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/app/projects">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <p className="text-gray-600">{project.code}</p>
          </div>
          <Badge variant={getStatusColor(project.status)}>
            {project.status.replace('_', ' ')}
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Project</DialogTitle>
                <DialogDescription>
                  Update project details and settings.
                </DialogDescription>
              </DialogHeader>
              <ProjectForm 
                project={project}
                onSuccess={() => {
                  setIsEditModalOpen(false);
                  queryClient.invalidateQueries({ queryKey: ['project', projectId] });
                  queryClient.invalidateQueries({ queryKey: ['projects'] });
                }}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Project</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this project? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => deleteProjectMutation.mutate()}
                  disabled={deleteProjectMutation.isPending}
                >
                  {deleteProjectMutation.isPending ? 'Deleting...' : 'Delete Project'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Project Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Project Overview</CardTitle>
            </CardHeader>
            <CardContent>
              {project.description && (
                <div className="mb-4">
                  <h4 className="font-medium text-sm text-gray-700 mb-1">Description</h4>
                  <p className="text-gray-600">{project.description}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.client && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-1">Client</h4>
                    <p className="text-gray-900">{project.client.name}</p>
                  </div>
                )}

                {project.startDate && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-1">Start Date</h4>
                    <p className="text-gray-900">{new Date(project.startDate).toLocaleDateString()}</p>
                  </div>
                )}

                {project.endDate && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-1">End Date</h4>
                    <p className="text-gray-900">{new Date(project.endDate).toLocaleDateString()}</p>
                  </div>
                )}

                {project.budgetHours && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-1">Budget Hours</h4>
                    <p className="text-gray-900">{project.budgetHours}h</p>
                  </div>
                )}

                {project.budgetAmount && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-1">Budget Amount</h4>
                    <p className="text-gray-900">${Number(project.budgetAmount).toLocaleString()}</p>
                  </div>
                )}

                {project.hourlyRate && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-1">Hourly Rate</h4>
                    <p className="text-gray-900">${Number(project.hourlyRate).toLocaleString()}/hr</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Project Stats */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Project Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-blue-500 mr-2" />
                  <span className="text-sm text-gray-600">Total Tasks</span>
                </div>
                <span className="font-medium">{summary?.totalTasks || tasks.length}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Target className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm text-gray-600">Completed</span>
                </div>
                <span className="font-medium">
                  {tasks.filter((t: any) => t.status === 'DONE').length}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-purple-500 mr-2" />
                  <span className="text-sm text-gray-600">Time Logged</span>
                </div>
                <span className="font-medium">
                  {Math.round((summary?.totalMinutes || 0) / 60)}h
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 text-yellow-500 mr-2" />
                  <span className="text-sm text-gray-600">Billable Hours</span>
                </div>
                <span className="font-medium">
                  {Math.round((summary?.billableMinutes || 0) / 60)}h
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild className="w-full" variant="outline">
                <Link href={`/app/projects/${projectId}/tasks`}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  View Tasks
                </Link>
              </Button>
              
              <Button asChild className="w-full" variant="outline">
                <Link href={`/app/timesheets?project=${projectId}`}>
                  <Clock className="h-4 w-4 mr-2" />
                  View Time Entries
                </Link>
              </Button>
              
              <Button asChild className="w-full" variant="outline">
                <Link href={`/app/expenses?project=${projectId}`}>
                  <FileText className="h-4 w-4 mr-2" />
                  View Expenses
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Tasks */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Tasks</CardTitle>
            <CardDescription>Latest task activity in this project</CardDescription>
          </div>
          <Button asChild>
            <Link href={`/app/projects/${projectId}/tasks`}>
              <Plus className="h-4 w-4 mr-2" />
              Manage Tasks
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating your first task.</p>
              <div className="mt-6">
                <Button asChild>
                  <Link href={`/app/projects/${projectId}/tasks`}>Create Task</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.slice(0, 5).map((task: any) => (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    {getTaskStatusIcon(task.status)}
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                          {task.priority}
                        </Badge>
                        {task.dueDate && (
                          <span className="text-xs text-gray-500">
                            Due {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {task.assignees?.map((assignee: any, index: number) => (
                      <div key={assignee.id} className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white">
                        {assignee.name.charAt(0).toUpperCase()}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              {tasks.length > 5 && (
                <div className="text-center pt-4">
                  <Button variant="outline" asChild>
                    <Link href={`/app/projects/${projectId}/tasks`}>
                      View All {tasks.length} Tasks
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}