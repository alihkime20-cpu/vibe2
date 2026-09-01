import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migrationsDir = join(process.cwd(), "database", "migrations");
const migrationNames = readdirSync(migrationsDir)
  .filter((name) => name.endsWith(".sql"))
  .sort();

function migration(name: string) {
  return readFileSync(join(migrationsDir, name), "utf8");
}

describe("encyclopedia migration contract", () => {
  it("keeps migrations ordered and complete", () => {
    expect(migrationNames).toEqual([
      "20260901000000_core.sql",
      "20260901001000_content.sql",
      "20260901002000_search_security.sql",
      "20260901003000_security_hardening.sql",
      "20260901004000_foreign_key_indexes.sql",
    ]);
  });

  it("models one logical topic with separate language translations", () => {
    expect(migration("20260901000000_core.sql")).toContain(
      "create table public.topics",
    );
    expect(migration("20260901001000_content.sql")).toContain(
      "unique (article_id, language_code)",
    );
    expect(migration("20260901001000_content.sql")).toContain(
      "unique (language_code, slug)",
    );
  });

  it("contains Arabic-capable search and public-only policies", () => {
    const coreMigration = migration("20260901000000_core.sql");
    const searchMigration = migration("20260901002000_search_security.sql");
    expect(coreMigration).toContain("create extension if not exists pgroonga");
    expect(searchMigration).toContain("using pgroonga");
    expect(searchMigration).toContain("public.search_articles");
    expect(searchMigration).toContain("publication_status = 'published'");
    expect(searchMigration).toContain(
      "alter table public.article_revisions enable row level security",
    );
    expect(migration("20260901003000_security_hardening.sql")).toContain(
      "using (false)",
    );
  });
});
