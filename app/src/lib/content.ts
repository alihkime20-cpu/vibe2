import type { Database } from "../../../database/types/supabase.generated";
import { getSupabaseClient } from "./supabase";

export type TranslationRow =
  Database["public"]["Tables"]["article_translations"]["Row"];
export type LanguageRow = Database["public"]["Tables"]["languages"]["Row"];
export type CategoryTranslationRow =
  Database["public"]["Tables"]["category_translations"]["Row"];
export type TagTranslationRow =
  Database["public"]["Tables"]["tag_translations"]["Row"];
export type SourceRow = Database["public"]["Tables"]["sources"]["Row"];
export type MediaRow = Database["public"]["Tables"]["media"]["Row"];
export type SearchRow =
  Database["public"]["Functions"]["search_articles"]["Returns"][number];

export interface ArticleSummary {
  article_id: string;
  translation_id: string;
  language_code: string;
  title: string;
  slug: string;
  summary: string | null;
  updated_at: string;
  is_featured?: boolean;
  category?: string | null;
}

export interface SearchResult extends SearchRow {
  category?: string | null;
}

export interface ArticleDetail {
  translation: TranslationRow;
  article: Database["public"]["Tables"]["articles"]["Row"];
  pair: Pick<TranslationRow, "id" | "slug" | "language_code" | "title"> | null;
  media: MediaRow[];
  sources: Array<
    SourceRow & { citation_note: string | null; sort_order: number }
  >;
  categories: Array<
    Pick<CategoryTranslationRow, "category_id" | "name" | "slug">
  >;
  tags: Array<Pick<TagTranslationRow, "tag_id" | "name" | "slug">>;
  related: Array<
    Pick<TranslationRow, "article_id" | "title" | "slug" | "summary">
  >;
  author: Database["public"]["Tables"]["authors"]["Row"] | null;
}

export interface TaxonomyPage {
  name: string;
  description: string | null;
  slug: string;
  articles: ArticleSummary[];
  total: number;
}

export interface HomeData {
  latest: ArticleSummary[];
  featured: ArticleSummary[];
  categories: CategoryTranslationRow[];
}

const PAGE_SIZE = 12;

function clientOrThrow() {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase is not configured.");
  return client;
}

function mapTranslation(
  row: Pick<
    TranslationRow,
    | "article_id"
    | "id"
    | "language_code"
    | "title"
    | "slug"
    | "summary"
    | "updated_at"
  >,
): ArticleSummary {
  return {
    article_id: row.article_id,
    translation_id: row.id,
    language_code: row.language_code,
    title: row.title,
    slug: row.slug,
    summary: row.summary,
    updated_at: row.updated_at,
  };
}

async function addCategoryLabels<T extends { article_id: string }>(
  items: T[],
  languageCode: string,
): Promise<(T & { category?: string | null })[]> {
  if (!items.length) return items;
  const client = clientOrThrow();
  const ids = items.map((item) => item.article_id);
  const { data: relations } = await client
    .from("article_categories")
    .select("article_id,category_id,sort_order")
    .in("article_id", ids)
    .order("sort_order", { ascending: true });
  const categoryIds = [
    ...new Set((relations ?? []).map((relation) => relation.category_id)),
  ];
  if (!categoryIds.length) return items;
  const { data: labels } = await client
    .from("category_translations")
    .select("category_id,name,slug")
    .eq("language_code", languageCode)
    .in("category_id", categoryIds);
  const byCategory = new Map(
    (labels ?? []).map((label) => [label.category_id, label.name]),
  );
  const byArticle = new Map<string, string>();
  for (const relation of relations ?? []) {
    const name = byCategory.get(relation.category_id);
    if (name && !byArticle.has(relation.article_id))
      byArticle.set(relation.article_id, name);
  }
  return items.map((item) => ({
    ...item,
    category: byArticle.get(item.article_id) ?? null,
  }));
}

