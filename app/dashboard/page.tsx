// app/dashboard/page.tsx

import { fetchActivities } from '@/lib/utils';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getValidStravaToken } from '@/lib/supabase';
import StravaReconnect from '@/components/auth/strava-connect';
import MtbActivities from '@/components/mtbactivities';
import EnhancedMtbActivities from '@/components/EnhancedMtbActivities';
import EnhancedMtbActivities2 from '@/components/EnhancedMtbActivities-2';

// app/dashboard/page.tsx
export default async function Dashboard() {
    const supabase = createServerComponentClient({ cookies });
    
    try {
      const accessToken = await getValidStravaToken(supabase);
  
      if (!accessToken) {
        // ... existing reconnect code ...
        return <div>Please connect your Strava account</div>;
      }
  
      // Calculate date range (e.g., last 12 months)
      const now = new Date();
      const twelveMonthsAgo = new Date(now);
      twelveMonthsAgo.setMonth(now.getMonth() - 12);
  
    const activities = await fetchActivities(accessToken, {
        before: new Date(),
        after: new Date(new Date().setMonth(new Date().getMonth() - 7)), // Last 7 months
        perPage: 50,
        activityType: 'Run'
      });

      console.log('Activities fetched:', activities);
  
      return (
        <div className="container mx-auto p-6">
          <EnhancedMtbActivities2 activities={activities} />
        </div>
      );


    } catch (error) {
      console.error('Error:', error);
      return (
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p>Please connect your Strava account</p>
          {/*  add a reconnect button here */}
        </div>
      );
    }
  }