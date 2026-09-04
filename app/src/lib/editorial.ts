export const EDITORIAL_API_ORIGIN = (
  import.meta.env.VITE_EDITORIAL_API_ORIGIN || ""
).replace(/\/$/, "");

export interface EditorialTranslationInput {
  languageCode: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  publicationStatus: "draft" | "review" | "published" | "archived";
  changeNote?: string;
  authorId?: string;
}

export interface EditorialArticleInput {
  canonicalKey: string;
  entityType?: string;
  isFeatured?: boolean;
  translations: EditorialTranslationInput[];
  categoryIds?: string[];
  tagIds?: string[];
  sources?: Array<{
    id?: string;
    name?: string;
    sourceType?: string;
    url?: string;
    author?: string;
    publicationDate?: string;
    notes?: string;
    citationNote?: string;
    sortOrder?: number;
  }>;
}

export interface EditorialArticleRow {
  id: string;
  article_id: string;
  language_code: string;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  seo_title: string | null;
  seo_description: string | null;
  keywords: string[];
  publication_status: "draft" | "review" | "published" | "archived";
  updated_at: string;
}

async function editorialRequest<T>(
  path: string,
  token: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${EDITORIAL_API_ORIGIN}${path}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData
        ? {}
        : { "content-type": "application/json" }),
      "x-editorial-token": token,
      ...(options.headers || {}),
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(
      payload.error || `Editorial API returned ${response.status}.`,
    );
  return payload as T;
}

export function getEditorialToken() {
  return sessionStorage.getItem("world-encyclopedia-editorial-token") || "";
}

export function saveEditorialToken(token: string) {
  if (token)
    sessionStorage.setItem("world-encyclopedia-editorial-token", token);
  else sessionStorage.removeItem("world-encyclopedia-editorial-token");
}

export function listEditorialArticles(
  token: string,
  languageCode: string,
  status = "",
) {
  const query = new URLSearchParams({ language: languageCode });
  if (status) query.set("status", status);
  return editorialRequest<{ data: EditorialArticleRow[] }>(
    `/api/editorial/articles?${query.toString()}`,
    token,
  );
}

export function createEditorialArticle(
  token: string,
  input: EditorialArticleInput,
) {
  return editorialRequest<{
    data: { article: { id: string }; translations: EditorialArticleRow[] };
  }>("/api/editorial/articles", token, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateEditorialArticle(
  token: string,
  articleId: string,
  input: Pick<
    EditorialArticleInput,
    "translations" | "categoryIds" | "tagIds" | "sources"
  >,
) {
  return editorialRequest<{
    data: { articleId: string; translations: EditorialArticleRow[] };
  }>(`/api/editorial/articles/${articleId}`, token, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function changeEditorialStatus(
  token: string,
  articleId: string,
  languageCode: string,
  status: EditorialTranslationInput["publicationStatus"],
  changeNote: string,
) {
  return editorialRequest<{ data: EditorialArticleRow }>(
    `/api/editorial/articles/${articleId}/status`,
    token,
    {
      method: "POST",
      body: JSON.stringify({ languageCode, status, changeNote }),
    },
  );
}

export function listRevisions(
  token: string,
  articleId: string,
  languageCode: string,
) {
  return editorialRequest<{
    data: Array<{
      id: string;
      version: number;
      title: string;
      publication_status: string;
      change_note: string | null;
      created_at: string;
    }>;
  }>(
    `/api/editorial/articles/${articleId}/revisions?language=${encodeURIComponent(languageCode)}`,
    token,
  );
}

export function attachEditorialSource(
  token: string,
  articleId: string,
  source: NonNullable<EditorialArticleInput["sources"]>[number],
) {
  return editorialRequest<{ ok: true }>(
    `/api/editorial/articles/${articleId}/sources`,
    token,
    { method: "POST", body: JSON.stringify(source) },
  );
}

export function uploadEditorialMedia(
  token: string,
  input: {
    articleId: string;
    languageCode: string;
    altText: string;
    caption: string;
    isPrimary: boolean;
    file: File;
  },
) {
  const body = new FormData();
  body.append("articleId", input.articleId);
  body.append("languageCode", input.languageCode);
  body.append("altText", input.altText);
  body.append("caption", input.caption);
  body.append("isPrimary", String(input.isPrimary));
  body.append("file", input.file);
  return editorialRequest<{ data: unknown }>("/api/editorial/media", token, {
    method: "POST",
    body,
  });
}
