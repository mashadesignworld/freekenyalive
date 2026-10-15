import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import Countdown from '@/components/Countdown';
import RsvpButton from '@/components/RsvpButton';
import { SIGN_URL } from '@/components/Header';
import type { LiveEvent } from '@/lib/supabase';

// Rebuilt at most every 30s and served from the CDN. 100k visitors never hit the database.
export const revalidate = 30;

const FALLBACK: LiveEvent = {
  id: '', 
  title: "A New Dawn: The Tribeless People's Rally",
  description: 'Uniting Kenya as one people, beyond ethnic lines. Join the digital gathering that is redefining our political future.',
  starts_at: '2026-11-07T15:00:00+03:00', 
  youtube_id: null, 
  status: 'scheduled', 
  chat_rooms: 3,
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

  // Ensure your background image is stored in: public/images/tribeless-rally-background.jpg
  const bgImageUrl = "/images/tribeless-rally-background.jpg";

  return (
    <>
      {/* HERO SECTION WITH BACKGROUND IMAGE */}
      <section 
        className="hero" 
        style={{
          position: 'relative',
          backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.5), rgba(15, 23, 42, 0.65)), url('${bgImageUrl}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: '#ffffff',
          padding: '4rem 0',
        }}
      >
        <div className="wrap hero-grid" style={{ position: 'relative', zIndex: 10 }}>
          <div>
            <p className="kicker" style={{ color: '#16a34a', fontWeight: 700 }}>
              {ev.status === 'live' ? '⚡️ Live now' : 'Next Tribeless Gathering'}
            </p>
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
            {/* Counter component remains completely untouched */}
            <Countdown to={ev.starts_at} />
          </div>
        </div>
      </section>

      {/* SECOND SECTION: TRIBELESS AGENDA */}
      <section className="wrap section" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <div style={{ width: '96px', height: '6px', margin: '0 auto 1.5rem auto', borderRadius: '9999px', background: 'linear-gradient(to right, #dc2626, #000000, #16a34a)' }} />

        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1.5rem', color: '#111827' }}>
          Our Shared Future: <span style={{ color: '#16a34a' }}>The Tribeless Agenda</span>
        </h2>
        
        <p className="question" style={{ fontSize: '1.5rem', lineHeight: 1.5, color: '#374151', maxWidth: '56rem', margin: '0 auto 2rem auto', fontStyle: 'italic', backgroundColor: '#f9fafb', padding: '2rem', borderRadius: '1rem', borderLeft: '6px solid #dc2626' }}>
          "To forge a nation where leadership is defined by character and competence, not ethnic affiliation. A Kenya where every citizen thrives, united by our diversity."
        </p>

        <p style={{ color: '#6b7280', fontWeight: 500 }}>
          This movement is built by Kenyans, for Kenya. Read the full vision on the main{' '}
          <a
            href="https://freekenya.co.ke"
            target="_blank"
            rel="noreferrer"
            style={{ color: '#dc2626', fontWeight: 600, textDecoration: 'underline' }}
          >
            FreeKenya platform
          </a>.
        </p>
      </section>

      {/* THIRD SECTION: WORLD-CLASS VERTICAL CARDS */}
      <section className="wrap section" style={{ padding: '4rem 2rem', backgroundColor: '#030712', color: '#ffffff', borderRadius: '1.5rem', margin: '3rem auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.1em', color: '#ef4444', backgroundColor: '#450a0a', padding: '0.5rem 1rem', borderRadius: '9999px', border: '1px solid #7f1d1d' }}>
            Grassroots Power
          </span>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: '1rem', color: '#ffffff' }}>
            Your Voice in the <span style={{ color: '#22c55e' }}>Digital Rally</span>
          </h2>
        </div>

        {/* CSS GRID FORCING 4 DISTINCT VERTICAL CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem' }}>
          
          {/* Vertical Card 1 */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: '#111827', padding: '2rem', borderRadius: '1rem', border: '1px solid #1f2937', minHeight: '340px' }}>
            <div>
              <div style={{ width: '3.5rem', height: '3.5rem', marginBottom: '1.5rem', borderRadius: '0.75rem', backgroundColor: 'rgba(220, 38, 38, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontWeight: 900, fontSize: '1.25rem' }}>
                01
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.75rem', color: '#ffffff' }}>
                Watch & Engage
              </h3>
              <p style={{ color: '#9ca3af', fontSize: '0.95rem', lineHeight: 1.6 }}>
                Experience high-definition live broadcasts on any mobile device, engineered with data-saver streaming across all 47 counties.
              </p>
            </div>
            <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #1f2937', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, color: '#ef4444' }}>Low-Data Stream</span>
              <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '9999px', backgroundColor: '#ef4444' }} />
            </div>
          </div>

          {/* Vertical Card 2 */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: '#111827', padding: '2rem', borderRadius: '1rem', border: '1px solid #1f2937', minHeight: '340px' }}>
            <div>
              <div style={{ width: '3.5rem', height: '3.5rem', marginBottom: '1.5rem', borderRadius: '0.75rem', backgroundColor: 'rgba(22, 163, 74, 0.15)', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.3)', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontWeight: 900, fontSize: '1.25rem' }}>
                02
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.75rem', color: '#ffffff' }}>
                Submit Questions
              </h3>
              <p style={{ color: '#9ca3af', fontSize: '0.95rem', lineHeight: 1.6 }}>
                Have your voice heard directly. Community moderators elevate unfiltered citizen questions to the live national panel.
              </p>
            </div>
            <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #1f2937', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, color: '#22c55e' }}>Direct Dialogue</span>
              <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '9999px', backgroundColor: '#22c55e' }} />
            </div>
          </div>

          {/* Vertical Card 3 */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: '#111827', padding: '2rem', borderRadius: '1rem', border: '1px solid #1f2937', minHeight: '340px' }}>
            <div>
              <div style={{ width: '3.5rem', height: '3.5rem', marginBottom: '1.5rem', borderRadius: '0.75rem', backgroundColor: 'rgba(220, 38, 38, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontWeight: 900, fontSize: '1.25rem' }}>
                03
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.75rem', color: '#ffffff' }}>
                Real-time Voting
              </h3>
              <p style={{ color: '#9ca3af', fontSize: '0.95rem', lineHeight: 1.6 }}>
                Participate in live digital polls during rallies to establish verified consensus on critical priorities in real time.
              </p>
            </div>
            <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #1f2937', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, color: '#ef4444' }}>Live Polling</span>
              <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '9999px', backgroundColor: '#ef4444' }} />
            </div>
          </div>

          {/* Vertical Card 4 */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: '#111827', padding: '2rem', borderRadius: '1rem', border: '1px solid #1f2937', minHeight: '340px' }}>
            <div>
              <div style={{ width: '3.5rem', height: '3.5rem', marginBottom: '1.5rem', borderRadius: '0.75rem', backgroundColor: 'rgba(22, 163, 74, 0.15)', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.3)', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontWeight: 900, fontSize: '1.25rem' }}>
                04
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.75rem', color: '#ffffff' }}>
                Connect Locally
              </h3>
              <p style={{ color: '#9ca3af', fontSize: '0.95rem', lineHeight: 1.6 }}>
                Join breakout rooms tailored to your county or constituency to organize grassroots action in your local area.
              </p>
            </div>
            <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #1f2937', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, color: '#22c55e' }}>47 Counties</span>
              <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '9999px', backgroundColor: '#22c55e' }} />
            </div>
          </div>

        </div>
      </section>
    </>
  );
}