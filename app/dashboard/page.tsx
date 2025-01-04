// app/dashboard/page.tsx

import { fetchActivities } from '@/lib/utils';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getValidStravaToken } from '@/lib/supabase';
import StravaReconnect from '@/components/auth/strava-connect';


export default async function Dashboard() {
    const supabase = createServerComponentClient({ cookies });
    
    try {
      const accessToken = await getValidStravaToken(supabase);
  
      if (!accessToken) {
        return (
          <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Connect to Strava</h1>
            <p className="mb-4">Please connect your Strava account to view your activities</p>
            <StravaReconnect />
          </div>
        );
      }
  
      const activities = await fetchActivities(accessToken);
  
      return (
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-4">My Activities</h1>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
            {JSON.stringify(activities, null, 2)}
          </pre>
        </div>
      );
    } catch (error) {
      console.error('Dashboard error:', error);
      return (
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="mb-4">There was an error connecting to Strava. Please try reconnecting.</p>
          <StravaReconnect />
          {process.env.NODE_ENV === 'development' && (
            <pre className="mt-4 p-4 bg-red-50 text-red-900 rounded">
              {JSON.stringify(error, null, 2)}
            </pre>
          )}
        </div>
      );
    }
  }