import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import Countdown from '@/components/Countdown';
import RsvpButton from '@/components/RsvpButton';
import { SIGN_URL } from '@/components/Header';
import type { LiveEvent } from '@/lib/supabase';

// Rebuilt at most every 30s and served from the CDN. 100k visitors never hit the database.
export const revalidate = 30;

const FALLBACK: LiveEvent = {
  id: '', title: "The People's Mandate: Live Town Hall",
  description: 'Join Kenyans nationwide for a live town hall on the Article 257(3) referendum drive.',
  starts_at: '2026-11-07T15:00:00+03:00', youtube_id: null, status: 'scheduled', chat_rooms: 3,
};

async function getData(): Promise<{ ev: LiveEvent; count: number }> {
  try {
    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const { data: ev } = await sb.from('events').select('*')
      .in('status', ['scheduled', 'live']).order('starts_at').limit(1).maybeSingle();
    if (!ev) return { ev: FALLBACK, count: 0 };
    const { data: count } = await sb.rpc('rsvp_count', { p_event: ev.id });
    return { ev, count: Number(count ?? 0) };
  } catch {
    return { ev: FALLBACK, count: 0 };
  }
}

export default async function Home() {
  const { ev, count } = await getData();
  const when = new Intl.DateTimeFormat('en-KE', {
    dateStyle: 'full', timeStyle: 'short', timeZone: 'Africa/Nairobi',
  }).format(new Date(ev.starts_at));

  return (
    <>
      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <p className="kicker">{ev.status === 'live' ? 'Live now' : 'Next live event'}</p>
            <h1>{ev.title}</h1>
            <p className="lede">{ev.description}</p>
            <p className="when">{when} (EAT)</p>
            <div className="actions">
              {ev.status === 'live'
                ? <Link className="btn big" href="/live">Join the live room</Link>
                : ev.id ? <RsvpButton eventId={ev.id} /> : <Link className="btn big" href="/login">Sign in to reserve your place</Link>}
              <a className="btn ghost big" href={SIGN_URL} target="_blank" rel="noreferrer">Sign the referendum</a>
            </div>
            {count > 0 && <p className="count"><b>{count.toLocaleString()}</b> Kenyans have registered</p>}
          </div>
          <div className="hero-clock">
            <Countdown to={ev.starts_at} />
          </div>
        </div>
      </section>

      <section className="wrap section">
        <h2>The referendum question</h2>
        <p className="question">
          Abolish all taxation on basic and essential commodities, including petrol, kerosene and diesel (Article 43).
        </p>
        <p>Collected under Article 257(3). Read the full agenda on the <a href="https://freekenya.co.ke" target="_blank" rel="noreferrer">main FreeKenya site</a>.</p>
      </section>

      <section className="wrap section">
        <h2>What happens in the live room</h2>
        <ul className="plain">
          <li><b>Watch</b> the stage broadcast on any phone, with a data-saver mode.</li>
          <li><b>Ask</b> a question. Moderators pick the ones the panel answers.</li>
          <li><b>Vote</b> in live engagement polls and watch results move.</li>
          <li><b>Chat</b> with supporters in your own room.</li>
        </ul>
      </section>
    </>
  );
}
