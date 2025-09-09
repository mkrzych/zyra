'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { projectsAPI, tasksAPI, usersAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const taskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
  projectId: z.string().min(1, 'Project is required'),
  parentId: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  dueDate: z.string().optional(),
  estimatedHours: z.number().min(0).optional(),
  assigneeIds: z.array(z.string()).optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  task?: any; // Existing task for editing
  projectId?: string; // Pre-selected project
  onSuccess: () => void;
}

export default function TaskForm({ task, projectId, onSuccess }: TaskFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsAPI.getAll({ limit: 100 }),
  });

  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersAPI.getAll(),
  });

  const { data: tasksData } = useQuery({
    queryKey: ['tasks-for-parent'],
    queryFn: () => tasksAPI.getAll({ limit: 100 }),
  });

  const projects = projectsData?.data?.items || [];
  const users = usersData?.data || [];
  const tasks = tasksData?.data?.items || [];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      projectId: task?.projectId || projectId || '',
      parentId: task?.parentId || '',
      status: task?.status || 'TODO',
      priority: task?.priority || 'MEDIUM',
      dueDate: task?.dueDate ? task.dueDate.split('T')[0] : '',
      estimatedHours: task?.estimatedHours || undefined,
      assigneeIds: task?.assignees?.map((a: any) => a.id) || [],
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: (data: TaskFormData) => tasksAPI.create(data),
    onSuccess: () => {
      onSuccess();
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: (data: TaskFormData) => tasksAPI.update(task.id, data),
    onSuccess: () => {
      onSuccess();
    },
  });

  const onSubmit = async (data: TaskFormData) => {
    setIsLoading(true);
    try {
      // Convert empty strings to undefined for optional fields
      const formattedData = {
        ...data,
        parentId: data.parentId || undefined,
        description: data.description || undefined,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
        estimatedHours: data.estimatedHours || undefined,
        assigneeIds: data.assigneeIds?.length ? data.assigneeIds : undefined,
      };

      if (task) {
        await updateTaskMutation.mutateAsync(formattedData);
      } else {
        await createTaskMutation.mutateAsync(formattedData);
      }
    } catch (error) {
      console.error('Task form error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statusOptions = [
    { value: 'TODO', label: 'To Do' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'IN_REVIEW', label: 'In Review' },
    { value: 'DONE', label: 'Done' },
  ];

  const priorityOptions = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'URGENT', label: 'Urgent' },
  ];

  // Filter available parent tasks (can't be self or descendant)
  const availableParentTasks = tasks.filter((t: any) => 
    t.projectId === watch('projectId') && 
    (!task || (t.id !== task.id && t.parentId !== task.id))
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Task Title */}
        <div className="md:col-span-2">
          <Label htmlFor="title">Task Title *</Label>
          <Input
            id="title"
            {...register('title')}
            placeholder="Enter task title"
          />
          {errors.title && (
            <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
          )}
        </div>

        {/* Project */}
        <div>
          <Label>Project *</Label>
          <Select 
            value={watch('projectId')} 
            onValueChange={(value) => setValue('projectId', value)}
            disabled={!!projectId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project: any) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name} ({project.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.projectId && (
            <p className="text-sm text-red-600 mt-1">{errors.projectId.message}</p>
          )}
        </div>

        {/* Parent Task */}
        <div>
          <Label>Parent Task (Optional)</Label>
          <Select 
            value={watch('parentId') || ''} 
            onValueChange={(value) => setValue('parentId', value || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="No parent task" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No parent task</SelectItem>
              {availableParentTasks.map((parentTask: any) => (
                <SelectItem key={parentTask.id} value={parentTask.id}>
                  {parentTask.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Task description..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Status */}
        <div>
          <Label>Status *</Label>
          <Select 
            value={watch('status')} 
            onValueChange={(value) => setValue('status', value as any)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Priority */}
        <div>
          <Label>Priority *</Label>
          <Select 
            value={watch('priority')} 
            onValueChange={(value) => setValue('priority', value as any)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              {priorityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Due Date */}
        <div>
          <Label htmlFor="dueDate">Due Date</Label>
          <Input
            id="dueDate"
            type="date"
            {...register('dueDate')}
          />
        </div>

        {/* Estimated Hours */}
        <div>
          <Label htmlFor="estimatedHours">Estimated Hours</Label>
          <Input
            id="estimatedHours"
            type="number"
            min="0"
            step="0.5"
            {...register('estimatedHours', { valueAsNumber: true })}
            placeholder="0"
          />
        </div>
      </div>

      {/* Assignees */}
      <div>
        <Label>Assignees</Label>
        <div className="space-y-2 mt-2">
          {users.map((user: any) => (
            <label key={user.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                value={user.id}
                {...register('assigneeIds')}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{user.name} ({user.email})</span>
            </label>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
        </Button>
      </div>

      {/* Error Display */}
      {(createTaskMutation.isError || updateTaskMutation.isError) && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">
            {createTaskMutation.error?.message || updateTaskMutation.error?.message || 'An error occurred'}
          </p>
        </div>
      )}
    </form>
  );
}