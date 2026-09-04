import { mkdir, writeFile } from "node:fs/promises";

const siteUrl = (process.env.SITE_URL || "").replace(/\/+$/, "");
const paths = [
  "/",
  "/ar/",
  "/en/",
  "/ar/about",
  "/en/about",
  "/ar/contact",
  "/en/contact",
  "/ar/privacy",
  "/en/privacy",
  "/ar/terms",
  "/en/terms",
  "/ar/editorial-policy",
  "/en/editorial-policy",
  "/ar/sources",
  "/en/sources",
  "/ar/corrections",
  "/en/corrections",
  "/ar/copyright",
  "/en/copyright",
];
const urls = siteUrl
  ? paths.map((path) => `  <url><loc>${siteUrl}${path}</loc></url>`).join("\n")
  : "  <!-- Set SITE_URL during production build to emit absolute sitemap URLs. -->";
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/
${siteUrl ? `Sitemap: ${siteUrl}/sitemap.xml\n` : "# Set SITE_URL during production build to emit the absolute sitemap URL.\n"}`;
await mkdir("dist", { recursive: true });
await writeFile("dist/sitemap.xml", sitemap, "utf8");
await writeFile("dist/robots.txt", robots, "utf8");
