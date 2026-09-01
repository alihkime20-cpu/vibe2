# تقرير المرحلة الأولى — World Encyclopedia

## الملخص التنفيذي

تم مسح محتوى المستودع السابق وإعادة بنائه من الصفر وفق الملف المرفق. نُفذت المرحلة الأولى فقط: تصميم وتنفيذ أساس PostgreSQL/Supabase، دعم العربية والإنجليزية، البحث متعدد اللغات، العلاقات، الإصدارات، RLS، طبقة اتصال الواجهة، والتوثيق القابل للنقل. لم يتم إنشاء آلاف المقالات أو بيانات وهمية كبيرة، ولم تُبنَ واجهة موسوعية نهائية.

> النتيجة الحالية هي أساس schema-first قابل للاستخدام خارج Manus. قاعدة البيانات هي مصدر الحقيقة، وكل تغييرات DDL محفوظة في migrations SQL داخل GitHub.

## المخطط المنطقي

يوجد كيان منطقي واحد في `topics` لكل موضوع، ويرتبط بصف واحد في `articles`. كل لغة تُخزن في `languages`، وكل نسخة لغوية للمقال في `article_translations` بقيد فريد `(article_id, language_code)`. بذلك لا يتكرر الموضوع العربي والإنجليزي، وتصبح إضافة لغة مستقبلية إضافة صفوف بدل إعادة تصميم الجداول.

```text
topics 1──1 articles 1──N article_translations N──1 languages
                         │
                         ├── article_revisions
                         ├── seo_metadata
                         ├── article_categories ── categories ── category_translations
                         ├── article_tags ── tags ── tag_translations
                         ├── article_sources ── sources
                         ├── article_relations ── articles
                         ├── article_authors ── authors
                         └── media ── Supabase Storage
```

## الجداول المنفذة

| المجموعة          | الجداول                                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------------------------- |
| الهوية واللغة     | `topics`, `articles`, `languages`                                                                       |
| الترجمة والتحرير  | `article_translations`, `article_revisions`, `authors`, `article_authors`, `seo_metadata`               |
| التصنيفات والوسوم | `categories`, `category_translations`, `article_categories`, `tags`, `tag_translations`, `article_tags` |
| العلاقات والمصادر | `article_relations`, `sources`, `article_sources`                                                       |
| الوسائط           | `media`                                                                                                 |

إجمالي جداول `public` المنفذة فعليًا هو **18 جدولًا**. جميعها تستخدم UUID، وحقول `created_at`/`updated_at` عند الحاجة، وقيود foreign key وcheck وunique مناسبة. التصنيفات هرمية عبر `categories.parent_id`، والعلاقات بين المقالات موجهة عبر `source_article_id` و`target_article_id` مع أنواع `related`, `similar`, `parent_topic`, `child_topic`, `references`, و`custom`.

## اللغات

أُدخلت اللغتان التاليتان فعليًا في `public.languages`:

| code | native name | direction | active |
| ---- | ----------- | --------- | ------ |
| `ar` | العربية     | `rtl`     | نعم    |
| `en` | English     | `ltr`     | نعم    |

المخطط يقبل لغات أخرى مستقبلًا مثل الفرنسية والإسبانية والتركية دون تغيير جوهري، لأن اللغة مرجع مستقل والمحتوى اللغوي صفوف مرتبطة بالكيان.

## البحث

فُعّل امتداد PGroonga داخل migration الأساسية، ثم أُنشئت فهارس `USING pgroonga` على `search_text` والعنوان والملخص والمحتوى. توضح وثائق Supabase أن PGroonga مناسب للبحث متعدد اللغات ويدعم نطاقًا أوسع من الشخصيات من البحث النصي المدمج في PostgreSQL [1].

يحتوي `article_translations.search_text` على نص موحد يُحدّث تلقائيًا عبر trigger من `title`, `summary`, `content`, و`keywords`. الدالة العامة:

```sql
public.search_articles(search_query, requested_language, page_size, page_offset)
```

تعيد الترجمات المنشورة فقط، وتصفّي حسب اللغة، وتحتسب `relevance` بأولوية العنوان ثم الملخص ثم الكلمات المفتاحية ثم المحتوى. يوجد حد أقصى قدره 100 صف للصفحة. البحث العربي لا يعتمد على إعداد `english` فقط؛ وهذا متسق مع كون البحث النصي الأصلي في PostgreSQL يعتمد على configurations وقواميس لغوية، بينما PGroonga يوفّر تغطية أوسع [1] [2].

## دورة حياة المحتوى

يدعم كل `article_translation` الحالات:

```text
draft → review → published → archived
```

كل ترجمة يمكن أن تملك عنوانًا وslug وملخصًا ومحتوى وكلمات مفتاحية وSEO status وتاريخ نشر مستقلًا. يمنع قيد قاعدة البيانات نشر ترجمة بلا `published_at`. يحتفظ `article_revisions` بلقطات الإصدار مع `version`, `change_note`, و`created_by`. سجل الإصدارات مفعّل عليه RLS وسياسة رفض صريحة للقراءة العامة، ولا توجد سياسات كتابة للزوار.

## الأمان والوصول العام

