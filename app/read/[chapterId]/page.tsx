"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState, useMemo } from "react";
import { X, Gauge, Sparkles } from "lucide-react";
import { getChapterPages, getChapter, listAllChapters, pageUrl } from "@/lib/mangadex";
import { Layout } from "@/components/panelio/Layout";
import { upsertEntry, getEntry, getImageQuality, setImageQuality, type ImageQuality } from "@/lib/library";

export default function ReaderPage() {
  const { chapterId } = useParams<{ chapterId: string }>();
  const searchParams = useSearchParams();

  const searchMangaId = searchParams.get("mangaId") || undefined;
  const searchPage = searchParams.get("page");

  const [page, setPage] = useState(searchPage ? Number(searchPage) : 0);
  const [uiVisible, setUiVisible] = useState(true);
  // How many pages are allowed to start fetching. Pages beyond this show a
  // skeleton instead of an <img src>, so the browser never fires off dozens
  // of image requests at once — each page unlocks the next once it loads.
  const [unlockedUpTo, setUnlockedUpTo] = useState(1);
  // Data-saver (compressed) by default — faster loads, less data. The
  // reader header has a toggle to switch to full-resolution ("HD").
  const [quality, setQuality] = useState<ImageQuality>("saver");
  useEffect(() => {
    setQuality(getImageQuality());
  }, []);
  const toggleQuality = () => {
    const next: ImageQuality = quality === "saver" ? "original" : "saver";
    setQuality(next);
    setImageQuality(next);
  };
  // Refs to each page's wrapper div — used both to scroll to a restored
  // reading position and to observe which page is currently in view.
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  const chapterQ = useQuery({ queryKey: ["chapter", chapterId], queryFn: () => getChapter(chapterId) });
  const pagesQ = useQuery({ queryKey: ["pages", chapterId], queryFn: () => getChapterPages(chapterId) });

  const mangaId = searchMangaId || chapterQ.data?.relationships.find((r) => r.type === "manga")?.id;

  const chaptersQ = useQuery({
    queryKey: ["chapters", mangaId],
    queryFn: () => listAllChapters(mangaId!),
    enabled: !!mangaId,
  });

  const sortedChapters = useMemo(() => {
    // Officially licensed chapters have no pages on MangaDex (they link out),
    // so they must not appear in the reader's prev/next chain.
    return (chaptersQ.data?.data ?? [])
      .filter((c) => !c.attributes.externalUrl)
      .slice()
      .sort((a, b) => {
      const an = parseFloat(a.attributes.chapter || "0");
      const bn = parseFloat(b.attributes.chapter || "0");
      return an - bn;
    });
  }, [chaptersQ.data]);

  const currentIndex = sortedChapters.findIndex((c) => c.id === chapterId);
  const nextChapter =
    currentIndex >= 0 && currentIndex < sortedChapters.length - 1 ? sortedChapters[currentIndex + 1] : null;

  const pages = pagesQ.data?.data ?? [];
  const totalPages = pages.length;

  // Restore reading position (once) from the saved library entry, unlock
  // pages up to it, and scroll straight there — all from the computed
  // value directly, so we don't race against the setPage re-render.
  const restoredRef = useRef(false);
  useEffect(() => {
    if (restoredRef.current) return;
    if (!mangaId || totalPages === 0) return;
    restoredRef.current = true;
    const entry = getEntry(mangaId);
    if (entry && entry.lastChapterId === chapterId && typeof entry.lastPage === "number" && !searchPage) {
      const restored = Math.min(entry.lastPage, Math.max(totalPages - 1, 0));
      if (restored > 0) {
        setPage(restored);
        setUnlockedUpTo((u) => Math.max(u, restored + 1));
        requestAnimationFrame(() => {
          pageRefs.current[restored]?.scrollIntoView({ block: "start" });
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mangaId, chapterId, totalPages]);

  useEffect(() => {
    if (!mangaId || !chapterQ.data || totalPages === 0) return;
    upsertEntry({
      mangaId,
      title: getEntry(mangaId)?.title || "",
      cover: getEntry(mangaId)?.cover ?? null,
      lastChapterId: chapterId,
      lastChapterNumber: chapterQ.data.attributes.chapter,
      lastPage: page,
      totalPages,
      readAt: Date.now(),
      updatedAt: Date.now(),
    });
  }, [page, chapterId, mangaId, chapterQ.data, totalPages]);

  const nextHref = (id: string) => `/read/${id}${mangaId ? `?mangaId=${mangaId}` : ""}`;

  // Track which page is currently in view so reading progress saves
  // correctly as the user scrolls (not just when they tap a nav button).
  useEffect(() => {
    if (totalPages === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        let best: { index: number; ratio: number } | null = null;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const idx = Number((entry.target as HTMLElement).dataset.index);
          if (best === null || entry.intersectionRatio > best.ratio) {
            best = { index: idx, ratio: entry.intersectionRatio };
          }
        }
        if (best) setPage(best.index);
      },
      { threshold: [0.5], rootMargin: "-15% 0px -15% 0px" }
    );
    pageRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [totalPages]);

  if (pagesQ.isLoading || chapterQ.isLoading) {
    return (
      <Layout bare>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[color:var(--ink)]">
          <div className="halftone panel-border aspect-[2/3] w-64 skeleton-manga" />
          <p className="font-[family-name:var(--font-serif)] italic text-[color:var(--paper-dim)]">Loading pages…</p>
        </div>
      </Layout>
    );
  }

  if (pagesQ.error || totalPages === 0) {
    return (
      <Layout bare>
        <div className="flex min-h-screen items-center justify-center px-6">
          <div className="max-w-md text-center">
            <p className="font-[family-name:var(--font-serif)] text-lg italic text-[color:var(--paper-dim)]">
              This chapter is external-only or failed to load.
            </p>
            {mangaId && (
              <Link
                href={`/manga/${mangaId}`}
                className="mt-6 inline-block border-[1.5px] border-[color:var(--paper)] px-5 py-3 font-[family-name:var(--font-display)] text-sm uppercase tracking-widest text-[color:var(--paper)] hover:bg-[color:var(--vermilion)] hover:border-[color:var(--vermilion)]"
              >
                ← Back to series
              </Link>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  const server = pagesQ.data!;
  const chapterNum = chapterQ.data?.attributes.chapter ?? "—";
  const chapterTitle = chapterQ.data?.attributes.title;

  return (
    <div className="grain relative min-h-screen bg-[color:var(--ink)] text-[color:var(--paper)]">
      <div
        className={`fixed inset-x-0 top-0 z-40 border-b border-[color:var(--rule)] bg-[color:var(--ink)]/85 backdrop-blur transition-all duration-300 ${
          uiVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        }`}
      >
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-5 py-3 md:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <Link
              href={mangaId ? `/manga/${mangaId}` : "/"}
              className="text-[color:var(--paper-dim)] hover:text-[color:var(--paper)]"
            >
              <X className="h-5 w-5" />
            </Link>
            <div className="min-w-0">
              <p className="font-[family-name:var(--font-display)] text-xs uppercase tracking-[0.3em] text-[color:var(--vermilion)]">
                Chapter {chapterNum}
              </p>
              <p className="truncate font-[family-name:var(--font-serif)] text-sm italic text-[color:var(--paper-dim)]">
                {chapterTitle || "Untitled"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleQuality}
              className="flex items-center gap-1.5 border border-[color:var(--rule)] px-2.5 py-1.5 font-[family-name:var(--font-display)] text-xs uppercase tracking-widest text-[color:var(--paper-dim)] transition hover:border-[color:var(--paper)] hover:text-[color:var(--paper)]"
              aria-label="Toggle image quality"
              title={quality === "saver" ? "Data saver — tap for HD" : "HD — tap for data saver"}
            >
              {quality === "saver" ? <Gauge className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
              {quality === "saver" ? "Saver" : "HD"}
            </button>
            <span className="font-[family-name:var(--font-display)] text-sm tabular-nums text-[color:var(--paper-dim)]">
              {String(page + 1).padStart(2, "0")}
              <span className="text-[color:var(--paper-faint)]"> / {String(totalPages).padStart(2, "0")}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="pt-20">
        <div className="mx-auto flex max-w-[900px] flex-col">
          {pages.map((f, i) => (
            <div key={f} ref={(el) => { pageRefs.current[i] = el; }} data-index={i}>
              <ReaderImage
                server={server}
                file={f}
                saverFile={server.dataSaver[i]}
                quality={quality}
                alt={`Page ${i + 1}`}
                shouldLoad={i <= unlockedUpTo}
                onLoadComplete={() => setUnlockedUpTo((u) => Math.max(u, i + 1))}
                className="w-full"
                onClick={() => setUiVisible((v) => !v)}
              />
            </div>
          ))}
          <div className="border-t border-[color:var(--rule)] p-6 text-center">
            <p className="font-[family-name:var(--font-serif)] italic text-[color:var(--paper-dim)]">End of chapter</p>
            {nextChapter && (
              <Link
                href={nextHref(nextChapter.id)}
                className="mt-4 inline-block border-[1.5px] border-[color:var(--paper)] px-5 py-3 font-[family-name:var(--font-display)] text-sm uppercase tracking-widest hover:bg-[color:var(--vermilion)] hover:border-[color:var(--vermilion)]"
              >
                Next chapter →
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReaderImage({
  server,
  file,
  saverFile,
  quality,
  alt,
  className,
  shouldLoad,
  onLoadComplete,
  onClick,
}: {
  server: { baseUrl: string; hash: string };
  file: string;
  saverFile?: string;
  quality: ImageQuality;
  alt: string;
  className?: string;
  shouldLoad: boolean;
  onLoadComplete?: () => void;
  onClick?: () => void;
}) {
  const [attempt, setAttempt] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const original = pageUrl(server, file);
  const saver = saverFile ? pageUrl(server, saverFile, true) : original;
  const preferred = quality === "saver" ? saver : original;
  const fallback = quality === "saver" ? original : saver;
  // attempt 0: preferred quality. attempt 1: retry the same URL (transient
  // network blip). attempt 2: fall back to the other quality entirely.
  const src = attempt === 0 ? preferred : attempt === 1 ? `${preferred}&r=1` : fallback;

  // Reset load state when the quality preference changes so the new
  // source is actually fetched instead of showing a stale image.
  useEffect(() => {
    setAttempt(0);
    setLoaded(false);
  }, [quality]);

  if (!shouldLoad) {
    return (
      <div
        className={`skeleton-manga panel-border ${className ?? ""}`}
        style={{ aspectRatio: "2 / 3" }}
        aria-hidden
      />
    );
  }

  return (
    <div className="relative">
      {!loaded && <div className="skeleton-manga absolute inset-0" style={{ aspectRatio: "2 / 3" }} aria-hidden />}
      <img
        referrerPolicy="no-referrer"
        src={src}
        alt={alt}
        loading="eager"
        className={`${className ?? ""} transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
        onClick={onClick}
        onLoad={() => {
          setLoaded(true);
          onLoadComplete?.();
        }}
        onError={() => {
          if (attempt < 2) {
            setAttempt((a) => a + 1);
          } else {
            // give up gracefully, still unlock the next page
            setLoaded(true);
            onLoadComplete?.();
          }
        }}
      />
    </div>
  );
}
