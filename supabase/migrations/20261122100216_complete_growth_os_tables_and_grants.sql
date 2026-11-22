-- Add remaining application tables without changing existing content.
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  brand_positioning text,
  timezone text not null default 'Asia/Kolkata'
);
create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  url text not null,
  source_type text not null,
  reliability_score integer not null default 50,
  last_checked_at timestamptz,
  unique(owner_id,url)
);
alter table public.ideas add column if not exists source_ids uuid[] not null default '{}';
alter table public.voice_examples add column if not exists quality_score integer;
alter table public.experience_facts add column if not exists created_at timestamptz not null default now();
alter table public.posts add column if not exists approved_by uuid references auth.users(id);
create table if not exists public.post_versions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  version integer not null,
  content text not null,
  editor_notes text,
  created_at timestamptz not null default now(),
  unique(post_id,version)
);
create table if not exists public.workflow_runs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id),
  workflow text not null,
  status text not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  error text
);
create index if not exists posts_owner_idx on public.posts(owner_id,created_at desc);
create index if not exists metrics_post_idx on public.post_metrics(post_id,captured_at desc);
create index if not exists ideas_owner_idx on public.ideas(owner_id,status,created_at);
do $$ declare t text; k text; begin
  foreach t in array array['profiles','sources','post_versions','workflow_runs'] loop
    execute format('alter table public.%I enable row level security',t);
    k := case when t='profiles' then 'user_id' else 'owner_id' end;
    execute format('create policy owner_access on public.%I for all to authenticated using (%I = (select auth.uid())) with check (%I = (select auth.uid()))',t,k,k);
  end loop;
end $$;
grant usage on schema public to authenticated, service_role;
grant select,insert,update,delete on public.profiles,public.sources,public.ideas,public.voice_examples,public.experience_facts,public.posts,public.post_versions,public.post_metrics,public.workflow_runs to authenticated;
grant all on public.profiles,public.sources,public.ideas,public.voice_examples,public.experience_facts,public.posts,public.post_versions,public.post_metrics,public.workflow_runs,public.publish_attempts to service_role;
revoke all on public.publish_attempts from anon, authenticated;
