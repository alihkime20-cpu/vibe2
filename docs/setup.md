# التشغيل والإعداد

## المتطلبات

يلزم Node.js 20 أو أحدث، وpnpm، ومشروع PostgreSQL 15 أو أحدث. يعمل المشروع مباشرة مع Supabase، كما يمكن تشغيل الواجهة دون قاعدة بيانات لرؤية شاشة حالة الإعداد.

## إعداد الواجهة

انسخ ملف البيئة:

```bash
cp .env.example .env.local
```

ثم املأ:

```dotenv
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<publishable-or-anon-key>
```

المفتاح المسموح في المتصفح هو publishable/anon فقط، مع الاعتماد على RLS. لا تضع service-role key في `.env.local` أو في أي ملف يمر إلى Vite.

## تثبيت وتشغيل

```bash
pnpm install
pnpm dev
```

الأوامر المفيدة:

```bash
pnpm check
pnpm build
pnpm test
```

## تطبيق قاعدة البيانات

المigrations مرتبة زمنيًا:

| الاسم                                    | المحتوى                                                                 |
| ---------------------------------------- | ----------------------------------------------------------------------- |
| `20260901000000_core.sql`                | الامتدادات، اللغات، topics، articles، authors، triggers الأساسية        |
| `20260901001000_content.sql`             | الترجمات، الإصدارات، التصنيفات، الوسوم، العلاقات، المصادر، الوسائط وSEO |
| `20260901002000_search_security.sql`     | PGroonga، عمود البحث، دالة البحث، RLS وbucket الوسائط                   |
| `20260901003000_security_hardening.sql`  | تثبيت `search_path` الآمن وسياسة رفض صريحة للإصدارات الخاصة             |
| `20260901004000_foreign_key_indexes.sql` | فهارس تغطية للمفاتيح الخارجية المكتشفة في مراجعة Supabase الأدائية      |

من Supabase Dashboard يمكن تشغيل الملفات بالترتيب في SQL Editor. عبر Supabase CLI بعد ربط المشروع:

```bash
supabase db push
```

وللبيئات العامة التي لا تستخدم CLI، يُمكن نسخ migration كلّها إلى SQL Editor وتشغيلها بالترتيب. يجب عدم تشغيل migration على قاعدة تحتوي نسخة قديمة من جداول المشروع دون مراجعة؛ هذه المرحلة تستهدف قاعدة المشروع الجديدة الفارغة التي تم التحقق منها قبل التطبيق.

## اختبار الدالة

بعد وجود مقال منشور بترجمة عربية أو إنجليزية، يمكن اختبار:

```sql
select *
from public.search_articles('الحضارة', 'ar', 20, 0);
```

أو:

```sql
select *
from public.search_articles('science', 'en', 20, 0);
```

أثناء الاختبار لا تستخدم `set enable_seqscan = off` في الإنتاج؛ ورد هذا الخيار في توثيق PGroonga لأغراض إظهار استخدام الفهرس على جداول صغيرة فقط [1].

## ملاحظات التخزين

يُنشئ migration bucket عامًا باسم `encyclopedia-media` للقراءة فقط من الزوار. لا توجد سياسات رفع عامة. عمليات الرفع والحذف مستقبلًا تتم من خادم موثوق أو Edge Function، ثم يُسجل المسار وmetadata في جدول `media`.

## المراجع

[1]: https://supabase.com/docs/guides/database/extensions/pgroonga "Supabase: PGroonga: Multilingual Full Text Search"
