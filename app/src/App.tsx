import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronRight,
  Clock3,
  ExternalLink,
  FileText,
  Globe2,
  ImagePlus,
  Library,
  Menu,
  Search,
  ShieldCheck,
  Sparkles,
  Tag,
  X,
} from "lucide-react";
import {
  fetchArticle,
  fetchCategory,
  fetchHome,
  fetchLanguages,
  fetchTag,
  searchPublicArticles,
  storageUrl,
  type ArticleDetail,
  type ArticleSummary,
  type CategoryTranslationRow,
  type LanguageRow,
  type SearchResult,
  type TaxonomyPage,
} from "./lib/content";
import {
  attachEditorialSource,
  changeEditorialStatus,
  createEditorialArticle,
  EDITORIAL_API_ORIGIN,
  getEditorialToken,
  listEditorialArticles,
  listRevisions,
  saveEditorialToken,
  type EditorialArticleInput,
  type EditorialArticleRow,
  updateEditorialArticle,
  uploadEditorialMedia,
} from "./lib/editorial";
import {
  absoluteUrl,
  articleSchema,
  languagePath,
  setDocumentSeo,
  SITE_NAME,
} from "./lib/seo";
import "./styles.css";

type Route = {
  language: string;
  kind:
    | "home"
    | "search"
    | "article"
    | "category"
    | "tag"
    | "static"
    | "admin"
    | "not-found";
  slug?: string;
};
type StaticPage =
  | "about"
  | "contact"
  | "privacy"
  | "terms"
  | "editorial-policy"
  | "sources"
  | "corrections"
  | "copyright";

const FALLBACK_LANGUAGES: LanguageRow[] = [
  {
    code: "ar",
    name: "Arabic",
    native_name: "العربية",
    direction: "rtl",
    is_active: true,
    sort_order: 1,
    created_at: "1970-01-01T00:00:00.000Z",
  },
  {
    code: "en",
    name: "English",
    native_name: "English",
    direction: "ltr",
    is_active: true,
    sort_order: 2,
    created_at: "1970-01-01T00:00:00.000Z",
  },
];

const STATIC_PAGES: Record<
  StaticPage,
  {
    ar: { title: string; body: string[] };
    en: { title: string; body: string[] };
  }
> = {
  about: {
    ar: {
      title: "من نحن",
      body: [
        "World Encyclopedia مشروع موسوعي ثنائي اللغة يهدف إلى تنظيم المعرفة العامة في صفحات واضحة، موثقة، قابلة للقراءة، ومفتوحة للتحديث المسؤول.",
        "نبدأ بالعربية والإنجليزية، ونبني كل موضوع ككيان واحد له ترجمات مستقلة حتى يحافظ القارئ على الموضوع نفسه عند الانتقال بين اللغات.",
        "تقوم منهجيتنا على كتابة أصلية، مصادر قابلة للتحقق، مراجعة تحريرية، وإظهار واضح لتاريخ التحديث. لا ندّعي شراكات أو اعتمادات غير موجودة.",
      ],
    },
    en: {
      title: "About us",
      body: [
        "World Encyclopedia is a bilingual knowledge project designed to organize general information into clear, sourced, readable, and responsibly maintained pages.",
        "We begin with Arabic and English. Each subject is modeled as one logical entity with independent translations so readers stay on the same subject when switching languages.",
        "Our editorial approach emphasizes original writing, verifiable sources, editorial review, and transparent update history. We do not claim partnerships or credentials that do not exist.",
      ],
    },
  },
  contact: {
    ar: {
      title: "اتصل بنا",
      body: [
        "للاستفسارات التحريرية أو طلبات التصحيح أو مسائل حقوق النشر، أرسل رسالة إلى فريق الموسوعة عبر البريد المخصص للنطاق بعد إطلاقه.",
        "في هذه النسخة لا نجمع بيانات اتصال عبر نموذج عام. ستضاف قناة محمية ضد الرسائل المزعجة قبل فتح استقبال الطلبات، مع جمع الحد الأدنى من البيانات اللازمة للرد.",
      ],
    },
    en: {
      title: "Contact",
      body: [
        "For editorial questions, correction requests, or copyright matters, contact the encyclopedia team through the domain email once the public domain is activated.",
        "This release does not collect contact details through a public form. A spam-protected channel will be added before accepting requests, with only the minimum information needed to respond.",
      ],
    },
  },
  privacy: {
    ar: {
      title: "سياسة الخصوصية",
      body: [
        "لا تجمع الواجهة العامة بيانات شخصية لمجرد القراءة، ولا تستخدم أدوات تتبع غير ضرورية. قد تسجل المتصفحات إعداد اللغة محليًا لتسهيل التنقل.",
        "عند إضافة تحليلات أو إعلانات مستقبلًا، سيُفصح عنها بوضوح وتُضاف أدوات الموافقة وإدارة ملفات الارتباط حسب المناطق المستهدفة. لا نستخدم مفتاح service-role في المتصفح.",
        "لأسئلة الخصوصية، استخدم قناة الاتصال المعلنة بعد إطلاق النطاق العام.",
      ],
    },
    en: {
      title: "Privacy policy",
      body: [
        "The public interface does not collect personal data merely for reading and does not use unnecessary tracking. A browser may retain the selected language locally to make navigation easier.",
        "If analytics or advertising are added later, they will be disclosed clearly and consent and cookie controls will be added where required. A service-role key is never exposed in the browser.",
        "For privacy questions, use the published contact channel after the public domain launches.",
      ],
    },
  },
  terms: {
    ar: {
      title: "شروط الاستخدام",
      body: [
        "يمكنك قراءة صفحات الموسوعة والاستشهاد بها مع الحفاظ على الإسناد المناسب للمصدر. لا يجوز استخدام الموقع لنشر محتوى مضلل أو آلي منخفض القيمة أو انتهاك حقوق الغير.",
        "المعلومات عامة ولأغراض معرفية، ولا تشكل استشارة مهنية. الروابط الخارجية تقود إلى مواقع مستقلة ولا يعني وجودها تبني كل ما تنشره.",
      ],
    },
    en: {
      title: "Terms of use",
      body: [
        "You may read and cite encyclopedia pages with appropriate attribution. You may not use the site to publish misleading, low-value automated material or to infringe third-party rights.",
        "Information is general and educational, not professional advice. External links lead to independent websites and do not mean that every statement on those websites is endorsed.",
      ],
    },
  },
  "editorial-policy": {
    ar: {
      title: "السياسة التحريرية",
      body: [
        "تُنشأ المقالات من خلال موضوع منطقي واحد وترجمات لغوية مستقلة. تمر الترجمة بالحالات: مسودة، مراجعة، منشورة، مؤرشفة.",
        "يجب أن يقدم المقال قيمة تفسيرية أصلية، وأن يذكر مصادره، وأن يراجع عند ظهور معلومات جديدة أو أخطاء. تُحفظ النسخ السابقة في سجل revisions ولا تظهر للعامة.",
        "لا نستخدم scraping لإعادة النشر، ولا ننشئ صفحات هدفها الأساسي الزيارات أو الإعلانات.",
      ],
    },
    en: {
      title: "Editorial policy",
      body: [
        "Articles are created from one logical subject with independent language translations. A translation moves through draft, review, published, and archived states.",
        "Every article should provide original explanatory value, cite its sources, and be reviewed when information changes or errors are reported. Previous versions remain in revision history and are not public.",
        "We do not scrape content for republication or create pages whose primary purpose is traffic or advertising.",
      ],
    },
  },
  sources: {
    ar: {
      title: "المصادر والمراجع",
      body: [
        "تُسجل المصادر ككيانات مستقلة يمكن إعادة استخدامها في مقالات متعددة، مع حفظ اسم المصدر والرابط والمؤلف وتاريخ النشر والوصول وملاحظة الاستشهاد.",
        "وجود رابط في قائمة المصادر لا يعني نسخ محتوى الموقع المصدر. القيمة الأساسية يجب أن تأتي من الصياغة والتحليل والتنظيم التحريري داخل الموسوعة.",
      ],
    },
    en: {
      title: "Sources and references",
      body: [
        "Sources are stored as reusable entities that can be linked to multiple articles, including source name, URL, author, publication date, access date, and citation notes.",
        "Listing a source does not mean copying the source website. The encyclopedia must provide its own editorial writing, analysis, and organization.",
      ],
    },
  },
  corrections: {
    ar: {
      title: "تصحيح المعلومات",
      body: [
        "إذا وجدت خطأً أو معلومة تحتاج إلى تحديث، جهّز رابط الصفحة، واذكر الفقرة المعنية، واقترح التصحيح مع مصدر يمكن التحقق منه.",
        "ستُفتح قناة تصحيح محمية قبل إطلاق استقبال الطلبات العامة. تُراجع البلاغات ولا تُطبّق تلقائيًا دون تحرير ومصدر مناسب.",
      ],
    },
    en: {
      title: "Corrections",
      body: [
        "If you find an error or information that needs updating, provide the page URL, identify the relevant passage, and suggest a correction with a verifiable source.",
        "A protected corrections channel will be opened before public submissions begin. Reports are reviewed and are not applied automatically without editorial review and an appropriate source.",
      ],
    },
  },
  copyright: {
    ar: {
      title: "حقوق النشر",
      body: [
        "نكتب محتوى الموسوعة بصورة أصلية ونحترم حقوق النصوص والصور والعلامات التابعة للغير. يجب أن يملك كل ملف وسائط مستخدم أو يملك الموقع إذنًا مناسبًا لاستخدامه.",
        "لطلبات حقوق النشر، استخدم قناة الاتصال الرسمية بعد إطلاق النطاق. لا ندّعي ملكية مواد لا نملكها.",
      ],
    },
    en: {
      title: "Copyright",
      body: [
        "We write encyclopedia content originally and respect the rights of third-party text, images, and marks. Every media file must be owned by the uploader or used with appropriate permission.",
        "For copyright requests, use the official contact channel after the domain launches. We do not claim ownership of material we do not own.",
      ],
    },
  },
};

