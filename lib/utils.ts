import { StravaTokens } from "@/types/strava";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// utils/strava.ts
export const STRAVA_CLIENT_ID = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/strava/callback`;

export const getStravaAuthUrl = () => {
  const scope = 'read,activity:read_all';
  return `https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}&scope=${scope}`;
};

export const exchangeToken = async (code: string): Promise<StravaTokens> => {
  const response = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to exchange token');
  }

  return response.json();
};

export const refreshStravaToken = async (refresh_token: string): Promise<StravaTokens> => {
  const response = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      refresh_token,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh token');
  }

  return response.json();
};

// export const fetchActivities = async (access_token: string) => {
//   const response = await fetch('https://www.strava.com/api/v3/athlete/activities', {
//     headers: {
//       'Authorization': `Bearer ${access_token}`,
//     },
//   });

//   if (!response.ok) {
//     throw new Error('Failed to fetch activities');
//   }

//   const activities = await response.json();
//   console.log('Fetched activities:', activities);
//   return activities;
// };

export async function fetchActivities(accessToken: string, params: {
  before?: Date,
  after?: Date,
  perPage?: number
} = {}) {
  // Convert dates to Unix timestamps (seconds)
  const beforeTimestamp = params.before ? Math.floor(params.before.getTime() / 1000) : undefined;
  const afterTimestamp = params.after ? Math.floor(params.after.getTime() / 1000) : undefined;
  
  // Build the URL with query parameters
  const queryParams = new URLSearchParams({
    per_page: String(params.perPage || 30), // Default to 30 activities
    ...(beforeTimestamp && { before: beforeTimestamp.toString() }),
    ...(afterTimestamp && { after: afterTimestamp.toString() })
  });

  const response = await fetch(
    `https://www.strava.com/api/v3/athlete/activities?${queryParams}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch activities');
  }

  return response.json();
}