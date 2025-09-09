'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { clientsAPI, projectsAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  code: z.string().min(1, 'Project code is required'),
  description: z.string().optional(),
  status: z.enum(['PLANNED', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED']),
  clientId: z.string().optional(),
  budgetHours: z.number().min(0).optional(),
  budgetAmount: z.number().min(0).optional(),
  hourlyRate: z.number().min(0).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  color: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  project?: any; // Existing project for editing
  onSuccess: () => void;
}

export default function ProjectForm({ project, onSuccess }: ProjectFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const { data: clientsData } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientsAPI.getAll({ limit: 100 }),
  });

  const clients = clientsData?.data?.items || [];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: project?.name || '',
      code: project?.code || '',
      description: project?.description || '',
      status: project?.status || 'PLANNED',
      clientId: project?.clientId || '',
      budgetHours: project?.budgetHours || undefined,
      budgetAmount: project?.budgetAmount ? Number(project.budgetAmount) : undefined,
      hourlyRate: project?.hourlyRate ? Number(project.hourlyRate) : undefined,
      startDate: project?.startDate ? project.startDate.split('T')[0] : '',
      endDate: project?.endDate ? project.endDate.split('T')[0] : '',
      color: project?.color || '#3B82F6',
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: (data: ProjectFormData) => projectsAPI.create(data),
    onSuccess: () => {
      onSuccess();
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: (data: ProjectFormData) => projectsAPI.update(project.id, data),
    onSuccess: () => {
      onSuccess();
    },
  });

  const onSubmit = async (data: ProjectFormData) => {
    setIsLoading(true);
    try {
      // Convert empty strings to undefined for optional fields
      const formattedData = {
        ...data,
        clientId: data.clientId || undefined,
        budgetHours: data.budgetHours || undefined,
        budgetAmount: data.budgetAmount || undefined,
        hourlyRate: data.hourlyRate || undefined,
        startDate: data.startDate ? new Date(data.startDate).toISOString() : undefined,
        endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
        description: data.description || undefined,
        color: data.color || undefined,
      };

      if (project) {
        await updateProjectMutation.mutateAsync(formattedData);
      } else {
        await createProjectMutation.mutateAsync(formattedData);
      }
    } catch (error) {
      console.error('Project form error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statusOptions = [
    { value: 'PLANNED', label: 'Planned' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'ON_HOLD', label: 'On Hold' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Project Name */}
        <div>
          <Label htmlFor="name">Project Name *</Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="Enter project name"
          />
          {errors.name && (
            <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Project Code */}
        <div>
          <Label htmlFor="code">Project Code *</Label>
          <Input
            id="code"
            {...register('code')}
            placeholder="e.g., PROJ-001"
          />
          {errors.code && (
            <p className="text-sm text-red-600 mt-1">{errors.code.message}</p>
          )}
        </div>
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Project description..."
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

        {/* Client */}
        <div>
          <Label>Client</Label>
          <Select 
            value={watch('clientId') || ''} 
            onValueChange={(value) => setValue('clientId', value || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select client (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No Client</SelectItem>
              {clients.map((client: any) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Budget Hours */}
        <div>
          <Label htmlFor="budgetHours">Budget Hours</Label>
          <Input
            id="budgetHours"
            type="number"
            min="0"
            step="1"
            {...register('budgetHours', { valueAsNumber: true })}
            placeholder="0"
          />
        </div>

        {/* Budget Amount */}
        <div>
          <Label htmlFor="budgetAmount">Budget Amount ($)</Label>
          <Input
            id="budgetAmount"
            type="number"
            min="0"
            step="0.01"
            {...register('budgetAmount', { valueAsNumber: true })}
            placeholder="0.00"
          />
        </div>

        {/* Hourly Rate */}
        <div>
          <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
          <Input
            id="hourlyRate"
            type="number"
            min="0"
            step="0.01"
            {...register('hourlyRate', { valueAsNumber: true })}
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Start Date */}
        <div>
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            {...register('startDate')}
          />
        </div>

        {/* End Date */}
        <div>
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            type="date"
            {...register('endDate')}
          />
        </div>
      </div>

      {/* Project Color */}
      <div>
        <Label htmlFor="color">Project Color</Label>
        <div className="flex items-center space-x-2">
          <Input
            id="color"
            type="color"
            {...register('color')}
            className="w-16 h-10"
          />
          <span className="text-sm text-gray-500">Used for visual identification</span>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
        </Button>
      </div>

      {/* Error Display */}
      {(createProjectMutation.isError || updateProjectMutation.isError) && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">
            {createProjectMutation.error?.message || updateProjectMutation.error?.message || 'An error occurred'}
          </p>
        </div>
      )}
    </form>
  );
}