function parseRoute(pathname = window.location.pathname): Route {
  const parts = pathname
    .replace(/^\/+|\/+$/g, "")
    .split("/")
    .filter(Boolean);
  if (parts[0] === "admin") return { language: "ar", kind: "admin" };
  const language = parts[0] === "en" ? "en" : parts[0] === "ar" ? "ar" : "";
  if (!language) return { language: "ar", kind: "not-found" };
  if (parts.length === 1) return { language, kind: "home" };
  if (parts[1] === "search") return { language, kind: "search" };
  if (parts[1] === "category" && parts[2])
    return { language, kind: "category", slug: decodeURIComponent(parts[2]) };
  if (parts[1] === "tag" && parts[2])
    return { language, kind: "tag", slug: decodeURIComponent(parts[2]) };
  const staticPage = parts[1] as StaticPage;
  if (STATIC_PAGES[staticPage])
    return { language, kind: "static", slug: staticPage };
  if (parts.length === 2)
    return { language, kind: "article", slug: decodeURIComponent(parts[1]) };
  return { language, kind: "not-found" };
}

function navigate(path: string) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function text(language: string, ar: string, en: string) {
  return language === "ar" ? ar : en;
}
function dir(language: string) {
  return language === "ar" ? "rtl" : "ltr";
}
function localeDate(language: string, value?: string | null) {
  return value
    ? new Intl.DateTimeFormat(language === "ar" ? "ar" : "en", {
        dateStyle: "medium",
      }).format(new Date(value))
    : "—";
}
function localizeSlug(slug: string, language: string) {
  return `/${language}/${encodeURIComponent(slug)}`;
}

function useRoute() {
  const [route, setRoute] = useState<Route>(() => parseRoute());
  useEffect(() => {
    const listener = () => setRoute(parseRoute());
    window.addEventListener("popstate", listener);
    return () => window.removeEventListener("popstate", listener);
  }, []);
  return route;
}

function App() {
  const route = useRoute();
  const [languages, setLanguages] = useState<LanguageRow[]>(FALLBACK_LANGUAGES);
  useEffect(() => {
    void fetchLanguages()
      .then(setLanguages)
      .catch(() => setLanguages(FALLBACK_LANGUAGES));
  }, []);
  if (route.kind === "admin") return <AdminPage />;
  return <PublicShell route={route} languages={languages} />;
}

