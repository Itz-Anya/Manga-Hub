"use client";

import { useEffect, useState } from "react";

export interface LibraryEntry {
  mangaId: string;
  title: string;
  cover: string | null;
  lastChapterId?: string;
  lastChapterNumber?: string | null;
  lastPage?: number;
  totalPages?: number;
  bookmarked?: boolean;
  readAt?: number;
  updatedAt: number;
}

const KEY = "mangahub.library.v1";

function read(): Record<string, LibraryEntry> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

function write(v: Record<string, LibraryEntry>) {
  localStorage.setItem(KEY, JSON.stringify(v));
  window.dispatchEvent(new CustomEvent("mangahub:library"));
}

export function useLibrary() {
  const [entries, setEntries] = useState<Record<string, LibraryEntry>>({});
  useEffect(() => {
    setEntries(read());
    const on = () => setEntries(read());
    window.addEventListener("mangahub:library", on);
    window.addEventListener("storage", on);
    return () => {
      window.removeEventListener("mangahub:library", on);
      window.removeEventListener("storage", on);
    };
  }, []);
  return entries;
}

export function upsertEntry(entry: LibraryEntry) {
  const all = read();
  all[entry.mangaId] = { ...(all[entry.mangaId] || {}), ...entry, updatedAt: Date.now() };
  write(all);
}

export function removeEntry(mangaId: string) {
  const all = read();
  delete all[mangaId];
  write(all);
}

export function setBookmark(mangaId: string, bookmarked: boolean, base?: Partial<LibraryEntry>) {
  const all = read();
  const existing = all[mangaId];
  if (!existing && !bookmarked) return;
  const merged: LibraryEntry = {
    ...(existing ?? { mangaId, title: "", cover: null, updatedAt: Date.now() }),
    ...(base ?? {}),
    mangaId,
    bookmarked,
    updatedAt: Date.now(),
  };
  all[mangaId] = merged;
  write(all);
}

export function getEntry(mangaId: string): LibraryEntry | undefined {
  return read()[mangaId];
}

// Image quality preference for the reader. MangaDex serves two versions of
// every page: full-resolution ("original") and a compressed "data-saver"
// copy that's roughly 1/3 the file size. Defaults to data-saver so chapters
// load faster and use less data; the reader lets the user switch to HD.
export type ImageQuality = "saver" | "original";
const QUALITY_KEY = "mangahub.imageQuality.v1";

export function getImageQuality(): ImageQuality {
  if (typeof window === "undefined") return "saver";
  const v = localStorage.getItem(QUALITY_KEY);
  return v === "original" ? "original" : "saver";
}

export function setImageQuality(q: ImageQuality) {
  localStorage.setItem(QUALITY_KEY, q);
  window.dispatchEvent(new CustomEvent("mangahub:quality"));
}