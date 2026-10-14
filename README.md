# FreeKenya Live (demo)

Next.js 14 + Supabase (free tier) + Vercel (free tier). Shows the pattern that scales to 100k:
CDN-cached pages and poll snapshots, sharded chat rooms, moderated Q&A, one vote per user enforced in Postgres.

## 1. Supabase (5 min)
1. Create a project at supabase.com (free).
2. SQL Editor: paste and run `supabase/schema.sql`.
3. Authentication > Providers > Email: turn **off** "Confirm email" (demo only, avoids the free email limit).
4. Project Settings > API: copy the Project URL and the anon public key.

## 2. Run locally
```bash
cp .env.example .env.local   # paste the two values
npm install
npm run dev                  # http://localhost:3000
```
Sign up in the app, then in the SQL Editor make yourself admin:
```sql
update profiles set role = 'admin' where id = (select id from auth.users where email = 'you@example.com');
```
Open `/admin` to go live, approve questions, and end the event.

## 3. Deploy to Vercel
Push to GitHub, import the repo in Vercel, add the same two env vars, deploy.

## Demo script
1. Landing page: countdown, live registration count.
2. Sign up on a second device or incognito window. Reserve a place.
3. `/admin`: click **Go live**. The live room switches from lobby to video on every open tab.
4. Vote in the poll on two accounts. Watch the bars move (3s snapshot).
5. Ask a question, approve it in `/admin`, and see it appear for everyone.
6. Open the chat on two accounts. Note the "room X of 3" label (sharding).

Set a real video ID in the `events.youtube_id` column (use a YouTube Live or unlisted video).

## What is deliberately NOT in the demo
HLS broadcast pipeline, Redis counters, dedicated pub/sub for fan-out, SMS OTP, WAF, load testing.
These are the items the funding request covers.