function PublicShell({
  route,
  languages,
}: {
  route: Route;
  languages: LanguageRow[];
}) {
  const language = route.language;
  const [menuOpen, setMenuOpen] = useState(false);
  const switchLanguage = (code: string) => {
    if (route.kind === "article" && route.slug)
      navigate(localizeSlug(route.slug, code));
    else if (route.kind === "category" && route.slug)
      navigate(`/${code}/category/${encodeURIComponent(route.slug)}`);
    else if (route.kind === "tag" && route.slug)
      navigate(`/${code}/tag/${encodeURIComponent(route.slug)}`);
    else if (route.kind === "static" && route.slug)
      navigate(`/${code}/${route.slug}`);
    else navigate(`/${code}${route.kind === "search" ? "/search" : "/"}`);
    setMenuOpen(false);
  };
  return (
    <div className="site" dir={dir(language)}>
      <header className="topbar">
        <div className="container nav-inner">
          <button
            className="brand"
            onClick={() => navigate(`/${language}/`)}
            aria-label={text(language, "العودة إلى الرئيسية", "Back to home")}
          >
            <span className="brand-mark">
              <BookOpen size={18} />
            </span>
            <span>
              <strong>World</strong> Encyclopedia
            </span>
          </button>
          <nav
            className={`main-nav ${menuOpen ? "open" : ""}`}
            aria-label="Primary navigation"
          >
            <button onClick={() => navigate(`/${language}/`)}>
              {text(language, "الرئيسية", "Home")}
            </button>
            <button onClick={() => navigate(`/${language}/search`)}>
              {text(language, "استكشف", "Explore")}
            </button>
            <button onClick={() => navigate(`/${language}/about`)}>
              {text(language, "عن الموسوعة", "About")}
            </button>
          </nav>
          <div className="nav-actions">
            <div
              className="language-switcher"
              aria-label={text(language, "اختيار اللغة", "Language selector")}
            >
              {languages
                .filter((item) => item.is_active)
                .map((item) => (
                  <button
                    key={item.code}
                    className={item.code === language ? "active" : ""}
                    onClick={() => switchLanguage(item.code)}
                  >
                    {item.native_name}
                  </button>
                ))}
            </div>
            <button
              className="menu-toggle"
              onClick={() => setMenuOpen((value) => !value)}
              aria-label={text(language, "فتح القائمة", "Open menu")}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>
      <main>
        {route.kind === "home" ? <HomePage language={language} /> : null}
        {route.kind === "search" ? <SearchPage language={language} /> : null}
        {route.kind === "article" && route.slug ? (
          <ArticlePage
            language={language}
            slug={route.slug}
            languages={languages}
          />
        ) : null}
        {route.kind === "category" && route.slug ? (
          <TaxonomyPageView
            language={language}
            kind="category"
            slug={route.slug}
          />
        ) : null}
        {route.kind === "tag" && route.slug ? (
          <TaxonomyPageView language={language} kind="tag" slug={route.slug} />
        ) : null}
        {route.kind === "static" && route.slug ? (
          <StaticPageView language={language} page={route.slug as StaticPage} />
        ) : null}
        {route.kind === "not-found" ? <NotFound language={language} /> : null}
      </main>
      <Footer language={language} onNavigate={navigate} />
    </div>
  );
}

function HomePage({ language }: { language: string }) {
  const [data, setData] = useState<{
    latest: ArticleSummary[];
    featured: ArticleSummary[];
    categories: CategoryTranslationRow[];
  } | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    void fetchHome(language)
      .then(setData)
      .catch((reason) =>
        setError(
          reason instanceof Error ? reason.message : "Unable to load content.",
        ),
      );
    setDocumentSeo({
      title: `${SITE_NAME} — ${text(language, "المعرفة المنظمة", "Organized knowledge")}`,
      description: text(
        language,
        "موسوعة عالمية ثنائية اللغة للمحتوى الأصلي والمصادر الواضحة.",
        "A bilingual encyclopedia for original content and transparent sources.",
      ),
      path: languagePath(language),
      languageCode: language,
    });
  }, [language]);
  return (
    <>
      <section className="hero home-hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="kicker">
              <Sparkles size={14} />{" "}
              {text(
                language,
                "موسوعة عالمية · معرفة موثقة",
                "GLOBAL ENCYCLOPEDIA · SOURCED KNOWLEDGE",
              )}
            </p>
            <h1>
              {text(
                language,
                "افهم العالم،\nموضوعًا بعد موضوع.",
                "Understand the world,\none subject at a time.",
              )}
            </h1>
            <p className="hero-lede">
              {text(
                language,
                "محتوى أصلي ومنظم، بلغتين، مع مصادر واضحة وسياق يساعدك على القراءة بعمق.",
                "Original, structured knowledge in two languages, with clear sources and context for deeper reading.",
              )}
            </p>
            <SearchBox language={language} />
          </div>
          <div className="hero-orbit" aria-hidden="true">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="orbit-center">
              <Globe2 size={56} strokeWidth={1.2} />
              <span>AR · EN</span>
            </div>
            <span className="orbit-label label-one">TOPICS</span>
            <span className="orbit-label label-two">SOURCES</span>
            <span className="orbit-label label-three">REVIEWED</span>
          </div>
        </div>
      </section>
      <section className="container section-block">
        <div className="section-title">
          <div>
            <p className="kicker">
              {text(language, "ابدأ من هنا", "START HERE")}
            </p>
            <h2>{text(language, "استكشف المجالات", "Explore the fields")}</h2>
          </div>
          <span className="section-note">
            {text(language, "تصنيفات متعددة اللغات", "Multilingual categories")}
          </span>
        </div>
        {error ? (
          <InlineError message={error} language={language} />
        ) : (
          <div className="category-grid">
            {(data?.categories ?? []).map((category) => (
              <button
                className="category-card"
                key={category.id}
                onClick={() =>
                  navigate(
                    `/${language}/category/${encodeURIComponent(category.slug)}`,
                  )
                }
              >
                <span className="category-icon">
                  <Library size={19} />
                </span>
                <span>
                  <strong>{category.name}</strong>
                  <small>
                    {category.description ||
                      text(
                        language,
                        "مقالات منتقاة وموثقة",
                        "Curated, sourced articles",
                      )}
                  </small>
                </span>
                <ChevronRight size={18} />
              </button>
            ))}
            {!data?.categories.length ? (
              <EmptyBlock
                language={language}
                label={text(
                  language,
                  "ستظهر التصنيفات بعد نشر أول محتوى.",
                  "Categories will appear after the first content is published.",
                )}
              />
            ) : null}
          </div>
        )}
      </section>
      <section className="container section-block">
        <div className="section-title">
          <div>
            <p className="kicker">
              {text(language, "قراءات جديدة", "RECENT READING")}
            </p>
            <h2>{text(language, "أحدث المقالات", "Latest articles")}</h2>
          </div>
          <button
            className="text-link"
            onClick={() => navigate(`/${language}/search`)}
          >
            {text(language, "عرض الكل", "View all")} <ArrowRight size={15} />
          </button>
        </div>
        <ArticleGrid
          articles={data?.latest ?? []}
          language={language}
          loading={!data && !error}
        />
      </section>
      {(data?.featured.length ?? 0) > 0 ? (
        <section className="container section-block featured-strip">
          <div className="section-title">
            <div>
              <p className="kicker">
                {text(language, "اختيار التحرير", "EDITORIAL SELECTION")}
              </p>
              <h2>{text(language, "مقالات مميزة", "Featured articles")}</h2>
            </div>
          </div>
          <ArticleGrid
            articles={data?.featured ?? []}
            language={language}
            featured
          />
        </section>
      ) : null}
      <section className="container manifesto">
        <div className="manifesto-mark">
          <ShieldCheck size={30} />
        </div>
        <div>
          <p className="kicker">{text(language, "مبدأنا", "OUR PRINCIPLE")}</p>
          <h2>
            {text(
              language,
              "المعلومة الجيدة تبدأ من مصدر واضح.",
              "Good knowledge starts with a clear source.",
            )}
          </h2>
          <p>
            {text(
              language,
              "كل صفحة تُبنى لتكون مفيدة بذاتها: كتابة أصلية، بنية قابلة للقراءة، ومراجع يمكن الرجوع إليها.",
              "Every page is built to stand on its own: original writing, readable structure, and references readers can follow.",
            )}
          </p>
        </div>
      </section>
    </>
  );
}

