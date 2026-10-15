import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Poll results snapshot. The CDN caches each response for 3s, so the database
// runs this query about once every few seconds no matter how many viewers there are.
export async function GET(req: NextRequest) {
  const poll = req.nextUrl.searchParams.get('poll');
  if (!poll) return NextResponse.json({ error: 'poll required' }, { status: 400 });
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const { data, error } = await sb.rpc('poll_results', { p_poll: poll });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ results: data }, {
    headers: { 'Cache-Control': 'public, s-maxage=3, stale-while-revalidate=5' },
  });
}
