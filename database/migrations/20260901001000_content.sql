-- World Encyclopedia: translations, taxonomy, references, media, and editorial history

create table public.article_translations (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles(id) on delete cascade,
  language_code text not null references public.languages(code) on update cascade on delete restrict,
  title text not null,
  slug text not null,
  summary text,
  content text not null default '',
  content_format text not null default 'markdown' check (content_format in ('markdown', 'html', 'plain')),
  seo_title text,
  seo_description text,
  keywords text[] not null default '{}'::text[],
  publication_status text not null default 'draft' check (publication_status in ('draft', 'review', 'published', 'archived')),
  published_at timestamptz,
  author_id uuid references public.authors(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (article_id, language_code),
  unique (language_code, slug),
  check (length(trim(title)) > 0),
  check (length(trim(slug)) > 0),
  check (publication_status <> 'published' or published_at is not null)
);

comment on table public.article_translations is 'One row per article language. The article/topic remains a single logical entity.';

create table public.article_revisions (
  id uuid primary key default gen_random_uuid(),
  article_translation_id uuid not null references public.article_translations(id) on delete cascade,
  version integer not null check (version > 0),
  title text not null,
  summary text,
  content text not null default '',
  content_format text not null default 'markdown' check (content_format in ('markdown', 'html', 'plain')),
  seo_title text,
  seo_description text,
  keywords text[] not null default '{}'::text[],
  publication_status text not null check (publication_status in ('draft', 'review', 'published', 'archived')),
  change_note text,
  created_by text,
  created_at timestamptz not null default timezone('utc', now()),
  unique (article_translation_id, version)
);

comment on table public.article_revisions is 'Immutable snapshots for auditability and rollback; application code should only insert rows.';

create table public.article_authors (
  article_id uuid not null references public.articles(id) on delete cascade,
  author_id uuid not null references public.authors(id) on delete cascade,
  contribution_role text not null default 'author',
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (article_id, author_id),
  check (length(trim(contribution_role)) > 0)
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.categories(id) on delete set null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

comment on table public.categories is 'Language-neutral category tree using an adjacency-list parent_id.';

create table public.category_translations (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  language_code text not null references public.languages(code) on update cascade on delete restrict,
  name text not null,
  slug text not null,
  description text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (category_id, language_code),
  unique (language_code, slug),
  check (length(trim(name)) > 0),
  check (length(trim(slug)) > 0)
);

create table public.article_categories (
  article_id uuid not null references public.articles(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  is_primary boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (article_id, category_id)
);

create unique index article_categories_one_primary_idx
  on public.article_categories (article_id)
  where is_primary = true;

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  canonical_key text not null unique,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (length(trim(canonical_key)) > 0)
);

create table public.tag_translations (
  id uuid primary key default gen_random_uuid(),
  tag_id uuid not null references public.tags(id) on delete cascade,
  language_code text not null references public.languages(code) on update cascade on delete restrict,
  name text not null,
  slug text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (tag_id, language_code),
  unique (language_code, slug),
  check (length(trim(name)) > 0),
  check (length(trim(slug)) > 0)
);

create table public.article_tags (
  article_id uuid not null references public.articles(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (article_id, tag_id)
);

create table public.article_relations (
  source_article_id uuid not null references public.articles(id) on delete cascade,
  target_article_id uuid not null references public.articles(id) on delete cascade,
  relation_type text not null check (relation_type in ('related', 'similar', 'parent_topic', 'child_topic', 'references', 'custom')),
  relation_key text,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (source_article_id, target_article_id, relation_type),
  check (source_article_id <> target_article_id),
  check (relation_type <> 'custom' or length(trim(coalesce(relation_key, ''))) > 0)
);

comment on table public.article_relations is 'Directed article graph; reverse links can be stored explicitly when needed.';

create table public.sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  source_type text not null default 'other',
  url text,
  source_author text,
  publication_date date,
  accessed_at date not null default current_date,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (length(trim(name)) > 0),
  check (url is null or url ~* '^https?://')
);

create table public.article_sources (
  article_id uuid not null references public.articles(id) on delete cascade,
  source_id uuid not null references public.sources(id) on delete cascade,
  citation_note text,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (article_id, source_id)
);

create table public.media (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles(id) on delete cascade,
  storage_bucket text not null default 'encyclopedia-media',
  storage_path text not null,
  filename text not null,
  mime_type text not null,
  file_size_bytes bigint check (file_size_bytes is null or file_size_bytes >= 0),
  alt_text text,
  caption text,
  language_code text references public.languages(code) on update cascade on delete set null,
  is_primary boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (storage_bucket, storage_path),
  check (length(trim(storage_path)) > 0),
  check (length(trim(filename)) > 0),
  check (length(trim(mime_type)) > 0)
);

create unique index media_one_primary_per_article_idx
  on public.media (article_id)
  where is_primary = true;

create table public.seo_metadata (
  article_translation_id uuid primary key references public.article_translations(id) on delete cascade,
  canonical_url text,
  og_title text,
  og_description text,
  og_image_media_id uuid references public.media(id) on delete set null,
  twitter_card text not null default 'summary_large_image' check (twitter_card in ('summary', 'summary_large_image', 'player', 'app')),
  twitter_title text,
  twitter_description text,
  noindex boolean not null default false,
  structured_data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default timezone('utc', now()),
  check (canonical_url is null or canonical_url ~* '^https?://')
);

create trigger article_translations_set_updated_at
before update on public.article_translations
for each row execute function public.set_updated_at();

create trigger categories_set_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

create trigger category_translations_set_updated_at
before update on public.category_translations
for each row execute function public.set_updated_at();

create trigger tags_set_updated_at
before update on public.tags
for each row execute function public.set_updated_at();

create trigger tag_translations_set_updated_at
before update on public.tag_translations
for each row execute function public.set_updated_at();

create trigger sources_set_updated_at
before update on public.sources
for each row execute function public.set_updated_at();

create trigger media_set_updated_at
before update on public.media
for each row execute function public.set_updated_at();

create trigger seo_metadata_set_updated_at
before update on public.seo_metadata
for each row execute function public.set_updated_at();

create index article_translations_article_id_idx on public.article_translations (article_id);
create index article_translations_status_idx on public.article_translations (publication_status, language_code);
create index article_translations_published_at_idx on public.article_translations (published_at desc)
  where publication_status = 'published';
create index article_revisions_translation_created_idx on public.article_revisions (article_translation_id, created_at desc);
create index article_authors_author_id_idx on public.article_authors (author_id);
create index categories_parent_id_idx on public.categories (parent_id);
create index categories_active_sort_idx on public.categories (is_active, sort_order);
create index category_translations_category_id_idx on public.category_translations (category_id);
create index article_categories_category_id_idx on public.article_categories (category_id, sort_order);
create index tag_translations_tag_id_idx on public.tag_translations (tag_id);
create index article_tags_tag_id_idx on public.article_tags (tag_id);
create index article_relations_target_idx on public.article_relations (target_article_id, relation_type);
create index article_relations_source_idx on public.article_relations (source_article_id, relation_type);
create index article_sources_source_id_idx on public.article_sources (source_id);
create index media_article_id_idx on public.media (article_id, is_primary desc, created_at);
