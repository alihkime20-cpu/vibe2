import { timingSafeEqual } from "node:crypto";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import multer from "multer";
import type { Database } from "../database/types/supabase.generated";
import {
  getAdminSupabase,
  getEditorialToken,
  getPublicSupabaseConfig,
} from "./supabase";

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);
    callback(null, allowed.has(file.mimetype));
  },
});

type TranslationInsert =
  Database["public"]["Tables"]["article_translations"]["Insert"];
type SourceInsert = Database["public"]["Tables"]["sources"]["Insert"];
type ArticleTranslation =
  Database["public"]["Tables"]["article_translations"]["Row"];

const configuredOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
if (configuredOrigins.length) {
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || configuredOrigins.includes(origin))
          return callback(null, true);
        return callback(new Error("Origin is not allowed by CORS."));
      },
      credentials: false,
      methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: [
        "content-type",
        "authorization",
        "x-editorial-token",
        "x-editor",
      ],
    }),
  );
}
app.use(express.json({ limit: "2mb" }));

function sendError(
  res: Response,
  status: number,
  message: string,
  details?: unknown,
) {
  return res
    .status(status)
    .json({ error: message, ...(details ? { details } : {}) });
}

function tokensMatch(expected: string, presented: string) {
  const expectedBuffer = Buffer.from(expected);
  const presentedBuffer = Buffer.from(presented);
  return (
    expectedBuffer.length === presentedBuffer.length &&
    timingSafeEqual(expectedBuffer, presentedBuffer)
  );
}

function requireEditorialToken(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const expected = getEditorialToken();
  const presented =
    req.header("x-editorial-token") ||
    req.header("authorization")?.replace(/^Bearer\s+/i, "");
  if (!expected)
    return sendError(
      res,
      503,
      "Editorial API is not configured. Set EDITORIAL_ADMIN_TOKEN on the server.",
    );
  if (!presented || !tokensMatch(expected, presented))
    return sendError(res, 401, "Valid editorial credentials are required.");
  next();
}

function adminOrFail(res: Response) {
  const client = getAdminSupabase();
  if (!client) {
    sendError(
      res,
      503,
      "Editorial API is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY on the server.",
    );
    return null;
  }
  return client;
}

function bodyRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function stringValue(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function stringArray(value: unknown) {
  return Array.isArray(value)
    ? value
        .filter(
          (item): item is string =>
            typeof item === "string" && item.trim().length > 0,
        )
        .map((item) => item.trim())
    : [];
}

function jsonObject(
  value: unknown,
): Database["public"]["Tables"]["seo_metadata"]["Insert"]["structured_data"] {
  return (
    value && typeof value === "object" ? value : {}
  ) as Database["public"]["Tables"]["seo_metadata"]["Insert"]["structured_data"];
}

async function createRevision(
  client: NonNullable<ReturnType<typeof getAdminSupabase>>,
  translation: ArticleTranslation,
  changeNote: string | null,
  createdBy: string | null,
) {
  const { data: latest, error: latestError } = await client
    .from("article_revisions")
    .select("version")
    .eq("article_translation_id", translation.id)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (latestError) throw latestError;
  const { error } = await client.from("article_revisions").insert({
    article_translation_id: translation.id,
    version: (latest?.version ?? 0) + 1,
    title: translation.title,
    summary: translation.summary,
    content: translation.content,
    content_format: translation.content_format,
    seo_title: translation.seo_title,
    seo_description: translation.seo_description,
    keywords: translation.keywords,
    publication_status: translation.publication_status,
    change_note: changeNote,
    created_by: createdBy,
  });
  if (error) throw error;
}

async function replaceArticleRelations(
  client: NonNullable<ReturnType<typeof getAdminSupabase>>,
  articleId: string,
  payload: Record<string, unknown>,
) {
  const categoryIds = stringArray(payload.categoryIds);
  if (Array.isArray(payload.categoryIds)) {
    const { error: deleteError } = await client
      .from("article_categories")
      .delete()
      .eq("article_id", articleId);
    if (deleteError) throw deleteError;
    if (categoryIds.length) {
      const { error } = await client.from("article_categories").insert(
        categoryIds.map((categoryId, index) => ({
          article_id: articleId,
          category_id: categoryId,
          is_primary: index === 0,
          sort_order: index,
        })),
      );
      if (error) throw error;
    }
  }
  const tagIds = stringArray(payload.tagIds);
  if (Array.isArray(payload.tagIds)) {
    const { error: deleteError } = await client
      .from("article_tags")
      .delete()
      .eq("article_id", articleId);
    if (deleteError) throw deleteError;
    if (tagIds.length) {
      const { error } = await client
        .from("article_tags")
        .insert(
          tagIds.map((tagId) => ({ article_id: articleId, tag_id: tagId })),
        );
      if (error) throw error;
    }
  }
}

async function attachSources(
  client: NonNullable<ReturnType<typeof getAdminSupabase>>,
  articleId: string,
  sources: unknown,
) {
  if (!Array.isArray(sources)) return;
  for (const sourceInput of sources) {
    const source = bodyRecord(sourceInput);
    const sourceId = stringValue(source.id);
    let resolvedId = sourceId;
    if (!resolvedId) {
      const insert: SourceInsert = {
        name: stringValue(source.name),
        source_type: stringValue(source.sourceType, "other"),
        url: stringValue(source.url) || null,
        source_author: stringValue(source.author) || null,
        publication_date: stringValue(source.publicationDate) || null,
        notes: stringValue(source.notes) || null,
      };
      if (!insert.name) throw new Error("Each new source needs a name.");
      const { data, error } = await client
        .from("sources")
        .insert(insert)
        .select("id")
        .single();
      if (error) throw error;
      resolvedId = data.id;
    }
    const { error } = await client.from("article_sources").upsert(
      {
        article_id: articleId,
        source_id: resolvedId,
        citation_note: stringValue(source.citationNote) || null,
        sort_order: Number.isFinite(Number(source.sortOrder))
          ? Number(source.sortOrder)
          : 0,
      },
      { onConflict: "article_id,source_id" },
    );
    if (error) throw error;
  }
}

async function upsertTranslations(
  client: NonNullable<ReturnType<typeof getAdminSupabase>>,
  articleId: string,
  translations: unknown,
  editor: string | null,
) {
  if (!Array.isArray(translations) || translations.length === 0)
    throw new Error("At least one translation is required.");
  const saved: ArticleTranslation[] = [];
  for (const translationInput of translations) {
    const translation = bodyRecord(translationInput);
    const languageCode = stringValue(translation.languageCode);
    const title = stringValue(translation.title);
    const slug = stringValue(translation.slug);
    if (!languageCode || !title || !slug)
      throw new Error("Every translation needs languageCode, title, and slug.");
    const publicationStatus = stringValue(
      translation.publicationStatus,
      "draft",
    );
    const insert: TranslationInsert = {
      article_id: articleId,
      language_code: languageCode,
      title,
      slug,
      summary: stringValue(translation.summary) || null,
      content:
        typeof translation.content === "string" ? translation.content : "",
      content_format: stringValue(translation.contentFormat, "markdown"),
      seo_title: stringValue(translation.seoTitle) || null,
      seo_description: stringValue(translation.seoDescription) || null,
      keywords: stringArray(translation.keywords),
      publication_status: publicationStatus,
      published_at:
        publicationStatus === "published"
          ? stringValue(translation.publishedAt) || new Date().toISOString()
          : null,
      author_id: stringValue(translation.authorId) || null,
    };
    const { data, error } = await client
      .from("article_translations")
      .upsert(insert, { onConflict: "article_id,language_code" })
      .select("*")
      .single();
    if (error) throw error;
    const { error: seoError } = await client.from("seo_metadata").upsert(
      {
        article_translation_id: data.id,
        canonical_url: stringValue(translation.canonicalUrl) || null,
        og_title:
          stringValue(translation.ogTitle) || data.seo_title || data.title,
        og_description:
          stringValue(translation.ogDescription) ||
          data.seo_description ||
          data.summary,
        twitter_title:
          stringValue(translation.twitterTitle) || data.seo_title || data.title,
        twitter_description:
          stringValue(translation.twitterDescription) ||
          data.seo_description ||
          data.summary,
        noindex: translation.noindex === true,
        structured_data: jsonObject(translation.structuredData),
      },
      { onConflict: "article_translation_id" },
    );
    if (seoError) throw seoError;
    await createRevision(
      client,
      data,
      stringValue(translation.changeNote) || "Editorial save",
      editor,
    );
    saved.push(data);
  }
  return saved;
}

app.get("/api/health", (_req, res) =>
  res.json({ ok: true, service: "world-encyclopedia-editorial" }),
);
app.get("/api/public-config", (_req, res) =>
  res.json(getPublicSupabaseConfig()),
);

const editorial = express.Router();
editorial.use(requireEditorialToken);

editorial.get("/languages", async (_req, res) => {
  const client = adminOrFail(res);
  if (!client) return;
  const { data, error } = await client
    .from("languages")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  if (error) return sendError(res, 500, error.message);
  return res.json({ data });
});

editorial.get("/articles", async (req, res) => {
  const client = adminOrFail(res);
  if (!client) return;
  const language = stringValue(req.query.language, "ar");
  const status = stringValue(req.query.status);
  let query = client
    .from("article_translations")
    .select("*")
    .eq("language_code", language)
    .order("updated_at", { ascending: false })
    .range(0, 99);
  if (status) query = query.eq("publication_status", status);
  const { data, error } = await query;
  if (error) return sendError(res, 500, error.message);
  return res.json({ data: data ?? [] });
});

editorial.get("/articles/:articleId/revisions", async (req, res) => {
  const client = adminOrFail(res);
  if (!client) return;
  const language = stringValue(req.query.language, "ar");
  const { data: translation, error: translationError } = await client
    .from("article_translations")
    .select("id")
    .eq("article_id", req.params.articleId)
    .eq("language_code", language)
    .maybeSingle();
  if (translationError) return sendError(res, 500, translationError.message);
  if (!translation) return sendError(res, 404, "Translation not found.");
  const { data, error } = await client
    .from("article_revisions")
    .select("*")
    .eq("article_translation_id", translation.id)
    .order("version", { ascending: false })
    .range(0, 99);
  if (error) return sendError(res, 500, error.message);
  return res.json({ data: data ?? [] });
});

editorial.post("/articles", async (req, res) => {
  const client = adminOrFail(res);
  if (!client) return;
  try {
    const payload = bodyRecord(req.body);
    const canonicalKey = stringValue(payload.canonicalKey);
    if (!canonicalKey)
      return sendError(
        res,
        400,
        "canonicalKey is required for idempotent article creation.",
      );
    const { data: topic, error: topicError } = await client
      .from("topics")
      .upsert(
        {
          canonical_key: canonicalKey,
          entity_type: stringValue(payload.entityType, "topic"),
        },
        { onConflict: "canonical_key" },
      )
      .select("id")
      .single();
    if (topicError) throw topicError;
    const { data: article, error: articleError } = await client
      .from("articles")
      .upsert(
        { topic_id: topic.id, is_featured: payload.isFeatured === true },
        { onConflict: "topic_id" },
      )
      .select("*")
      .single();
    if (articleError) throw articleError;
    const editor = stringValue(req.header("x-editor")) || null;
    const translations = await upsertTranslations(
      client,
      article.id,
      payload.translations,
      editor,
    );
    await replaceArticleRelations(client, article.id, payload);
    await attachSources(client, article.id, payload.sources);
    return res.status(201).json({ data: { article, translations } });
  } catch (error) {
    return sendError(
      res,
      400,
      error instanceof Error ? error.message : "Unable to create article.",
    );
  }
});

editorial.patch("/articles/:articleId", async (req, res) => {
  const client = adminOrFail(res);
  if (!client) return;
  try {
    const payload = bodyRecord(req.body);
    const editor = stringValue(req.header("x-editor")) || null;
    const translations = await upsertTranslations(
      client,
      req.params.articleId,
      payload.translations,
      editor,
    );
    await replaceArticleRelations(client, req.params.articleId, payload);
    await attachSources(client, req.params.articleId, payload.sources);
    return res.json({
      data: { articleId: req.params.articleId, translations },
    });
  } catch (error) {
    return sendError(
      res,
      400,
      error instanceof Error ? error.message : "Unable to update article.",
    );
  }
});

editorial.post("/articles/:articleId/status", async (req, res) => {
  const client = adminOrFail(res);
  if (!client) return;
  try {
    const payload = bodyRecord(req.body);
    const languageCode = stringValue(payload.languageCode, "ar");
    const status = stringValue(payload.status);
    if (!["draft", "review", "published", "archived"].includes(status))
      return sendError(res, 400, "Unsupported publication status.");
    const update = {
      publication_status: status,
      published_at: status === "published" ? new Date().toISOString() : null,
    };
    const { data, error } = await client
      .from("article_translations")
      .update(update)
      .eq("article_id", req.params.articleId)
      .eq("language_code", languageCode)
      .select("*")
      .single();
    if (error) throw error;
    await createRevision(
      client,
      data,
      stringValue(payload.changeNote) || `Status changed to ${status}`,
      stringValue(req.header("x-editor")) || null,
    );
    return res.json({ data });
  } catch (error) {
    return sendError(
      res,
      400,
      error instanceof Error ? error.message : "Unable to change status.",
    );
  }
});

editorial.post("/articles/:articleId/sources", async (req, res) => {
  const client = adminOrFail(res);
  if (!client) return;
  try {
    await attachSources(client, req.params.articleId, [req.body]);
    return res.status(201).json({ ok: true });
  } catch (error) {
    return sendError(
      res,
      400,
      error instanceof Error ? error.message : "Unable to attach source.",
    );
  }
});

editorial.delete("/articles/:articleId/sources/:sourceId", async (req, res) => {
  const client = adminOrFail(res);
  if (!client) return;
  const { error } = await client
    .from("article_sources")
    .delete()
    .eq("article_id", req.params.articleId)
    .eq("source_id", req.params.sourceId);
  if (error) return sendError(res, 400, error.message);
  return res.status(204).send();
});

editorial.post("/media", upload.single("file"), async (req, res) => {
  const client = adminOrFail(res);
  if (!client) return;
  try {
    if (!req.file) return sendError(res, 400, "file is required.");
    const articleId = stringValue(req.body.articleId);
    if (!articleId) return sendError(res, 400, "articleId is required.");
    const bucket = "encyclopedia-media";
    const safeName =
      req.file.originalname
        .toLowerCase()
        .replace(/[^a-z0-9._-]+/g, "-")
        .replace(/^-|-$/g, "") || "upload";
    const path = `${articleId}/${Date.now()}-${safeName}`;
    const { error: uploadError } = await client.storage
      .from(bucket)
      .upload(path, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });
    if (uploadError) throw uploadError;
    if (req.body.isPrimary === "true") {
      const { error: clearError } = await client
        .from("media")
        .update({ is_primary: false })
        .eq("article_id", articleId)
        .eq("is_primary", true);
      if (clearError) throw clearError;
    }
    const { data, error } = await client
      .from("media")
      .insert({
        article_id: articleId,
        storage_bucket: bucket,
        storage_path: path,
        filename: req.file.originalname,
        mime_type: req.file.mimetype,
        file_size_bytes: req.file.size,
        alt_text: stringValue(req.body.altText) || null,
        caption: stringValue(req.body.caption) || null,
        language_code: stringValue(req.body.languageCode) || null,
        is_primary: req.body.isPrimary === "true",
      })
      .select("*")
      .single();
    if (error) throw error;
    return res.status(201).json({ data });
  } catch (error) {
    return sendError(
      res,
      400,
      error instanceof Error ? error.message : "Unable to upload media.",
    );
  }
});