function SearchBox({
  language,
  initial = "",
}: {
  language: string;
  initial?: string;
}) {
  const [query, setQuery] = useState(initial);
  return (
    <form
      className="hero-search"
      onSubmit={(event) => {
        event.preventDefault();
        if (query.trim())
          navigate(`/${language}/search?q=${encodeURIComponent(query.trim())}`);
      }}
    >
      <Search size={19} />
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={text(
          language,
          "ابحث في المعرفة…",
          "Search the encyclopedia…",
        )}
        aria-label={text(language, "عبارة البحث", "Search query")}
        dir={dir(language)}
      />
      <button type="submit">
        {text(language, "ابحث", "Search")} <ArrowRight size={16} />
      </button>
    </form>
  );
}

function ArticleGrid({
  articles,
  language,
  loading = false,
  featured = false,
}: {
  articles: ArticleSummary[];
  language: string;
  loading?: boolean;
  featured?: boolean;
}) {
  if (loading)
    return (
      <div className="article-grid">
        {[1, 2, 3].map((item) => (
          <div className="skeleton-card" key={item} />
        ))}
      </div>
    );
  if (!articles.length)
    return (
      <EmptyBlock
        language={language}
        label={text(
          language,
          "لا توجد مقالات منشورة بعد.",
          "No published articles yet.",
        )}
      />
    );
  return (
    <div className={`article-grid ${featured ? "featured-grid" : ""}`}>
      {articles.map((article) => (
        <ArticleCard
          article={article}
          language={language}
          key={article.translation_id}
        />
      ))}
    </div>
  );
}

function ArticleCard({
  article,
  language,
}: {
  article: ArticleSummary;
  language: string;
}) {
  return (
    <article
      className="article-card"
      onClick={() => navigate(localizeSlug(article.slug, language))}
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter")
          navigate(localizeSlug(article.slug, language));
      }}
    >
      <div className="card-topline">
        <span>{article.category || text(language, "مقالة", "ARTICLE")}</span>
        <span>{localeDate(language, article.updated_at)}</span>
      </div>
      <h3>{article.title}</h3>
      <p>
        {article.summary ||
          text(
            language,
            "مقالة موسوعية قيد الإعداد.",
            "An encyclopedia article in preparation.",
          )}
      </p>
      <span className="card-link">
        {text(language, "اقرأ المقال", "Read article")} <ArrowRight size={14} />
      </span>
    </article>
  );
}

function SearchPage({ language }: { language: string }) {
  const queryFromUrl =
    new URLSearchParams(window.location.search).get("q") || "";
  const [query, setQuery] = useState(queryFromUrl);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [page, setPage] = useState(1);
  const [totalKnown, setTotalKnown] = useState(0);
  const [state, setState] = useState<"idle" | "loading" | "error">(
    queryFromUrl ? "loading" : "idle",
  );
  const [error, setError] = useState("");
  const runSearch = (requestedQuery = query, requestedPage = 1) => {
    const clean = requestedQuery.trim();
    if (clean.length < 2) {
      setResults([]);
      setState("idle");
      setError(
        text(
          language,
          "اكتب حرفين على الأقل للبحث.",
          "Type at least two characters to search.",
        ),
      );
      return;
    }
    setState("loading");
    setError("");
    void searchPublicArticles(language, clean, requestedPage)
      .then((response) => {
        setResults(response.results);
        setTotalKnown(response.totalKnown);
        setPage(requestedPage);
        setState("idle");
        navigate(
          `/${language}/search?q=${encodeURIComponent(clean)}${requestedPage > 1 ? `&page=${requestedPage}` : ""}`,
        );
      })
      .catch((reason) => {
        setState("error");
        setError(
          reason instanceof Error
            ? reason.message
            : text(language, "تعذر تنفيذ البحث.", "Search failed."),
        );
      });
  };
  useEffect(() => {
    setDocumentSeo({
      title: `${text(language, "البحث", "Search")} — ${SITE_NAME}`,
      description: text(
        language,
        "ابحث في المقالات المنشورة بالموسوعة.",
        "Search published encyclopedia articles.",
      ),
      path: `/${language}/search`,
      languageCode: language,
    });
    if (queryFromUrl)
      runSearch(
        queryFromUrl,
        Number(new URLSearchParams(window.location.search).get("page")) || 1,
      );
  }, [language]);
  return (
    <section className="container page-section">
      <div className="page-intro">
        <p className="kicker">
          <Search size={14} />{" "}
          {text(language, "البحث في الموسوعة", "SEARCH THE ENCYCLOPEDIA")}
        </p>
        <h1>
          {text(
            language,
            "ابحث عن موضوع يستحق الفهم.",
            "Find a subject worth understanding.",
          )}
        </h1>
        <p>
          {text(
            language,
            "تبحث الدالة في العنوان والملخص والكلمات المفتاحية والمحتوى، مع ترتيب النتائج حسب الصلة.",
            "The search covers titles, summaries, keywords, and content, with relevance-ranked results.",
          )}
        </p>
      </div>
      <SearchBox language={language} initial={query} />
      <div className="search-toolbar">
        <span>
          {query
            ? `${text(language, "نتائج البحث عن", "Results for")} “${query}”`
            : text(
                language,
                "ابدأ بكتابة عبارة بحث",
                "Start with a search query",
              )}
        </span>
        {state === "loading" ? (
          <span className="loading-label">
            {text(language, "جارٍ البحث…", "Searching…")}
          </span>
        ) : null}
      </div>
      {error ? <InlineError message={error} language={language} /> : null}
      {state !== "loading" && !error && query && results.length === 0 ? (
        <EmptyBlock
          language={language}
          label={text(
            language,
            "لم نعثر على نتائج منشورة. جرّب عبارة أخرى.",
            "No published results found. Try another query.",
          )}
        />
      ) : null}
      <div className="search-results">
        {results.map((result) => (
          <article
            className="search-result"
            key={result.translation_id}
            onClick={() => navigate(localizeSlug(result.slug, language))}
          >
            <div className="result-meta">
              <span>{result.language_code.toUpperCase()}</span>
              <span>{result.relevance.toFixed(0)} pts</span>
              <span>
                {result.category || text(language, "موسوعة", "Encyclopedia")}
              </span>
            </div>
            <h2>{result.title}</h2>
            <p>{result.summary}</p>
            <span className="card-link">
              {text(language, "فتح المقال", "Open article")}{" "}
              <ArrowRight size={14} />
            </span>
          </article>
        ))}
      </div>
      {results.length > 0 ? (
        <div className="pagination">
          <button
            disabled={page === 1}
            onClick={() => runSearch(query, page - 1)}
          >
            {text(language, "السابق", "Previous")}
          </button>
          <span>{page}</span>
          <button
            disabled={results.length < 12 || totalKnown <= page * 12}
            onClick={() => runSearch(query, page + 1)}
          >
            {text(language, "التالي", "Next")}
          </button>
        </div>
      ) : null}
    </section>
  );
}

