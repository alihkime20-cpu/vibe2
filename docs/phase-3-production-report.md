# تقرير المرحلة الثالثة — Production Readiness لـ Hostinger

## A — حالة Production

**READY WITH NOTES**.

الكود أصبح قابلًا للتشغيل على Hostinger كـNode.js Web App واحد يخدم واجهة React/Vite المبنية وخادم Express وEditorial API تحت نفس الدومين. بقيت ملاحظات تشغيلية لا يمكن تنفيذها من داخل المستودع: تعيين النطاق الحقيقي في `SITE_URL`، إدخال متغيرات البيئة السرية في Hostinger، ربط GitHub من hPanel، تفعيل SSL، وتنفيذ أول deployment فعلي. كما أن المحتوى الإنتاجي ما زال فارغًا عمدًا، ولم تبدأ مرحلة إدخال المقالات.

## B — ما تم فحصه

تم فحص المعمارية الفعلية، لا التقرير فقط. التطبيق الحالي React/Vite في `app/`، وخادم Express/TypeScript في `server/index.ts`، ونقطة دخول الخادم هي الملف نفسه عبر `tsx`. ينتج Vite مجلد `dist/` في جذر المشروع، ثم يخدمه Express في وضع production. أضيف fallback يعيد `dist/index.html` لكل GET لا يبدأ بـ`/api/`، ولذلك تعمل إعادة تحميل `/ar/...` و`/en/...` و`/admin`.

تم فحص scripts وlockfile وNode/pnpm، وجرى تشغيل تثبيت frozen، TypeScript، Vitest، Vite build، خادم Production محلي، مسارات SPA، health endpoint، endpoint التحرير المحمي، فحص bundle، ملفات البيئة، Git history، وسجل Supabase والمستشارين الأمني والأدائي قراءةً فقط.

## C — ما تم إصلاحه

أضيف `start` production command واضح: `pnpm start`. أصبح Express يخدم `dist` ويدير fallback في نفس العملية، مع `PORT` قابل للتهيئة. أضيف CORS مقيد اختياريًا ولا يُفتح cross-origin عند ترك `CORS_ORIGINS` فارغًا، وأصبحت مقارنة `EDITORIAL_ADMIN_TOKEN` timing-safe. حُدد رفع الوسائط إلى 8 MB مع السماح بـJPEG وPNG وWebP فقط.

أزيل default localhost من عميل Editorial API، وأصبح الإنتاج يستخدم `/api` نسبيًا. أضيف Vite proxy للتطوير المحلي فقط. أضيفت متطلبات Node و`.nvmrc`، ونُقل `tsx` إلى dependencies لأنه مطلوب في Start production. أضيف توليد `sitemap.xml` و`robots.txt` أثناء build من `SITE_URL` حتى لا يبقى نطاق placeholder في ملفات الإنتاج.

أُنشئ `docs/production-deployment.md` بتعليمات Hostinger/GitHub/ZIP/domain/SSL/fallback/Supabase/troubleshooting، دون أي secret. لم تُضف migration جديدة ولم تُحذف أي migration ولم تتغير قاعدة Supabase.

## D — الملفات التي تغيرت

| الملف                                             | سبب التغيير                                                              |
| ------------------------------------------------- | ------------------------------------------------------------------------ |
| `server/index.ts`                                 | static serving، SPA fallback، CORS، timing-safe token، upload validation |
| `app/src/lib/editorial.ts`                        | إزالة default localhost من bundle                                        |
| `app/vite.config.ts`                              | proxy تطويري لمسارات `/api`                                              |
| `package.json` و`pnpm-lock.yaml`                  | `start`، engines، نقل tsx، build sitemap                                 |
| `.env.example` و`.nvmrc`                          | توثيق runtime وenvironment variables                                     |
| `app/public/robots.txt` و`app/public/sitemap.xml` | إزالة النطاق التجريبي؛ build يولد الملفات الفعلية                        |
| `scripts/generate-sitemap.mjs`                    | توليد sitemap/robots من `SITE_URL`                                       |
| `scripts/production-smoke.sh`                     | اختبار خادم production والمسارات والحماية                                |
| `docs/production-deployment.md`                   | دليل نشر Hostinger الحقيقي                                               |
| `docs/phase-3-production-report.md`               | هذا التقرير                                                              |

## E — أوامر Production

```text
Install: pnpm install --frozen-lockfile
Build: pnpm build
Start: pnpm start
Output: dist
```

يتوقع Start وجود `SUPABASE_URL` و`SUPABASE_SERVICE_ROLE_KEY` و`EDITORIAL_ADMIN_TOKEN` في بيئة الخادم. إذا لم توجد هذه القيم، يبقى health endpoint متاحًا، لكن Editorial API يعيد `503` بدل فتح أي كتابة.

## F — Environment Variables

| Variable                    | Browser/Server      | Required                                   |
| --------------------------- | ------------------- | ------------------------------------------ |
| `VITE_SUPABASE_URL`         | Browser-safe        | نعم                                        |
| `VITE_SUPABASE_ANON_KEY`    | Browser-safe        | نعم                                        |
| `VITE_SITE_ORIGIN`          | Browser-safe        | لا؛ فارغ ليستخدم المتصفح أصل النطاق الحالي |
| `VITE_EDITORIAL_API_ORIGIN` | Browser-safe        | لا؛ فارغ في same-origin                    |
| `SITE_URL`                  | Build configuration | موصى به؛ يستخدم لتوليد sitemap وrobots     |
| `SUPABASE_URL`              | Server-only         | نعم لـEditorial API                        |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only         | نعم لـEditorial API؛ لا يصل للbundle       |
| `EDITORIAL_ADMIN_TOKEN`     | Server-only         | نعم لحماية التحرير؛ لا يصل للbundle        |
| `CORS_ORIGINS`              | Server-only         | لا في same-origin                          |
| `PORT`                      | Server-only         | لا؛ Hostinger توفره عادةً                  |

