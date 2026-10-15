'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/lib/useUser';

export default function RsvpButton({ eventId }: { eventId: string }) {
  const { user, ready } = useUser();
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!user) return;
    supabase().from('rsvps').select('event_id').eq('event_id', eventId).maybeSingle()
      .then(({ data }) => setDone(!!data));
  }, [user, eventId]);

  if (!ready) return null;
  if (!user) return <Link className="btn big" href="/login">Sign in to reserve your place</Link>;
  if (done) return <p className="ok">You are registered. See you in the live room.</p>;
  return (
    <>
      <button className="btn big" onClick={async () => {
        const { error } = await supabase().from('rsvps').insert({ event_id: eventId, user_id: user.id });
        if (error && error.code !== '23505') setErr(error.message); else setDone(true);
      }}>Reserve my place</button>
      {err && <p className="err">{err}</p>}
    </>
  );
}
