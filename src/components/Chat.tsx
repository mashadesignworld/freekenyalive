'use client';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { displayName, roomFor } from '@/lib/useUser';
import type { User } from '@supabase/supabase-js';

type Msg = { id: number; author: string; body: string };

export default function Chat({ eventId, rooms, user }: { eventId: string; rooms: number; user: User | null }) {
  const room = user ? roomFor(user.id, rooms) : 0;
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState('');
  const [err, setErr] = useState('');
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sb = supabase();
    sb.from('chat_messages').select('id,author,body').eq('event_id', eventId).eq('room', room)
      .order('id', { ascending: false }).limit(50).then(({ data }) => setMsgs((data ?? []).reverse()));
    // Each viewer subscribes to ONE room, never the whole audience.
    const ch = sb.channel(`chat-${eventId}-${room}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `room=eq.${room}` },
        p => setMsgs(m => [...m.slice(-99), p.new as Msg]))
      .subscribe();
    return () => { sb.removeChannel(ch); };
  }, [eventId, room]);

  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }); }, [msgs]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !text.trim()) return;
    const { error } = await supabase().from('chat_messages')
      .insert({ event_id: eventId, room, user_id: user.id, author: displayName(user), body: text.trim() });
    if (error) setErr(error.message); else { setText(''); setErr(''); }
  }

  return (
    <div className="chat">
      <p className="note">Chat room {room + 1} of {rooms}</p>
      <div className="log" aria-live="polite">
        {msgs.map(m => <p key={m.id}><b>{m.author}</b> {m.body}</p>)}
        <div ref={end} />
      </div>
      {user ? (
        <form onSubmit={send} className="row">
          <input value={text} onChange={e => setText(e.target.value)} maxLength={280} placeholder="Say something" aria-label="Chat message" />
          <button className="btn">Send</button>
        </form>
      ) : <p className="note">Sign in to join the chat.</p>}
      {err && <p className="err">{err}</p>}
    </div>
  );
}
