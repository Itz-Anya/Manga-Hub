<p align="center">
  <img src="https://i.ibb.co/Gv9rZ4J3/file-00000000f5cc7207bf95c73242084d2c.jpg" alt="Manga Hub logo" width="50%" />
</p>

Manga Hub is a simple manga reader. Browse popular series, open a chapter and pick up right where you left off. No accounts and no ads.

It's built with Next.js 15, React 19 and the public [MangaDex](https://mangadex.org) API, and made by Anya and Murali.

## Features

- **Discover:** a grid of popular titles with search, genre filters and infinite scroll.
- **Series pages:** synopsis, credits, tags and the full chapter list, with Open Graph images and structured data for link previews.
- **Reader:** vertical scrolling, a data saver / HD switch and a quick jump to the next chapter.
- **Library:** bookmark series and keep track of your progress. Everything is stored in your browser.
- **Installable:** works as a PWA with cached images and API responses.
- **SEO:** generated sitemap, robots.txt and per-page metadata.

## Tech stack

- Next.js 15 (App Router), React 19 and TypeScript
- TanStack Query with a persisted cache in `localStorage`
- Tailwind CSS 4
- lucide-react for icons
- Bun or npm

## How it works

Manga Hub is a thin front end over the MangaDex API. It has no database and needs no API key.

- `/api/mangadex/[...path]` proxies API requests on the server and adds cache headers.
- `/api/image` proxies page and cover images with the Referer header MangaDex expects.
- Your library, bookmarks and progress live in `localStorage` on your device.
- The About page reads public GitHub stats for the creators and caches them for an hour.

## Getting started

You need Node.js 18.18 or newer, or Bun.

```bash
npm install
npm run dev
```

or

```bash
bun install
bun dev
```

Then open [http://localhost:3000](http://localhost:3000).

| Command | What it does |
|---|---|
| `dev` | Starts the dev server |
| `build` | Builds for production |
| `start` | Runs the production build |
| `lint` | Runs the Next.js lint checks |

No environment variables are required. In production you can set `NEXT_PUBLIC_SITE_URL` so the sitemap and canonical URLs use your domain.

## Deployment

The easiest way to deploy is [Vercel](https://vercel.com). Push the repo, import it and deploy. It also runs on any host that supports Next.js.

## Creators

<p align="center">
  <img src="https://random-images-anya.vercel.app/am" alt="Anya and Murali" />
</p>

## Credits

Manga data, covers and pages come from the [MangaDex API](https://api.mangadex.org). All manga belongs to its creators, publishers and uploaders.

<p align="center">
If you like the project, a star on the repo means a lot.
</p>
