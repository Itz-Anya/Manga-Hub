"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { listManga, listTags, type Manga } from "@/lib/mangadex";
import { Layout } from "@/components/panelio/Layout";
import { MangaTile } from "@/components/panelio/MangaTile";
import { GridSkeleton } from "@/components/panelio/Skeleton";

function sizeFor(index: number): "sm" | "md" | "lg" | "xl" {
  if (index === 0) return "xl";
  if (index === 3 || index === 8) return "lg";
  return "md";
}

function spanFor(index: number): string {
  if (index === 0) return "col-span-2 row-span-2 md:col-span-2 md:row-span-2";
  if (index === 3) return "col-span-2 md:col-span-1 md:row-span-2";
  if (index === 8) return "col-span-2 md:col-span-2";
  return "col-span-1";
}

export default function DiscoverPage() {
  const [query, setQuery] = useState("");
  const [input, setInput] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const tagsQ = useQuery({ queryKey: ["tags"], queryFn: listTags, staleTime: 60 * 60 * 1000 });

  const PAGE_SIZE = 32;
  const mangaQ = useInfiniteQuery({
    queryKey: ["manga-infinite", { query, activeTag }],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      const main = await listManga({
        limit: PAGE_SIZE,
        offset: pageParam,
        title: query || undefined,
        includedTags: activeTag ? [activeTag] : undefined,
        order: query ? { relevance: "desc" } : { followedCount: "desc" },
        readableOnly: true,
      });
      if (pageParam === 0 && !query && !activeTag) {
        try {
          const pinned = await listManga({ limit: 1, title: "Haimiya-senpai" });
          if (pinned.data[0]) {
            const p = pinned.data[0];
            return { ...main, data: [p, ...main.data.filter((m) => m.id !== p.id)] };
          }
        } catch {}
      }
      return main;
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage?.data?.length) return undefined;
      const loaded = allPages.reduce((n, p) => n + (p.data?.length ?? 0), 0);
      if (loaded >= (lastPage.total ?? loaded)) return undefined;
      return allPages.length * PAGE_SIZE;
    },
  });

  const featuredTags = useMemo(() => {
    const t = tagsQ.data ?? [];
    const wanted = ["Action", "Romance", "Comedy", "Drama", "Fantasy", "Sci-Fi", "Slice of Life", "Horror", "Mystery", "Sports"];
    return wanted
      .map((name) => t.find((tag) => tag.attributes.name.en === name))
      .filter((x): x is NonNullable<typeof x> => !!x);
  }, [tagsQ.data]);

  const list: Manga[] = useMemo(() => {
    const pages = mangaQ.data?.pages ?? [];
    const seen = new Set<string>();
    const out: Manga[] = [];
    for (const p of pages) {
      for (const m of p.data ?? []) {
        if (seen.has(m.id)) continue;
        seen.add(m.id);
        out.push(m);
      }
    }
    return out;
  }, [mangaQ.data]);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && mangaQ.hasNextPage && !mangaQ.isFetchingNextPage) {
          mangaQ.fetchNextPage();
        }
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [mangaQ.hasNextPage, mangaQ.isFetchingNextPage, mangaQ]);

  return (
    <Layout>
      <section className="border-b border-[color:var(--rule)]">
        <div className="mx-auto max-w-[1400px] px-5 py-6 md:px-8 md:py-10">
          <figure className="panel-border relative overflow-hidden bg-[color:var(--panel)]">
            <img
              src="https://anya-file-host.vercel.app/cznc5nha4b"
              alt="Manga Hub"
              className="block h-auto w-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="halftone pointer-events-none absolute inset-0 opacity-15 mix-blend-multiply" />
          </figure>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setQuery(input.trim());
            }}
            className="mt-10 flex max-w-2xl items-stretch"
          >
            <div className="caption-box relative flex flex-1 items-center gap-3 px-4 py-3">
              <Search className="h-4 w-4 text-[color:var(--paper-dim)]" />
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Search a title, a mood, a mangaka…"
                className="w-full bg-transparent font-[family-name:var(--font-serif)] text-base italic text-[color:var(--paper)] placeholder:text-[color:var(--paper-faint)] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="ml-[-1.5px] border-y-[1.5px] border-r-[1.5px] border-[color:var(--paper)] bg-[color:var(--paper)] px-5 font-[family-name:var(--font-display)] text-sm uppercase tracking-widest text-[color:var(--ink)] transition-colors hover:bg-[color:var(--vermilion)] hover:text-[color:var(--paper)]"
            >
              Search
            </button>
          </form>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="font-[family-name:var(--font-display)] text-[10px] uppercase tracking-[0.3em] text-[color:var(--paper-faint)]">Genres →</span>
            <button
              onClick={() => setActiveTag(null)}
              className={`border px-3 py-1 font-[family-name:var(--font-display)] text-xs uppercase tracking-widest transition ${
                !activeTag
                  ? "border-[color:var(--paper)] bg-[color:var(--paper)] text-[color:var(--ink)]"
                  : "border-[color:var(--rule)] text-[color:var(--paper-dim)] hover:border-[color:var(--paper)] hover:text-[color:var(--paper)]"
              }`}
            >
              All
            </button>
            {featuredTags.map((t) => {
              const active = activeTag === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTag(active ? null : t.id)}
                  className={`border px-3 py-1 font-[family-name:var(--font-display)] text-xs uppercase tracking-widest transition ${
                    active
                      ? "border-[color:var(--vermilion)] bg-[color:var(--vermilion)] text-[color:var(--paper)]"
                      : "border-[color:var(--rule)] text-[color:var(--paper-dim)] hover:border-[color:var(--paper)] hover:text-[color:var(--paper)]"
                  }`}
                >
                  {t.attributes.name.en}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-5 pt-10 md:px-8">
        <div className="flex items-baseline justify-between border-b border-[color:var(--rule)] pb-3">
          <h2 className="font-[family-name:var(--font-display)] text-2xl uppercase tracking-widest text-[color:var(--paper)] md:text-3xl">
            {query ? `Readable results for "${query}"` : activeTag ? "Readable by tag" : "Start reading now"}
          </h2>
          <span className="font-[family-name:var(--font-serif)] text-sm italic text-[color:var(--paper-dim)]">
            {mangaQ.data ? `${list.length} readable titles` : "—"}
          </span>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-5 py-8 md:px-8">
        {mangaQ.isLoading || !mangaQ.data ? (
          <GridSkeleton />
        ) : mangaQ.error ? (
          <p className="font-[family-name:var(--font-serif)] italic text-[color:var(--paper-dim)]">Couldn't load the catalog. Try again in a moment.</p>
        ) : list.length === 0 ? (
          <p className="font-[family-name:var(--font-serif)] italic text-[color:var(--paper-dim)]">No readable English chapters found for that search.</p>
        ) : (
          <>
            <div className="grid auto-rows-[minmax(0,auto)] grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
              {list.map((m: Manga, i: number) => (
                <div key={m.id} className={spanFor(i)}>
                  <MangaTile manga={m} size={sizeFor(i)} index={i} />
                </div>
              ))}
            </div>
            <div ref={sentinelRef} className="mt-10 flex items-center justify-center py-6">
              {mangaQ.isFetchingNextPage ? (
                <span className="flex items-center gap-2 font-[family-name:var(--font-display)] text-xs uppercase tracking-[0.3em] text-[color:var(--paper-dim)]">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading more
                </span>
              ) : mangaQ.hasNextPage ? (
                <button
                  onClick={() => mangaQ.fetchNextPage()}
                  className="border border-[color:var(--rule)] px-4 py-2 font-[family-name:var(--font-display)] text-xs uppercase tracking-widest text-[color:var(--paper-dim)] hover:border-[color:var(--paper)] hover:text-[color:var(--paper)]"
                >
                  Load more
                </button>
              ) : (
                <span className="font-[family-name:var(--font-serif)] text-sm italic text-[color:var(--paper-faint)]">— end of the catalogue —</span>
              )}
            </div>
          </>
        )}
      </section>
    </Layout>
  );
}