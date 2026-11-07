import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED = /^https:\/\/[^/]+\.mangadex\.(org|network)(:\d+)?\//;

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const target = url.searchParams.get("url");
  if (!target || !ALLOWED.test(target)) {
    return new Response("bad url", { status: 400 });
  }
  try {
    const res = await fetch(target, {
      headers: { Referer: "https://mangadex.org/", Accept: "image/*,*/*" },
      cache: "no-store",
    });
    if (!res.ok || !res.body) {
      return new Response(`upstream ${res.status}`, { status: res.status });
    }
    return new Response(res.body, {
      status: 200,
      headers: {
        "content-type": res.headers.get("content-type") ?? "image/jpeg",
        "cache-control": "public, max-age=86400, immutable",
      },
    });
  } catch (e) {
    return new Response(String(e), { status: 502 });
  }
}