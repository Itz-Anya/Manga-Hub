import Link from "next/link";
import { coverUrl, pickTitle, type Manga } from "@/lib/mangadex";

type Size = "sm" | "md" | "lg" | "xl";

const sizeClasses: Record<Size, string> = {
  sm: "aspect-[2/3]",
  md: "aspect-[2/3]",
  lg: "aspect-[3/5]",
  xl: "aspect-[3/5]",
};

export function MangaTile({ manga, size = "md", index = 0 }: { manga: Manga; size?: Size; index?: number }) {
  const cover = coverUrl(manga, 512);
  const title = pickTitle(manga);
  const author = manga.relationships.find((r) => r.type === "author");
  const year = manga.attributes.year;
  const status = manga.attributes.status;
  const num = String(index + 1).padStart(3, "0");

  return (
    <Link href={`/manga/${manga.id}`} className="panelio-cursor group block">
      <article className="tilt-hover panel-border relative overflow-hidden bg-[color:var(--panel)]">
        <div className={`relative w-full ${sizeClasses[size]} overflow-hidden`}>
          {cover ? (
            <img
              referrerPolicy="no-referrer"
              src={cover}
              alt={title}
              loading="lazy"
              className="h-full w-full object-cover grayscale-[0.15] transition-all duration-500 group-hover:grayscale-0"
            />
          ) : (
            <div className="h-full w-full skeleton-manga" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--ink)] via-transparent to-transparent opacity-70" />
          <div className="halftone absolute inset-0 opacity-20 mix-blend-multiply" />
          <div className="absolute left-2 top-2 font-[family-name:var(--font-display)] text-[10px] uppercase tracking-widest text-[color:var(--paper)]">
            <span className="bg-[color:var(--ink)] px-1.5 py-0.5">#{num}</span>
          </div>
          {status === "ongoing" && (
            <div className="absolute right-2 top-2 flex items-center gap-1 bg-[color:var(--vermilion)] px-1.5 py-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--paper)]" />
              <span className="font-[family-name:var(--font-display)] text-[10px] uppercase tracking-wider text-[color:var(--paper)]">Live</span>
            </div>
          )}
        </div>
        <div className="border-t border-[color:var(--rule)] p-3">
          <h3 className="line-clamp-2 font-[family-name:var(--font-display)] text-base font-semibold uppercase leading-tight tracking-[0.01em] text-[color:var(--paper)] md:text-lg">
            {title}
          </h3>
          <div className="mt-1 flex items-center justify-between font-[family-name:var(--font-serif)] text-xs italic text-[color:var(--paper-dim)]">
            <span className="truncate">{(author?.attributes?.name as string) || "—"}</span>
            {year && <span className="shrink-0 pl-2">{year}</span>}
          </div>
        </div>
      </article>
    </Link>
  );
}