تم تفعيل RLS على الجداول الثمانية عشر. تسمح سياسات `anon` و`authenticated` بالقراءة فقط للمحتوى المنشور أو البيانات المرتبطة به، مثل التصنيفات والمصادر والوسائط المرتبطة بمقال منشور. لا توجد سياسات insert/update/delete عامة. تُترك عمليات الإدارة المستقبلية لخادم موثوق أو Edge Function باستخدام service role، مع منع تسريب المفتاح إلى المتصفح.

راجعت Supabase المشروع بعد DDL: فحص الأمان النهائي أعاد **صفر تنبيهات**. أما فحص الأداء فأبقى ملاحظات `INFO` عن فهارس غير مستخدمة؛ وهذا متوقع لأن قاعدة البيانات فارغة ولم تُنفذ عليها استعلامات إنتاج بعد، ولا يُنصح بحذف الفهارس المصممة للعلاقات قبل ظهور حمل حقيقي.

## ما نُفذ فعليًا في Supabase

| البند                    | النتيجة                                                  |
| ------------------------ | -------------------------------------------------------- |
| المشروع                  | `yydufmbexnlblnevdmlw` — `ali`                           |
| حالة القاعدة قبل التنفيذ | قاعدة `public` فارغة                                     |
| الجداول بعد التنفيذ      | 18 جدولًا في `public`                                    |
| اللغات                   | `ar` و`en` موجودتان ونشطتان                              |
| PGroonga                 | مفعّل عبر migration وفهارسه موجودة                       |
| RLS                      | مفعّل على الجداول الثمانية عشر                           |
| البحث                    | دالة `public.search_articles` وفهارسها موجودة            |
| التخزين                  | bucket `encyclopedia-media` العام للقراءة، دون رفع عام   |
| بيانات المقالات          | لا توجد بيانات جماعية؛ اختبار smoke تراجع عبر `ROLLBACK` |

## migrations المرفوعة والمطبقة

| ملف GitHub                               | اسم migration في Supabase                 | version الفعلي   |
| ---------------------------------------- | ----------------------------------------- | ---------------- |
| `20260901000000_core.sql`                | `core_entities_and_languages`             | `20260901033449` |
| `20260901001000_content.sql`             | `content_translations_taxonomy_and_media` | `20260901033500` |
| `20260901002000_search_security.sql`     | `multilingual_search_rls_and_storage`     | `20260901033530` |
| `20260901003000_security_hardening.sql`  | `security_hardening`                      | `20260901033938` |
| `20260901004000_foreign_key_indexes.sql` | `foreign_key_covering_indexes`            | `20260901034331` |

المigration الخامسة أضيفت بعد مراجعة Supabase لإضافة فهارس تغطية للمفاتيح الخارجية التي كشفها الفحص الأدائي. أضيفت كذلك migration التقوية الأمنية لتثبيت `search_path` للدوال ومعالجة ملاحظة غياب policy على سجل الإصدارات دون فتح الوصول إليه.

## ما تم رفعه إلى GitHub

أُعيد تنظيم المستودع في البنية التالية:

```text
app/
database/migrations/
database/types/
docs/
scripts/
tests/
```

يتضمن المستودع واجهة Vite/React خفيفة لاختبار اتصال `languages` واستدعاء RPC للبحث، ملف `.env.example`، الأنواع المولدة من Supabase، توثيق المعمارية والمخطط والإعداد والنشر والنسخ الاحتياطي، واختبارات بنيوية محلية. أُزيلت طبقة MySQL/Drizzle وطبقة Manus-specific القديمة من التنفيذ الجديد، بما فيها Forge storage وOAuth وtRPC runtime، حتى لا تمنع النقل الخارجي.

## الاختبارات المنفذة

| الاختبار                     | النتيجة                                                                                |
| ---------------------------- | -------------------------------------------------------------------------------------- |
| `pnpm test`                  | ناجح: 3 اختبارات                                                                       |
| `pnpm check`                 | ناجح                                                                                   |
| `pnpm build`                 | ناجح؛ Vite أنتج `dist`                                                                 |
| Prettier check               | ناجح                                                                                   |
| Vite runtime smoke           | ناجح؛ الصفحة استجابت على المنفذ 5173                                                   |
| Supabase transaction smoke   | ناجح؛ trigger البحث، البحث العربي، uniqueness، وقيد النشر اختُبرت ثم تراجع transaction |
| Supabase RLS advisor         | ناجح؛ لا lints أمنية                                                                   |
| Supabase performance advisor | لا أخطاء؛ فقط INFO لفهارس غير مستخدمة بسبب القاعدة الفارغة                             |

## ما تبقى قبل المرحلة الثانية

قبل بدء إنتاج المحتوى الجماعي يلزم بناء طبقة ingestion/editorial موثوقة، مع API خادمي للإنشاء والتعديل والحفظ إلى `article_revisions`، وتحديد دور المحرر وسياسات الكتابة، ثم بناء صفحات المقال والتصنيف والوسوم ومسارات `/ar/...` و`/en/...`. بعد ذلك تُضاف اختبارات API واختبارات RLS بصلاحيات الزائر والمحرر، ويُستكمل توليد sitemap وhreflang وSchema.org من المقالات المنشورة.

لن تبدأ هذه الخطوات أو توليد آلاف المقالات ضمن المرحلة الحالية، التزامًا بنطاق الملف المرفق.

## المراجع

[1]: https://supabase.com/docs/guides/database/extensions/pgroonga "Supabase: PGroonga: Multilingual Full Text Search"
[2]: https://supabase.com/docs/guides/database/full-text-search "Supabase: Full Text Search"
