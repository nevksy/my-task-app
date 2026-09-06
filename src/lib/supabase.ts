import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    'Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Copy .env.example to ' +
      '.env.local and fill in the values from the Supabase dashboard.',
  );
}

/**
 * Single shared Supabase client for the whole app.
 *
 * - `persistSession` keeps the user signed in across reloads (localStorage).
 * - `autoRefreshToken` silently refreshes the access token before it expires.
 * - `detectSessionInUrl` completes the OAuth redirect (`?code=...`) on load.
 *
 * The anon/publishable key is safe in client code; Row Level Security in the
 * database is what actually isolates each user's rows.
 */
export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
