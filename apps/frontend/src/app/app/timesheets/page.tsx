'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Calendar, Clock, Play, Pause } from 'lucide-react';
import { timesheetsAPI, projectsAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TimesheetsPage() {
  const [selectedWeek, setSelectedWeek] = useState('');
  const [activeTimer, setActiveTimer] = useState<string | null>(null);
  const [timerStart, setTimerStart] = useState<Date | null>(null);

  // Get current week start (Monday)
  const getWeekStart = (date = new Date()) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const weekStart = new Date(d.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  };

  const currentWeekStart = getWeekStart();
  const weekStartString = currentWeekStart.toISOString().split('T')[0];

  const { data: weeklyData, isLoading } = useQuery({
    queryKey: ['timesheets-weekly', selectedWeek || weekStartString],
    queryFn: () => timesheetsAPI.getWeekly({ 
      weekStart: selectedWeek || weekStartString 
    }),
  });

  const { data: projectsData } = useQuery({
    queryKey: ['projects-active'],
    queryFn: () => projectsAPI.getAll({ status: 'ACTIVE', limit: 100 }),
  });

  const weeklyStats = weeklyData?.data;
  const projects = projectsData?.data?.items || [];

  const formatHours = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${mins.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysOfWeek = (weekStart: Date) => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(day.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const startTimer = (projectId: string) => {
    setActiveTimer(projectId);
    setTimerStart(new Date());
  };

  const stopTimer = () => {
    if (activeTimer && timerStart) {
      const endTime = new Date();
      const minutes = Math.round((endTime.getTime() - timerStart.getTime()) / (1000 * 60));
      
      // Here you would typically create a timesheet entry
      console.log(`Timer stopped: ${minutes} minutes for project ${activeTimer}`);
    }
    
    setActiveTimer(null);
    setTimerStart(null);
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

  const weekDays = getDaysOfWeek(new Date(weeklyStats?.weekStart || currentWeekStart));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Timesheets</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Previous Week
          </Button>
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Next Week
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Manual Entry
          </Button>
        </div>
      </div>

      {/* Weekly Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {weeklyStats ? `${weeklyStats.totalHours}h` : '0h'}
            </div>
            <p className="text-xs text-gray-500">Total Hours</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {weeklyStats ? `${weeklyStats.billableHours}h` : '0h'}
            </div>
            <p className="text-xs text-gray-500">Billable Hours</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {weeklyStats?.projectSummary?.length || 0}
            </div>
            <p className="text-xs text-gray-500">Active Projects</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">40h</div>
            <p className="text-xs text-gray-500">Target Hours</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Timer */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Quick Timer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <select className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select Project</option>
              {projects.map((project: any) => (
                <option key={project.id} value={project.id}>
                  {project.name} ({project.code})
                </option>
              ))}
            </select>
            
            {activeTimer ? (
              <Button onClick={stopTimer} variant="destructive">
                <Pause className="mr-2 h-4 w-4" />
                Stop Timer
              </Button>
            ) : (
              <Button onClick={() => startTimer('project-1')}>
                <Play className="mr-2 h-4 w-4" />
                Start Timer
              </Button>
            )}
          </div>
          
          {activeTimer && timerStart && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-800">
                  Timer running for Project XYZ
                </span>
                <span className="font-mono text-green-800">
                  {Math.floor((Date.now() - timerStart.getTime()) / (1000 * 60))} min
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly Grid */}
      <Card>
        <CardHeader>
          <CardTitle>
            Week of {weekDays[0]?.toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {/* Headers */}
            <div className="grid grid-cols-8 gap-2 text-sm font-medium text-gray-500">
              <div>Project</div>
              {weekDays.map((day, index) => (
                <div key={index} className="text-center">
                  {formatDate(day.toISOString())}
                </div>
              ))}
              <div className="text-center">Total</div>
            </div>

            {/* Project Rows */}
            {weeklyStats?.projectSummary?.map((projectSummary: any, index: number) => (
              <div key={index} className="grid grid-cols-8 gap-2 py-2 border-b">
                <div className="font-medium">
                  {projectSummary.project.name}
                </div>
                
                {weekDays.map((day, dayIndex) => {
                  const dayKey = day.toISOString().split('T')[0];
                  const dayEntries = weeklyStats.dailySummary[dayKey];
                  const dayMinutes = dayEntries?.entries
                    ?.filter((entry: any) => entry.projectId === projectSummary.project.id)
                    ?.reduce((sum: number, entry: any) => sum + entry.minutes, 0) || 0;
                  
                  return (
                    <div key={dayIndex} className="text-center text-sm">
                      {dayMinutes > 0 ? formatHours(dayMinutes) : '-'}
                    </div>
                  );
                })}
                
                <div className="text-center font-medium">
                  {formatHours(projectSummary.totalMinutes)}
                </div>
              </div>
            )) || (
              <div className="py-8 text-center text-gray-500">
                No time entries for this week
              </div>
            )}

            {/* Totals Row */}
            {weeklyStats && weeklyStats.projectSummary?.length > 0 && (
              <div className="grid grid-cols-8 gap-2 pt-2 border-t font-medium">
                <div>Total</div>
                {weekDays.map((day, dayIndex) => {
                  const dayKey = day.toISOString().split('T')[0];
                  const dayTotal = weeklyStats.dailySummary[dayKey]?.totalMinutes || 0;
                  
                  return (
                    <div key={dayIndex} className="text-center">
                      {dayTotal > 0 ? formatHours(dayTotal) : '-'}
                    </div>
                  );
                })}
                <div className="text-center">
                  {weeklyStats.totalHours}h
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}