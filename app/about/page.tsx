import Link from "next/link";
import type { Metadata } from "next";
import { Layout } from "@/components/panelio/Layout";
import { Palette, Code2, Github, Send } from "lucide-react";

export const metadata: Metadata = {
  title: "About · Manga Hub",
  description: "Manga Hub is an editorially-minded manga reader by Anya & Murali.",
};

const CREATORS = [
  {
    name: "Anya",
    role: "Designer & Developer",
    tag: "Frontend",
    Icon: Palette,
    accent: "linear-gradient(135deg, oklch(0.75 0.18 320), oklch(0.7 0.2 350))",
    chipBg: "bg-fuchsia-500/15 text-fuchsia-300",
    img: "https://random-images-anya.vercel.app/anya",
    github: "https://github.com/itz-Anya",
    githubLabel: "GitHub — itz-Anya",
    telegram: "https://t.me/SylveonLab",
    telegramLabel: "Telegram — SylveonLab",
    quote: "Crafts the calm.",
  },
  {
    name: "Murali",
    role: "API Owner & Pro Coder",
    tag: "Backend",
    Icon: Code2,
    accent: "linear-gradient(135deg, oklch(0.7 0.18 50), oklch(0.65 0.2 25))",
    chipBg: "bg-orange-500/15 text-orange-300",
    img: "https://itz-murali-images.vercel.app/api",
    github: "https://github.com/Itz-Murali",
    githubLabel: "GitHub — Itz-Murali",
    telegram: "https://t.me/ChikuBots",
    telegramLabel: "Telegram — ChikuBots",
    quote: "Powers the engine.",
  },
];

export default function AboutPage() {
  return (
    <Layout>
      <section className="mx-auto max-w-4xl px-5 py-16 md:px-8 md:py-24">
        <div className="flex flex-col items-center text-center">
          <div className="panel-border relative overflow-hidden">
            <img
              src="https://i.ibb.co/Gv9rZ4J3/file-00000000f5cc7207bf95c73242084d2c.jpg"
              alt="Manga Hub"
              className="h-32 w-32 object-cover md:h-40 md:w-40"
              referrerPolicy="no-referrer"
            />
          </div>
          <p className="mt-6 font-[family-name:var(--font-display)] text-xs uppercase tracking-[0.4em] text-[color:var(--vermilion)]">
            About
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-5xl font-bold uppercase leading-[0.9] tracking-tight text-[color:var(--paper)] md:text-7xl">
            Manga <span className="italic text-[color:var(--vermilion)]">Hub</span>
          </h1>
        </div>

        <div className="mx-auto mt-10 max-w-2xl space-y-6 font-[family-name:var(--font-serif)] text-lg leading-relaxed text-[color:var(--paper)]">
          <p>
            Manga Hub is an indie reading room built for readers who love the
            medium. Discover trending series, jump straight into a chapter, and
            keep your progress in a personal library — no accounts, no ads, no
            noise. Just manga.
          </p>
          <p>
            The catalog spans thousands of titles across every genre — action,
            romance, comedy, drama, fantasy, sci-fi, slice of life, horror,
            mystery, sports and more. Filter by tag, search by title, and read
            in either page-flip or long-scroll mode with adjustable brightness.
          </p>
          <p className="text-[color:var(--paper-dim)] italic">
            Everything you read is remembered locally on your device, so you
            can pick up exactly where you left off — even on the next visit.
          </p>
        </div>

        <div className="mt-16">
          <p className="font-[family-name:var(--font-display)] text-xs uppercase tracking-[0.4em] text-[color:var(--vermilion)]">Credits</p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-bold uppercase tracking-tight text-[color:var(--paper)] md:text-5xl">
            Built by two
          </h2>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {CREATORS.map((c) => {
              const Icon = c.Icon;
              return (
                <div
                  key={c.name}
                  className="panel-border relative overflow-hidden bg-[color:var(--panel)] p-6"
                >
                  <div
                    className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-40 blur-3xl"
                    style={{ background: c.accent }}
                    aria-hidden
                  />
                  <div className="flex items-start gap-4">
                    <img
                      referrerPolicy="no-referrer"
                      src={c.img}
                      alt={c.name}
                      className="h-20 w-20 rounded-full border border-[color:var(--rule)] object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-[family-name:var(--font-display)] text-2xl uppercase tracking-tight text-[color:var(--paper)]">
                          {c.name}
                        </h3>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-[family-name:var(--font-display)] uppercase tracking-widest ${c.chipBg}`}
                        >
                          <Icon className="h-3 w-3" /> {c.tag}
                        </span>
                      </div>
                      <p className="mt-1 font-[family-name:var(--font-serif)] text-sm italic text-[color:var(--paper-dim)]">
                        {c.role}
                      </p>
                      <p className="mt-3 font-[family-name:var(--font-serif)] text-base text-[color:var(--paper)]">
                        “{c.quote}”
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <a
                          href={c.github}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 border border-[color:var(--rule)] px-2.5 py-1 font-[family-name:var(--font-display)] text-[11px] uppercase tracking-widest text-[color:var(--paper)] transition hover:border-[color:var(--vermilion)] hover:text-[color:var(--vermilion)]"
                        >
                          <Github className="h-3 w-3" /> {c.githubLabel}
                        </a>
                        <a
                          href={c.telegram}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 border border-[color:var(--rule)] px-2.5 py-1 font-[family-name:var(--font-display)] text-[11px] uppercase tracking-widest text-[color:var(--paper)] transition hover:border-[color:var(--vermilion)] hover:text-[color:var(--vermilion)]"
                        >
                          <Send className="h-3 w-3" /> {c.telegramLabel}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Link
          href="/"
          className="mt-12 inline-block border-[1.5px] border-[color:var(--paper)] px-5 py-3 font-[family-name:var(--font-display)] text-sm uppercase tracking-widest text-[color:var(--paper)] transition hover:bg-[color:var(--vermilion)] hover:border-[color:var(--vermilion)]"
        >
          Enter the reader →
        </Link>
      </section>
    </Layout>
  );
}