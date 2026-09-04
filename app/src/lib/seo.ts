export const SITE_NAME = "World Encyclopedia";
export const SITE_ORIGIN = (
  import.meta.env.VITE_SITE_ORIGIN || "https://world-encyclopedia.example"
).replace(/\/$/, "");

export function absoluteUrl(path: string) {
  return `${SITE_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}

export function languagePath(languageCode: string, slug?: string) {
  return slug ? `/${languageCode}/${slug}` : `/${languageCode}/`;
}

export function upsertMeta(name: string, content: string, property = false) {
  const attribute = property ? "property" : "name";
  let element = document.head.querySelector<HTMLMetaElement>(
    `meta[${attribute}="${name}"]`,
  );
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  element.content = content;
}

export function upsertLink(rel: string, href: string, hreflang?: string) {
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]`;
  let element = document.head.querySelector<HTMLLinkElement>(selector);
  if (!element) {
    element = document.createElement("link");
    element.rel = rel;
    if (hreflang) element.hreflang = hreflang;
    document.head.appendChild(element);
  }
  element.href = href;
}

export function setDocumentSeo(input: {
  title: string;
  description: string;
  path: string;
  languageCode: string;
  alternate?: { languageCode: string; path: string }[];
  image?: string;
  type?: "website" | "article";
  structuredData?: Record<string, unknown>;
}) {
  document.title = input.title;
  document.documentElement.lang = input.languageCode;
  document.documentElement.dir = input.languageCode === "ar" ? "rtl" : "ltr";
  upsertMeta("description", input.description);
  upsertMeta("og:title", input.title, true);
  upsertMeta("og:description", input.description, true);
  upsertMeta("og:url", absoluteUrl(input.path), true);
  upsertMeta("og:type", input.type ?? "website", true);
  upsertMeta("twitter:card", "summary_large_image");
  upsertMeta("twitter:title", input.title);
  upsertMeta("twitter:description", input.description);
  if (input.image) {
    upsertMeta("og:image", input.image, true);
    upsertMeta("twitter:image", input.image);
  }
  upsertLink("canonical", absoluteUrl(input.path));
  for (const alternate of input.alternate ?? []) {
    upsertLink(
      "alternate",
      absoluteUrl(alternate.path),
      alternate.languageCode,
    );
  }
  const existing = document.head.querySelector<HTMLScriptElement>(
    'script[data-seo-jsonld="true"]',
  );
  existing?.remove();
  if (input.structuredData) {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.dataset.seoJsonld = "true";
    script.textContent = JSON.stringify(input.structuredData);
    document.head.appendChild(script);
  }
}

export function articleSchema(input: {
  title: string;
  description: string;
  path: string;
  languageCode: string;
  publishedAt?: string | null;
  updatedAt: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    inLanguage: input.languageCode,
    mainEntityOfPage: absoluteUrl(input.path),
    datePublished: input.publishedAt ?? undefined,
    dateModified: input.updatedAt,
    image: input.image ? [input.image] : undefined,
    publisher: { "@type": "Organization", name: SITE_NAME },
  };
}
