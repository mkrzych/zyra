'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Filter } from 'lucide-react';
import { projectsAPI, clientsAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProjectsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [clientId, setClientId] = useState('');

  const { data: projectsData, isLoading } = useQuery({
    queryKey: ['projects', search, status, clientId],
    queryFn: () => projectsAPI.getAll({ search, status, clientId }),
  });

  const { data: clientsData } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientsAPI.getAll({ limit: 100 }),
  });

  const projects = projectsData?.data?.items || [];
  const clients = clientsData?.data?.items || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANNED':
        return 'bg-gray-100 text-gray-800';
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'ON_HOLD':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Projects</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="PLANNED">Planned</option>
          <option value="ACTIVE">Active</option>
          <option value="ON_HOLD">On Hold</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        <select
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Clients</option>
          {clients.map((client: any) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-500">No projects found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project: any) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{project.code}</p>
                  </div>
                  <div
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      project.status
                    )}`}
                  >
                    {project.status.replace('_', ' ')}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {project.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {project.description}
                  </p>
                )}
                
                {project.client && (
                  <p className="text-sm text-gray-500 mb-2">
                    Client: {project.client.name}
                  </p>
                )}
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {project.budgetHours && (
                    <div>
                      <span className="text-gray-500">Budget:</span>
                      <p className="font-medium">{project.budgetHours}h</p>
                    </div>
                  )}
                  
                  {project.budgetAmount && (
                    <div>
                      <span className="text-gray-500">Amount:</span>
                      <p className="font-medium">${Number(project.budgetAmount).toLocaleString()}</p>
                    </div>
                  )}
                  
                  {project.startDate && (
                    <div>
                      <span className="text-gray-500">Start:</span>
                      <p className="font-medium">{formatDate(project.startDate)}</p>
                    </div>
                  )}
                  
                  {project.endDate && (
                    <div>
                      <span className="text-gray-500">End:</span>
                      <p className="font-medium">{formatDate(project.endDate)}</p>
                    </div>
                  )}
                </div>
                
                {project._count && (
                  <div className="flex gap-4 mt-3 pt-3 border-t text-xs text-gray-500">
                    <span>{project._count.tasks || 0} tasks</span>
                    <span>{project._count.timesheetEntries || 0} time entries</span>
                    <span>{project._count.expenses || 0} expenses</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}