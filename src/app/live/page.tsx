'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase, LiveEvent } from '@/lib/supabase';
import { useUser } from '@/lib/useUser';
import Countdown from '@/components/Countdown';
import Poll from '@/components/Poll';
import Chat from '@/components/Chat';
import QA from '@/components/QA';

export default function LiveRoom() {
  const { user, ready } = useUser();
  const [ev, setEv] = useState<LiveEvent | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState<'chat' | 'qa'>('chat');

  useEffect(() => {
    supabase().from('events').select('*').in('status', ['scheduled', 'live']).order('starts_at').limit(1)
      .maybeSingle().then(({ data }) => { setEv(data); setLoaded(true); });
    // Moderators flip the event to "live"; viewers pick it up without refreshing.
    const ch = supabase().channel('events').on('postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'events' }, p => setEv(p.new as LiveEvent)).subscribe();
    return () => { supabase().removeChannel(ch); };
  }, []);

  if (!ready || !loaded) return <div className="wrap section"><p>Loading…</p></div>;
  if (!ev) return <div className="wrap section"><h1>No event scheduled</h1><Link href="/">Back to home</Link></div>;

  const live = ev.status === 'live' && ev.youtube_id;
  return (
    <div className="wrap live-grid">
      <div>
        <h1 className="live-title">{ev.title}</h1>
        <div className="player">
          {live ? (
            <iframe src={`https://www.youtube-nocookie.com/embed/${ev.youtube_id}?autoplay=1&rel=0`}
              title="Live stream" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
          ) : (
            <div className="lobby">
              <p>The broadcast starts soon</p>
              <Countdown to={ev.starts_at} />
            </div>
          )}
        </div>
        <p className="note">Demo uses YouTube Live. Production swaps this for an HLS stream (AWS IVS, Mux or Cloudflare Stream) with signed playback.</p>
        <Poll eventId={ev.id} user={user} />
      </div>
      <aside className="side">
        <div className="tabs" role="tablist">
          <button role="tab" aria-selected={tab === 'chat'} onClick={() => setTab('chat')}>Chat</button>
          <button role="tab" aria-selected={tab === 'qa'} onClick={() => setTab('qa')}>Questions</button>
        </div>
        {tab === 'chat' ? <Chat eventId={ev.id} rooms={ev.chat_rooms} user={user} /> : <QA eventId={ev.id} user={user} />}
        {!user && <p><Link href="/login">Sign in</Link> to take part.</p>}
      </aside>
    </div>
  );
}
