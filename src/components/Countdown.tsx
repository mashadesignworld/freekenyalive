'use client';
import { useEffect, useState } from 'react';

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(s / 86400), h: Math.floor(s / 3600) % 24, m: Math.floor(s / 60) % 60, s: s % 60 };
}

export default function Countdown({ to }: { to: string }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  if (now === null) return <div className="countdown" aria-hidden="true" />;
  const p = parts(new Date(to).getTime() - now);
  const cell = (v: number, l: string) => (
    <div><b>{String(v).padStart(2, '0')}</b><small>{l}</small></div>
  );
  return (
    <div className="countdown" role="timer" aria-label="Time until the event starts">
      {cell(p.d, 'days')}{cell(p.h, 'hours')}{cell(p.m, 'minutes')}{cell(p.s, 'seconds')}
    </div>
  );
}
