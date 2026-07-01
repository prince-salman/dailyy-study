-- ============================================================
-- DAILYY STUDY - SUPABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================================

create table if not exists users (
  id text primary key,
  name text not null,
  email text unique not null,
  password text not null,
  roles text[] default array['student'],
  subjects text[] default array[]::text[],
  xp integer default 0,
  streak integer default 0,
  last_login_date text default '',
  xp_history jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

create table if not exists transactions (
  id text primary key,
  user_email text not null,
  user_name text not null default '',
  package text not null,
  price integer not null default 0,
  subject text default '',
  status text not null default 'pending',
  approved_at timestamptz,
  date timestamptz default now()
);

create table if not exists tryout_questions (
  id bigint primary key,
  q text not null,
  options text[] not null,
  ans integer not null default 0,
  subject text default 'Umum',
  video_url text default '',
  error_rate integer default 50
);

create table if not exists duel_questions (
  id bigint primary key,
  q text not null,
  options text[] not null,
  ans integer not null default 0,
  subject text default 'Umum'
);

create table if not exists tryout_history (
  id bigserial primary key,
  user_email text not null,
  title text default 'Simulasi UTBK',
  score integer default 0,
  correct integer default 0,
  total integer default 0,
  xp_claimed boolean default false,
  date timestamptz default now()
);

create table if not exists audit_logs (
  id bigserial primary key,
  user_name text default 'Unknown',
  user_role text default 'guest',
  action text not null,
  created_at timestamptz default now()
);

create table if not exists expenses (
  id text primary key,
  name text not null,
  price integer not null default 0,
  date timestamptz default now()
);

create table if not exists counseling_notes (
  user_id text primary key,
  note text default '',
  updated_at timestamptz default now()
);

create table if not exists helpdesk_tickets (
  id text primary key,
  user_email text not null default '',
  user_name text not null default '',
  subject text not null default '',
  message text not null default '',
  status text not null default 'open',
  reply text default '',
  created_at timestamptz default now()
);

create table if not exists live_session (
  id integer primary key default 1,
  is_live boolean default false,
  zoom_link text default '',
  zoom_meeting_id text default '',
  zoom_passcode text default '',
  live_title text default '',
  updated_at timestamptz default now()
);

insert into live_session (id) values (1) on conflict (id) do nothing;

-- Disable RLS for all tables (using anon key with app-level auth)
alter table users disable row level security;
alter table transactions disable row level security;
alter table tryout_questions disable row level security;
alter table duel_questions disable row level security;
alter table tryout_history disable row level security;
alter table audit_logs disable row level security;
alter table expenses disable row level security;
alter table counseling_notes disable row level security;
alter table helpdesk_tickets disable row level security;
alter table live_session disable row level security;
