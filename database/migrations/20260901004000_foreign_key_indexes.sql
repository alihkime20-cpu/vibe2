-- World Encyclopedia: covering indexes for foreign keys found by Supabase advisors

create index article_translations_author_id_idx
  on public.article_translations (author_id);

create index media_language_code_idx
  on public.media (language_code);

create index seo_metadata_og_image_media_id_idx
  on public.seo_metadata (og_image_media_id);
