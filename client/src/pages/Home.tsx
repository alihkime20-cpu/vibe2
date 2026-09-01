import { useMemo, useState } from "react";
import { ArrowLeft, ArrowUpLeft, BookOpen, ChevronDown, Globe2, Landmark, Menu, Search, Sparkles, Telescope, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const categories = [
  { title: "الشخصيات", subtitle: "أعلام تركوا أثرًا", icon: Users, tone: "ochre" },
  { title: "الأحداث", subtitle: "محطات غيّرت التاريخ", icon: Landmark, tone: "blue" },
  { title: "العلوم", subtitle: "أفكار تفسّر العالم", icon: Telescope, tone: "sage" },
  { title: "الأماكن", subtitle: "مدن وحضارات ومعالم", icon: Globe2, tone: "rose" },
  { title: "الكتب والأعمال", subtitle: "إرث الثقافة الإنسانية", icon: BookOpen, tone: "violet" },
];

const featured = [
  { name: "ابن الهيثم", latin: "Ibn al-Haytham", meta: "عالم بصريات وفيلسوف", years: "965 — 1040", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=900&q=80" },
  { name: "ماري كوري", latin: "Marie Curie", meta: "عالمة فيزياء وكيمياء", years: "1867 — 1934", image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=900&q=80" },
  { name: "ليوناردو دافنشي", latin: "Leonardo da Vinci", meta: "فنان ومخترع ومفكر", years: "1452 — 1519", image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=900&q=80" },
];

const articles = [
  { category: "حضارات", title: "كيف ازدهرت مدن طريق الحرير؟", description: "قراءة في الشبكات التجارية والثقافية التي ربطت الشرق بالغرب لقرون طويلة.", date: "منذ يومين", color: "bg-[#dce8e1]" },
  { category: "علوم", title: "من الملاحظة إلى المنهج العلمي", description: "محطات أساسية في تشكّل طرق البحث والاستدلال التي نعرفها اليوم.", date: "منذ 4 أيام", color: "bg-[#e9e1d3]" },
  { category: "أماكن", title: "الإسكندرية: مدينة عند ملتقى العوالم", description: "تاريخ مدينة جمعت المعرفة والتجارة واللغات على شاطئ المتوسط.", date: "منذ أسبوع", color: "bg-[#e6dfe5]" },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState("العربية");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const visibleFeatured = useMemo(() => submittedQuery ? featured.filter((item) => `${item.name} ${item.latin} ${item.meta}`.toLowerCase().includes(submittedQuery.toLowerCase())) : featured, [submittedQuery]);

  return (
    <div dir="rtl" className="min-h-screen bg-[#f8f6f1] text-[#182b2b] selection:bg-[#c98d4d]/30">
      <header className="border-b border-[#dfe5df] bg-[#f8f6f1]/90 backdrop-blur-md">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 lg:px-8">
          <a href="#top" className="flex items-center gap-3" aria-label="World Encyclopedia">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#123d3b] text-[#f8f6f1]"><Globe2 size={21} strokeWidth={1.7} /></span>
            <span className="leading-none"><strong className="block font-serif text-[20px] font-semibold tracking-tight">الموسوعة</strong><small className="mt-1 block text-[10px] font-medium uppercase tracking-[0.2em] text-[#74817c]">WORLD ENCYCLOPEDIA</small></span>
          </a>
          <nav className="hidden items-center gap-8 text-sm font-medium text-[#50615d] lg:flex">
            <a className="text-[#123d3b]" href="#explore">استكشف</a><a href="#featured" className="transition-colors hover:text-[#b06e31]">شخصيات بارزة</a><a href="#timeline" className="transition-colors hover:text-[#b06e31]">الخط الزمني</a><a href="#articles" className="transition-colors hover:text-[#b06e31]">أحدث المقالات</a>
          </nav>
          <div className="flex items-center gap-2">
            <button className="hidden items-center gap-1 px-3 py-2 text-sm text-[#50615d] sm:flex" onClick={() => setLanguage(language === "العربية" ? "English" : "العربية")}><span>{language}</span><ChevronDown size={14} /></button>
            <Button variant="outline" className="hidden border-[#cbd6d0] bg-transparent text-[#123d3b] hover:bg-white sm:flex">تسجيل الدخول</Button>
            <button className="rounded-lg p-2 lg:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="فتح القائمة">{menuOpen ? <X size={22} /> : <Menu size={22} />}</button>
          </div>
        </div>
        {menuOpen && <nav className="border-t border-[#dfe5df] px-5 py-4 lg:hidden"><div className="flex flex-col gap-4 text-sm text-[#50615d]"><a href="#explore" onClick={() => setMenuOpen(false)}>استكشف</a><a href="#featured" onClick={() => setMenuOpen(false)}>شخصيات بارزة</a><a href="#timeline" onClick={() => setMenuOpen(false)}>الخط الزمني</a><a href="#articles" onClick={() => setMenuOpen(false)}>أحدث المقالات</a></div></nav>}
      </header>

      <main id="top">
        <section className="relative overflow-hidden border-b border-[#dfe5df] bg-[#e9efeb]">
          <div className="absolute -left-32 -top-36 h-[480px] w-[480px] rounded-full bg-[#d2e0d9] blur-3xl" /><div className="absolute -bottom-48 right-[-5%] h-[460px] w-[460px] rounded-full bg-[#f0ddc6] blur-3xl" />
          <div className="relative mx-auto grid max-w-7xl gap-12 px-5 pb-20 pt-20 lg:grid-cols-[1fr_420px] lg:items-center lg:px-8 lg:pb-28 lg:pt-28">
            <div className="max-w-3xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#bfd0c8] bg-[#f8f6f1]/70 px-3 py-1.5 text-xs font-semibold text-[#527067]"><Sparkles size={13} /> معرفة مفتوحة للجميع</div>
              <h1 className="font-serif text-[clamp(45px,7vw,82px)] font-medium leading-[1.02] tracking-[-0.045em] text-[#123d3b]">اكتشف العالم<br /><em className="font-serif not-italic text-[#b06e31]">من حولك</em></h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-[#53645f]">موسوعة عالمية تجمع الأشخاص والأحداث والأماكن والأفكار في مكان واحد، وتصل بين المعرفة الإنسانية عبر الزمن.</p>
              <form className="mt-9 flex max-w-2xl items-center gap-2 rounded-2xl border border-[#c6d4cc] bg-white p-2 shadow-[0_12px_35px_rgba(25,58,53,0.08)]" onSubmit={(event) => { event.preventDefault(); setSubmittedQuery(query); }}>
                <Search className="mr-2 text-[#83938c]" size={22} /><input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent px-2 py-3 text-sm outline-none placeholder:text-[#9aa7a1]" placeholder="ابحث عن شخصية، دولة، حدث، مدينة، عالم..." aria-label="البحث في الموسوعة" /><Button type="submit" className="rounded-xl bg-[#c47d3b] px-6 text-white hover:bg-[#aa672d]">بحث</Button>
              </form>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#72837c]"><span>اقتراحات شائعة:</span><button onClick={() => { setQuery("ابن الهيثم"); setSubmittedQuery("ابن الهيثم"); }} className="underline decoration-[#c47d3b]/40 underline-offset-4">ابن الهيثم</button><button onClick={() => { setQuery("الحضارة المصرية"); setSubmittedQuery("الحضارة المصرية"); }} className="underline decoration-[#c47d3b]/40 underline-offset-4">الحضارة المصرية</button><button onClick={() => { setQuery("الفلسفة"); setSubmittedQuery("الفلسفة"); }} className="underline decoration-[#c47d3b]/40 underline-offset-4">الفلسفة</button></div>
            </div>
            <div className="relative hidden h-[350px] lg:block"><div className="absolute right-10 top-0 h-72 w-64 rotate-6 rounded-[140px_140px_22px_22px] bg-[#d39c63] opacity-80" /><div className="absolute left-8 top-16 h-60 w-56 -rotate-12 rounded-[130px_130px_18px_18px] bg-[#27615d]" /><div className="absolute left-28 top-28 h-44 w-52 rotate-3 rounded-[50%_50%_18px_18px] border-[18px] border-[#f2e9d9] bg-[#7a9a88] shadow-2xl" /><div className="absolute bottom-4 right-6 rounded-xl border border-white/60 bg-[#f8f6f1]/85 px-4 py-3 text-xs text-[#50615d] shadow-sm">معرفة بلا حدود<br /><span className="text-[10px] text-[#9a6a3b]">منذ فجر الحضارة</span></div></div>
          </div>
        </section>

        <section id="explore" className="mx-auto max-w-7xl px-5 py-20 lg:px-8"><div className="mb-8 flex items-end justify-between"><div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#b06e31]">استكشف الموسوعة</p><h2 className="font-serif text-4xl tracking-tight text-[#123d3b]">أبواب المعرفة</h2></div><a href="#articles" className="hidden items-center gap-2 text-sm text-[#527067] sm:flex">عرض كل التصنيفات <ArrowLeft size={16} /></a></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{categories.map(({ title, subtitle, icon: Icon, tone }) => <a href="#featured" key={title} className={`group rounded-2xl p-5 transition-transform hover:-translate-y-1 ${tone === "ochre" ? "bg-[#ead9bd]" : tone === "blue" ? "bg-[#dbe7e8]" : tone === "sage" ? "bg-[#dbe8df]" : tone === "rose" ? "bg-[#eadde0]" : "bg-[#e3ddeb]"}`}><Icon className="mb-12 text-[#244d49]" size={25} strokeWidth={1.6} /><h3 className="font-serif text-xl text-[#203f3d]">{title}</h3><p className="mt-1 text-xs text-[#64746e]">{subtitle}</p><ArrowUpLeft className="mt-5 text-[#b06e31] opacity-0 transition-opacity group-hover:opacity-100" size={17} /></a>)}</div></section>

        <section id="featured" className="border-y border-[#e0e5df] bg-white/50"><div className="mx-auto max-w-7xl px-5 py-20 lg:px-8"><div className="mb-9 flex items-end justify-between"><div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#b06e31]">وجوه غيّرت العالم</p><h2 className="font-serif text-4xl tracking-tight text-[#123d3b]">شخصيات بارزة</h2></div><button className="hidden items-center gap-2 text-sm text-[#527067] sm:flex">استكشف الشخصيات <ArrowLeft size={16} /></button></div>{submittedQuery && <p className="mb-5 text-sm text-[#6a7c74]">نتائج البحث عن: <strong className="text-[#123d3b]">{submittedQuery}</strong></p>}<div className="grid gap-5 md:grid-cols-3">{(visibleFeatured.length ? visibleFeatured : featured).map((item) => <article key={item.name} className="group overflow-hidden rounded-2xl border border-[#e1e6e1] bg-[#f8f6f1]"><div className="h-56 overflow-hidden bg-[#d9e1da]"><img src={item.image} alt={item.name} className="h-full w-full object-cover grayscale-[20%] transition-transform duration-500 group-hover:scale-105" /></div><div className="p-5"><p className="text-xs text-[#b06e31]">{item.meta}</p><h3 className="mt-2 font-serif text-2xl text-[#123d3b]">{item.name}</h3><p className="mt-1 text-xs tracking-wide text-[#87948e]">{item.latin} · {item.years}</p><a href="#articles" className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-[#527067]">اقرأ المقال <ArrowLeft size={14} /></a></div></article>)}</div></div></section>

        <section id="timeline" className="mx-auto max-w-7xl px-5 py-20 lg:px-8"><div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end"><div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#b06e31]">رحلة عبر الزمن</p><h2 className="font-serif text-4xl leading-tight tracking-tight text-[#123d3b]">كل لحظة لها<br />حكاية</h2><p className="mt-5 max-w-sm text-sm leading-7 text-[#667872]">تتبّع الأفكار والاختراعات والأحداث التي شكّلت عالمنا، من أقدم الحضارات حتى يومنا هذا.</p></div><div className="rounded-2xl border border-[#d8e2da] bg-[#e9efeb] p-6 sm:p-9"><div className="flex justify-between text-[11px] font-semibold text-[#7c8d84]"><span>1000 ق.م</span><span>500 ق.م</span><span>0</span><span>500</span><span>1000</span><span>1500</span><span>2000</span></div><div className="relative my-10 h-1 rounded-full bg-[#b9cdc1]"><div className="absolute right-[42%] top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-4 border-[#e9efeb] bg-[#b06e31]" /><div className="absolute right-[42%] top-7 w-40 text-right"><p className="text-sm font-semibold text-[#244d49]">عصر الترجمة</p><p className="mt-1 text-[11px] text-[#74857d]">ازدهار حركة نقل المعرفة</p></div></div><div className="mt-24 flex justify-end"><button className="inline-flex items-center gap-2 rounded-lg border border-[#b8cbc0] bg-white/60 px-4 py-2 text-xs font-semibold text-[#527067]">استكشف الخط الزمني <ArrowLeft size={14} /></button></div></div></div></section>

        <section id="articles" className="border-t border-[#e0e5df] bg-[#f1f0ea]"><div className="mx-auto max-w-7xl px-5 py-20 lg:px-8"><div className="mb-9 flex items-end justify-between"><div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#b06e31]">من دفتر الموسوعة</p><h2 className="font-serif text-4xl tracking-tight text-[#123d3b]">أحدث المقالات</h2></div><button className="hidden items-center gap-2 text-sm text-[#527067] sm:flex">كل المقالات <ArrowLeft size={16} /></button></div><div className="grid gap-5 md:grid-cols-3">{articles.map((article) => <article key={article.title} className="rounded-2xl border border-[#dfe4de] bg-[#f8f6f1] p-6"><div className={`mb-8 h-28 rounded-xl ${article.color}`} /><p className="text-xs font-semibold text-[#b06e31]">{article.category}</p><h3 className="mt-2 font-serif text-2xl leading-tight text-[#123d3b]">{article.title}</h3><p className="mt-3 text-sm leading-6 text-[#718078]">{article.description}</p><div className="mt-6 flex items-center justify-between border-t border-[#e3e7e1] pt-4 text-[11px] text-[#8d9993]"><span>{article.date}</span><a href="#top" className="font-semibold text-[#527067]">قراءة المقال <ArrowLeft className="mr-1 inline" size={12} /></a></div></article>)}</div></div></section>
      </main>

      <footer className="bg-[#123d3b] text-[#d9e6de]"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 px-5 py-12 sm:flex-row lg:px-8"><div><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#d29a60] text-[#123d3b]"><Globe2 size={19} /></span><span className="font-serif text-xl">الموسوعة</span></div><p className="mt-4 max-w-xs text-xs leading-6 text-[#9fb7aa]">نرتّب المعرفة الإنسانية لتكون أقرب، أوضح، وأكثر اتصالًا.</p></div><div className="grid grid-cols-2 gap-x-12 gap-y-3 text-xs text-[#a9bdb2]"><a href="#explore">التصنيفات</a><a href="#featured">الشخصيات</a><a href="#timeline">الخط الزمني</a><a href="#articles">المقالات</a></div></div><div className="border-t border-[#37615b] px-5 py-5 text-center text-[11px] text-[#8fa99c]">© 2026 World Encyclopedia · معرفة مفتوحة للجميع</div></footer>
    </div>
  );
}
