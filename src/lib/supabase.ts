import { createClient, SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

// Browser client. Created lazily so the build works before env vars are set.
export function supabase(): SupabaseClient {
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return client;
}

export type LiveEvent = {
  id: string; title: string; description: string | null; starts_at: string;
  youtube_id: string | null; status: 'scheduled' | 'live' | 'ended'; chat_rooms: number;
};
