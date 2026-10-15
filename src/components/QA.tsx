'use client';
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { displayName } from '@/lib/useUser';
import type { User } from '@supabase/supabase-js';

type Q = { id: number; author: string; body: string };

export default function QA({ eventId, user }: { eventId: string; user: User | null }) {
  const [qs, setQs] = useState<Q[]>([]);
  const [text, setText] = useState('');
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    const { data } = await supabase().from('questions').select('id,author,body')
      .eq('event_id', eventId).eq('status', 'approved').order('id', { ascending: false }).limit(30);
    setQs(data ?? []);
  }, [eventId]);

  useEffect(() => {
    load();
    const ch = supabase().channel(`qa-${eventId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'questions' }, load).subscribe();
    return () => { supabase().removeChannel(ch); };
  }, [eventId, load]);

  async function ask(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const { error } = await supabase().from('questions')
      .insert({ event_id: eventId, user_id: user.id, author: displayName(user), body: text.trim() });
    if (error) return setMsg(error.message);
    setText(''); setMsg('Sent. A moderator will review it.');
  }

  return (
    <div className="qa">
      {user ? (
        <form onSubmit={ask} className="row">
          <input value={text} onChange={e => setText(e.target.value)} minLength={3} maxLength={280}
            placeholder="Ask the panel a question" aria-label="Your question" required />
          <button className="btn">Ask</button>
        </form>
      ) : <p className="note">Sign in to ask a question.</p>}
      {msg && <p className="note">{msg}</p>}
      <ul className="plain qlist">
        {qs.length === 0 && <li className="note">No approved questions yet.</li>}
        {qs.map(q => <li key={q.id}><b>{q.author}</b>{q.body}</li>)}
      </ul>
    </div>
  );
}
