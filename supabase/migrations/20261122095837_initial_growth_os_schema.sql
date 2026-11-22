create extension if not exists pgcrypto;
create type public.post_status as enum ('draft','review','approved','scheduled','publishing','published','mock_published','failed','unknown_delivery','cancelled');
create table public.ideas(id uuid primary key default gen_random_uuid(),owner_id uuid not null references auth.users(id),title text not null,angle text not null default '',status text not null default 'inbox',score numeric,created_at timestamptz not null default now());
create table public.posts(id uuid primary key default gen_random_uuid(),owner_id uuid not null references auth.users(id),idea_id uuid references public.ideas(id),content text not null,content_hash text not null,status public.post_status not null default 'draft',version integer not null default 1,approved_version integer,approved_at timestamptz,scheduled_at timestamptz,published_at timestamptz,linkedin_post_id text unique,claim_token uuid,claimed_at timestamptz,last_error text,created_at timestamptz not null default now(),updated_at timestamptz not null default now(),constraint approved_version_valid check(approved_version is null or approved_version=version));
create table public.voice_examples(id uuid primary key default gen_random_uuid(),owner_id uuid not null references auth.users(id),content text not null,tags text[] not null default '{}',created_at timestamptz not null default now());
create table public.experience_facts(id uuid primary key default gen_random_uuid(),owner_id uuid not null references auth.users(id),claim text not null,evidence text,approved boolean not null default false);
create table public.post_metrics(id uuid primary key default gen_random_uuid(),owner_id uuid not null references auth.users(id),post_id uuid not null references public.posts(id),captured_at timestamptz not null default now(),impressions int,reactions int,comments int,reposts int,source text not null);
create table public.publish_attempts(id uuid primary key default gen_random_uuid(),post_id uuid not null references public.posts(id),claim_token uuid not null unique,status text not null,external_id text,error_message text,started_at timestamptz not null default now(),finished_at timestamptz);
create index posts_due_idx on public.posts(scheduled_at) where status='scheduled';
do $$ declare t text; begin foreach t in array array['ideas','posts','voice_examples','experience_facts','post_metrics'] loop execute format('alter table public.%I enable row level security',t); execute format('create policy owner_access on public.%I for all to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()))',t); end loop; end $$;
alter table public.publish_attempts enable row level security;
create or replace function public.claim_due_posts(max_items integer default 5)
returns table(id uuid,content text,claim_token uuid) language plpgsql security definer set search_path = '' as $$
begin
 if auth.role() <> 'service_role' then raise exception 'forbidden'; end if;
 return query
 with due as (select p.id from public.posts p where p.status='scheduled' and p.scheduled_at<=now() and p.approved_version=p.version and p.approved_at is not null order by p.scheduled_at for update skip locked limit least(greatest(max_items,1),10)),
 claimed as (update public.posts p set status='publishing',claim_token=gen_random_uuid(),claimed_at=now(),updated_at=now() from due where p.id=due.id returning p.id,p.content,p.claim_token),
 attempts as (insert into public.publish_attempts(post_id,claim_token,status) select c.id,c.claim_token,'in_progress' from claimed c returning post_id)
 select c.id,c.content,c.claim_token from claimed c;
end $$;
create or replace function public.finish_publish(p_post_id uuid,p_claim_token uuid,p_status text,p_external_id text,p_error text)
returns void language plpgsql security definer set search_path = '' as $$
begin
 if auth.role() <> 'service_role' then raise exception 'forbidden'; end if;
 if p_status not in ('published','mock_published','failed','unknown_delivery') then raise exception 'invalid status'; end if;
 update public.posts set status=p_status::public.post_status,linkedin_post_id=p_external_id,last_error=p_error,published_at=case when p_status in ('published','mock_published') then now() else null end,updated_at=now() where id=p_post_id and claim_token=p_claim_token and status='publishing';
 if not found then raise exception 'stale claim'; end if;
 update public.publish_attempts set status=p_status,external_id=p_external_id,error_message=p_error,finished_at=now() where claim_token=p_claim_token;
end $$;
revoke all on function public.claim_due_posts(integer) from public,anon,authenticated;
revoke all on function public.finish_publish(uuid,uuid,text,text,text) from public,anon,authenticated;
grant execute on function public.claim_due_posts(integer) to service_role;
grant execute on function public.finish_publish(uuid,uuid,text,text,text) to service_role;