لا توجد قيم سرية في `.env.example` أو الملفات المتتبعة. فحص bundle لم يجد `localhost` أو مفاتيح service-role أو admin token. فحص Git history لم يجد assignments حقيقية لهذه الأسرار؛ الموجود مجرد placeholders معلنة في `.env.example`.

## G — Hostinger

الإعداد المطلوب هو **Node.js Web App** من جذر المستودع، وليس Static Web App منفصلًا. استخدم Node `22.13.0`، أوامر Install/Build/Start من القسم E، وOutput directory `dist`. Root directory هو المجلد الذي يحتوي `package.json`، وEntry file عند طلبه هو `server/index.ts`. اربط الفرع `manus-initial-vibe` من GitHub، ثم أضف متغيرات البيئة من القسم F.

لا يحتاج نفس الدومين إلى CORS أو reverse proxy إضافي؛ Express يخدم الواجهة و`/api` معًا. لا تضف Rewrite خارجيًا ما دام Hostinger يشغل Node.js Web App، لأن fallback موجود في `server/index.ts`. إذا اختير Static منفصل بدلًا من Node Web App، فسيحتاج API إلى خدمة Node منفصلة وCORS وإعادة توجيه مستقلة، ولذلك ليس الخيار الموصى به.

تدعم Hostinger نشر Node.js Web Apps عبر GitHub أو ZIP، وتطلب تحديد Output directory وEntry file عند اختيار Other [1].

## H — Supabase

**قاعدة البيانات لم تُنقل من Supabase.** بقي مشروع Supabase `yydufmbexnlblnevdmlw` هو مصدر البيانات الوحيد. سجل migrations المنشور ما زال يحتوي migrations المرحلة الأولى والثانية فقط، ولا توجد migration للمرحلة الثالثة. أظهر فحص الجداول أن الجداول العامة المنشورة مفعّل عليها RLS، وأن عدد صفوف المحتوى ما زال صفرًا بينما اللغات صفان.

## I — Security

| البند           | النتيجة                                                                                   |
| --------------- | ----------------------------------------------------------------------------------------- |
| Service role    | يبقى في `server/supabase.ts` عبر environment فقط، ولا يمر إلى Vite أو bundle              |
| Editorial token | مطلوب لكل `/api/editorial/*`، ومقارنته timing-safe؛ الغياب يعيد `503`، والخطأ يعيد `401`  |
| CORS            | مغلق افتراضيًا في same-origin؛ يفتح فقط للأصول الموجودة في `CORS_ORIGINS`                 |
| RLS             | مفعّل على جداول public بحسب فحص Supabase؛ public API يعتمد على القراءة المنشورة من المصدر |
| Secrets         | لا توجد أسرار حقيقية في الملفات أو bundle أو history المفحوص                              |
| Uploads         | 8 MB كحد أقصى، JPEG/PNG/WebP فقط، وتخزين Supabase Storage لا filesystem دائم              |

أعاد Supabase Security Advisor قائمة فارغة (`lints: []`). أما Performance Advisor فأظهر INFO عن فهارس غير مستخدمة، وهو متوقع قبل وجود مقالات أو حمل إنتاجي، ولا يبرر حذفها في هذه المراجعة.

## J — Tests

| Test                             | النتيجة                                                                              |
| -------------------------------- | ------------------------------------------------------------------------------------ |
| `pnpm install --frozen-lockfile` | ناجح                                                                                 |
| `pnpm test`                      | ناجح، 3 اختبارات                                                                     |
| `pnpm check`                     | ناجح، TypeScript بلا أخطاء                                                           |
| `pnpm build`                     | ناجح، `dist/index.html` وassets وrobots وsitemap                                     |
| Bundle scan                      | ناجح؛ لا localhost ولا secrets                                                       |
| Production smoke                 | health `200`، الجذر ومسارات `/ar/` و`/en/` والمقالات والتصنيفات و`/admin` تعيد `200` |
| Editorial protection             | بدون إعدادات سرية يعيد `503` ولا يفتح الكتابة                                        |
| Supabase read-only audit         | ACTIVE_HEALTHY، migrations دون تغيير، RLS مفعّل، Security Advisor بلا lints          |

## K — Git

تم رفع هذا التدقيق إلى الفرع الحالي دون تغييره:

```text
Branch: manus-initial-vibe
Commit SHA: 89900b9
Commit message: Prepare Hostinger production deployment
```

## L — القرار النهائي

هل أصبح المشروع جاهزًا الآن لنشره على Hostinger دون تعديل إضافي؟ **الكود جاهز للنشر، لكن لا يمكن اعتبار النشر مكتملًا دون إعداد Hostinger الفعلي.** المطلوب قبل فتح الموقع هو اختيار Node.js Web App، ربط الفرع، إدخال متغيرات البيئة، تعيين `SITE_URL` بالنطاق الحقيقي، تفعيل SSL، تنفيذ deploy، ثم تشغيل اختبارات القسم J من خارج الخادم.

لا توجد حاجة إلى تعديل قاعدة البيانات أو إنشاء قاعدة جديدة على Hostinger. لا تبدأ مرحلة المحتوى أو التوليد الجماعي ضمن هذا التقرير.

## References

[1]: https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/ "Hostinger: How to add a Node.js web app in Hostinger"
