import { refreshStravaToken } from "./strava";

 // lib/supabase.ts
 export async function getValidStravaToken(supabase: any) {
  console.log('Attempting to get Strava tokens...');
  
  // Get the most recent token
  const { data: tokens, error } = await supabase
    .from('strava_tokens')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  console.log('Supabase query result:', { tokens, error });

  if (error) {
    console.error('Supabase error:', error);
    // Clean up old tokens before returning null
    try {
      await supabase
        .from('strava_tokens')
        .delete()
        .lt('expires_at', new Date().toISOString());
      console.log('Cleaned up expired tokens');
    } catch (cleanupError) {
      console.error('Error cleaning up tokens:', cleanupError);
    }
    return null;
  }

  if (!tokens) {
    console.log('No tokens found (null result)');
    return null;
  }

  // Check if token is expired or will expire in the next 5 minutes
  const expiresAt = new Date(tokens.expires_at);
  const now = new Date();
  const fiveMinutes = 5 * 60 * 1000;

  console.log('Token expiry check:', {
    expiresAt,
    now,
    timeUntilExpiry: expiresAt.getTime() - now.getTime()
  });

  if (expiresAt.getTime() - now.getTime() <= fiveMinutes) {
    console.log('Token expired or expiring soon, refreshing...');
    try {
      const newTokens = await refreshStravaToken(tokens.refresh_token);
      
      // Update tokens in database
      const { error: updateError } = await supabase
        .from('strava_tokens')
        .update({
          access_token: newTokens.access_token,
          refresh_token: newTokens.refresh_token,
          expires_at: new Date(newTokens.expires_at * 1000).toISOString(),
        })
        .eq('user_id', tokens.user_id);

      if (updateError) {
        console.error('Error updating tokens:', updateError);
        throw updateError;
      }

      console.log('Token refreshed successfully');
      return newTokens.access_token;
    } catch (error) {
      console.error('Error refreshing token:', error);
      // If refresh fails, delete the invalid tokens
      await supabase
        .from('strava_tokens')
        .delete()
        .eq('user_id', tokens.user_id);
      return null;
    }
  }

  return tokens.access_token;
}