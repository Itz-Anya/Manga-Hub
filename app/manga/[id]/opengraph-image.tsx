import { ImageResponse } from "next/og";
import { getMangaServer } from "@/lib/mangadex.server";
import { authorNames, coverUrl, pickTitle } from "@/lib/mangadex";

export const runtime = "nodejs";
export const alt = "Manga Hub";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

export default async function OGImage({ params }: { params: { id: string } }) {
  const manga = await getMangaServer(params.id);
  const title = manga ? pickTitle(manga) : "Manga Hub";
  const author = manga ? authorNames(manga).author : "";
  const year = manga?.attributes.year;
  const status = manga?.attributes.status;
  const cover = manga ? coverUrl(manga, 512) : null;
  const tags = (manga?.attributes.tags ?? [])
    .map((t) => t.attributes.name.en)
    .filter(Boolean)
    .slice(0, 4);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#0f0d0b",
          color: "#f4ecdd",
          fontFamily: "serif",
          padding: 60,
        }}
      >
        {cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt=""
            width={340}
            height={510}
            style={{
              objectFit: "cover",
              border: "3px solid #f4ecdd",
              boxShadow: "12px 12px 0 #d1451a",
            }}
          />
        )}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginLeft: cover ? 56 : 0,
            flex: 1,
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontSize: 22,
                letterSpacing: 8,
                textTransform: "uppercase",
                color: "#d1451a",
                fontFamily: "sans-serif",
              }}
            >
              Manga Hub · {status ?? "series"}
              {year ? ` · ${year}` : ""}
            </div>
            <div
              style={{
                fontSize: title.length > 40 ? 68 : 88,
                fontWeight: 800,
                textTransform: "uppercase",
                lineHeight: 1,
                marginTop: 24,
                fontFamily: "sans-serif",
                letterSpacing: -1,
              }}
            >
              {title.slice(0, 60)}
            </div>
            {author && (
              <div style={{ fontSize: 28, fontStyle: "italic", marginTop: 20, color: "#c8bfae" }}>
                by {author}
              </div>
            )}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {tags.map((t) => (
              <div
                key={t}
                style={{
                  border: "1.5px solid #6b6558",
                  padding: "6px 14px",
                  fontSize: 18,
                  textTransform: "uppercase",
                  letterSpacing: 3,
                  color: "#c8bfae",
                  fontFamily: "sans-serif",
                }}
              >
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}