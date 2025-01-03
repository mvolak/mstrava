// components/auth/strava-connect.tsx
'use client';

import { getStravaAuthUrl } from "@/lib/strava";



export default function StravaConnect() {
  const handleStravaLogin = () => {
    window.location.href = getStravaAuthUrl();
  };

  return (
    <button
      onClick={handleStravaLogin}
      className="bg-[#FC4C02] text-white px-4 py-2 rounded-md hover:bg-[#E34902]"
    >
      Connect with Strava
    </button>
  );
}

// ... rest of the Strava utility functions remain the same
