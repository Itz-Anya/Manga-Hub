"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { useState, useMemo } from "react";
import { Layout } from "@/components/panelio/Layout";
import { useLibrary, removeEntry, type LibraryEntry } from "@/lib/library";

type Tab = "continue" | "bookmarks" | "history";

export default function LibraryPage() {
  const entries = useLibrary();
  const all = useMemo(() => Object.values(entries), [entries]);
  const [tab, setTab] = useState<Tab>("continue");

  const continueList = useMemo(
    () =>
      all
        .filter(
          (e) =>
            !!e.lastChapterId &&
            typeof e.totalPages === "number" &&
            (e.totalPages ?? 0) > 0 &&
            (e.lastPage ?? 0) < (e.totalPages ?? 0) - 1
        )
        .sort((a, b) => (b.readAt ?? b.updatedAt) - (a.readAt ?? a.updatedAt)),
    [all]
  );
  const bookmarks = useMemo(
    () => all.filter((e) => e.bookmarked).sort((a, b) => b.updatedAt - a.updatedAt),
    [all]
  );
  const history = useMemo(
    () => all.slice().sort((a, b) => (b.readAt ?? b.updatedAt) - (a.readAt ?? a.updatedAt)),
    [all]
  );

  const list = tab === "continue" ? continueList : tab === "bookmarks" ? bookmarks : history;

  const emptyCopy: Record<Tab, string> = {
    continue: "No chapters in progress. Start reading a title.",
    bookmarks: "No bookmarks yet. Tap the bookmark on a series page.",
    history: "No reading history yet.",
  };

  return (
    <Layout>
      <section className="mx-auto max-w-[1200px] px-5 py-12 md:px-8">
        <div className="border-b border-[color:var(--rule)] pb-4">
          <p className="font-[family-name:var(--font-display)] text-xs uppercase tracking-[0.4em] text-[color:var(--vermilion)]">Section 02</p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-6xl font-bold uppercase tracking-tight text-[color:var(--paper)] md:text-8xl">
            Your library
          </h1>
          <p className="mt-3 font-[family-name:var(--font-serif)] text-lg italic text-[color:var(--paper-dim)]">
            {continueList.length > 0
              ? `${continueList.length} in progress · ${bookmarks.length} bookmarks · ${history.length} viewed`
              : `${bookmarks.length} bookmarks · ${history.length} viewed`}
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {(
            [
              ["continue", `Continue (${continueList.length})`],
              ["bookmarks", `Bookmarks (${bookmarks.length})`],
              ["history", `History (${history.length})`],
            ] as Array<[Tab, string]>
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              aria-pressed={tab === key}
              className={`border px-3 py-1.5 font-[family-name:var(--font-display)] text-xs uppercase tracking-widest transition ${
                tab === key
                  ? "border-[color:var(--vermilion)] bg-[color:var(--vermilion)] text-[color:var(--paper)]"
                  : "border-[color:var(--rule)] text-[color:var(--paper-dim)] hover:border-[color:var(--paper)] hover:text-[color:var(--paper)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {list.length === 0 ? (
          <div className="mt-16 flex flex-col items-start gap-3">
            <p className="font-[family-name:var(--font-serif)] italic text-[color:var(--paper-dim)]">{emptyCopy[tab]}</p>
            <Link
              href="/"
              className="border-[1.5px] border-[color:var(--paper)] px-5 py-3 font-[family-name:var(--font-display)] text-sm uppercase tracking-widest text-[color:var(--paper)] transition hover:bg-[color:var(--vermilion)] hover:border-[color:var(--vermilion)]"
            >
              Browse the catalog →
            </Link>
          </div>
        ) : (
          <ul className="mt-8 divide-y divide-[color:var(--rule)]">
            {list.map((e: LibraryEntry) => {
              const progress = e.totalPages ? Math.round(((e.lastPage ?? 0) / e.totalPages) * 100) : 0;
              return (
                <li key={e.mangaId} className="group grid grid-cols-[64px_1fr_auto] items-center gap-4 py-4">
                  <Link href={`/manga/${e.mangaId}`} className="block">
                    <div className="panel-border aspect-[2/3] w-16 overflow-hidden bg-[color:var(--panel)]">
                      {e.cover && <img referrerPolicy="no-referrer" src={e.cover} alt="" className="h-full w-full object-cover" />}
                    </div>
                  </Link>
                  <div className="min-w-0">
                    <Link href={`/manga/${e.mangaId}`}>
                      <h2 className="truncate font-[family-name:var(--font-display)] text-xl uppercase text-[color:var(--paper)] hover:text-[color:var(--vermilion)]">
                        {e.title}
                      </h2>
                    </Link>
                    {e.lastChapterId && (
                      <p className="mt-1 font-[family-name:var(--font-serif)] text-sm italic text-[color:var(--paper-dim)]">
                        Continuing chapter {e.lastChapterNumber ?? "—"} · page {(e.lastPage ?? 0) + 1}
                        {e.totalPages ? ` / ${e.totalPages}` : ""}
                      </p>
                    )}
                    {e.totalPages ? (
                      <div className="mt-2 h-[3px] w-full bg-[color:var(--rule)]">
                        <div className="h-full bg-[color:var(--vermilion)]" style={{ width: `${progress}%` }} />
                      </div>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    {e.lastChapterId && (
                      <Link
                        href={`/read/${e.lastChapterId}?mangaId=${e.mangaId}`}
                        className="border border-[color:var(--paper)] px-3 py-1.5 font-[family-name:var(--font-display)] text-xs uppercase tracking-widest text-[color:var(--paper)] hover:bg-[color:var(--vermilion)] hover:border-[color:var(--vermilion)]"
                      >
                        Resume
                      </Link>
                    )}
                    <button
                      onClick={() => removeEntry(e.mangaId)}
                      aria-label="Remove"
                      className="border border-[color:var(--rule)] p-1.5 text-[color:var(--paper-dim)] transition hover:border-[color:var(--vermilion)] hover:text-[color:var(--vermilion)]"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </Layout>
  );
}