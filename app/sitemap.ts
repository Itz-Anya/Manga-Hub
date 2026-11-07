import type { MetadataRoute } from "next";

function siteUrl(): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL;
  if (!env) return "";
  return env.startsWith("http") ? env.replace(/\/$/, "") : `https://${env}`;
}

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const now = new Date();
  const routes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/library`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
  ];

  try {
    const res = await fetch(
      "https://api.mangadex.org/manga?limit=50&order[followedCount]=desc&hasAvailableChapters=true&availableTranslatedLanguage[]=en&contentRating[]=safe&contentRating[]=suggestive",
      { next: { revalidate: 3600 } },
    );
    if (res.ok) {
      const json = (await res.json()) as { data?: Array<{ id: string }> };
      for (const m of json.data ?? []) {
        routes.push({
          url: `${base}/manga/${m.id}`,
          lastModified: now,
          changeFrequency: "weekly",
          priority: 0.7,
        });
      }
    }
  } catch {}

  return routes;
}