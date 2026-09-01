-- World Encyclopedia: multilingual search, public read policies, and storage boundary

alter table public.article_translations
  add column search_text text not null default '';

create or replace function public.set_article_search_text()
returns trigger
language plpgsql
as $$
begin
  new.search_text := lower(
    concat_ws(
      ' ',
      new.title,
      coalesce(new.summary, ''),
      coalesce(new.content, ''),
      coalesce(array_to_string(new.keywords, ' '), '')
    )
  );
  return new;
end;
$$;

update public.article_translations
set search_text = lower(
  concat_ws(
    ' ',
    title,
    coalesce(summary, ''),
    coalesce(content, ''),
    coalesce(array_to_string(keywords, ' '), '')
  )
);

create trigger article_translations_set_search_text
before insert or update of title, summary, content, keywords
on public.article_translations
for each row execute function public.set_article_search_text();

comment on column public.article_translations.search_text is 'Trigger-maintained multilingual search corpus; indexed with PGroonga for Arabic and English.';

create index article_translations_search_text_pgroonga_idx
  on public.article_translations using pgroonga (search_text);

create index article_translations_title_pgroonga_idx
  on public.article_translations using pgroonga (title);

create index article_translations_summary_pgroonga_idx
  on public.article_translations using pgroonga (summary);

create index article_translations_content_pgroonga_idx
  on public.article_translations using pgroonga (content);

create or replace function public.search_articles(
  search_query text,
  requested_language text default 'ar',
  page_size integer default 20,
  page_offset integer default 0
)
returns table (
  article_id uuid,
  topic_id uuid,
  translation_id uuid,
  language_code text,
  title text,
  slug text,
  summary text,
  publication_status text,
  relevance real
)
language sql
stable
security invoker
set search_path = public, extensions
as $$
  select
    t.article_id,
    a.topic_id,
    t.id as translation_id,
    t.language_code,
    t.title,
    t.slug,
    t.summary,
    t.publication_status,
    (
      case when t.title &@~ search_query then 8 else 0 end +
      case when coalesce(t.summary, '') &@~ search_query then 4 else 0 end +
      case when coalesce(t.keywords::text, '') &@~ search_query then 3 else 0 end +
      case when t.content &@~ search_query then 1 else 0 end
    )::real as relevance
  from public.article_translations t
  join public.articles a on a.id = t.article_id
  where t.language_code = coalesce(nullif(requested_language, ''), 'ar')
    and t.publication_status = 'published'
    and t.search_text &@~ search_query
  order by relevance desc, t.updated_at desc
  limit greatest(1, least(coalesce(page_size, 20), 100))
  offset greatest(coalesce(page_offset, 0), 0);
$$;

comment on function public.search_articles(text, text, integer, integer) is 'Public multilingual article search. PGroonga matches Arabic and English; relevance boosts title, summary, keywords, then content.';

alter table public.languages enable row level security;
alter table public.topics enable row level security;
alter table public.articles enable row level security;
alter table public.authors enable row level security;
alter table public.article_translations enable row level security;
alter table public.article_revisions enable row level security;
alter table public.article_authors enable row level security;
alter table public.categories enable row level security;
alter table public.category_translations enable row level security;
alter table public.article_categories enable row level security;
alter table public.tags enable row level security;
alter table public.tag_translations enable row level security;
alter table public.article_tags enable row level security;
alter table public.article_relations enable row level security;
alter table public.sources enable row level security;
alter table public.article_sources enable row level security;
alter table public.media enable row level security;
alter table public.seo_metadata enable row level security;

create policy languages_public_read on public.languages
  for select to anon, authenticated
  using (is_active = true);

create policy topics_public_read on public.topics
  for select to anon, authenticated
  using (exists (
    select 1 from public.articles a
    join public.article_translations t on t.article_id = a.id
    where a.topic_id = topics.id and t.publication_status = 'published'
  ));

create policy articles_public_read on public.articles
  for select to anon, authenticated
  using (exists (
    select 1 from public.article_translations t
    where t.article_id = articles.id and t.publication_status = 'published'
  ));

create policy authors_public_read on public.authors
  for select to anon, authenticated
  using (exists (
    select 1
    from public.article_authors aa
    join public.articles a on a.id = aa.article_id
    join public.article_translations t on t.article_id = a.id
    where aa.author_id = authors.id and t.publication_status = 'published'
  ));

create policy article_translations_public_read on public.article_translations
  for select to anon, authenticated
  using (publication_status = 'published');

create policy article_authors_public_read on public.article_authors
  for select to anon, authenticated
  using (exists (
    select 1 from public.article_translations t
    where t.article_id = article_authors.article_id and t.publication_status = 'published'
  ));

create policy categories_public_read on public.categories
  for select to anon, authenticated
  using (is_active = true);

create policy category_translations_public_read on public.category_translations
  for select to anon, authenticated
  using (exists (
    select 1 from public.categories c
    where c.id = category_translations.category_id and c.is_active = true
  ));

create policy article_categories_public_read on public.article_categories
  for select to anon, authenticated
  using (exists (
    select 1 from public.article_translations t
    where t.article_id = article_categories.article_id and t.publication_status = 'published'
  ));

create policy tags_public_read on public.tags
  for select to anon, authenticated
  using (exists (
    select 1 from public.article_tags at
    join public.article_translations t on t.article_id = at.article_id
    where at.tag_id = tags.id and t.publication_status = 'published'
  ));

create policy tag_translations_public_read on public.tag_translations
  for select to anon, authenticated
  using (exists (
    select 1
    from public.tags tg
    join public.article_tags at on at.tag_id = tg.id
    join public.article_translations tr on tr.article_id = at.article_id
    where tg.id = tag_translations.tag_id and tr.publication_status = 'published'
  ));

create policy article_tags_public_read on public.article_tags
  for select to anon, authenticated
  using (exists (
    select 1 from public.article_translations t
    where t.article_id = article_tags.article_id and t.publication_status = 'published'
  ));

create policy article_relations_public_read on public.article_relations
  for select to anon, authenticated
  using (
    exists (select 1 from public.article_translations t where t.article_id = article_relations.source_article_id and t.publication_status = 'published')
    and exists (select 1 from public.article_translations t where t.article_id = article_relations.target_article_id and t.publication_status = 'published')
  );

create policy sources_public_read on public.sources
  for select to anon, authenticated
  using (exists (
    select 1 from public.article_sources ars
    join public.article_translations t on t.article_id = ars.article_id
    where ars.source_id = sources.id and t.publication_status = 'published'
  ));

create policy article_sources_public_read on public.article_sources
  for select to anon, authenticated
  using (exists (
    select 1 from public.article_translations t
    where t.article_id = article_sources.article_id and t.publication_status = 'published'
  ));

create policy media_public_read on public.media
  for select to anon, authenticated
  using (exists (
    select 1 from public.article_translations t
    where t.article_id = media.article_id and t.publication_status = 'published'
  ));

create policy seo_metadata_public_read on public.seo_metadata
  for select to anon, authenticated
  using (exists (
    select 1 from public.article_translations t
    where t.id = seo_metadata.article_translation_id and t.publication_status = 'published'
  ));

-- Revisions are intentionally private. Content administration uses the service role or a future editorial role.

insert into storage.buckets (id, name, public)
values ('encyclopedia-media', 'encyclopedia-media', true)
on conflict (id) do update set public = excluded.public;

create policy encyclopedia_media_public_read on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'encyclopedia-media');
