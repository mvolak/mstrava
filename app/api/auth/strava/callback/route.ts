// app/api/auth/strava/callback/route.ts
import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { exchangeToken } from '@/lib/utils';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);


export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');

  if (!code) {
    return new Response('Code is required', { status: 400 });
  }

  try {
    // Create a Supabase client specifically for route handlers
    const supabase = createRouteHandlerClient({ cookies });

    // Exchange the code for tokens
    const stravaResponse = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
      }),
    });

    if (!stravaResponse.ok) {
      console.error('Strava token exchange failed:', await stravaResponse.text());
      return new Response('Failed to exchange Strava token', { status: 400 });
    }

    const tokens = await stravaResponse.json();

    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.log('No session found, creating anonymous record');
      // If no session exists, you could either:
      // Option 1: Create a temporary anonymous session
      const { data: anonUser, error: signUpError } = await supabase.auth.signUp({
        email: `temp_${Date.now()}@example.com`,
        password: crypto.randomUUID(),
      });

      if (signUpError) {
        console.error('Error creating anonymous user:', signUpError);
        return new Response('Authentication failed', { status: 401 });
      }

      // Store tokens with anonymous user
      await supabase
        .from('strava_tokens')
        .upsert({
          user_id: anonUser.user?.id,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: new Date(tokens.expires_at * 1000).toISOString(),
        });
    } else {
      // Store tokens with authenticated user
      await supabase
        .from('strava_tokens')
        .upsert({
          user_id: session.user.id,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: new Date(tokens.expires_at * 1000).toISOString(),
        });
    }

    // Add some debugging
    console.log('Strava auth successful, redirecting to dashboard');
    
    // Redirect to the dashboard
    return Response.redirect(new URL('/dashboard', request.url));
  } catch (error) {
    console.error('Error in Strava callback:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}


// export async function GET(request: NextRequest) {
//   const searchParams = request.nextUrl.searchParams;
//   const code = searchParams.get('code');

//   if (!code) {
//     return new Response('Code is required', { status: 400 });
//   }

//   try {
//     // Exchange the code for tokens
//     const tokens = await exchangeToken(code);

//     // Get the current user from Supabase
//     const { data: { user } } = await supabase.auth.getUser();

//     if (!user) {
//       return new Response('Unauthorized', { status: 401 });
//     }

//     // Store tokens in Supabase
//     await supabase
//       .from('strava_tokens')
//       .upsert({
//         user_id: user.id,
//         access_token: tokens.access_token,
//         refresh_token: tokens.refresh_token,
//         expires_at: new Date(tokens.expires_at * 1000).toISOString(),
//       });

//     // Redirect to the dashboard
//     return Response.redirect(new URL('/dashboard', request.url));
//   } catch (error) {
//     console.error('Error in Strava callback:', error);
//     return new Response('Internal Server Error', { status: 500 });
//   }
// }