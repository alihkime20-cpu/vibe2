# World Encyclopedia

موسوعة عالمية قابلة للتوسع، متعددة اللغات منذ اليوم الأول، ومصممة للعمل خارج Manus. يستخدم المشروع React/Vite للواجهة العامة، Express/TypeScript لطبقة التحرير الخادمية، وSupabase PostgreSQL لمصدر البيانات، مع migrations SQL قياسية محفوظة في المستودع.

> المرحلة الثانية تبني الأساس العام والتحريري: صفحات Home/Search/Article/Category/Tag، محتوى عربي وإنجليزي، SEO ديناميكي، Editorial API محمي، revisions، مصادر، رفع وسائط، ودورة نشر واضحة. لا تُنشأ أي مقالات تلقائيًا ولا توجد ادعاءات شراكة أو محتوى منسوخ.

## بنية المستودع

```text
app/                    واجهة Vite/React للموسوعة العامة ولوحة /admin المخفية
  public/               robots.txt وsitemap.xml
  src/                  React client، المسارات العامة، SEO، وطبقة Supabase/Editorial API
server/                 Express API خادمي للمحتوى والتحرير والوسائط

database/
  migrations/           migrations PostgreSQL المرتبة زمنيًا
  types/                أنواع TypeScript العامة للمشروع

docs/
  architecture.md      القرارات والطبقات وقابلية النقل
  database-schema.md    ERD والجداول والعلاقات والفهارس
  setup.md              التشغيل وتطبيق migrations
  deployment-and-backup.md  النشر والنسخ الاحتياطي والاستعادة

scripts/                اختبارات SQL محلية وتحقق بنيوي
supabase/               مساحة توافق مستقبلية مع Supabase CLI
```

## التشغيل

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

لتشغيل طبقة التحرير محليًا في طرفية ثانية:

```bash
pnpm dev:api
```

تفتح الواجهة العامة على `/ar/` أو `/en/`. لوحة التحرير الداخلية موجودة على `/admin` ولا تظهر في التنقل العام. لاستخدامها، عيّن `EDITORIAL_ADMIN_TOKEN` و`SUPABASE_SERVICE_ROLE_KEY` في بيئة الخادم ثم أدخل الرمز في شاشة الدخول. مفتاح service-role لا يدخل إلى Vite ولا إلى المتصفح.

وللتحقق:

```bash
pnpm check
pnpm build
pnpm test
```

## قاعدة البيانات

المصدر المنطقي للبيانات هو PostgreSQL. يبدأ المخطط باللغتين `ar` و`en`، ويستخدم `topics` ككيان واحد للموضوع ثم يربطه بصفوف `article_translations`. إضافة لغة جديدة لا تتطلب تغييرًا جوهريًا في الجداول.

المigrations:

1. `database/migrations/20260901000000_core.sql` ينشئ الامتدادات واللغات والكيانات الأساسية.
2. `database/migrations/20260901001000_content.sql` ينشئ الترجمات، الإصدارات، التصنيفات، الوسوم، العلاقات، المصادر، الوسائط وSEO.
3. `database/migrations/20260901002000_search_security.sql` ينشئ فهارس PGroonga، دالة البحث، RLS وbucket الوسائط.
4. `database/migrations/20260901003000_security_hardening.sql` يثبت `search_path` الآمن ويضع سياسة رفض صريحة لسجل الإصدارات الخاص.
5. `database/migrations/20260901004000_foreign_key_indexes.sql` يضيف فهارس تغطية للعلاقات التي كشفها فحص Supabase الأدائي.
6. `database/migrations/20260903000000_phase2_listing_indexes.sql` يضيف فهارس مسارات القوائم والـslugs للصفحات العامة.

طبّقها بالترتيب في Supabase SQL Editor أو عبر `supabase db push` بعد ربط المشروع. المشروع المرتبط الذي تم فحصه هو Supabase project ref `yydufmbexnlblnevdmlw`، وكانت قاعدة `public` فارغة قبل التنفيذ.

## البحث

يستخدم `public.search_articles(...)` عمود `search_text` المحدث تلقائيًا عبر trigger من العنوان والملخص والمحتوى والكلمات المفتاحية، وفهرس PGroonga للعربية والإنجليزية. تعطي الدالة وزنًا أعلى لتطابق العنوان، ثم الملخص، ثم الكلمات المفتاحية، ثم المحتوى. الوصول العام مقصور على الترجمات المنشورة بفضل RLS.

## قابلية النقل

لا تعتمد الواجهة على runtime أو storage خاص بـ Manus. المتغيرات العامة هي `VITE_SUPABASE_URL` و`VITE_SUPABASE_ANON_KEY`. للـEditorial API الخادمي: `SUPABASE_URL` و`SUPABASE_SERVICE_ROLE_KEY` و`EDITORIAL_ADMIN_TOKEN` و`PORT` اختياريًا. تبقى مفاتيح service-role في الخادم ولا تمر إلى المتصفح. راجع `docs/setup.md` و`docs/deployment-and-backup.md` للنشر والنسخ الاحتياطي.

## الحالة الحالية

تم تنفيذ المرحلة الثانية: الواجهة العامة، صفحات المحتوى، البحث، SEO، Editorial API، لوحة التحرير، رفع الوسائط، revisions، وفحوص البناء والاختبارات. لم يتم إدخال محتوى تجريبي أو تشغيل توليد جماعي. الخطوة التالية هي إدخال عدد محدود من المقالات الأصلية والمصادر ثم مراجعتها يدويًا قبل التوسع.