function ArticlePage({
  language,
  slug,
  languages,
}: {
  language: string;
  slug: string;
  languages: LanguageRow[];
}) {
  const [data, setData] = useState<ArticleDetail | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "missing" | "error">(
    "loading",
  );
  useEffect(() => {
    setState("loading");
    void fetchArticle(language, slug)
      .then((value) => {
        setData(value);
        setState(value ? "ready" : "missing");
        if (value) {
          const image = value.media.find((item) => item.is_primary);
          const imageUrl = image
            ? storageUrl(image.storage_bucket, image.storage_path)
            : undefined;
          setDocumentSeo({
            title: `${value.translation.seo_title || value.translation.title} — ${SITE_NAME}`,
            description:
              value.translation.seo_description ||
              value.translation.summary ||
              value.translation.title,
            path: `/${language}/${slug}`,
            languageCode: language,
            image: imageUrl,
            alternate: value.pair
              ? [
                  {
                    languageCode: value.pair.language_code,
                    path: `/${value.pair.language_code}/${value.pair.slug}`,
                  },
                ]
              : [],
            type: "article",
            structuredData: articleSchema({
              title: value.translation.title,
              description: value.translation.summary || value.translation.title,
              path: `/${language}/${slug}`,
              languageCode: language,
              publishedAt: value.translation.published_at,
              updatedAt: value.translation.updated_at,
              image: imageUrl,
            }),
          });
        }
      })
      .catch(() => setState("error"));
  }, [language, slug]);
  if (state === "loading") return <LoadingPage language={language} />;
  if (state === "missing") return <NotFound language={language} />;
  if (state === "error" || !data)
    return (
      <InlineError
        message={text(
          language,
          "تعذر تحميل المقال.",
          "Unable to load this article.",
        )}
        language={language}
      />
    );
  const {
    translation,
    media,
    sources,
    categories,
    tags,
    related,
    author,
    pair,
  } = data;
  const primaryImage = media.find((item) => item.is_primary) || media[0];
  const imageUrl = primaryImage
    ? storageUrl(primaryImage.storage_bucket, primaryImage.storage_path)
    : "";
  const switchPair = pair
    ? () => navigate(`/${pair.language_code}/${encodeURIComponent(pair.slug)}`)
    : undefined;
  return (
    <article className="container article-page">
      <div className="breadcrumbs">
        <button onClick={() => navigate(`/${language}/`)}>
          {text(language, "الرئيسية", "Home")}
        </button>
        <ChevronRight size={14} />
        <span>{categories[0]?.name || text(language, "مقالة", "Article")}</span>
      </div>
      <div className="article-layout">
        <div className="article-main">
          <div className="article-header">
            <div className="article-label">
              <FileText size={15} />{" "}
              {text(language, "مقال موسوعي", "ENCYCLOPEDIA ARTICLE")}
            </div>
            <h1>{translation.title}</h1>
            {translation.summary ? (
              <p className="article-summary">{translation.summary}</p>
            ) : null}
            <div className="article-byline">
              <span>
                <Clock3 size={14} /> {text(language, "آخر تحديث", "Updated")}{" "}
                {localeDate(language, translation.updated_at)}
              </span>
              {author ? (
                <span>
                  {text(language, "بقلم", "By")} {author.display_name}
                </span>
              ) : null}
              {switchPair ? (
                <button onClick={switchPair}>
                  <Globe2 size={14} />{" "}
                  {text(
                    language,
                    "اقرأ باللغة الأخرى",
                    "Read in the other language",
                  )}
                </button>
              ) : (
                <span className="muted">
                  {text(
                    language,
                    "لا توجد ترجمة مقابلة بعد",
                    "No alternate translation yet",
                  )}
                </span>
              )}
            </div>
          </div>
          {imageUrl ? (
            <figure className="article-hero-image">
              <img
                src={imageUrl}
                alt={primaryImage?.alt_text || translation.title}
                loading="eager"
              />
              <figcaption>{primaryImage?.caption}</figcaption>
            </figure>
          ) : null}
          <div className="article-content">
            {renderContent(translation.content)}
          </div>
          <SourcesList language={language} sources={sources} />
          <div className="article-tags">
            {categories.map((category) => (
              <button
                key={category.category_id}
                onClick={() =>
                  navigate(
                    `/${language}/category/${encodeURIComponent(category.slug)}`,
                  )
                }
              >
                <Library size={13} /> {category.name}
              </button>
            ))}
            {tags.map((tag) => (
              <button
                key={tag.tag_id}
                onClick={() =>
                  navigate(`/${language}/tag/${encodeURIComponent(tag.slug)}`)
                }
              >
                <Tag size={13} /> {tag.name}
              </button>
            ))}
          </div>
        </div>
        <aside className="article-aside">
          <div className="aside-card">
            <p className="kicker">
              {text(language, "في هذه الصفحة", "ON THIS PAGE")}
            </p>
            <p>
              {text(
                language,
                "مقالة منشورة ومراجعة ضمن مسار التحرير.",
                "Published and reviewed through the editorial workflow.",
              )}
            </p>
            <div className="aside-rule" />
            <span>
              {text(language, "تاريخ الإنشاء", "Created")}
              <strong>{localeDate(language, translation.created_at)}</strong>
            </span>
            <span>
              {text(language, "آخر تحديث", "Updated")}
              <strong>{localeDate(language, translation.updated_at)}</strong>
            </span>
          </div>
          {related.length ? (
            <div className="aside-card">
              <p className="kicker">
                {text(language, "اقرأ أيضًا", "READ NEXT")}
              </p>
              {related.map((item) => (
                <button
                  className="related-link"
                  key={item.article_id}
                  onClick={() => navigate(localizeSlug(item.slug, language))}
                >
                  <strong>{item.title}</strong>
                  <ChevronRight size={15} />
                </button>
              ))}
            </div>
          ) : null}
        </aside>
      </div>
    </article>
  );
}

function renderContent(content: string) {
  const lines = content.split(/\r?\n/);
  return (
    <>
      {lines.map((line, index) => {
        const value = line.trim();
        if (!value) return <div className="content-space" key={index} />;
        if (value.startsWith("### "))
          return <h3 key={index}>{value.slice(4)}</h3>;
        if (value.startsWith("## "))
          return <h2 key={index}>{value.slice(3)}</h2>;
        if (value.startsWith("# "))
          return <h2 key={index}>{value.slice(2)}</h2>;
        if (value.startsWith("- "))
          return <li key={index}>{value.slice(2)}</li>;
        return <p key={index}>{value.replace(/\*\*(.*?)\*\*/g, "$1")}</p>;
      })}
    </>
  );
}