editorial.post("/categories", async (req, res) => {
  const client = adminOrFail(res);
  if (!client) return;
  try {
    const payload = bodyRecord(req.body);
    const translations = Array.isArray(payload.translations)
      ? payload.translations
      : [];
    const { data: category, error: categoryError } = await client
      .from("categories")
      .insert({
        parent_id: stringValue(payload.parentId) || null,
        sort_order: Number(payload.sortOrder) || 0,
      })
      .select("*")
      .single();
    if (categoryError) throw categoryError;
    if (translations.length) {
      const rows = translations.map((item) => {
        const row = bodyRecord(item);
        return {
          category_id: category.id,
          language_code: stringValue(row.languageCode),
          name: stringValue(row.name),
          slug: stringValue(row.slug),
          description: stringValue(row.description) || null,
        };
      });
      const { error } = await client.from("category_translations").insert(rows);
      if (error) throw error;
    }
    return res.status(201).json({ data: category });
  } catch (error) {
    return sendError(
      res,
      400,
      error instanceof Error ? error.message : "Unable to create category.",
    );
  }
});

editorial.post("/tags", async (req, res) => {
  const client = adminOrFail(res);
  if (!client) return;
  try {
    const payload = bodyRecord(req.body);
    const canonicalKey = stringValue(payload.canonicalKey);
    if (!canonicalKey) return sendError(res, 400, "canonicalKey is required.");
    const { data: tag, error: tagError } = await client
      .from("tags")
      .upsert({ canonical_key: canonicalKey }, { onConflict: "canonical_key" })
      .select("*")
      .single();
    if (tagError) throw tagError;
    const translations = Array.isArray(payload.translations)
      ? payload.translations
      : [];
    if (translations.length) {
      const rows = translations.map((item) => {
        const row = bodyRecord(item);
        return {
          tag_id: tag.id,
          language_code: stringValue(row.languageCode),
          name: stringValue(row.name),
          slug: stringValue(row.slug),
        };
      });
      const { error } = await client
        .from("tag_translations")
        .upsert(rows, { onConflict: "tag_id,language_code" });
      if (error) throw error;
    }
    return res.status(201).json({ data: tag });
  } catch (error) {
    return sendError(
      res,
      400,
      error instanceof Error ? error.message : "Unable to create tag.",
    );
  }
});

app.use("/api/editorial", editorial);

const distDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../dist",
);
if (existsSync(distDir)) {
  app.use(express.static(distDir, { index: "index.html", redirect: false }));
  app.use((req, res, next) => {
    if (req.method === "GET" && !req.path.startsWith("/api/")) {
      return res.sendFile(path.join(distDir, "index.html"));
    }
    return next();
  });
}

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof multer.MulterError)
    return sendError(res, 400, error.message);
  return sendError(
    res,
    500,
    error instanceof Error ? error.message : "Unexpected server error.",
  );
});

const port = Number(process.env.PORT || 8787);
if (process.env.NODE_ENV !== "test") {
  app.listen(port, "0.0.0.0", () =>
    console.log(`Editorial API listening on ${port}`),
  );
}

export default app;
