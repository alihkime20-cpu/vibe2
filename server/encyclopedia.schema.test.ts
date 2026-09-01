import { describe, expect, it } from "vitest";
import { categories, encyclopediaEntries } from "../drizzle/schema";

describe("encyclopedia schema", () => {
  it("defines multilingual category and entry tables", () => {
    expect(categories).toBeDefined();
    expect(encyclopediaEntries).toBeDefined();
    expect(encyclopediaEntries.titleAr).toBeDefined();
    expect(encyclopediaEntries.titleEn).toBeDefined();
    expect(encyclopediaEntries.slug).toBeDefined();
    expect(encyclopediaEntries.status).toBeDefined();
  });
});
