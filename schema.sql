-- ═══════════════════════════════════════════════════════════════
--  STATIC — Supabase database schema
--  Run this entire file in: Supabase → SQL Editor → New query
-- ═══════════════════════════════════════════════════════════════

-- ── Profiles ────────────────────────────────────────────────────
create table public.profiles (
  id                uuid references auth.users(id) on delete cascade primary key,
  username          text unique not null,
  display_name      text,
  bio               text,
  current_mood      text,
  avatar_color      text default '#a78bfa',
  interests         text[] default '{}',
  like_label        text default 'sparks',
  follower_label    text default 'crew',
  like_visibility   text default 'everyone',   -- everyone | only me | top followers only | nobody
  like_duration     text default 'always',     -- always | 24 hours | 48 hours | 7 days
  show_guestbook    boolean default true,
  show_reactions    boolean default true,
  created_at        timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);


-- ── Posts ────────────────────────────────────────────────────────
create table public.posts (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references public.profiles(id) on delete cascade not null,
  content     text,
  image_url   text,
  filter_name text,
  tags        text[] default '{}',
  created_at  timestamptz default now()
);

alter table public.posts enable row level security;

create policy "Posts are viewable by everyone"
  on public.posts for select using (true);

create policy "Users can insert their own posts"
  on public.posts for insert with check (auth.uid() = user_id);

create policy "Users can delete their own posts"
  on public.posts for delete using (auth.uid() = user_id);

create index posts_user_id_idx on public.posts(user_id);
create index posts_created_at_idx on public.posts(created_at desc);
create index posts_tags_idx on public.posts using gin(tags);


-- ── Reactions ────────────────────────────────────────────────────
create table public.reactions (
  id         uuid default gen_random_uuid() primary key,
  post_id    uuid references public.posts(id) on delete cascade not null,
  user_id    uuid references public.profiles(id) on delete cascade not null,
  emoji      text not null,
  created_at timestamptz default now(),
  unique(post_id, user_id, emoji)
);

alter table public.reactions enable row level security;

create policy "Reactions are viewable by everyone"
  on public.reactions for select using (true);

create policy "Users can insert reactions"
  on public.reactions for insert with check (auth.uid() = user_id);

create policy "Users can delete their own reactions"
  on public.reactions for delete using (auth.uid() = user_id);


-- ── Guestbook ────────────────────────────────────────────────────
create table public.guestbook (
  id               uuid default gen_random_uuid() primary key,
  profile_user_id  uuid references public.profiles(id) on delete cascade not null,
  author_id        uuid references public.profiles(id) on delete cascade not null,
  message          text not null,
  created_at       timestamptz default now()
);

alter table public.guestbook enable row level security;

create policy "Guestbook entries are viewable by everyone"
  on public.guestbook for select using (true);

create policy "Logged-in users can leave guestbook entries"
  on public.guestbook for insert with check (auth.uid() = author_id);


-- ── Follows ──────────────────────────────────────────────────────
create table public.follows (
  id           uuid default gen_random_uuid() primary key,
  follower_id  uuid references public.profiles(id) on delete cascade not null,
  following_id uuid references public.profiles(id) on delete cascade not null,
  created_at   timestamptz default now(),
  unique(follower_id, following_id)
);

alter table public.follows enable row level security;

create policy "Follows are viewable by everyone"
  on public.follows for select using (true);

create policy "Users can follow others"
  on public.follows for insert with check (auth.uid() = follower_id);

create policy "Users can unfollow"
  on public.follows for delete using (auth.uid() = follower_id);


-- ── Blasts ───────────────────────────────────────────────────────
create table public.blasts (
  id             uuid default gen_random_uuid() primary key,
  sender_id      uuid references public.profiles(id) on delete cascade not null,
  message        text not null,
  recipient_type text default 'all followers',
  color          text default 'purple',
  expires_at     timestamptz not null,
  created_at     timestamptz default now()
);

alter table public.blasts enable row level security;

create policy "Active blasts are viewable by everyone"
  on public.blasts for select using (expires_at > now());

create policy "Users can send blasts"
  on public.blasts for insert with check (auth.uid() = sender_id);


-- ── Feeds ────────────────────────────────────────────────────────
create table public.feeds (
  id                 uuid default gen_random_uuid() primary key,
  user_id            uuid references public.profiles(id) on delete cascade not null,
  name               text not null,
  tags               text[] default '{}',
  color              text default '#a78bfa',
  includes_suggested boolean default true,
  created_at         timestamptz default now()
);

alter table public.feeds enable row level security;

create policy "Users can view their own feeds"
  on public.feeds for select using (auth.uid() = user_id);

create policy "Users can create feeds"
  on public.feeds for insert with check (auth.uid() = user_id);

create policy "Users can delete their own feeds"
  on public.feeds for delete using (auth.uid() = user_id);


-- ── Storage bucket ───────────────────────────────────────────────
-- Run this separately in Supabase → Storage → New bucket
-- Bucket name: post-images
-- Public: YES (toggle on)
-- Then add this policy in Storage → post-images → Policies:
--
-- Policy name: "Users can upload their own images"
-- Allowed operation: INSERT
-- Target roles: authenticated
-- WITH CHECK: (auth.uid()::text = (storage.foldername(name))[1])
