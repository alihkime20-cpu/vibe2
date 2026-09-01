-- World Encyclopedia: core entities and language registry
-- Portable PostgreSQL migration for Supabase or any standard PostgreSQL 15+ instance.

create extension if not exists pgcrypto with schema extensions;
create extension if not exists pgroonga with schema extensions;
create extension if not exists ltree with schema extensions;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table public.languages (
  code text primary key check (code ~ '^[a-z]{2,3}(-[A-Z][a-z]{2})?$'),
  name text not null,
  native_name text not null,
  direction text not null default 'ltr' check (direction in ('ltr', 'rtl')),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

comment on table public.languages is 'Supported content and URL languages; add rows rather than changing the schema.';

insert into public.languages (code, name, native_name, direction, is_active, sort_order)
values
  ('ar', 'Arabic', 'العربية', 'rtl', true, 1),
  ('en', 'English', 'English', 'ltr', true, 2)
on conflict (code) do update set
  name = excluded.name,
  native_name = excluded.native_name,
  direction = excluded.direction,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

create table public.topics (
  id uuid primary key default gen_random_uuid(),
  canonical_key text not null unique,
  entity_type text not null default 'topic',
  parent_topic_id uuid references public.topics(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (length(trim(canonical_key)) > 0),
  check (length(trim(entity_type)) > 0)
);

comment on table public.topics is 'One logical topic/entity shared by all language versions.';

create table public.articles (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null unique references public.topics(id) on delete cascade,
  is_featured boolean not null default false,
  view_count bigint not null default 0 check (view_count >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

comment on table public.articles is 'Editorial article container for a topic; translations hold language-specific content and publication state.';

create table public.authors (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  bio text,
  website_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (length(trim(display_name)) > 0)
);

create trigger topics_set_updated_at
before update on public.topics
for each row execute function public.set_updated_at();

create trigger articles_set_updated_at
before update on public.articles
for each row execute function public.set_updated_at();

create trigger authors_set_updated_at
before update on public.authors
for each row execute function public.set_updated_at();

create index topics_parent_topic_id_idx on public.topics (parent_topic_id);
create index topics_entity_type_idx on public.topics (entity_type);
create index articles_featured_idx on public.articles (is_featured) where is_featured = true;
create index authors_display_name_idx on public.authors (display_name);