function SourcesList({
  language,
  sources,
}: {
  language: string;
  sources: ArticleDetail["sources"];
}) {
  if (!sources.length) return null;
  return (
    <section className="sources-section">
      <div className="section-title compact">
        <div>
          <p className="kicker">
            <Library size={14} />{" "}
            {text(language, "المصادر والمراجع", "SOURCES & REFERENCES")}
          </p>
          <h2>{text(language, "مصادر هذا المقال", "Article sources")}</h2>
        </div>
      </div>
      <ol>
        {sources.map((source) => (
          <li key={source.id}>
            <div>
              <strong>{source.name}</strong>
              {source.source_author ? (
                <span>{source.source_author}</span>
              ) : null}
              {source.citation_note ? <p>{source.citation_note}</p> : null}
            </div>
            {source.url ? (
              <a href={source.url} target="_blank" rel="noreferrer">
                <ExternalLink size={14} />
              </a>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}

function TaxonomyPageView({
  language,
  kind,
  slug,
}: {
  language: string;
  kind: "category" | "tag";
  slug: string;
}) {
  const [data, setData] = useState<TaxonomyPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  useEffect(() => {
    setLoading(true);
    void (
      kind === "category"
        ? fetchCategory(language, slug, page)
        : fetchTag(language, slug, page)
    )
      .then((value) => {
        setData(value);
        setLoading(false);
        if (value)
          setDocumentSeo({
            title: `${value.name} — ${SITE_NAME}`,
            description: value.description || value.name,
            path: `/${language}/${kind}/${slug}`,
            languageCode: language,
          });
      })
      .catch(() => setLoading(false));
  }, [language, kind, slug, page]);
  if (loading) return <LoadingPage language={language} />;
  if (!data) return <NotFound language={language} />;
  return (
    <section className="container page-section">
      <div className="page-intro taxonomy-intro">
        <p className="kicker">
          <Library size={14} />{" "}
          {kind === "category"
            ? text(language, "تصنيف", "CATEGORY")
            : text(language, "وسم", "TAG")}
        </p>
        <h1>{data.name}</h1>
        {data.description ? <p>{data.description}</p> : null}
      </div>
      <ArticleGrid articles={data.articles} language={language} />
      <div className="pagination">
        <button
          disabled={page === 1}
          onClick={() => setPage((value) => value - 1)}
        >
          {text(language, "السابق", "Previous")}
        </button>
        <span>{page}</span>
        <button
          disabled={data.articles.length < 12}
          onClick={() => setPage((value) => value + 1)}
        >
          {text(language, "التالي", "Next")}
        </button>
      </div>
    </section>
  );
}

function StaticPageView({
  language,
  page,
}: {
  language: string;
  page: StaticPage;
}) {
  const content = STATIC_PAGES[page][language === "ar" ? "ar" : "en"];
  useEffect(() => {
    setDocumentSeo({
      title: `${content.title} — ${SITE_NAME}`,
      description: content.body[0],
      path: `/${language}/${page}`,
      languageCode: language,
    });
  }, [language, page]);
  return (
    <section className="container page-section static-page">
      <p className="kicker">
        <BookOpen size={14} />{" "}
        {text(language, "عن World Encyclopedia", "ABOUT WORLD ENCYCLOPEDIA")}
      </p>
      <h1>{content.title}</h1>
      {content.body.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </section>
  );
}
function NotFound({ language }: { language: string }) {
  return (
    <section className="container page-section not-found">
      <span className="not-found-number">404</span>
      <h1>
        {text(language, "هذه الصفحة غير موجودة.", "This page does not exist.")}
      </h1>
      <p>
        {text(
          language,
          "ارجع إلى الرئيسية أو جرّب البحث عن موضوع آخر.",
          "Return home or search for another subject.",
        )}
      </p>
      <button
        className="primary-button"
        onClick={() => navigate(`/${language}/`)}
      >
        {text(language, "العودة إلى الرئيسية", "Back home")}{" "}
        <ArrowRight size={15} />
      </button>
    </section>
  );
}
function LoadingPage({ language }: { language: string }) {
  return (
    <section className="container page-section">
      <div className="loading-block">
        <div className="spinner" />
        {text(language, "جارٍ تحميل الصفحة…", "Loading page…")}
      </div>
    </section>
  );
}
function EmptyBlock({ language, label }: { language: string; label: string }) {
  return (
    <div className="empty-block">
      <BookOpen size={22} />
      <p>{label}</p>
    </div>
  );
}
function InlineError({
  message,
  language,
}: {
  message: string;
  language: string;
}) {
  return (
    <div className="inline-error">
      <ShieldCheck size={18} />
      <div>
        <strong>
          {text(language, "تعذر إكمال الطلب", "Unable to complete the request")}
        </strong>
        <p>{message}</p>
      </div>
    </div>
  );
}

function Footer({
  language,
  onNavigate,
}: {
  language: string;
  onNavigate: (path: string) => void;
}) {
  const link = (path: string) => onNavigate(`/${language}/${path}`);
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <div className="brand">
            <span className="brand-mark">
              <BookOpen size={18} />
            </span>
            <span>
              <strong>World</strong> Encyclopedia
            </span>
          </div>
          <p>
            {text(
              language,
              "معرفة منظمة، بلغتين، وبمصادر واضحة.",
              "Organized knowledge, in two languages, with clear sources.",
            )}
          </p>
        </div>
        <div>
          <h3>{text(language, "الموسوعة", "Explore")}</h3>
          <button onClick={() => onNavigate(`/${language}/`)}>
            {text(language, "الرئيسية", "Home")}
          </button>
          <button onClick={() => onNavigate(`/${language}/search`)}>
            {text(language, "البحث", "Search")}
          </button>
          <button onClick={() => link("about")}>
            {text(language, "من نحن", "About")}
          </button>
        </div>
        <div>
          <h3>{text(language, "السياسات", "Policies")}</h3>
          <button onClick={() => link("privacy")}>
            {text(language, "الخصوصية", "Privacy")}
          </button>
          <button onClick={() => link("terms")}>
            {text(language, "الشروط", "Terms")}
          </button>
          <button onClick={() => link("editorial-policy")}>
            {text(language, "السياسة التحريرية", "Editorial policy")}
          </button>
          <button onClick={() => link("copyright")}>
            {text(language, "حقوق النشر", "Copyright")}
          </button>
        </div>
        <div>
          <h3>{text(language, "المراجع", "Trust")}</h3>
          <button onClick={() => link("sources")}>
            {text(language, "المصادر والمراجع", "Sources")}
          </button>
          <button onClick={() => link("corrections")}>
            {text(language, "تصحيح المعلومات", "Corrections")}
          </button>
          <button onClick={() => link("contact")}>
            {text(language, "اتصل بنا", "Contact")}
          </button>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>
          © {new Date().getFullYear()} {SITE_NAME}
        </span>
        <span>
          {text(
            language,
            "محتوى أصلي · قراءة مسؤولة",
            "Original content · Responsible reading",
          )}
        </span>
      </div>
    </footer>
  );
}

function AdminPage() {
  const [token, setToken] = useState(getEditorialToken());
  const [authenticated, setAuthenticated] = useState(Boolean(token));
  const [articles, setArticles] = useState<EditorialArticleRow[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editorLanguage, setEditorLanguage] = useState("ar");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const refresh = () => {
    if (!token) return;
    setError("");
    void listEditorialArticles(token, editorLanguage, statusFilter)
      .then((response) => setArticles(response.data))
      .catch((reason) =>
        setError(
          reason instanceof Error
            ? reason.message
            : "Unable to load editorial data.",
        ),
      );
  };
  useEffect(() => {
    if (authenticated) refresh();
  }, [authenticated, statusFilter, editorLanguage]);
  if (!authenticated)
    return (
      <div className="admin-gate">
        <div className="admin-gate-card">
          <span className="brand-mark">
            <ShieldCheck size={21} />
          </span>
          <p className="kicker">EDITORIAL CONSOLE</p>
          <h1>لوحة التحرير الداخلية</h1>
          <p>
            هذه المساحة غير مرتبطة بالتنقل العام. أدخل رمز التحرير المهيأ على
            الخادم.
          </p>
          <input
            type="password"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            placeholder="Editorial token"
          />
          <button
            className="primary-button"
            onClick={() => {
              saveEditorialToken(token);
              setAuthenticated(true);
            }}
          >
            دخول آمن <ArrowRight size={15} />
          </button>
          <small>API origin: {EDITORIAL_API_ORIGIN}</small>
        </div>
      </div>
    );
  return (
    <div className="admin-shell" dir="rtl">
      <aside className="admin-sidebar">
        <div className="brand">
          <span className="brand-mark">
            <BookOpen size={18} />
          </span>
          <span>
            <strong>World</strong> Editorial
          </span>
        </div>
        <p className="admin-caption">إنشاء، مراجعة، نشر</p>
        <button className="admin-side-active">
          <FileText size={16} /> المقالات
        </button>
        <button onClick={() => navigate("/ar/")}>
          <Globe2 size={16} /> فتح الموقع العام
        </button>
        <button
          onClick={() => {
            saveEditorialToken("");
            setAuthenticated(false);
          }}
        >
          <X size={16} /> تسجيل الخروج
        </button>
      </aside>
      <main className="admin-main">
        <div className="admin-header">
          <div>
            <p className="kicker">EDITORIAL WORKSPACE</p>
            <h1>مركز المحتوى</h1>
          </div>
          <div className="admin-filters">
            <select
              value={editorLanguage}
              onChange={(event) => {
                setEditorLanguage(event.target.value);
                setSelectedId("");
              }}
            >
              <option value="ar">العربية</option>
              <option value="en">English</option>
            </select>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="">كل الحالات</option>
              <option value="draft">مسودة</option>
              <option value="review">مراجعة</option>
              <option value="published">منشور</option>
              <option value="archived">مؤرشف</option>
            </select>
            <button
              className="primary-button"
              onClick={() => setSelectedId("")}
            >
              + مقال جديد
            </button>
          </div>
        </div>
        {error ? <InlineError message={error} language="ar" /> : null}
        <div className="admin-grid">
          <section className="admin-list">
            <div className="admin-list-title">
              <strong>المقالات</strong>
              <span>{articles.length}</span>
            </div>
            {articles.map((article) => (
              <button
                className={`admin-list-item ${selectedId === article.article_id ? "selected" : ""}`}
                key={article.id}
                onClick={() => setSelectedId(article.article_id)}
              >
                <span
                  className={`status-dot status-${article.publication_status}`}
                />
                <span>
                  <strong>{article.title}</strong>
                  <small>
                    {article.slug} · {article.language_code}
                  </small>
                </span>
              </button>
            ))}
            {!articles.length ? (
              <EmptyBlock language="ar" label="لا توجد مقالات في هذا الفلتر." />
            ) : null}
          </section>
          <EditorialEditor
            token={token}
            languageCode={editorLanguage}
            article={articles.find(
              (article) => article.article_id === selectedId,
            )}
            onSaved={(saved) => {
              setMessage(saved);
              refresh();
            }}
            message={message}
          />
        </div>
      </main>
    </div>
  );
}

function EditorialEditor({
  token,
  languageCode,
  article,
  onSaved,
  message,
}: {
  token: string;
  languageCode: string;
  article?: EditorialArticleRow;
  onSaved: (message: string) => void;
  message: string;
}) {
  const [canonicalKey, setCanonicalKey] = useState("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [categoryIds, setCategoryIds] = useState("");
  const [tagIds, setTagIds] = useState("");
  const [status, setStatus] =
    useState<
      EditorialArticleInput["translations"][number]["publicationStatus"]
    >("draft");
  const [sourceName, setSourceName] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceNote, setSourceNote] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaAlt, setMediaAlt] = useState("");
  const [mediaCaption, setMediaCaption] = useState("");
  const [saving, setSaving] = useState(false);
  const [editorError, setEditorError] = useState("");
  const [revisions, setRevisions] = useState<
    Array<{
      id: string;
      version: number;
      title: string;
      publication_status: string;
      change_note: string | null;
      created_at: string;
    }>
  >([]);
  useEffect(() => {
    if (article) {
      setCanonicalKey(article.article_id);
      setTitle(article.title);
      setSlug(article.slug);
      setSummary(article.summary || "");
      setContent(article.content);
      setSeoTitle(article.seo_title || "");
      setSeoDescription(article.seo_description || "");
      setKeywords(article.keywords.join(", "));
      setStatus(article.publication_status);
      void listRevisions(token, article.article_id, article.language_code)
        .then((response) => setRevisions(response.data))
        .catch(() => setRevisions([]));
    } else {
      setCanonicalKey("");
      setTitle("");
      setSlug("");
      setSummary("");
      setContent("");
      setSeoTitle("");
      setSeoDescription("");
      setKeywords("");
      setStatus("draft");
      setRevisions([]);
    }
  }, [article, token]);
  const relationIds = (value: string) =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  async function save(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setEditorError("");
    try {
      const translation = {
        languageCode,
        title,
        slug,
        summary,
        content,
        seoTitle,
        seoDescription,
        keywords: keywords
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        publicationStatus: status,
        changeNote: "Saved from editorial console",
      } as const;
      if (article) {
        await updateEditorialArticle(token, article.article_id, {
          translations: [translation],
          categoryIds: relationIds(categoryIds),
          tagIds: relationIds(tagIds),
        });
        onSaved("تم حفظ التعديلات وإنشاء revision جديدة.");
      } else {
        const result = await createEditorialArticle(token, {
          canonicalKey: canonicalKey || slug,
          translations: [translation],
          categoryIds: relationIds(categoryIds),
          tagIds: relationIds(tagIds),
        });
        onSaved(`تم إنشاء المقال ${result.data.article.id}.`);
      }
    } catch (reason) {
      setEditorError(reason instanceof Error ? reason.message : "تعذر الحفظ.");
    } finally {
      setSaving(false);
    }
  }
  async function changeStatus(
    next: EditorialArticleInput["translations"][number]["publicationStatus"],
  ) {
    if (!article) return;
    setSaving(true);
    setEditorError("");
    try {
      await changeEditorialStatus(
        token,
        article.article_id,
        article.language_code,
        next,
        `Status changed to ${next}`,
      );
      onSaved(`تم تغيير الحالة إلى ${next}.`);
    } catch (reason) {
      setEditorError(
        reason instanceof Error ? reason.message : "تعذر تغيير الحالة.",
      );
    } finally {
      setSaving(false);
    }
  }
  async function addSource() {
    if (!article || !sourceName) return;
    try {
      await attachEditorialSource(token, article.article_id, {
        name: sourceName,
        url: sourceUrl,
        citationNote: sourceNote,
      });
      setSourceName("");
      setSourceUrl("");
      setSourceNote("");
      onSaved("تم ربط المصدر بالمقال.");
    } catch (reason) {
      setEditorError(
        reason instanceof Error ? reason.message : "تعذر ربط المصدر.",
      );
    }
  }
  async function uploadMedia() {
    if (!article || !mediaFile) return;
    try {
      await uploadEditorialMedia(token, {
        articleId: article.article_id,
        languageCode: article.language_code,
        altText: mediaAlt,
        caption: mediaCaption,
        isPrimary: true,
        file: mediaFile,
      });
      setMediaFile(null);
      onSaved("تم رفع الوسائط وحفظ بياناتها.");
    } catch (reason) {
      setEditorError(
        reason instanceof Error ? reason.message : "تعذر رفع الوسائط.",
      );
    }
  }
  return (
    <section className="editor-panel">
      <div className="editor-panel-header">
        <div>
          <p className="kicker">
            {article ? "EDIT ARTICLE" : "CREATE ARTICLE"}
          </p>
          <h2>{article?.title || "إنشاء مقال جديد"}</h2>
        </div>
        {article ? (
          <span className={`editor-status status-${status}`}>{status}</span>
        ) : null}
      </div>
      {message ? <div className="success-message">{message}</div> : null}
      {editorError ? <div className="editor-error">{editorError}</div> : null}
      <form onSubmit={save} className="editor-form">
        <fieldset>
          <legend>01 · المعلومات الأساسية والموضوع</legend>
          <label>
            Canonical key
            <input
              value={canonicalKey}
              onChange={(event) => setCanonicalKey(event.target.value)}
              placeholder="مثال: black-hole"
              required={!article}
            />
          </label>
          <div className="field-grid">
            <label>
              اللغة
              <select value={languageCode} disabled>
                <option value="ar">العربية — ar</option>
                <option value="en">English — en</option>
              </select>
            </label>
            <label>
              الحالة
              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as typeof status)
                }
              >
                <option value="draft">مسودة</option>
                <option value="review">مراجعة</option>
                <option value="published">منشور</option>
                <option value="archived">مؤرشف</option>
              </select>
            </label>
          </div>
        </fieldset>
        <fieldset>
          <legend>02 · المحتوى</legend>
          <label>
            العنوان
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
          </label>
          <label>
            Slug
            <input
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              required
            />
          </label>
          <label>
            الملخص
            <textarea
              rows={3}
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
            />
          </label>
          <label>
            المحتوى <small>Markdown آمن؛ كل سطر فقرة أو عنوان يبدأ بـ #.</small>
            <textarea
              className="content-editor"
              rows={12}
              value={content}
              onChange={(event) => setContent(event.target.value)}
            />
          </label>
        </fieldset>
        <fieldset>
          <legend>03 · SEO</legend>
          <label>
            SEO title
            <input
              value={seoTitle}
              onChange={(event) => setSeoTitle(event.target.value)}
              placeholder="يستخدم العنوان عند تركه فارغًا"
            />
          </label>
          <label>
            Meta description
            <textarea
              rows={2}
              value={seoDescription}
              onChange={(event) => setSeoDescription(event.target.value)}
            />
          </label>
          <label>
            Keywords
            <input
              value={keywords}
              onChange={(event) => setKeywords(event.target.value)}
              placeholder="كلمة، موضوع، معرفة"
            />
          </label>
        </fieldset>
        <fieldset>
          <legend>04 · التصنيفات والوسوم</legend>
          <label>
            Category IDs
            <input
              value={categoryIds}
              onChange={(event) => setCategoryIds(event.target.value)}
              placeholder="UUID, UUID"
            />
          </label>
          <label>
            Tag IDs
            <input
              value={tagIds}
              onChange={(event) => setTagIds(event.target.value)}
              placeholder="UUID, UUID"
            />
          </label>
          <small>
            ضع المعرفات مفصولة بفواصل؛ سيحفظ الخادم العلاقات مع منع التكرار.
          </small>
        </fieldset>
        <div className="editor-actions">
          <button className="primary-button" type="submit" disabled={saving}>
            {saving
              ? "جارٍ الحفظ…"
              : article
                ? "حفظ وإنشاء revision"
                : "حفظ كمسودة"}
          </button>
          {article ? (
            <>
              <button
                type="button"
                className="secondary-button"
                onClick={() => void changeStatus("review")}
              >
                إرسال للمراجعة
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={() => void changeStatus("published")}
              >
                نشر
              </button>
              <button
                type="button"
                className="ghost-button"
                onClick={() => void changeStatus("archived")}
              >
                أرشفة
              </button>
            </>
          ) : null}
        </div>
      </form>
      <div className="editor-subsections">
        <details open>
          <summary>05 · المصادر والمراجع</summary>
          <div className="subform">
            <input
              value={sourceName}
              onChange={(event) => setSourceName(event.target.value)}
              placeholder="اسم المصدر"
            />
            <input
              value={sourceUrl}
              onChange={(event) => setSourceUrl(event.target.value)}
              placeholder="https://..."
            />
            <input
              value={sourceNote}
              onChange={(event) => setSourceNote(event.target.value)}
              placeholder="ملاحظة الاستشهاد"
            />
            <button
              className="secondary-button"
              type="button"
              disabled={!article}
              onClick={() => void addSource()}
            >
              إضافة مصدر
            </button>
          </div>
        </details>
        <details>
          <summary>06 · الوسائط</summary>
          <div className="subform">
            <label className="file-input">
              <ImagePlus size={17} /> اختر صورة
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) =>
                  setMediaFile(event.target.files?.[0] || null)
                }
              />
            </label>
            <input
              value={mediaAlt}
              onChange={(event) => setMediaAlt(event.target.value)}
              placeholder="Alt text وصفي"
            />
            <input
              value={mediaCaption}
              onChange={(event) => setMediaCaption(event.target.value)}
              placeholder="تعليق الصورة"
            />
            <button
              className="secondary-button"
              type="button"
              disabled={!article || !mediaFile}
              onClick={() => void uploadMedia()}
            >
              رفع الصورة
            </button>
          </div>
        </details>
        <details>
          <summary>07 · سجل revisions ({revisions.length})</summary>
          {revisions.length ? (
            <ul className="revision-list">
              {revisions.map((revision) => (
                <li key={revision.id}>
                  <strong>v{revision.version}</strong>
                  <span>{revision.publication_status}</span>
                  <small>{revision.change_note || "Editorial update"}</small>
                </li>
              ))}
            </ul>
          ) : (
            <p className="subtle">ستظهر النسخ هنا بعد أول حفظ.</p>
          )}
        </details>
      </div>
    </section>
  );
}

export default App;
