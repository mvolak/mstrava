"use client"

import React from 'react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Calendar, Clock, TrendingUp, Activity, Bike } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface DateRange {
  start: Date;
  end: Date;
  label: string;
}

interface StravaActivity {
  id: number;
  name: string;
  type: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  start_date: string;
  average_speed: number;
  location_city?: string;
}

// Utility functions
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const formatDistance = (meters: number): string => {
    return (meters / 1000).toFixed(1) + ' km';
  };
  
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const formatSpeed = (metersPerSecond: number): string => {
    const kmPerHour = (metersPerSecond * 3.6).toFixed(1);
    return `${kmPerHour} km/h`;
  };

  const ActivityTypeSwitch = ({ 
    showRuns, 
    onToggle 
  }: { 
    showRuns: boolean; 
    onToggle: (checked: boolean) => void;
  }) => {
    return (
      <div className="flex items-center space-x-2">
        <Bike className={`h-5 w-5 ${!showRuns ? 'text-orange-500' : 'text-gray-400'}`} />
        <Switch
          checked={showRuns}
          onCheckedChange={onToggle}
          className="data-[state=checked]:bg-orange-500"
        />
        <Activity className={`h-5 w-5 ${showRuns ? 'text-orange-500' : 'text-gray-400'}`} />
        <Label className="text-sm text-gray-600">
          {showRuns ? 'Running Activities' : 'MTB Activities'}
        </Label>
      </div>
    );
  };

  const DateRangeSelector = ({ 
    onRangeChange, 
    currentRange 
  }: { 
    onRangeChange: (range: DateRange) => void;
    currentRange: string;
  }) => {
    const ranges: { label: string; months: number | null }[] = [
      { label: 'Last 3 months', months: 3 },
      { label: 'Last 6 months', months: 6 },
      { label: '12 months', months: 12 },
      { label: 'All time', months: null }
    ];
  
    const handleRangeSelect = (label: string, months: number | null) => {
      const end = new Date();
      const start = new Date();
      if (months) {
        start.setMonth(end.getMonth() - months);
      } else {
        // For "All time", go back 10 years
        start.setFullYear(end.getFullYear() - 10);
      }
      onRangeChange({ start, end, label });
    };
  
    return (
      <div className="flex flex-wrap gap-2 mb-6">
        {ranges.map(({ label, months }) => (
          <button
            key={label}
            onClick={() => handleRangeSelect(label, months)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              currentRange === label
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    );
  };

const ActivityCardSkeleton = () => (
  <Card className="hover:shadow-lg transition-shadow">
    <CardHeader>
      <CardTitle className="flex items-center justify-between">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-5 w-5 rounded-full" />
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      <div className="pt-2 border-t">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const NoActivitiesFound = ({ dateRange }: { dateRange: DateRange }) => (
  <Card className="p-8 text-center">
    <div className="flex flex-col items-center gap-4">
      <Bike className="h-16 w-16 text-gray-400" />
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-gray-700">No MTB Rides Found</h3>
        <p className="text-gray-500">
          No mountain bike activities found between{' '}
          {formatDate(dateRange.start)} and {formatDate(dateRange.end)}
        </p>
      </div>
    </div>
  </Card>
);


const EnhancedMtbActivities2 = ({ activities: initialActivities }: { activities: StravaActivity[] }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showRuns, setShowRuns] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({
    start: new Date(new Date().setMonth(new Date().getMonth() - 3)),
    end: new Date(),
    label: 'Last 3 months'
  });

  // Separate activities by type and sort by date
  const [runActivities, setRunActivities] = useState<StravaActivity[]>([]);
  const [mtbActivities, setMtbActivities] = useState<StravaActivity[]>([]);

  // console.log('initial acts: ', initialActivities);
  
  // Initialize and separate activities
  useEffect(() => {
    // First, sort all activities by date (newest first)
    const sortedActivities = [...initialActivities].sort((a, b) => 
      new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
    );

    // Separate into run and MTB activities
    const runs = sortedActivities.filter(activity => activity.type === 'Run');
    const mtb = sortedActivities.filter(activity => 
      activity.type === 'Ride' || activity.type === 'MountainBikeRide'
    );

    setRunActivities(runs);
    setMtbActivities(mtb);

    console.log('Effect set.. ');
    // console.log('runs: ', runs);
    // console.log('mtbs: ', mtb);
  }, [initialActivities]);

  const filterActivitiesByDate = (activities: StravaActivity[], range: DateRange) => {
    return activities.filter(activity => {
      const activityDate = new Date(activity.start_date);
      return activityDate >= range.start && activityDate <= range.end;
    });
  };

  const handleDateRangeChange = async (newRange: DateRange) => {
    setIsLoading(true);
    setDateRange(newRange);
    setIsLoading(false);
  };

  const handleActivityTypeToggle = (checked: boolean) => {
    setShowRuns(checked);
  };

  // Get current activities based on type and date range
  const currentActivities = filterActivitiesByDate(
    showRuns ? runActivities : mtbActivities,
    dateRange
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            Recent {showRuns ? 'Runs' : 'MTB Rides'}
          </h2>
          <ActivityTypeSwitch 
            showRuns={showRuns} 
            onToggle={handleActivityTypeToggle} 
          />
        </div>
        <div className="text-sm text-gray-500">
          Showing {currentActivities.length} {showRuns ? 'running' : 'MTB'} activities from {formatDate(dateRange.start)} to {formatDate(dateRange.end)}
        </div>
      </div>

      <DateRangeSelector 
        onRangeChange={handleDateRangeChange} 
        currentRange={dateRange.label} 
      />

      <div className="grid gap-6 md:grid-cols-3">
        {isLoading ? (
          <>
            <ActivityCardSkeleton />
            <ActivityCardSkeleton />
            <ActivityCardSkeleton />
          </>
        ) : currentActivities.length > 0 ? (
          currentActivities.map((activity) => (
            <Card key={activity.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-lg font-medium truncate" title={activity.name}>
                    {activity.name}
                  </span>
                  {showRuns ? 
                    <Activity className="h-5 w-5 text-orange-500" /> : 
                    <Bike className="h-5 w-5 text-orange-500" />
                  }
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{formatTime(activity.moving_time)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <TrendingUp className="h-4 w-4" />
                      <span>{activity.total_elevation_gain}m</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Activity className="h-4 w-4" />
                      <span>{formatDistance(activity.distance)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Activity className="h-4 w-4" />
                      <span>{formatSpeed(activity.average_speed)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(new Date(activity.start_date))}</span>
                    </div>
                    {activity.location_city && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{activity.location_city}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="md:col-span-3">
            <NoActivitiesFound dateRange={dateRange} />
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedMtbActivities2;