"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Bookmark, BookmarkCheck, ChevronRight } from "lucide-react";
import { getManga, listAllChapters, coverUrl, pickTitle, pickDescription, authorNames } from "@/lib/mangadex";
import { Layout } from "@/components/panelio/Layout";
import { PanelSkeleton } from "@/components/panelio/Skeleton";
import { setBookmark, upsertEntry, useLibrary } from "@/lib/library";

export default function MangaDetailClient({ id }: { id: string }) {
  const mangaQ = useQuery({ queryKey: ["manga", id], queryFn: () => getManga(id) });
  const chaptersQ = useQuery({ queryKey: ["chapters", id], queryFn: () => listAllChapters(id) });
  const library = useLibrary();
  const inLibrary = !!library[id]?.bookmarked;

  const mangaData = mangaQ.data;
  const title = mangaData ? pickTitle(mangaData) : "";
  const cover = mangaData ? coverUrl(mangaData, 512) : "";

  
  useEffect(() => {
    if (!mangaData) return;
    upsertEntry({ mangaId: id, title, cover, updatedAt: Date.now() });
  }, [id, mangaData]);

  if (mangaQ.isLoading) {
    return (
      <Layout>
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-8 px-5 py-10 md:grid-cols-[300px_1fr] md:px-8">
          <PanelSkeleton className="aspect-[2/3]" />
          <div className="space-y-4">
            <PanelSkeleton className="h-10 w-2/3" />
            <PanelSkeleton className="h-40 w-full" />
          </div>
        </div>
      </Layout>
    );
  }

  if (mangaQ.error || !mangaQ.data) {
    return (
      <Layout>
        <div className="mx-auto max-w-2xl px-6 py-24">
          <p className="font-[family-name:var(--font-serif)] italic text-[color:var(--paper-dim)]">
            Couldn't load this title.
          </p>
        </div>
      </Layout>
    );
  }

  const manga = mangaQ.data;
  const desc = pickDescription(manga);
  const { author, artist } = authorNames(manga);
  const tags = manga.attributes.tags.map((t) => t.attributes.name.en).filter(Boolean);

  const chapters = (chaptersQ.data?.data ?? []).slice().sort((a, b) => {
    const an = parseFloat(a.attributes.chapter || "0");
    const bn = parseFloat(b.attributes.chapter || "0");
    return an - bn;
  });

  const toggleLibrary = () => {
    setBookmark(id, !inLibrary, { title, cover });
  };

  return (
    <Layout>
      <article className="mx-auto max-w-[1200px] px-5 py-10 md:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[320px_1fr]">
          <div>
            <div className="panel-border relative overflow-hidden bg-[color:var(--panel)]">
              {cover && <img referrerPolicy="no-referrer" src={cover} alt={title} className="aspect-[2/3] w-full object-cover" />}
              <div className="halftone absolute inset-0 opacity-20 mix-blend-multiply" />
            </div>
            <button
              onClick={toggleLibrary}
              className={`mt-3 flex w-full items-center justify-center gap-2 border-[1.5px] px-4 py-3 font-[family-name:var(--font-display)] text-sm uppercase tracking-widest transition ${
                inLibrary
                  ? "border-[color:var(--vermilion)] bg-[color:var(--vermilion)] text-[color:var(--paper)]"
                  : "border-[color:var(--paper)] text-[color:var(--paper)] hover:bg-[color:var(--paper)] hover:text-[color:var(--ink)]"
              }`}
            >
              {inLibrary ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
              {inLibrary ? "In library" : "Add to library"}
            </button>
          </div>

          <div>
            <p className="font-[family-name:var(--font-display)] text-xs uppercase tracking-[0.4em] text-[color:var(--vermilion)]">
              {manga.attributes.status} · {manga.attributes.year ?? "—"}
            </p>
            <h1 className="mt-2 font-[family-name:var(--font-display)] text-5xl font-bold uppercase leading-[0.9] tracking-tight text-[color:var(--paper)] md:text-7xl">
              {title}
            </h1>
            <p className="mt-4 font-[family-name:var(--font-serif)] text-base italic text-[color:var(--paper-dim)]">
              Story by <span className="text-[color:var(--paper)]">{author}</span>
              {artist !== author && <> · Art by <span className="text-[color:var(--paper)]">{artist}</span></>}
            </p>

            <div className="mt-6 flex flex-wrap gap-1.5">
              {tags.slice(0, 12).map((t) => (
                <span key={t} className="border border-[color:var(--rule)] px-2 py-1 font-[family-name:var(--font-display)] text-[10px] uppercase tracking-widest text-[color:var(--paper-dim)]">
                  {t}
                </span>
              ))}
            </div>

            <p className="mt-8 max-w-2xl whitespace-pre-line font-[family-name:var(--font-serif)] text-lg leading-relaxed text-[color:var(--paper)]">
              {desc || "No synopsis available."}
            </p>
          </div>
        </div>

        <section className="mt-14">
          <div className="flex items-baseline justify-between border-b border-[color:var(--rule)] pb-3">
            <h2 className="font-[family-name:var(--font-display)] text-2xl uppercase tracking-widest text-[color:var(--paper)]">Chapters</h2>
            <span className="font-[family-name:var(--font-serif)] text-sm italic text-[color:var(--paper-dim)]">
              {chaptersQ.data ? `${chaptersQ.data.data.length} entries` : "—"}
            </span>
          </div>

          {chaptersQ.isLoading ? (
            <div className="mt-4 space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <PanelSkeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : chapters.length === 0 ? (
            <p className="mt-6 font-[family-name:var(--font-serif)] italic text-[color:var(--paper-dim)]">No English chapters listed.</p>
          ) : (
            <ul className="mt-4 divide-y divide-[color:var(--rule)]">
              {chapters.map((c) => {
                // Publisher URLs in the feed (kodansha.us/reader/… etc.) are
                // frequently stale or region-locked. MangaDex's own chapter page
                // is stable and always forwards to the current official reader.
                const external = c.attributes.externalUrl ? `https://mangadex.org/chapter/${c.id}` : null;
                const rowClass =
                  "group flex items-center justify-between gap-3 py-3 transition hover:bg-[color:var(--panel)]";
                const inner = (
                  <>
                    <div className="flex min-w-0 items-baseline gap-4">
                      <span className="w-16 shrink-0 font-[family-name:var(--font-display)] text-lg text-[color:var(--vermilion)]">
                        Ch. {c.attributes.chapter ?? "—"}
                      </span>
                      <span className="truncate font-[family-name:var(--font-serif)] text-base italic text-[color:var(--paper)]">
                        {c.attributes.title || "Untitled"}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="hidden font-[family-name:var(--font-display)] text-xs uppercase tracking-widest text-[color:var(--paper-faint)] sm:inline">
                        {external ? "Official" : `${c.attributes.pages} pp`}
                      </span>
                      <ChevronRight className="h-4 w-4 text-[color:var(--paper-dim)] transition group-hover:translate-x-1 group-hover:text-[color:var(--vermilion)]" />
                    </div>
                  </>
                );
                return (
                  <li key={c.id}>
                    {external ? (
                      <a href={external} target="_blank" rel="noopener noreferrer" className={rowClass}>
                        {inner}
                      </a>
                    ) : (
                      <Link href={`/read/${c.id}?mangaId=${id}`} className={rowClass}>
                        {inner}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </article>
    </Layout>
  );
}
