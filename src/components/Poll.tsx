'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

type PollRow = { id: string; question: string; options: string[]; status: string };

export default function Poll({ eventId, user }: { eventId: string; user: User | null }) {
  const [poll, setPoll] = useState<PollRow | null>(null);
  const [counts, setCounts] = useState<number[]>([]);
  const [voted, setVoted] = useState<number | null>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    supabase().from('polls').select('*').eq('event_id', eventId).neq('status', 'draft')
      .order('id').limit(1).maybeSingle().then(({ data }) => setPoll(data));
  }, [eventId]);

  useEffect(() => {
    if (!poll || !user) return;
    supabase().from('poll_votes').select('option_idx').eq('poll_id', poll.id).maybeSingle()
      .then(({ data }) => setVoted(data ? data.option_idx : null));
  }, [poll, user]);

  // Results come from a CDN-cached snapshot, not a live database connection.
  useEffect(() => {
    if (!poll) return;
    const load = async () => {
      const r = await fetch(`/api/snapshot?poll=${poll.id}`);
      if (!r.ok) return;
      const { results } = await r.json();
      const arr = poll.options.map(() => 0);
      (results ?? []).forEach((x: { option_idx: number; votes: number }) => { arr[x.option_idx] = Number(x.votes); });
      setCounts(arr);
    };
    load();
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, [poll]);

  if (!poll) return null;
  const total = counts.reduce((a, b) => a + b, 0);

  async function vote(i: number) {
    if (!user) return setErr('Sign in to vote.');
    const { error } = await supabase().from('poll_votes').insert({ poll_id: poll!.id, user_id: user.id, option_idx: i });
    if (error) return setErr(error.code === '23505' ? 'You have already voted.' : error.message);
    setVoted(i); setErr('');
  }

  return (
    <section className="panel">
      <h3>{poll.question}</h3>
      <p className="note">Engagement poll. This is not an official vote.</p>
      {poll.options.map((o, i) => {
        const pct = total ? Math.round((counts[i] ?? 0) / total * 100) : 0;
        return (
          <button key={i} className={'opt' + (voted === i ? ' mine' : '')}
            disabled={voted !== null || poll.status !== 'open'} onClick={() => vote(i)}>
            <span className="fill" style={{ width: pct + '%' }} />
            <span className="lbl">{o}</span><span className="pct">{pct}%</span>
          </button>
        );
      })}
      <p className="note">{total.toLocaleString()} votes{voted !== null && ' · Your vote is in'}</p>
      {err && <p className="err" role="alert">{err}</p>}
    </section>
  );
}
