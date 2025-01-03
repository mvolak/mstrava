

// app/dashboard/page.tsx

import { fetchActivities } from '@/lib/utils';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export default async function Dashboard() {
  const supabase = createServerComponentClient({ cookies });
  
  // Get the current user's tokens
  const { data: tokens } = await supabase
    .from('strava_tokens')
    .select('*')
    .single();

  if (!tokens) {
    return <div>Please connect your Strava account</div>;
  }

  const activities = await fetchActivities(tokens.access_token);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">My Activities</h1>
      <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
        {JSON.stringify(activities, null, 2)}
      </pre>
    </div>
  );
}



// // pages/dashboard.tsx
// import { useEffect, useState } from 'react';
// import { supabase } from '@/utils/supabaseClient';
// import { fetchActivities, refreshStravaToken } from '@/utils/strava';

// export default function Dashboard() {
//   const [activities, setActivities] = useState([]);

//   useEffect(() => {
//     const loadActivities = async () => {
//       try {
//         // Get the current user's tokens
//         const { data: tokens } = await supabase
//           .from('strava_tokens')
//           .select('*')
//           .single();

//         if (!tokens) {
//           console.error('No Strava tokens found');
//           return;
//         }

//         // Check if token needs refresh
//         if (new Date(tokens.expires_at) <= new Date()) {
//           const newTokens = await refreshStravaToken(tokens.refresh_token);
//           // Update tokens in Supabase
//           await supabase
//             .from('strava_tokens')
//             .update({
//               access_token: newTokens.access_token,
//               refresh_token: newTokens.refresh_token,
//               expires_at: new Date(newTokens.expires_at * 1000).toISOString(),
//             })
//             .eq('user_id', tokens.user_id);
            
//           // Use new access token
//           const activities = await fetchActivities(newTokens.access_token);
//           setActivities(activities);
//         } else {
//           // Use existing access token
//           const activities = await fetchActivities(tokens.access_token);
//           setActivities(activities);
//         }
//       } catch (error) {
//         console.error('Error loading activities:', error);
//       }
//     };

//     loadActivities();
//   }, []);

//   return (
//     <div>
//       <h1>My Strava Activities</h1>
//       <pre>{JSON.stringify(activities, null, 2)}</pre>
//     </div>
//   );
// }