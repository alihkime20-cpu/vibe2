# تقرير المرحلة الثانية — World Encyclopedia

## الملخص التنفيذي

تم تحويل المشروع من شاشة تحقق تقنية إلى أساس موسوعة عامة ثنائية اللغة مع طبقة تحرير خادمية منفصلة. أصبحت الواجهة تدعم المسارات `/ar/...` و`/en/...` للصفحة الرئيسية والبحث والمقال والتصنيف والوسم والصفحات التعريفية والسياسات، مع تصميم متجاوب وواجهة RTL/LTR. كما أضيف Express Editorial API يستخدم Supabase service role على الخادم فقط، ويحمي عمليات الكتابة برمز `EDITORIAL_ADMIN_TOKEN`، ويدعم الإنشاء idempotent، التعديل، حفظ `article_revisions`، تغيير حالة النشر، ربط المصادر، رفع الوسائط، وإنشاء التصنيفات والوسوم.

لم تُنشأ مقالات وهمية أو آلاف الصفحات، ولم تُستخدم بيانات منسوخة أو ادعاءات شراكة. بقي المحتوى المنشور فارغًا كما كان، وأضيفت فقط migration للفهارس اللازمة للصفحات العامة. لوحة التحرير على `/admin` منفصلة عن التنقل العام، وتدعم اختيار العربية أو الإنجليزية وتعرض حالات المسودة والمراجعة والنشر والأرشفة.

## ما تم تطبيقه

| المجال | التنفيذ |
| --- | --- |
| الواجهة العامة | Home، Search، Article، Category، Tag، About، Contact، Privacy، Terms، Editorial Policy، Sources، Corrections، Copyright، و404 |
| اللغات | مسارات عربية وإنجليزية، تبديل لغة، اتجاه RTL/LTR، وربط الترجمة المقابلة للمقال عند توفرها |
| المحتوى | جلب المنشور فقط من Supabase، عرض الملخص، تاريخ التحديث، التصنيفات، الوسوم، الوسائط، المصادر والمقالات ذات الصلة |
| البحث | استخدام دالة `search_articles` الحالية مع pagination وواجهة نتائج مرتبة حسب الصلة |
| SEO | canonical، hreflang، Open Graph، Twitter metadata، وSchema.org Article ديناميكيًا عبر `app/src/lib/seo.ts` |
| التحرير | شاشة `/admin` مخفية عن nav العام مع token داخلي وفلترة حسب اللغة والحالة |
| API | `GET /api/health`، `GET /api/public-config`، مسارات المقالات والترجمات، revisions، status، sources، media، categories، tags |
| الأمان | لا يُرسل service-role إلى المتصفح، لا توجد كتابة عامة، مسارات الإدارة محمية، و`/admin` و`/api/` مستبعدان من robots |
| الوسائط | رفع multipart إلى bucket `encyclopedia-media` مع alt text وcaption وprimary media وmetadata في جدول `media` |
| قابلية النقل | تشغيل مستقل عبر Vite وExpress وSupabase PostgreSQL، دون اعتماد runtime خاص بـ Manus |

## ملفات التنفيذ الرئيسية

- `app/src/App.tsx`: المسارات والواجهة العامة ولوحة التحرير.
- `app/src/styles.css`: الهوية البصرية المتجاوبة ودعم RTL/LTR.
- `app/src/lib/content.ts`: استعلامات Supabase typed للصفحات العامة والبحث.
- `app/src/lib/editorial.ts`: عميل Editorial API في المتصفح دون أسرار.
- `app/src/lib/seo.ts`: أدوات meta وcanonical وhreflang وSchema.org.
- `server/index.ts`: API التحرير الخادمي وعمليات الكتابة والرفع.
- `server/supabase.ts`: عميل service-role الخادمي وإعدادات الحماية.
- `database/migrations/20260903000000_phase2_listing_indexes.sql`: فهارس مسارات المرحلة الثانية.

## التشغيل

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

وفي طرفية ثانية لتشغيل API التحرير:

```bash
pnpm dev:api
```

تحتاج الواجهة العامة إلى `VITE_SUPABASE_URL` و`VITE_SUPABASE_ANON_KEY`. يحتاج الخادم إلى `SUPABASE_URL` و`SUPABASE_SERVICE_ROLE_KEY` و`EDITORIAL_ADMIN_TOKEN`. لا تضع المفتاح الخادمي في `.env.local` الذي يُعرض على Vite أو في أي ملف يُرفع إلى Git.

## التحقق

| الفحص | النتيجة |
| --- | --- |
| `pnpm test` | ناجح: 3 اختبارات |
| `pnpm check` | ناجح: TypeScript بلا أخطاء |
| `pnpm build` | ناجح: Vite production build |
| Vite smoke test | نجحت `/ar/` و`/en/` و`/admin` في إعادة نقطة الدخول |
| API smoke test | `GET /api/health` أعاد `ok: true`، والمسار المحمي أعاد `503` عند غياب إعداد الخادم بدل فتح الكتابة |
| Supabase | migration المرحلة الثانية مطبقة في المشروع المرتبط، مع بقاء RLS وسياسات القراءة العامة السابقة |

## حدود المرحلة

لوحة التحرير الحالية أداة تشغيلية أولية وليست نظام صلاحيات متعدد المستخدمين. الحماية الحالية تعتمد على `EDITORIAL_ADMIN_TOKEN` في الخادم؛ قبل فتحها لفريق متعدد الأعضاء يجب إضافة هوية محررين، تدوير رموز، تدقيق محاولات الدخول، وصلاحيات أدوار أكثر دقة. كما أن المحتوى العربي والإنجليزي لم يُدخل بعد، وsitemap الحالي يضم الصفحات الثابتة فقط ويستخدم أصل نطاق محايدًا يجب استبداله بالنطاق verified قبل الإطلاق. لا توجد إعلانات أو تحليلات أو Google verification values مضافة في هذه المرحلة.

## commit

تم رفع التنفيذ إلى الفرع `manus-initial-vibe` في commit:

`3cd312c Build public encyclopedia and editorial workspace`
