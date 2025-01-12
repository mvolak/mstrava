// app/dashboard/page.tsx

import { fetchActivities } from '@/lib/utils';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getValidStravaToken } from '@/lib/supabase';
import StravaReconnect from '@/components/auth/strava-connect';
import MtbActivities from '@/components/mtbactivities';
import EnhancedMtbActivities from '@/components/EnhancedMtbActivities';

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
  
    //   const activities = await fetchActivities(accessToken, {
    //     after: twelveMonthsAgo,
    //     before: now,
    //     perPage: 50 // Increase if you need more activities
    //   });
  
    //   // If no activities found in the last 12 months, fetch the most recent ones regardless of date
    //   if (activities.length === 0) {
    //     console.log('No activities found in last 12 months, fetching most recent ones');
    //     const recentActivities = await fetchActivities(accessToken, {
    //       perPage: 10
    //     });
        
    //     if (recentActivities.length > 0) {
    //       console.log(`Found ${recentActivities.length} activities, most recent from: ${new Date(recentActivities[0].start_date)}`);
    //     }
        
    //     return (
    //       <div className="container mx-auto p-6">
    //         <MtbActivities activities={recentActivities} />
    //         {recentActivities.length > 0 && (
    //           <div className="mt-4 text-gray-500 text-sm">
    //             Last activity was on: {new Date(recentActivities[0].start_date).toLocaleDateString()}
    //           </div>
    //         )}
    //       </div>
    //     );
    //   }
  
    //   return (
    //     <div className="container mx-auto p-6">
    //       <MtbActivities activities={activities} />
    //     </div>
    //   );

    const activities = await fetchActivities(accessToken, {
        after: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
        perPage: 50
      });
  
      return (
        <div className="container mx-auto p-6">
          <h4>Dashboard</h4>
          <EnhancedMtbActivities activities={activities} />
        </div>
      );


    } catch (error) {
      // ... existing error handling ...
      console.error('Error:', error);
      return (
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p>Please connect your Strava account</p>
          {/* You could add a reconnect button here */}
        </div>
      );
    }
  }