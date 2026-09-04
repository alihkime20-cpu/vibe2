# Production Deployment على Hostinger

## 1. القرار المعماري

القرار المناسب لهذا المشروع هو **B: تشغيل Express كخادم Production واحد يخدم API وملفات `dist` معًا**. السبب أن المشروع يحتوي على واجهة React/Vite ثابتة وEditorial API خادمي، وأن تشغيلهما تحت نفس الأصل يحقق العناوين المطلوبة مثل `domain.com/ar/...` و`domain.com/en/...` ويجعل طلبات `/api/...` نسبية، فلا يحتاج الإنتاج إلى CORS بين أصلين.

الخادم يخدم `dist` بعد البناء، ويحوّل أي طلب `GET` غير بادئ بـ`/api/` إلى `dist/index.html`. لذلك تعمل إعادة التحميل المباشر لمسارات `/ar/...` و`/en/...` و`/admin` بدل إرجاع 404 من الخادم. في التطوير فقط يمرر Vite طلبات `/api` إلى `127.0.0.1:8787` عبر proxy.

> **قاعدة البيانات لم تُنقل من Supabase.** تبقى Supabase مصدر البيانات الوحيد، ولا تنشئ Hostinger قاعدة بيانات بديلة.

## 2. Requirements

يحتاج النشر إلى خطة Hostinger تدعم Node.js Web Apps، أو VPS مع إعداد Node.js يدوي. توضح وثائق Hostinger الرسمية أن Node.js Web Apps متاحة على خطط Business وCloud، وأن React وVite وExpress من التقنيات المدعومة [1]. يلزم ربط GitHub أو رفع ZIP، مع إبقاء متغيرات البيئة السرية داخل إعدادات Hostinger لا داخل Git.

إصدارات المشروع مثبتة كما يلي:

| المتطلب       | القيمة                                                    |
| ------------- | --------------------------------------------------------- |
| Node.js       | `22.13.0`، وأي إصدار `22.x` متوافق مع قيد `>=22.13.0 <23` |
| pnpm          | `10.4.1` من `packageManager`                              |
| Frontend      | React + Vite                                              |
| Backend       | Express + TypeScript عبر `tsx`                            |
| Database      | Supabase PostgreSQL، دون نقل أو إنشاء بديل                |
| Runtime entry | `server/index.ts` عبر `pnpm start`                        |

## 3. Install وBuild وStart

الأوامر الرسمية للمشروع هي:

```bash
Install: pnpm install --frozen-lockfile
Build: pnpm build
Start: pnpm start
Output: dist
```

يبني `pnpm build` الواجهة إلى مجلد `dist` في جذر المشروع. يشغّل `pnpm start` خادم Express، ويستخدم `PORT` الذي توفره Hostinger أو القيمة الافتراضية `8787`. لا يحتاج Start إلى خادم Vite preview؛ خادم Express هو الذي يقدم ملفات `dist` وواجهة API معًا.

للتطوير المحلي:

```bash
pnpm install --frozen-lockfile
pnpm dev
pnpm dev:api
```

## 4. Environment Variables

لا توجد قيم حقيقية في Git. صنّفت المتغيرات المستخدمة فعليًا كما يلي:

| Variable                    | Browser/Server             | Required                                                       |
| --------------------------- | -------------------------- | -------------------------------------------------------------- |
| `VITE_SUPABASE_URL`         | Browser-safe               | نعم للقراءة العامة من الواجهة                                  |
| `VITE_SUPABASE_ANON_KEY`    | Browser-safe               | نعم للقراءة العامة مع RLS                                      |
| `VITE_SITE_ORIGIN`          | Browser-safe               | لا؛ اتركه فارغًا ليستخدم المتصفح أصل النطاق الحالي             |
| `VITE_EDITORIAL_API_ORIGIN` | Browser-safe               | لا؛ اتركه فارغًا في same-origin production                     |
| `SITE_URL`                  | Build/server configuration | موصى به في production لبناء sitemap وrobots بالنطاق الحقيقي    |
| `SUPABASE_URL`              | Server-only                | نعم لخادم Editorial API                                        |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only                | نعم لخادم Editorial API، ممنوع في المتصفح                      |
| `EDITORIAL_ADMIN_TOKEN`     | Server-only                | نعم لحماية `/api/editorial/*`                                  |
| `CORS_ORIGINS`              | Server-only                | لا في same-origin؛ قائمة origins مفصولة بفواصل عند فصل الواجهة |
| `PORT`                      | Server-only                | لا؛ Hostinger توفره عادةً، والافتراضي `8787`                   |

