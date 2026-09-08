
<p align="center">
  <img src="https://i.ibb.co/Gv9rZ4J3/file-00000000f5cc7207bf95c73242084d2c.jpg" alt="Manga Hub logo" width="50%" />
</p>


An indie manga reader with an editorial, ink-and-paper aesthetic — browse trending titles, dive into a chapter, and pick up right where you left off. No accounts, no ads, just manga.

Built with Next.js 15, React 19, and the public [MangaDex](https://mangadex.org) API. Made by Anya & Murali.

## Features

- **Discover feed** — an editorial, magazine-style grid of trending and searchable titles, filterable by genre tag, with infinite scroll pagination.
- **Series pages** — synopsis, author/artist credits, tags, and a full chapter list, with dynamic Open Graph images and JSON-LD structured data for rich search/social previews.
- **Reader** — page-by-page **flip** mode or continuous **scroll** mode, adjustable brightness, and previous/next chapter navigation.
- **Personal library** — bookmark series, automatically track "continue reading" progress, and browse your reading history — all stored locally in the browser, no login required.
- **Installable PWA** — a service worker provides an app shell, offline caching for images and API responses, and installability on mobile/desktop.
- **SEO-ready** — dynamic `sitemap.xml`, `robots.txt`, and per-page metadata out of the box.

## Tech Stack

- **Framework:** Next.js 15 (App Router) with React 19 and TypeScript
- **Data fetching & caching:** TanStack Query, with a persisted client cache in `localStorage`
- **Styling:** Tailwind CSS 4
- **Icons:** lucide-react
- **Package manager:** Bun (a `bun.lock` is included) or npm

## How It Works

Manga Hub is a thin, editorial front end over the MangaDex API — it stores no data of its own and requires no database, sign-up, or API key.

- `/api/mangadex/[...path]` proxies requests to the MangaDex API server-side, adding cache headers so repeated requests are fast and don't hit the upstream API unnecessarily.
- `/api/image` proxies MangaDex's page/cover images with the correct `Referer` header (required by MangaDex's CDN) so images load reliably in the browser.
- Your library, bookmarks, and reading progress live entirely in `localStorage` on your device — there's no backend database.

## Getting Started

Requires Node.js 18.18+ (or Bun).

```bash
# with npm
npm install
npm run dev

# or with Bun
bun install
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Available Scripts

| Command | Description |
|---|---|
| `dev` | Start the development server |
| `build` | Build the app for production |
| `start` | Run the production build |
| `lint` | Run Next.js/ESLint checks |

No environment variables are required to run the app locally. Optionally set `NEXT_PUBLIC_SITE_URL` in production so the generated sitemap and canonical URLs point to your deployed domain.

## Deployment

This project is ready to deploy on [Vercel](https://vercel.com) out of the box:

1. Push the repository to GitHub/GitLab/Bitbucket.
2. Import it into Vercel.
3. Deploy — no environment variables are required.

It should also run on any host that supports Next.js (Node.js server or edge runtime), since it makes no assumptions specific to Vercel beyond reading `VERCEL_URL` as a convenience fallback for the site URL.

## 👩‍💻 Creators

<table width="100%">
    <tr>
      <td align="center" width="50%">
        <img src="https://random-images-anya.vercel.app/anya" width="260"><br><br>
        <b>𝜜ɴყꫝㅤ𓆩💗𓆪</b><br><br>
        <a href="https://github.com/itz-Anya">
          <img src="https://img.shields.io/badge/GitHub-Itz--Anya-black?style=for-the-badge&logo=github">
        </a>
      </td>
      <td align="center" width="50%">
        <img src="https://itz-murali-images.vercel.app/api" width="260"><br><br>
        <b>𝐌 𝐔 𝐑 𝚨 𝐋 𝐈 𓂃ִֶָ⋆.˚</b><br><br>
        <a href="https://github.com/Itz-Murali">
          <img src="https://img.shields.io/badge/GitHub-Itz--Murali-black?style=for-the-badge&logo=github">
        </a>
      </td>
    </tr>
  </table>


---


Manga metadata, covers, and pages are provided via the [MangaDex API](https://api.mangadex.org). All manga content belongs to its respective creators, publishers, and uploaders.


---


<p align="center">
⭐ If you like this project, don’t forget to star the repo!
</p>  
