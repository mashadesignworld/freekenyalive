import './globals.css';
import type { Metadata } from 'next';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'FreeKenya Live',
  description: 'Live town halls and campaign events from the FreeKenya Movement.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
        <footer className="wrap foot">
          <p>FreeKenya Movement. Demo build. Engagement polls are not official votes.</p>
          <p>
            <a href="https://twitter.com/FreekenyaM" target="_blank" rel="noreferrer">X / Twitter</a>{' '}
            <a href="https://www.facebook.com/freekenya.or.ke" target="_blank" rel="noreferrer">Facebook</a>{' '}
            <a href="https://www.youtube.com/watch?v=U1ZuT9cxWw4" target="_blank" rel="noreferrer">YouTube</a>
          </p>
        </footer>
      </body>
    </html>
  );
}
