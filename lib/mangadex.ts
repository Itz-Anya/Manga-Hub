const API = "/api/mangadex";

// Never surface NSFW material: only these two content ratings are ever
// requested, and adult tags are excluded outright.
export const SAFE_CONTENT_RATINGS = ["safe", "suggestive"] as const;
const NSFW_TAG_IDS = [
  "97893a4c-12af-4dac-b6be-0dffb353568e", // Sexual Violence
];
export function isNsfw(m: Pick<Manga, "attributes">): boolean {
  const rating = m.attributes.contentRating;
  if (rating && !SAFE_CONTENT_RATINGS.includes(rating as (typeof SAFE_CONTENT_RATINGS)[number])) return true;
  return (m.attributes.tags ?? []).some((t) => NSFW_TAG_IDS.includes(t.id));
}
const UPLOADS = "https://uploads.mangadex.org";

export interface MangaTag {
  id: string;
  attributes: { name: Record<string, string>; group: string };
}

export interface Manga {
  id: string;
  type: "manga";
  attributes: {
    title: Record<string, string>;
    altTitles: Array<Record<string, string>>;
    description: Record<string, string>;
    year: number | null;
    status: string;
    contentRating: string;
    tags: MangaTag[];
    originalLanguage: string;
    lastChapter?: string | null;
  };
  relationships: Array<{
    id: string;
    type: string;
    attributes?: Record<string, unknown> & { fileName?: string; name?: string };
  }>;
}

export interface Chapter {
  id: string;
  attributes: {
    chapter: string | null;
    volume: string | null;
    title: string | null;
    translatedLanguage: string;
    pages: number;
    publishAt: string;
    externalUrl: string | null;
  };
  relationships: Array<{ id: string; type: string; attributes?: Record<string, unknown> }>;
}

export function pickTitle(m: Pick<Manga, "attributes">): string {
  const t = m.attributes.title;
  return t.en || t["ja-ro"] || t.ja || t[Object.keys(t)[0]] || "Untitled";
}

const HTML_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  hellip: "\u2026",
  mdash: "\u2014",
  ndash: "\u2013",
  rsquo: "\u2019",
  lsquo: "\u2018",
  ldquo: "\u201c",
  rdquo: "\u201d",
};

// MangaDex descriptions often contain raw HTML (<br>, <p>, <a href>…) as well as
// markdown links and bbcode-ish noise. Render that as-is and readers see tags
// instead of prose, so we strip it down to clean text.
export function stripHtml(input: string): string {
  return input
    .replace(/<\s*br\s*\/?\s*>/gi, "\n")
    .replace(/<\s*\/\s*(p|div|li|h[1-6])\s*>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&([a-z]+);/gi, (m, name) => HTML_ENTITIES[String(name).toLowerCase()] ?? m)
    .replace(/\[([^\]]+)\]\((?:[^)]+)\)/g, "$1")
    .replace(/\[\/?[a-z]+(?:=[^\]]+)?\]/gi, "")
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function pickDescription(m: Pick<Manga, "attributes">): string {
  const d = m.attributes.description || {};
  return stripHtml(d.en || d[Object.keys(d)[0]] || "");
}

export function coverUrl(manga: Manga, size: 256 | 512 | "orig" = 512): string | null {
  const cover = manga.relationships.find((r) => r.type === "cover_art");
  const fileName = cover?.attributes?.fileName as string | undefined;
  if (!fileName) return null;
  const suffix = size === "orig" ? "" : `.${size}.jpg`;
  return `${UPLOADS}/covers/${manga.id}/${fileName}${suffix}`;
}

export function authorNames(manga: Manga): { author: string; artist: string } {
  const author = manga.relationships.find((r) => r.type === "author");
  const artist = manga.relationships.find((r) => r.type === "artist");
  return {
    author: (author?.attributes?.name as string) || "Unknown",
    artist: (artist?.attributes?.name as string) || "Unknown",
  };
}