export async function fetchHome(languageCode: string): Promise<HomeData> {
  const client = clientOrThrow();
  const [latestResponse, featuredResponse, categoriesResponse] =
    await Promise.all([
      client
        .from("article_translations")
        .select("article_id,id,language_code,title,slug,summary,updated_at")
        .eq("language_code", languageCode)
        .eq("publication_status", "published")
        .order("updated_at", { ascending: false })
        .range(0, PAGE_SIZE - 1),
      client
        .from("article_translations")
        .select(
          "article_id,id,language_code,title,slug,summary,updated_at,articles!inner(is_featured)",
        )
        .eq("language_code", languageCode)
        .eq("publication_status", "published")
        .eq("articles.is_featured", true)
        .order("updated_at", { ascending: false })
        .range(0, 5),
      client
        .from("category_translations")
        .select(
          "category_id,id,language_code,name,slug,description,created_at,updated_at",
        )
        .eq("language_code", languageCode)
        .order("name", { ascending: true })
        .range(0, 7),
    ]);
  if (latestResponse.error) throw latestResponse.error;
  if (featuredResponse.error) throw featuredResponse.error;
  if (categoriesResponse.error) throw categoriesResponse.error;
  const latest = await addCategoryLabels(
    (latestResponse.data ?? []).map(mapTranslation),
    languageCode,
  );
  const featured = await addCategoryLabels(
    (featuredResponse.data ?? []).map((row) => ({
      ...mapTranslation(row),
      is_featured: true,
    })),
    languageCode,
  );
  return { latest, featured, categories: categoriesResponse.data ?? [] };
}

export async function searchPublicArticles(
  languageCode: string,
  query: string,
  page: number,
): Promise<{ results: SearchResult[]; totalKnown: number }> {
  const client = clientOrThrow();
  const { data, error } = await client.rpc("search_articles", {
    search_query: query,
    requested_language: languageCode,
    page_size: PAGE_SIZE,
    page_offset: Math.max(0, page - 1) * PAGE_SIZE,
  });
  if (error) throw error;
  const results = await addCategoryLabels(
    (data ?? []).map((row) => ({ ...row, category: null })),
    languageCode,
  );
  return {
    results,
    totalKnown:
      results.length === PAGE_SIZE
        ? page * PAGE_SIZE + 1
        : (page - 1) * PAGE_SIZE + results.length,
  };
}

