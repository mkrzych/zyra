'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { timesheetsAPI, projectsAPI, tasksAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const timesheetEntrySchema = z.object({
  projectId: z.string().min(1, 'Project is required'),
  taskId: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  hours: z.number().min(0.1, 'Hours must be greater than 0'),
  minutes: z.number().min(0).max(59).optional(),
  billable: z.boolean(),
  hourlyRate: z.number().min(0).optional(),
  notes: z.string().optional(),
});

type TimesheetEntryFormData = z.infer<typeof timesheetEntrySchema>;

interface TimesheetEntryFormProps {
  entry?: any; // Existing entry for editing
  projectId?: string; // Pre-selected project
  onSuccess: () => void;
}

export default function TimesheetEntryForm({ entry, projectId, onSuccess }: TimesheetEntryFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(entry?.projectId || projectId || '');

  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsAPI.getAll({ limit: 100 }),
  });

  const { data: tasksData } = useQuery({
    queryKey: ['tasks', selectedProjectId],
    queryFn: () => selectedProjectId ? tasksAPI.getAll({ projectId: selectedProjectId, limit: 100 }) : null,
    enabled: !!selectedProjectId,
  });

  const projects = projectsData?.data?.items || [];
  const tasks = tasksData?.data?.items || [];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TimesheetEntryFormData>({
    resolver: zodResolver(timesheetEntrySchema),
    defaultValues: {
      projectId: entry?.projectId || projectId || '',
      taskId: entry?.taskId || '',
      date: entry?.date ? entry.date.split('T')[0] : new Date().toISOString().split('T')[0],
      hours: entry?.minutes ? Math.floor(entry.minutes / 60) : 1,
      minutes: entry?.minutes ? entry.minutes % 60 : 0,
      billable: entry?.billable ?? true,
      hourlyRate: entry?.hourlyRate ? Number(entry.hourlyRate) : undefined,
      notes: entry?.notes || '',
    },
  });

  const createEntryMutation = useMutation({
    mutationFn: (data: TimesheetEntryFormData) => {
      const totalMinutes = (data.hours * 60) + (data.minutes || 0);
      return timesheetsAPI.create({
        projectId: data.projectId,
        taskId: data.taskId || undefined,
        date: new Date(data.date).toISOString(),
        minutes: totalMinutes,
        billable: data.billable,
        hourlyRate: data.hourlyRate || undefined,
        notes: data.notes || undefined,
      } as any);
    },
    onSuccess: () => {
      onSuccess();
    },
  });

  const updateEntryMutation = useMutation({
    mutationFn: (data: TimesheetEntryFormData) => {
      const totalMinutes = (data.hours * 60) + (data.minutes || 0);
      return timesheetsAPI.update(entry.id, {
        projectId: data.projectId,
        taskId: data.taskId || undefined,
        date: new Date(data.date).toISOString(),
        minutes: totalMinutes,
        billable: data.billable,
        hourlyRate: data.hourlyRate || undefined,
        notes: data.notes || undefined,
      } as any);
    },
    onSuccess: () => {
      onSuccess();
    },
  });

  const onSubmit = async (data: TimesheetEntryFormData) => {
    setIsLoading(true);
    try {
      if (entry) {
        await updateEntryMutation.mutateAsync(data);
      } else {
        await createEntryMutation.mutateAsync(data);
      }
    } catch (error) {
      console.error('Timesheet entry form error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProjectChange = (value: string) => {
    setSelectedProjectId(value);
    setValue('projectId', value);
    setValue('taskId', ''); // Reset task selection when project changes
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Project */}
        <div>
          <Label>Project *</Label>
          <Select 
            value={watch('projectId')} 
            onValueChange={handleProjectChange}
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

        {/* Task */}
        <div>
          <Label>Task (Optional)</Label>
          <Select 
            value={watch('taskId') || ''} 
            onValueChange={(value) => setValue('taskId', value || undefined)}
            disabled={!selectedProjectId}
          >
            <SelectTrigger>
              <SelectValue placeholder={selectedProjectId ? "Select task" : "Select project first"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No specific task</SelectItem>
              {tasks.map((task: any) => (
                <SelectItem key={task.id} value={task.id}>
                  {task.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Date */}
      <div>
        <Label htmlFor="date">Date *</Label>
        <Input
          id="date"
          type="date"
          {...register('date')}
        />
        {errors.date && (
          <p className="text-sm text-red-600 mt-1">{errors.date.message}</p>
        )}
      </div>

      {/* Time Duration */}
      <div>
        <Label>Duration *</Label>
        <div className="flex items-center space-x-2">
          <div className="flex-1">
            <Input
              type="number"
              min="0"
              step="1"
              placeholder="Hours"
              {...register('hours', { valueAsNumber: true })}
            />
            <Label className="text-xs text-gray-500 mt-1">Hours</Label>
          </div>
          <div className="flex-1">
            <Input
              type="number"
              min="0"
              max="59"
              step="1"
              placeholder="Minutes"
              {...register('minutes', { valueAsNumber: true })}
            />
            <Label className="text-xs text-gray-500 mt-1">Minutes</Label>
          </div>
        </div>
        {errors.hours && (
          <p className="text-sm text-red-600 mt-1">{errors.hours.message}</p>
        )}
      </div>

      {/* Billable and Rate */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="flex items-center space-x-2">
            <input
              type="checkbox"
              {...register('billable')}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Billable</span>
          </Label>
        </div>

        <div>
          <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
          <Input
            id="hourlyRate"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            {...register('hourlyRate', { valueAsNumber: true })}
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          {...register('notes')}
          placeholder="Description of work done..."
          rows={3}
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : entry ? 'Update Entry' : 'Add Entry'}
        </Button>
      </div>

      {/* Error Display */}
      {(createEntryMutation.isError || updateEntryMutation.isError) && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">
            {createEntryMutation.error?.message || updateEntryMutation.error?.message || 'An error occurred'}
          </p>
        </div>
      )}
    </form>
  );
}