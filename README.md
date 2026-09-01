# World Encyclopedia

أساس تقني لموسوعة عالمية قابلة للتوسع، متعددة اللغات منذ اليوم الأول، ومصممة للعمل خارج Manus. يستخدم المشروع React/Vite للواجهة وSupabase PostgreSQL لمصدر البيانات، مع migrations SQL قياسية محفوظة في المستودع.

> هذه المرحلة schema-first: تم بناء قاعدة البيانات، البحث، سياسات القراءة العامة، طبقة الاتصال، والتوثيق. لم يتم إنشاء آلاف المقالات، ولم تُبنَ واجهة المحتوى النهائية.

## بنية المستودع

```text
app/                    واجهة Vite/React خفيفة للتحقق من الاتصال والبحث
  public/               robots.txt وsitemap.xml
  src/                  React client وطبقة Supabase

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

طبّقها بالترتيب في Supabase SQL Editor أو عبر `supabase db push` بعد ربط المشروع. المشروع المرتبط الذي تم فحصه هو Supabase project ref `yydufmbexnlblnevdmlw`، وكانت قاعدة `public` فارغة قبل التنفيذ.

## البحث

يستخدم `public.search_articles(...)` عمود `search_text` المحدث تلقائيًا عبر trigger من العنوان والملخص والمحتوى والكلمات المفتاحية، وفهرس PGroonga للعربية والإنجليزية. تعطي الدالة وزنًا أعلى لتطابق العنوان، ثم الملخص، ثم الكلمات المفتاحية، ثم المحتوى. الوصول العام مقصور على الترجمات المنشورة بفضل RLS.

## قابلية النقل

لا تعتمد الواجهة على runtime أو storage خاص بـ Manus. المتغيرات العامة هي `VITE_SUPABASE_URL` و`VITE_SUPABASE_ANON_KEY`. أي service-role key أو `DATABASE_URL` يبقى في خادم آمن مستقبلي ولا يمر إلى المتصفح. راجع `docs/deployment-and-backup.md` للنسخ الاحتياطي والاستعادة والنشر على Hostinger.

## الحالة الحالية

تم تنفيذ المرحلة الأولى فقط. الخطوة التالية، بعد اعتماد المخطط، هي بناء ingestion/editorial API وصفحات المقالات والتصنيفات، ثم إدخال محتوى محدود ومراجعته قبل أي توليد جماعي.
