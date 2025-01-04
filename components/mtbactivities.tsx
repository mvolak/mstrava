import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Calendar, Clock, TrendingUp, Activity } from 'lucide-react';

interface StravaActivity {
  id: number;
  name: string;
  type: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  start_date: string;
  start_latlng: number[];
  end_latlng: number[];
  average_speed: number;
  max_speed: number;
  location_city?: string;
  location_country?: string;
}

const formatDistance = (meters: number): string => {
  return (meters / 1000).toFixed(1) + ' km';
};

const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatSpeed = (metersPerSecond: number): string => {
  const kmPerHour = (metersPerSecond * 3.6).toFixed(1);
  return `${kmPerHour} km/h`;
};

const MtbActivities = ({ activities }: { activities: StravaActivity[] }) => {
  // Filter only MTB rides and take latest 3
  const mtbActivities = activities
    // .filter(activity => activity.type === 'Ride' || activity.type === 'MountainBikeRide')
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Recent MTB Rides</h2>
        <span className="text-sm text-gray-500">
          Showing {mtbActivities.length} latest rides
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {mtbActivities.map((activity) => (
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
                    <span>{formatDate(activity.start_date)}</span>
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
        ))}
      </div>
    </div>
  );
};

export default MtbActivities;