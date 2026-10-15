'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function Login() {
  const router = useRouter();
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg('');
    const sb = supabase();
    const { data, error } = mode === 'up'
      ? await sb.auth.signUp({ email, password, options: { data: { full_name: name } } })
      : await sb.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return setMsg(error.message);
    if (mode === 'up' && !data.session) return setMsg('Check your email to confirm your account, then sign in.');
    router.push('/live');
  }

  return (
    <div className="wrap narrow section">
      <h1>{mode === 'in' ? 'Sign in' : 'Create your account'}</h1>
      <form onSubmit={submit} className="form">
        {mode === 'up' && (
          <label>Full name
            <input value={name} onChange={e => setName(e.target.value)} required autoComplete="name" />
          </label>
        )}
        <label>Email
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
        </label>
        <label>Password
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
            autoComplete={mode === 'in' ? 'current-password' : 'new-password'} />
        </label>
        <button className="btn big" disabled={busy}>{mode === 'in' ? 'Sign in' : 'Create account'}</button>
        {msg && <p className="err" role="alert">{msg}</p>}
      </form>
      <p>
        {mode === 'in' ? 'New here? ' : 'Already registered? '}
        <button className="link" onClick={() => setMode(mode === 'in' ? 'up' : 'in')}>
          {mode === 'in' ? 'Create an account' : 'Sign in'}
        </button>
      </p>
    </div>
  );
}
