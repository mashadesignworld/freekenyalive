-- FreeKenya Live: demo schema. Run once in Supabase > SQL Editor.

create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  county text,
  role text not null default 'viewer' check (role in ('viewer','moderator','admin')),
  created_at timestamptz default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  starts_at timestamptz not null,
  youtube_id text,                      -- demo stream; replaced by an HLS playback URL in production
  status text not null default 'scheduled' check (status in ('scheduled','live','ended')),
  chat_rooms int not null default 3     -- viewers are sharded across this many chat rooms
);

create table public.rsvps (
  event_id uuid references public.events on delete cascade,
  user_id uuid references auth.users on delete cascade,
  created_at timestamptz default now(),
  primary key (event_id, user_id)
);

create table public.polls (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events on delete cascade,
  question text not null,
  options text[] not null,
  status text not null default 'open' check (status in ('draft','open','closed'))
);

create table public.poll_votes (
  poll_id uuid references public.polls on delete cascade,
  user_id uuid references auth.users on delete cascade,
  option_idx int not null,
  created_at timestamptz default now(),
  primary key (poll_id, user_id)        -- one vote per user, enforced by the database
);

create table public.questions (
  id bigint generated always as identity primary key,
  event_id uuid references public.events on delete cascade,
  user_id uuid references auth.users on delete cascade,
  author text,
  body text not null check (char_length(body) between 3 and 280),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz default now()
);

create table public.chat_messages (
  id bigint generated always as identity primary key,
  event_id uuid references public.events on delete cascade,
  room int not null,
  user_id uuid references auth.users on delete cascade,
  author text,
  body text not null check (char_length(body) between 1 and 280),
  created_at timestamptz default now()
);
create index on public.chat_messages (event_id, room, created_at desc);

-- Helpers -------------------------------------------------------------
create function public.is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role in ('moderator','admin'));
$$;

create function public.poll_results(p_poll uuid)
returns table(option_idx int, votes bigint)
language sql stable security definer set search_path = public as $$
  select option_idx, count(*) from poll_votes where poll_id = p_poll group by option_idx;
$$;

create function public.rsvp_count(p_event uuid) returns bigint
language sql stable security definer set search_path = public as $$
  select count(*) from rsvps where event_id = p_event;
$$;

create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name) values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Row Level Security ---------------------------------------------------
alter table profiles      enable row level security;
alter table events        enable row level security;
alter table rsvps         enable row level security;
alter table polls         enable row level security;
alter table poll_votes    enable row level security;
alter table questions     enable row level security;
alter table chat_messages enable row level security;

create policy "own profile read" on profiles for select using (id = auth.uid() or is_staff());
create policy "own profile edit" on profiles for update using (id = auth.uid())
  with check (id = auth.uid() and role = 'viewer');

create policy "events public read" on events for select using (true);
create policy "events staff write" on events for all using (is_staff()) with check (is_staff());

create policy "rsvp own read"   on rsvps for select using (user_id = auth.uid());
create policy "rsvp own insert" on rsvps for insert with check (user_id = auth.uid());

create policy "polls public read" on polls for select using (status <> 'draft' or is_staff());
create policy "polls staff write" on polls for all using (is_staff()) with check (is_staff());

create policy "vote own read"   on poll_votes for select using (user_id = auth.uid());
create policy "vote own insert" on poll_votes for insert with check (
  user_id = auth.uid() and exists (select 1 from polls where id = poll_id and status = 'open'));

create policy "questions read"   on questions for select
  using (status = 'approved' or user_id = auth.uid() or is_staff());
create policy "questions insert" on questions for insert
  with check (user_id = auth.uid() and status = 'pending');
create policy "questions staff update" on questions for update using (is_staff());

create policy "chat read"   on chat_messages for select using (auth.uid() is not null);
create policy "chat insert" on chat_messages for insert with check (user_id = auth.uid());

grant execute on function public.poll_results(uuid) to anon, authenticated;
grant execute on function public.rsvp_count(uuid)  to anon, authenticated;

-- Realtime -------------------------------------------------------------
alter publication supabase_realtime add table questions, chat_messages;

-- Demo seed (edit the date; put a real YouTube video ID in) -------------
with e as (
  insert into events (title, description, starts_at, youtube_id, status)
  values ('The People''s Mandate: Live Town Hall',
          'Join Kenyans nationwide for a live town hall on the Article 257(3) referendum drive.',
          now() + interval '3 days', 'dQw4w9WgXcQ', 'scheduled')
  returning id)
insert into polls (event_id, question, options)
select id, 'Will you collect signatures in your county this month?',
       array['Yes','Maybe','I need help getting started'] from e;

-- After you sign up in the app, make yourself admin:
-- update profiles set role = 'admin'
--   where id = (select id from auth.users where email = 'you@example.com');
