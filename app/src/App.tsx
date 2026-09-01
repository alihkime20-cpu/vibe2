import { FormEvent, useEffect, useMemo, useState } from "react";
import type { Database } from "../../database/types/supabase.generated";
import { getSupabaseClient, hasSupabaseConfig } from "./lib/supabase";

type Language = Database["public"]["Tables"]["languages"]["Row"];
type SearchArticleResult =
  Database["public"]["Functions"]["search_articles"]["Returns"][number];

const fallbackLanguages: Language[] = [
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

type ConnectionState = "checking" | "connected" | "missing-config" | "error";

export default function App() {
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("checking");
  const [languages, setLanguages] = useState<Language[]>(fallbackLanguages);
  const [selectedLanguage, setSelectedLanguage] = useState("ar");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchArticleResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function checkDatabase() {
      if (!hasSupabaseConfig()) {
        if (active) setConnectionState("missing-config");
        return;
      }

      const supabase = getSupabaseClient();
      if (!supabase) {
        if (active) setConnectionState("missing-config");
        return;
      }

      const { data, error } = await supabase
        .from("languages")
        .select(
          "code,name,native_name,direction,is_active,sort_order,created_at",
        )
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (!active) return;
      if (error) {
        setConnectionState("error");
        return;
      }

      if (data?.length) {
        setLanguages(data);
        if (!data.some((language) => language.code === selectedLanguage)) {
          setSelectedLanguage(data[0].code);
        }
      }
      setConnectionState("connected");
    }

    void checkDatabase();
    return () => {
      active = false;
    };
  }, [selectedLanguage]);

  const connectionLabel = useMemo(() => {
    switch (connectionState) {
      case "connected":
        return "متصل بقاعدة البيانات";
      case "missing-config":
        return "بانتظار متغيرات البيئة";
      case "error":
        return "تعذر قراءة جدول اللغات";
      default:
        return "جارٍ فحص الاتصال";
    }
  }, [connectionState]);

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedQuery = query.trim();
    if (normalizedQuery.length < 2) {
      setSearchError("اكتب حرفين على الأقل للبحث.");
      setResults([]);
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      setSearchError("أضف VITE_SUPABASE_URL وVITE_SUPABASE_ANON_KEY أولًا.");
      setResults([]);
      return;
    }

    setSearching(true);
    setSearchError(null);
    const { data, error } = await supabase.rpc("search_articles", {
      search_query: normalizedQuery,
      requested_language: selectedLanguage,
      page_size: 20,
      page_offset: 0,
    });

    setSearching(false);
    if (error) {
      setSearchError(error.message);
      setResults([]);
      return;
    }
    setResults(data ?? []);
  }

  return (
    <main className="shell">
      <section className="hero">
        <div className="eyebrow">WORLD ENCYCLOPEDIA · PHASE 01</div>
        <div className="hero-grid">
          <div>
            <h1>
              أساس موسوعة عالمية، <em>جاهز للتوسع.</em>
            </h1>
            <p className="lead">
              طبقة بيانات متعددة اللغات تفصل هوية الموضوع عن ترجماته، وتحافظ على
              قابلية النقل بين Supabase وأي استضافة PostgreSQL قياسية.
            </p>
          </div>
          <div className="architecture-mark" aria-hidden="true">
            <span>topics</span>
            <span>translations</span>
            <span>search</span>
          </div>
        </div>
      </section>

      <section className="status-panel" aria-labelledby="status-title">
        <div className="section-heading">
          <div>
            <div className="eyebrow">RUNTIME CHECK</div>
            <h2 id="status-title">حالة الأساس التقني</h2>
          </div>
          <div className={`status-pill ${connectionState}`}>
            <span className="status-dot" />
            {connectionLabel}
          </div>
        </div>
        <div className="status-grid">
          <article className="status-card">
            <strong>01</strong>
            <span>PostgreSQL schema</span>
            <b>18 tables · RLS</b>
          </article>
          <article className="status-card accent">
            <strong>02</strong>
            <span>Multilingual search</span>
            <b>PGroonga · ar / en</b>
          </article>
          <article className="status-card">
            <strong>03</strong>
            <span>Editorial lifecycle</span>
            <b>draft → review → published</b>
          </article>
        </div>
      </section>

      <section className="search-panel" aria-labelledby="search-title">
        <div className="section-heading compact">
          <div>
            <div className="eyebrow">DATABASE RPC</div>
            <h2 id="search-title">اختبار البحث متعدد اللغات</h2>
          </div>
          <span className="table-label">public.search_articles()</span>
        </div>
        <form onSubmit={handleSearch} className="search-form">
          <label className="search-input">
            <span className="sr-only">عبارة البحث</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ابحث في العنوان أو الملخص أو المحتوى…"
              dir={selectedLanguage === "ar" ? "rtl" : "ltr"}
            />
          </label>
          <select
            value={selectedLanguage}
            onChange={(event) => setSelectedLanguage(event.target.value)}
            aria-label="لغة البحث"
          >
            {languages.map((language) => (
              <option key={language.code} value={language.code}>
                {language.native_name}
              </option>
            ))}
          </select>
          <button type="submit" disabled={searching}>
            {searching ? "جارٍ البحث…" : "ابحث"}
          </button>
        </form>
        {searchError ? (
          <p className="form-message error">{searchError}</p>
        ) : null}
        {!searchError && results.length === 0 ? (
          <p className="empty-state">
            لا توجد مقالات منشورة بعد. عند إدخال أول محتوى، ستظهر النتائج هنا مع
            ترتيب الصلة.
          </p>
        ) : null}
        {results.length > 0 ? (
          <div
            className="results"
            dir={selectedLanguage === "ar" ? "rtl" : "ltr"}
          >
            {results.map((result) => (
              <article className="result-card" key={result.translation_id}>
                <span>
                  {result.language_code.toUpperCase()} ·{" "}
                  {result.relevance.toFixed(0)} pts
                </span>
                <h3>{result.title}</h3>
                <p>{result.summary || "لا يوجد ملخص لهذه الترجمة."}</p>
              </article>
            ))}
          </div>
        ) : null}
      </section>

      <footer>
        <span>Schema-first foundation</span>
        <span>•</span>
        <span>Supabase PostgreSQL</span>
        <span>•</span>
        <span>Portable by design</span>
      </footer>
    </main>
  );
}
