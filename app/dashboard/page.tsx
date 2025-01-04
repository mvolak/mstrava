// app/dashboard/page.tsx

import { fetchActivities } from '@/lib/utils';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getValidStravaToken } from '@/lib/supabase';
import StravaReconnect from '@/components/auth/strava-connect';
import MtbActivities from '@/components/mtbactivities';


export default async function Dashboard() {
    const supabase = createServerComponentClient({ cookies });
    
    try {
      const accessToken = await getValidStravaToken(supabase);
  
      if (!accessToken) {
        // ... existing reconnect code ...
      }
  
      // Fetch activities from Strava
      const response = await fetch('https://www.strava.com/api/v3/athlete/activities?per_page=10', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch activities');
      }
  
      const activities = await response.json();
  
      return (
        <div className="container mx-auto p-6">
          <MtbActivities activities={activities} />
        </div>
      );
    } catch (error) {
      // ... existing error handling ...
    }
  }