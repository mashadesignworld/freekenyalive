'use client';
import Link from 'next/link';
import { useUser } from '@/lib/useUser';
import { supabase } from '@/lib/supabase';

export const SIGN_URL = 'https://signatures.freekenya.co.ke/signature-pad1';

export default function Header() {
  const { user, ready } = useUser();
  return (
    <header className="site-header">
      <div className="flag-band" aria-hidden="true" />
      <div className="wrap bar">
        <Link href="/" className="brand">FreeKenya <span>Live</span></Link>
        <nav aria-label="Main">
          <Link href="/">Home</Link>
          <Link href="/live">Live room</Link>
          <a href={SIGN_URL} target="_blank" rel="noreferrer">Sign referendum</a>
          <a href="https://freekenya.co.ke/?page_id=32" target="_blank" rel="noreferrer">Donate</a>
        </nav>
        {ready && (user
          ? <button className="btn ghost" onClick={() => supabase().auth.signOut()}>Sign out</button>
          : <Link className="btn" href="/login">Sign in</Link>)}
      </div>
    </header>
  );
}
