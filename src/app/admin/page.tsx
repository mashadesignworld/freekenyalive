'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase, LiveEvent } from '@/lib/supabase';
import { useUser } from '@/lib/useUser';

type Q = { id: number; author: string; body: string; status: string };

export default function Admin() {
  const { user, ready } = useUser();
  const [role, setRole] = useState<string | null>(null);
  const [ev, setEv] = useState<LiveEvent | null>(null);
  const [qs, setQs] = useState<Q[]>([]);

  const load = useCallback(async () => {
    const sb = supabase();
    const { data: e } = await sb.from('events').select('*').order('starts_at').limit(1).maybeSingle();
    setEv(e);
    const { data } = await sb.from('questions').select('id,author,body,status').order('id', { ascending: false }).limit(50);
    setQs(data ?? []);
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase().from('profiles').select('role').eq('id', user.id).maybeSingle()
      .then(({ data }) => { setRole(data?.role ?? 'viewer'); load(); });
  }, [user, load]);

  if (!ready) return <div className="wrap section">Loading…</div>;
  if (!user) return <div className="wrap section"><Link href="/login">Sign in</Link> first.</div>;
  if (role !== 'admin' && role !== 'moderator')
    return <div className="wrap section"><h1>Moderators only</h1><p>Your account does not have access.</p></div>;

  const setStatus = async (s: string) => { await supabase().from('events').update({ status: s }).eq('id', ev!.id); load(); };
  const mod = async (id: number, s: string) => { await supabase().from('questions').update({ status: s }).eq('id', id); load(); };

  return (
    <div className="wrap section">
      <h1>Moderator desk</h1>
      {ev && (
        <section className="panel">
          <h3>{ev.title}</h3>
          <p>Status: <b>{ev.status}</b></p>
          <div className="row">
            <button className="btn" onClick={() => setStatus('live')}>Go live</button>
            <button className="btn ghost" onClick={() => setStatus('ended')}>End event</button>
            <button className="btn ghost" onClick={() => setStatus('scheduled')}>Reset</button>
          </div>
        </section>
      )}
      <h2>Questions</h2>
      <ul className="plain qlist">
        {qs.map(q => (
          <li key={q.id}>
            <b>{q.author}</b>{q.body} <em>({q.status})</em>
            <span className="row">
              <button className="btn" onClick={() => mod(q.id, 'approved')}>Approve</button>
              <button className="btn ghost" onClick={() => mod(q.id, 'rejected')}>Reject</button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
