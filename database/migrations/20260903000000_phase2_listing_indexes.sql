-- World Encyclopedia phase two: public listing and slug lookup indexes

create index if not exists article_translations_published_language_updated_idx
  on public.article_translations (language_code, updated_at desc)
  where publication_status = 'published';

create index if not exists article_translations_published_language_slug_idx
  on public.article_translations (language_code, slug)
  where publication_status = 'published';

create index if not exists category_translations_language_slug_idx
  on public.category_translations (language_code, slug);

create index if not exists tag_translations_language_slug_idx
  on public.tag_translations (language_code, slug);

create index if not exists article_categories_article_sort_idx
  on public.article_categories (article_id, sort_order);

create index if not exists article_tags_article_idx
  on public.article_tags (article_id);