استخدم `.env.example` كقالب أسماء فقط. لا تضع `SUPABASE_SERVICE_ROLE_KEY` أو `EDITORIAL_ADMIN_TOKEN` أو كلمة مرور قاعدة بيانات داخل المستودع أو داخل Vite.

## 5. إعداد Hostinger المقترح

في hPanel اختر **Add Website → Deploy Web App → Import Git Repository**، ثم اختر المستودع `alihkime20-cpu/vibe2` والفرع `manus-initial-vibe`. توضح وثائق Hostinger أن مسار GitHub يمكنه إعادة البناء عند الدفع إلى المستودع [1]. إذا استخدمت الإعداد اليدوي أو صنّف Hostinger التطبيق كـOther، عيّن القيم التالية:

| إعداد Hostinger       | القيمة                                                                 |
| --------------------- | ---------------------------------------------------------------------- |
| نوع Web App           | Node.js Web App، أو Other إذا لم يكتشف Vite/Express تلقائيًا           |
| Node version          | `22.13.0` أو Node `22.x`                                               |
| Root directory        | جذر المستودع الذي يحتوي `package.json`                                 |
| Install command       | `pnpm install --frozen-lockfile`                                       |
| Build command         | `pnpm build`                                                           |
| Start command         | `pnpm start`                                                           |
| Output directory      | `dist`                                                                 |
| Entry file عند طلبه   | `server/index.ts`                                                      |
| Port                  | استخدم `PORT` الذي توفره Hostinger؛ لا تثبّت port خارجيًا في إعداد DNS |
| Environment variables | أضف متغيرات الجدول السابق من لوحة Hostinger                            |

لا تنشر `dist` وحده في هذا الخيار، لأن Editorial API يحتاج ملفات الخادم واعتمادياته. نشر `dist` كـStatic منفصل ممكن فقط إذا أُدير API في خدمة Node مستقلة مع CORS مضبوط، لكنه ليس الخيار الموصى به لهذا المشروع.

## 6. Domain وSSL

اربط النطاق بتطبيق Node.js داخل hPanel، ثم فعّل SSL وشغّل التحقق عبر HTTPS قبل نشر المحتوى. بعد اعتماد النطاق الحقيقي، عيّن `SITE_URL=https://domain.com` أثناء build؛ سيولد build `robots.txt` و`sitemap.xml` بالنطاق الحقيقي، ثم حدّث `canonical_url` من لوحة التحرير عند إدخال المقالات. لا تُعدّل `VITE_EDITORIAL_API_ORIGIN` عند same-origin؛ اتركها فارغة حتى تستخدم الواجهة `/api` على النطاق نفسه.

## 7. Routing وFallback

يقدم Express `dist/index.html` لأي طلب GET لا يبدأ بـ`/api/`. هذا يغطي:

```text
/
/ar/
/en/
/ar/article/<slug>
/en/article/<slug>
/ar/category/<slug>
/en/tag/<slug>
/admin
```

لا تضف Rewrite خارجيًا إلى `index.html` في إعداد Hostinger ما دام التطبيق يعمل كـNode.js Web App؛ fallback موجود داخل `server/index.ts`. أما إذا اختير نشر الواجهة كـStatic منفصلة، فيلزم إعداد rewrite في الخادم الثابت يعيد مسارات الواجهة إلى `index.html`، مع إبقاء `/api` على أصل الخادم الخادمي.