async function get<T>(path: string, params?: Record<string, string | number | string[]>): Promise<T> {
  const base = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  const url = new URL(API + path, base);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (Array.isArray(v)) v.forEach((val) => url.searchParams.append(k, String(val)));
      else url.searchParams.set(k, String(v));
    }
  }
  const res = await fetch(url.toString(), { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Upstream ${res.status}: ${await res.text().catch(() => "")}`);
  return res.json();
}

export interface MangaListParams {
  limit?: number;
  offset?: number;
  title?: string;
  includedTags?: string[];
  order?: Record<string, "asc" | "desc">;
  contentRating?: string[];
  readableOnly?: boolean;
}

export async function listManga(params: MangaListParams = {}): Promise<{ data: Manga[]; total: number }> {
  if (params.readableOnly) return listReadableManga(params);

  const q: Record<string, string | number | string[]> = {
    limit: params.limit ?? 32,
    offset: params.offset ?? 0,
    "includes[]": ["cover_art", "author", "artist"],
    "contentRating[]": [...SAFE_CONTENT_RATINGS],
    "excludedTags[]": NSFW_TAG_IDS,
    hasAvailableChapters: "true",
    "availableTranslatedLanguage[]": ["en"],
  };
  if (params.title) q.title = params.title;
  if (params.includedTags?.length) q["includedTags[]"] = params.includedTags;
  if (params.order) {
    for (const [k, v] of Object.entries(params.order)) q[`order[${k}]`] = v;
  } else {
    q["order[followedCount]"] = "desc";
  }
  const res = await get<{ data: Manga[]; total: number }>("/manga", q);
  return { data: res.data.filter((m) => !isNsfw(m)), total: res.total };
}

async function listReadableManga(params: MangaListParams): Promise<{ data: Manga[]; total: number }> {
  const target = params.limit ?? 32;
  const startOffset = params.offset ?? 0;
  const readable: Manga[] = [];
  let total = 0;
  let offset = startOffset;

  while (readable.length < target && offset < startOffset + 160) {
    const batch = await listManga({ ...params, readableOnly: false, limit: Math.max(target * 2, 48), offset });
    total = batch.total;
    if (batch.data.length === 0) break;

    for (let i = 0; i < batch.data.length; i += 8) {
      const slice = batch.data.slice(i, i + 8);
      const checks = await Promise.all(
        slice.map(async (manga) => ({ manga, readable: await hasReadableChapter(manga.id) }))
      );
      readable.push(...checks.filter((c) => c.readable).map((c) => c.manga));
      if (readable.length >= target) break;
    }

    offset += batch.data.length;
    if (offset >= total) break;
  }

  return { data: readable.slice(0, target), total };
}

export async function getManga(id: string): Promise<Manga> {
  const res = await get<{ data: Manga }>(`/manga/${id}`, { "includes[]": ["cover_art", "author", "artist"] });
  return res.data;
}

export async function listChapters(
  mangaId: string,
  options: number | { offset?: number; limit?: number } = 0
): Promise<{ data: Chapter[]; total: number }> {
  const offset = typeof options === "number" ? options : options.offset ?? 0;
  const limit = typeof options === "number" ? 96 : options.limit ?? 96;

  return get<{ data: Chapter[]; total: number }>(`/manga/${mangaId}/feed`, {
    limit,
    offset,
    "translatedLanguage[]": ["en"],
    "order[volume]": "asc",
    "order[chapter]": "asc",
    "contentRating[]": [...SAFE_CONTENT_RATINGS],
  });
}

// MangaDex's feed frequently contains the *same* chapter number uploaded by
// several scanlation groups. Left as-is, the chapter list shows repeats
// (e.g. two "Chapter 7" entries, or a "7.1" that is really just another
// group's copy of "7"), and clicking one of the repeats can land the reader
// on a chapter that looks identical to one already read. We dedupe by
// volume+chapter number, keeping the most complete upload (most pages) and
// breaking ties by the most recently published version.
function dedupeChapters(chapters: Chapter[]): Chapter[] {
  const byKey = new Map<string, Chapter>();
  for (const c of chapters) {
    const key = `${c.attributes.volume ?? ""}|${c.attributes.chapter ?? ""}`;
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, c);
      continue;
    }
    const existingExternal = !!existing.attributes.externalUrl;
    const currentExternal = !!c.attributes.externalUrl;
    if (existingExternal !== currentExternal) {
      if (existingExternal) byKey.set(key, c);
      continue;
    }
    const existingPages = existing.attributes.pages ?? 0;
    const currentPages = c.attributes.pages ?? 0;
    if (currentPages > existingPages) {
      byKey.set(key, c);
    } else if (currentPages === existingPages) {
      const existingTime = new Date(existing.attributes.publishAt).getTime();
      const currentTime = new Date(c.attributes.publishAt).getTime();
      if (currentTime > existingTime) byKey.set(key, c);
    }
  }
  return Array.from(byKey.values());
}

// Fetches the *entire* chapter feed for a manga (paginating past MangaDex's
// per-request limit) and returns it deduped. Use this anywhere the full,
// clean chapter list is needed (chapter list UI, prev/next navigation).
export async function listAllChapters(mangaId: string): Promise<{ data: Chapter[]; total: number }> {
  const limit = 100;
  let offset = 0;
  let total = Infinity;
  const all: Chapter[] = [];

  while (offset < total && offset < 2000) {
    const res = await listChapters(mangaId, { offset, limit });
    all.push(...res.data);
    total = res.total;
    offset += res.data.length;
    if (res.data.length === 0) break;
  }

  const deduped = dedupeChapters(all);
  return { data: deduped, total: deduped.length };
}

async function hasReadableChapter(mangaId: string): Promise<boolean> {
  try {
    const feed = await listChapters(mangaId, { limit: 6 });
    return feed.data.some((chapter) => chapter.attributes.pages > 0 || !!chapter.attributes.externalUrl);
  } catch {
    return false;
  }
}

export async function getChapterPages(chapterId: string): Promise<{
  baseUrl: string;
  hash: string;
  data: string[];
  dataSaver: string[];
}> {
  const res = await get<{ baseUrl: string; chapter: { hash: string; data: string[]; dataSaver: string[] } }>(
    `/at-home/server/${chapterId}`
  );
  return {
    baseUrl: res.baseUrl,
    hash: res.chapter.hash,
    data: res.chapter.data,
    dataSaver: res.chapter.dataSaver,
  };
}

export function pageUrl(server: { baseUrl: string; hash: string }, file: string, saver = false): string {
  const raw = `${server.baseUrl}/${saver ? "data-saver" : "data"}/${server.hash}/${file}`;
  return `/api/image?url=${encodeURIComponent(raw)}`;
}

export async function listTags(): Promise<MangaTag[]> {
  const res = await get<{ data: MangaTag[] }>("/manga/tag");
  return res.data;
}

export async function getChapter(id: string): Promise<Chapter> {
  const res = await get<{ data: Chapter }>(`/chapter/${id}`, { "includes[]": ["manga"] });
  return res.data;
}