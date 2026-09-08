import type { MetadataRoute } from "next";

function siteUrl(): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL;
  if (!env) return "";
  return env.startsWith("http") ? env.replace(/\/$/, "") : `https://${env}`;
}

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: base ? `${base}/sitemap.xml` : undefined,
  };
}