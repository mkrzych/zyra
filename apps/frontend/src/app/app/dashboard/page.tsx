'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  organizationsAPI, 
  usersAPI, 
  projectsAPI, 
  clientsAPI, 
  timesheetsAPI 
} from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { 
  Users, 
  FolderOpen, 
  Clock, 
  DollarSign,
  TrendingUp,
  Calendar,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, organization } = useAuth();

  const { data: orgData, isLoading: orgLoading } = useQuery({
    queryKey: ['organization'],
    queryFn: () => organizationsAPI.getCurrent(),
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersAPI.getAll(),
  });

  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ['projects-dashboard'],
    queryFn: () => projectsAPI.getAll({ limit: 10 }),
  });

  const { data: clientsData, isLoading: clientsLoading } = useQuery({
    queryKey: ['clients-dashboard'],
    queryFn: () => clientsAPI.getAll({ limit: 10 }),
  });

  const { data: weeklyTimeData, isLoading: timeLoading } = useQuery({
    queryKey: ['timesheets-weekly-dashboard'],
    queryFn: () => timesheetsAPI.getWeekly(),
  });

  const projects = projectsData?.data?.items || [];
  const activeProjects = projects.filter((p: any) => p.status === 'ACTIVE');
  const completedProjects = projects.filter((p: any) => p.status === 'COMPLETED');
  
  const clients = clientsData?.data?.items || [];
  const weeklyStats = weeklyTimeData?.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back, {user?.name}! Here&apos;s your project overview.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center justify-between w-full">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold">
                  {projectsLoading ? '-' : activeProjects.length}
                </p>
              </div>
              <FolderOpen className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center justify-between w-full">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clients</p>
                <p className="text-2xl font-bold">
                  {clientsLoading ? '-' : clients.length}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center justify-between w-full">
              <div>
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-2xl font-bold">
                  {timeLoading ? '-' : `${weeklyStats?.totalHours || 0}h`}
                </p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center justify-between w-full">
              <div>
                <p className="text-sm font-medium text-gray-600">Billable Hours</p>
                <p className="text-2xl font-bold">
                  {timeLoading ? '-' : `${weeklyStats?.billableHours || 0}h`}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Projects</CardTitle>
              <CardDescription>Latest project activity</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/app/projects">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {projectsLoading ? (
              <div className="text-sm text-gray-500">Loading projects...</div>
            ) : projects.length === 0 ? (
              <div className="text-center py-8">
                <FolderOpen className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No projects</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new project.</p>
                <div className="mt-6">
                  <Button asChild>
                    <Link href="/app/projects">Create Project</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.slice(0, 5).map((project: any) => (
                  <div key={project.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        project.status === 'ACTIVE' ? 'bg-green-500' :
                        project.status === 'COMPLETED' ? 'bg-blue-500' :
                        project.status === 'ON_HOLD' ? 'bg-yellow-500' :
                        'bg-gray-500'
                      }`} />
                      <div>
                        <p className="text-sm font-medium">{project.name}</p>
                        <p className="text-xs text-gray-500">{project.code}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {project.status.replace('_', ' ').toLowerCase()}
                      </p>
                      {project.client && (
                        <p className="text-xs text-gray-400">{project.client.name}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* This Week's Time */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>This Week's Time</CardTitle>
              <CardDescription>Time tracking overview</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/app/timesheets">View Timesheets</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {timeLoading ? (
              <div className="text-sm text-gray-500">Loading time data...</div>
            ) : !weeklyStats || weeklyStats.totalHours === 0 ? (
              <div className="text-center py-8">
                <Clock className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No time logged</h3>
                <p className="mt-1 text-sm text-gray-500">Start tracking time on your projects.</p>
                <div className="mt-6">
                  <Button asChild>
                    <Link href="/app/timesheets">Start Timer</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Hours</span>
                  <span className="font-medium">{weeklyStats.totalHours}h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Billable Hours</span>
                  <span className="font-medium">{weeklyStats.billableHours}h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Projects Worked</span>
                  <span className="font-medium">{weeklyStats.projectSummary?.length || 0}</span>
                </div>
                
                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium mb-2">Top Projects</h4>
                  {weeklyStats.projectSummary?.slice(0, 3).map((projectSummary: any, index: number) => (
                    <div key={index} className="flex items-center justify-between py-1">
                      <span className="text-sm text-gray-600 truncate">
                        {projectSummary.project.name}
                      </span>
                      <span className="text-sm font-medium">
                        {Math.round((projectSummary.totalMinutes / 60) * 100) / 100}h
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button asChild variant="outline" className="h-auto p-4">
              <Link href="/app/projects" className="flex flex-col items-center space-y-2">
                <FolderOpen className="h-6 w-6" />
                <span>New Project</span>
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="h-auto p-4">
              <Link href="/app/clients" className="flex flex-col items-center space-y-2">
                <Users className="h-6 w-6" />
                <span>Add Client</span>
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="h-auto p-4">
              <Link href="/app/timesheets" className="flex flex-col items-center space-y-2">
                <Clock className="h-6 w-6" />
                <span>Log Time</span>
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="h-auto p-4">
              <Link href="/app/tasks" className="flex flex-col items-center space-y-2">
                <CheckCircle className="h-6 w-6" />
                <span>View Tasks</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Organization Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Organization</CardTitle>
            <CardDescription>Your organization details</CardDescription>
          </CardHeader>
          <CardContent>
            {orgLoading ? (
              <div className="text-sm text-gray-500">Loading...</div>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="font-medium">{orgData?.data?.name}</p>
                  <p className="text-sm text-gray-500">Plan: {orgData?.data?.plan}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Currency</span>
                  <span className="text-sm font-medium">{orgData?.data?.currency}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Timezone</span>
                  <span className="text-sm font-medium">{orgData?.data?.timezone}</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">
                    Created: {new Date(orgData?.data?.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Overview</CardTitle>
            <CardDescription>Team members and roles</CardDescription>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="text-sm text-gray-500">Loading...</div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Members</span>
                  <span className="text-2xl font-bold">{usersData?.data?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Your Role</span>
                  <span className="text-sm font-medium capitalize">{user?.role?.replace('_', ' ').toLowerCase()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className="text-sm font-medium text-green-600">Active</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}