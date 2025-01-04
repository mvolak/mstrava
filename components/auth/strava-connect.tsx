// components/auth/strava-connect.tsx
'use client';

import { getStravaAuthUrl } from "@/lib/strava";



export default function StravaReconnect() {
  const handleReconnect = () => {
    window.location.href = getStravaAuthUrl();
  };

  return (
    <button
      onClick={handleReconnect}
      className="bg-[#FC4C02] text-white px-4 py-2 rounded-md hover:bg-[#E34902]"
    >
      Reconnect with Strava
    </button>
  );
}