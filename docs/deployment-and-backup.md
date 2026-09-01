# النشر والنسخ الاحتياطي

## نشر الواجهة

واجهة React/Vite ناتجها static assets ويمكن نشرها على Hostinger أو أي استضافة تدعم Node/Vite أو خدمة ملفات ثابتة. أنشئ build ثم ارفع مجلد `dist`:

```bash
pnpm install --frozen-lockfile
pnpm build
```

يجب تعريف `VITE_SUPABASE_URL` و`VITE_SUPABASE_ANON_KEY` أثناء build. في الاستضافة الثابتة يجب إعداد fallback إلى `index.html` إذا أضيفت مسارات client-side لاحقًا.

## نشر قاعدة البيانات

يُطبّق المخطط عبر migrations المحفوظة في GitHub، وليس عبر تغييرات يدوية غير موثقة. التسلسل الحالي هو:

```text
database/migrations/20260901000000_core.sql
database/migrations/20260901001000_content.sql
database/migrations/20260901002000_search_security.sql
```

إذا كان الهدف استضافة PostgreSQL خارج Supabase، يجب إنشاء الامتدادات المتاحة هناك أو تعطيل PGroonga واستبداله بفهارس PostgreSQL مناسبة بعد اختبار اللغة المستهدفة. لا ينبغي افتراض تكافؤ البحث العربي بين مزودين مختلفين.

## النسخ الاحتياطي

يُفضّل الاحتفاظ بنسخة دورية من البيانات والمخطط خارج لوحة التحكم. مثال باستخدام اتصال PostgreSQL آمن:

```bash
pg_dump "$DATABASE_URL" \
  --format=custom \
  --no-owner \
  --no-privileges \
  --file=backup/world-encyclopedia-$(date -u +%Y%m%dT%H%M%SZ).dump
```

ويُحفظ ملف dump في مخزن خاص ومشفّر، لا في المستودع العام أو داخل `dist`. يمكن أخذ نسخة schema-only للمراجعة:

```bash
pg_dump "$DATABASE_URL" --schema-only --no-owner --no-privileges > backup/schema.sql
```

## الاستعادة

للاستعادة إلى قاعدة فارغة:

```bash
createdb "$RESTORE_DATABASE_URL"
pg_restore "$BACKUP_FILE" \
  --dbname="$RESTORE_DATABASE_URL" \
  --no-owner \
  --no-privileges \
  --exit-on-error
```

تُختبر الاستعادة في قاعدة منفصلة قبل استخدامها كإنتاج. ملفات Supabase Storage ليست داخل dump العادي؛ يجب نسخ bucket `encyclopedia-media` وmetadata الخاصة به وفق سياسة التخزين المستخدمة.

## الأسرار

| المتغير                     | مكان الاستخدام            | هل يصل إلى المتصفح؟ |
| --------------------------- | ------------------------- | ------------------- |
| `VITE_SUPABASE_URL`         | واجهة Vite                | نعم                 |
| `VITE_SUPABASE_ANON_KEY`    | واجهة Vite                | نعم، مع RLS         |
| `SUPABASE_URL`              | خادم/وظيفة مستقبلية       | لا                  |
| `SUPABASE_SERVICE_ROLE_KEY` | خادم/وظيفة مستقبلية فقط   | ممنوع               |
| `DATABASE_URL`              | أدوات PostgreSQL الموثوقة | ممنوع               |

لا تضع أي قيمة سرية في GitHub أو سجلات build. استخدم secrets الخاصة بالاستضافة، ودوّر المفاتيح إذا تسربت.