## 8. Supabase والوسائط

يستخدم المتصفح `VITE_SUPABASE_URL` و`VITE_SUPABASE_ANON_KEY` للقراءة العامة، بينما يستخدم Express `SUPABASE_URL` و`SUPABASE_SERVICE_ROLE_KEY` للعمليات التحريرية. RLS في Supabase يبقى خط الدفاع الأساسي، والقراءة العامة تعتمد على صفوف المقالات المنشورة لا على client-side filtering فقط.

ترفع الوسائط إلى bucket `encyclopedia-media` في Supabase Storage، وتُحفظ metadata في جدول `media`. لا يعتمد المشروع على ملفات دائمة داخل Hostinger. يحدد الخادم حجم الرفع إلى 8 MB ويسمح بصور JPEG وPNG وWebP فقط. لا تُنشئ bucket أو migration جديدة في هذه المراجعة.

## 9. GitHub deployment

استخدم الفرع `manus-initial-vibe` كما هو. في Hostinger اربط المستودع، حدّد أوامر Install/Build/Start، أضف متغيرات البيئة، ثم نفّذ Deploy. بعد كل commit معتمد، راجع deployment log وجرّب `/api/health` قبل فتح الموقع للمستخدمين.

## 10. ZIP deployment

إذا تعذر ربط GitHub، أنشئ ZIP من جذر المشروع يحتوي `package.json` و`pnpm-lock.yaml` و`app/` و`server/` و`database/` و`public` إن وجد، ولا يحتوي `.env` أو `node_modules` أو `dist` الإلزامي. ارفع ZIP عبر Deploy Web App، ثم استخدم نفس أوامر Install/Build/Start وOutput `dist`. أضف الأسرار يدويًا في Environment Variables بعد الرفع.

## 11. Production verification

بعد النشر نفّذ من جهاز خارجي:

```bash
curl -fsS https://domain.com/api/health
curl -I https://domain.com/ar/
curl -I https://domain.com/en/
curl -I https://domain.com/ar/article/example
curl -I https://domain.com/admin
curl -i https://domain.com/api/editorial/articles
```

المتوقع أن يعيد health `ok: true`، وأن تعيد مسارات الواجهة `200` مع نقطة الدخول، وأن يعيد Editorial API خطأ حماية إذا لم يُرسل token صحيح. لا تختبر الكتابة في الإنتاج دون token معتمد ومقال محدد للمراجعة.

## 12. Troubleshooting

إذا ظهر `503` من Editorial API، تحقق من وجود `SUPABASE_URL` و`SUPABASE_SERVICE_ROLE_KEY` و`EDITORIAL_ADMIN_TOKEN` في بيئة Node.js، ثم أعد التشغيل. إذا ظهر 404 عند تحديث `/ar/...`، تحقق من أن التطبيق يعمل بـ`pnpm start` وأن Hostinger يستخدم Node.js Web App، لا استضافة ملفات ثابتة دون fallback. إذا فشل build، تحقق من Node `22.x` و`pnpm 10.4.1` ثم نفّذ `pnpm install --frozen-lockfile` من جذر المشروع. إذا فشلت قراءة البيانات، تحقق من `VITE_SUPABASE_URL` و`VITE_SUPABASE_ANON_KEY` وRLS في Supabase، دون نقل قاعدة البيانات إلى Hostinger.

## 13. Backup reminder

احتفظ بنسخ PostgreSQL الاحتياطية وملفات migrations خارج Hostinger، واختبر الاستعادة دوريًا. لا تعتبر deployment ZIP أو مجلد `dist` نسخة احتياطية لقاعدة البيانات أو للوسائط.

## References

[1]: https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/ "Hostinger: How to add a Node.js web app in Hostinger"
