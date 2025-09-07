'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { organizationsAPI, usersAPI } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back, {user?.name}! Here&apos;s what&apos;s happening in your organization.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Organization Info */}
        <Card>
          <CardHeader>
            <CardTitle>Organization</CardTitle>
            <CardDescription>Your organization details</CardDescription>
          </CardHeader>
          <CardContent>
            {orgLoading ? (
              <div className="text-sm text-gray-500">Loading...</div>
            ) : (
              <div className="space-y-2">
                <div>
                  <p className="font-medium">{orgData?.data?.name}</p>
                  <p className="text-sm text-gray-500">Plan: {orgData?.data?.plan}</p>
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

        {/* Team Members */}
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>Users in your organization</CardDescription>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="text-sm text-gray-500">Loading...</div>
            ) : (
              <div className="space-y-2">
                <p className="text-2xl font-bold">{usersData?.data?.length || 0}</p>
                <p className="text-sm text-gray-500">
                  Active team members
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current system information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">API Status</span>
                <span className="text-sm font-medium text-green-600">Healthy</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Your Role</span>
                <span className="text-sm font-medium">{user?.role}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Last Login</span>
                <span className="text-sm text-gray-500">Just now</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates and changes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 mt-2 bg-blue-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium">Welcome to Zyra!</p>
                <p className="text-sm text-gray-500">
                  You&apos;ve successfully set up your organization and can now start managing projects.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 mt-2 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium">System is ready</p>
                <p className="text-sm text-gray-500">
                  All systems are operational and ready for use.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}