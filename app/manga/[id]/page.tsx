import type { Metadata } from "next";
import Script from "next/script";
import MangaDetailClient from "./MangaDetailClient";
import { getMangaServer } from "@/lib/mangadex.server";
import { authorNames, coverUrl, pickDescription, pickTitle } from "@/lib/mangadex";

type Params = { id: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  const manga = await getMangaServer(id);
  if (!manga) {
    return {
      title: "Manga not found — Manga Hub",
      description: "This title couldn't be loaded.",
    };
  }
  const title = pickTitle(manga);
  const desc = (pickDescription(manga) || `${title} on Manga Hub.`).slice(0, 200);
  const cover = coverUrl(manga, 512);
  const url = `/manga/${id}`;
  const ogImage = `${url}/opengraph-image`;
  return {
    title: `${title} — Manga Hub`,
    description: desc,
    alternates: { canonical: url },
    openGraph: {
      type: "book",
      url,
      title,
      description: desc,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: [ogImage],
    },
    other: cover ? { "og:image:secondary": cover } : undefined,
  };
}

export default async function MangaPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const manga = await getMangaServer(id);

  const jsonLd = manga
    ? {
        "@context": "https://schema.org",
        "@type": "ComicSeries",
        name: pickTitle(manga),
        description: pickDescription(manga) || undefined,
        image: coverUrl(manga, 512) || undefined,
        inLanguage: manga.attributes.originalLanguage,
        datePublished: manga.attributes.year ? String(manga.attributes.year) : undefined,
        author: { "@type": "Person", name: authorNames(manga).author },
        creator: { "@type": "Person", name: authorNames(manga).artist },
        genre: manga.attributes.tags
          .map((t) => t.attributes.name.en)
          .filter(Boolean)
          .slice(0, 8),
        url: `/manga/${id}`,
      }
    : null;

  return (
    <>
      {jsonLd && (
        <Script
          id={`ldjson-manga-${id}`}
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <MangaDetailClient id={id} />
    </>
  );
}