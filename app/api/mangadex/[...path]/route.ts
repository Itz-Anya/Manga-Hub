import { NextRequest } from "next/server";

const API = "https://api.mangadex.org";

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const url = new URL(request.url);
  const target = `${API}/${(path ?? []).join("/")}${url.search}`;
  try {
    const res = await fetch(target, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    const body = await res.text();
    return new Response(body, {
      status: res.status,
      headers: {
        "content-type": res.headers.get("content-type") ?? "application/json",
        "cache-control": "public, max-age=300, s-maxage=600, stale-while-revalidate=86400",
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "upstream_failed", message: String(e) }), {
      status: 502,
      headers: { "content-type": "application/json" },
    });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";