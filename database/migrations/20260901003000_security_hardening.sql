-- World Encyclopedia: security hardening after Supabase advisor review

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.set_article_search_text()
returns trigger
language plpgsql
set search_path = public
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

-- Explicit deny policy documents that revisions are not public and silences the
-- RLS-without-policy advisor without granting any visitor access.
create policy article_revisions_no_public_read on public.article_revisions
  for select to anon, authenticated
  using (false);
