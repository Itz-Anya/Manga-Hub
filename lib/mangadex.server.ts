import type { Manga, Chapter } from "./mangadex";

const API = "https://api.mangadex.org";

async function serverGet<T>(
  path: string,
  params?: Record<string, string | number | string[]>,
  revalidate = 600,
): Promise<T | null> {
  const url = new URL(API + path);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (Array.isArray(v)) v.forEach((val) => url.searchParams.append(k, String(val)));
      else url.searchParams.set(k, String(v));
    }
  }
  try {
    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      next: { revalidate },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function getMangaServer(id: string): Promise<Manga | null> {
  const res = await serverGet<{ data: Manga }>(`/manga/${id}`, {
    "includes[]": ["cover_art", "author", "artist"],
  });
  return res?.data ?? null;
}

export async function listChaptersServer(mangaId: string, limit = 1): Promise<Chapter[]> {
  const res = await serverGet<{ data: Chapter[] }>(`/manga/${mangaId}/feed`, {
    limit,
    "translatedLanguage[]": ["en"],
    "order[chapter]": "desc",
    "contentRating[]": ["safe", "suggestive"],
  });
  return res?.data ?? [];
}