"use client"

import React from 'react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Calendar, Clock, TrendingUp, Activity, Bike } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

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
      // For "All time", go back 5 years
      start.setFullYear(end.getFullYear() - 5);
    }
    console.log('RangeSelect: ', start, '   ', end, '   ', label);
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

const EnhancedMtbActivities = ({ activities: initialActivities }: { activities: StravaActivity[] }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [activities, setActivities] = useState(initialActivities);
  const [dateRange, setDateRange] = useState<DateRange>({
    start: new Date(new Date().setMonth(new Date().getMonth() - 3)),
    end: new Date(),
    label: 'Last 3 months'
  });

  const handleDateRangeChange = async (newRange: DateRange) => {
    setIsLoading(true);
    setDateRange(newRange);
    
    try {
      // Here you would typically fetch new activities based on the date range
      // For now, we'll simulate a delay and filter the existing activities
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const filteredActivities = initialActivities.filter(activity => {
        const activityDate = new Date(activity.start_date);
        return activityDate >= newRange.start && activityDate <= newRange.end;
      });
      
      setActivities(filteredActivities);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const mtbActivities = activities
    // .filter(activity => activity.type === 'Ride' || activity.type === 'MountainBikeRide')
    .filter(activity => activity.type === 'Run' )
    .slice(0, 7);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold">Recent MTB Rides</h2>
        <div className="text-sm text-gray-500">
          Showing activities from {formatDate(dateRange.start)} to {formatDate(dateRange.end)}
        </div>
      </div>

      <DateRangeSelector onRangeChange={handleDateRangeChange} currentRange={dateRange.label} />

      <div className="grid gap-6 md:grid-cols-3">
        {isLoading ? (
          <>
            <ActivityCardSkeleton />
            <ActivityCardSkeleton />
            <ActivityCardSkeleton />
          </>
        ) : mtbActivities.length > 0 ? (
          mtbActivities.map((activity) => (
            // Your existing activity card component here
            <Card key={activity.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <span className="text-lg font-medium truncate" title={activity.name}>
                              {activity.name}
                            </span>
                            <Activity className="h-5 w-5 text-orange-500" />
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
                                {/* <span>{formatDate(activity.start_date)}</span> */}
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

export default EnhancedMtbActivities;