export async function fetchArticle(
  languageCode: string,
  slug: string,
): Promise<ArticleDetail | null> {
  const client = clientOrThrow();
  const { data: translation, error: translationError } = await client
    .from("article_translations")
    .select("*")
    .eq("language_code", languageCode)
    .eq("slug", slug)
    .eq("publication_status", "published")
    .maybeSingle();
  if (translationError) throw translationError;
  if (!translation) return null;

  const [
    articleResponse,
    mediaResponse,
    sourceRelationsResponse,
    categoryRelationsResponse,
    tagRelationsResponse,
    relationResponse,
    authorResponse,
    pairResponse,
  ] = await Promise.all([
    client
      .from("articles")
      .select("*")
      .eq("id", translation.article_id)
      .maybeSingle(),
    client
      .from("media")
      .select("*")
      .eq("article_id", translation.article_id)
      .order("is_primary", { ascending: false })
      .order("created_at", { ascending: true }),
    client
      .from("article_sources")
      .select("source_id,citation_note,sort_order")
      .eq("article_id", translation.article_id)
      .order("sort_order", { ascending: true }),
    client
      .from("article_categories")
      .select("category_id,sort_order")
      .eq("article_id", translation.article_id)
      .order("sort_order", { ascending: true }),
    client
      .from("article_tags")
      .select("tag_id")
      .eq("article_id", translation.article_id),
    client
      .from("article_relations")
      .select("target_article_id,sort_order")
      .eq("source_article_id", translation.article_id)
      .order("sort_order", { ascending: true }),
    translation.author_id
      ? client
          .from("authors")
          .select("*")
          .eq("id", translation.author_id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    client
      .from("article_translations")
      .select("id,article_id,language_code,title,slug")
      .eq("article_id", translation.article_id)
      .eq("publication_status", "published")
      .neq("language_code", languageCode)
      .maybeSingle(),
  ]);
  if (articleResponse.error) throw articleResponse.error;
  if (!articleResponse.data) return null;
  if (mediaResponse.error) throw mediaResponse.error;
  if (sourceRelationsResponse.error) throw sourceRelationsResponse.error;
  if (categoryRelationsResponse.error) throw categoryRelationsResponse.error;
  if (tagRelationsResponse.error) throw tagRelationsResponse.error;
  if (relationResponse.error) throw relationResponse.error;
  if (authorResponse.error) throw authorResponse.error;
  if (pairResponse.error) throw pairResponse.error;

  const sourceIds = (sourceRelationsResponse.data ?? []).map(
    (item) => item.source_id,
  );
  const categoryIds = (categoryRelationsResponse.data ?? []).map(
    (item) => item.category_id,
  );
  const tagIds = (tagRelationsResponse.data ?? []).map((item) => item.tag_id);
  const relatedIds = (relationResponse.data ?? []).map(
    (item) => item.target_article_id,
  );
  const [sourcesResponse, categoriesResponse, tagsResponse, relatedResponse] =
    await Promise.all([
      sourceIds.length
        ? client.from("sources").select("*").in("id", sourceIds)
        : Promise.resolve({ data: [], error: null }),
      categoryIds.length
        ? client
            .from("category_translations")
            .select("category_id,name,slug")
            .eq("language_code", languageCode)
            .in("category_id", categoryIds)
        : Promise.resolve({ data: [], error: null }),
      tagIds.length
        ? client
            .from("tag_translations")
            .select("tag_id,name,slug")
            .eq("language_code", languageCode)
            .in("tag_id", tagIds)
        : Promise.resolve({ data: [], error: null }),
      relatedIds.length
        ? client
            .from("article_translations")
            .select("article_id,title,slug,summary")
            .eq("language_code", languageCode)
            .eq("publication_status", "published")
            .in("article_id", relatedIds)
        : Promise.resolve({ data: [], error: null }),
    ]);
  if (sourcesResponse.error) throw sourcesResponse.error;
  if (categoriesResponse.error) throw categoriesResponse.error;
  if (tagsResponse.error) throw tagsResponse.error;
  if (relatedResponse.error) throw relatedResponse.error;
  const sourcesById = new Map(
    (sourcesResponse.data ?? []).map((source) => [source.id, source]),
  );
  return {
    translation,
    article: articleResponse.data,
    pair: pairResponse.data,
    media: mediaResponse.data ?? [],
    sources: (sourceRelationsResponse.data ?? [])
      .map((relation) => ({
        ...sourcesById.get(relation.source_id)!,
        citation_note: relation.citation_note,
        sort_order: relation.sort_order,
      }))
      .filter((source) => source.id),
    categories: categoriesResponse.data ?? [],
    tags: tagsResponse.data ?? [],
    related: relatedResponse.data ?? [],
    author: authorResponse.data,
  };
}

async function fetchTaxonomy(
  kind: "category" | "tag",
  languageCode: string,
  slug: string,
  page: number,
): Promise<TaxonomyPage | null> {
  const client = clientOrThrow();
  if (kind === "category") {
    const { data: translation, error: translationError } = await client
      .from("category_translations")
      .select("*")
      .eq("language_code", languageCode)
      .eq("slug", slug)
      .maybeSingle();
    if (translationError) throw translationError;
    if (!translation) return null;
    const { data: relations, error: relationError } = await client
      .from("article_categories")
      .select("article_id")
      .eq("category_id", translation.category_id)
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
    if (relationError) throw relationError;
    return buildTaxonomyResult(
      client,
      translation.name,
      translation.description,
      translation.slug,
      (relations ?? []).map((relation) => relation.article_id),
      languageCode,
    );
  }
  const { data: translation, error: translationError } = await client
    .from("tag_translations")
    .select("*")
    .eq("language_code", languageCode)
    .eq("slug", slug)
    .maybeSingle();
  if (translationError) throw translationError;
  if (!translation) return null;
  const { data: relations, error: relationError } = await client
    .from("article_tags")
    .select("article_id")
    .eq("tag_id", translation.tag_id)
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  if (relationError) throw relationError;
  return buildTaxonomyResult(
    client,
    translation.name,
    null,
    translation.slug,
    (relations ?? []).map((relation) => relation.article_id),
    languageCode,
  );
}

async function buildTaxonomyResult(
  client: ReturnType<typeof clientOrThrow>,
  name: string,
  description: string | null,
  slug: string,
  ids: string[],
  languageCode: string,
): Promise<TaxonomyPage> {
  if (!ids.length) return { name, description, slug, articles: [], total: 0 };
  const {
    data: articles,
    error: articlesError,
    count,
  } = await client
    .from("article_translations")
    .select("article_id,id,language_code,title,slug,summary,updated_at", {
      count: "exact",
    })
    .eq("language_code", languageCode)
    .eq("publication_status", "published")
    .in("article_id", ids)
    .order("updated_at", { ascending: false });
  if (articlesError) throw articlesError;
  return {
    name,
    description,
    slug,
    articles: await addCategoryLabels(
      (articles ?? []).map(mapTranslation),
      languageCode,
    ),
    total: count ?? articles?.length ?? 0,
  };
}

export const fetchCategory = (
  languageCode: string,
  slug: string,
  page: number,
) => fetchTaxonomy("category", languageCode, slug, page);
export const fetchTag = (languageCode: string, slug: string, page: number) =>
  fetchTaxonomy("tag", languageCode, slug, page);

export async function fetchLanguages(): Promise<LanguageRow[]> {
  const client = clientOrThrow();
  const { data, error } = await client
    .from("languages")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export function storageUrl(bucket: string, path: string) {
  const client = getSupabaseClient();
  return client?.storage.from(bucket).getPublicUrl(path).data.publicUrl ?? "";
}
