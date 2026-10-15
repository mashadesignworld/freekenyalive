'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useUser } from '@/lib/useUser';
import { supabase } from '@/lib/supabase';

export const SIGN_URL = 'https://signatures.freekenya.co.ke/signature-pad1';

export default function Header() {
  const { user, ready } = useUser();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the menu after navigating, and when Escape is pressed.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const close = () => setOpen(false);

  return (
    <header className="site-header">
      <div className="flag-band" aria-hidden="true" />
      <div className="wrap bar">
        <Link href="/" className="brand" onClick={close}>FreeKenya <span>Live</span></Link>

        <nav id="main-nav" className={open ? 'open' : ''} aria-label="Main">
          <Link href="/" onClick={close}>Home</Link>
          <Link href="/live" onClick={close}>Live room</Link>
          <a href={SIGN_URL} target="_blank" rel="noreferrer">Sign referendum</a>
          <a href="https://freekenya.co.ke/?page_id=32" target="_blank" rel="noreferrer">Donate</a>
        </nav>

        <div className="bar-actions">
          {ready && (user
            ? <button className="btn ghost" onClick={() => supabase().auth.signOut()}>Sign out</button>
            : <Link className="btn" href="/login" onClick={close}>Sign in</Link>)}
          <button
            className="menu-btn"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="main-nav"
            onClick={() => setOpen(o => !o)}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>
    </header>
  );
}
