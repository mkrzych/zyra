'use client';

import { useState, useEffect } from 'react';
import { Play, Pause, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface TimerWidgetProps {
  onTimeLogged: () => void;
}

export default function TimerWidget({ onTimeLogged }: TimerWidgetProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isRunning && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);
    } else if (!isRunning) {
      if (interval) clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, startTime]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsRunning(true);
    setStartTime(new Date());
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleStop = () => {
    setIsRunning(false);
    if (elapsedTime > 0) {
      // Here you could automatically create a timesheet entry
      // For now, we'll just notify the parent component
      onTimeLogged();
    }
    setElapsedTime(0);
    setStartTime(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Time Tracker</CardTitle>
        <CardDescription>Track time on your current work</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center space-y-4">
          <div className="text-4xl font-mono font-bold text-blue-600">
            {formatTime(elapsedTime)}
          </div>
          
          <div className="flex justify-center space-x-2">
            {!isRunning && elapsedTime === 0 && (
              <Button onClick={handleStart} className="flex items-center">
                <Play className="mr-2 h-4 w-4" />
                Start
              </Button>
            )}
            
            {isRunning && (
              <Button onClick={handlePause} variant="outline" className="flex items-center">
                <Pause className="mr-2 h-4 w-4" />
                Pause
              </Button>
            )}
            
            {!isRunning && elapsedTime > 0 && (
              <Button onClick={handleStart} className="flex items-center">
                <Play className="mr-2 h-4 w-4" />
                Resume
              </Button>
            )}
            
            {elapsedTime > 0 && (
              <Button onClick={handleStop} variant="destructive" className="flex items-center">
                <Square className="mr-2 h-4 w-4" />
                Stop & Save
              </Button>
            )}
          </div>
          
          {!isRunning && elapsedTime === 0 && (
            <p className="text-sm text-gray-500">
              Start tracking time on your work
            </p>
          )}
          
          {isRunning && (
            <p className="text-sm text-green-600">
              Timer is running...
            </p>
          )}
          
          {!isRunning && elapsedTime > 0 && (
            <p className="text-sm text-yellow-600">
              Timer paused. Resume or stop to save.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}