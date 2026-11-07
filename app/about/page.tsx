import Link from "next/link";
import type { Metadata } from "next";
import { Compass, BookOpen, BookMarked, Smartphone } from "lucide-react";
import { Layout } from "@/components/panelio/Layout";
import { Creators } from "@/components/panelio/Creators";
import { CREATORS } from "@/lib/creators";
import { getGithubProfile } from "@/lib/github";

export const metadata: Metadata = {
  title: "About | Manga Hub",
  description: "Manga Hub is a simple, ad-free manga reader made by Anya and Murali.",
};

export const revalidate = 3600;

const FEATURES = [
  {
    Icon: Compass,
    title: "Discover",
    text: "Browse popular series, filter by genre or search for a specific title. Only manga with chapters you can actually read shows up.",
  },
  {
    Icon: BookOpen,
    title: "Read your way",
    text: "Scroll through a chapter page by page, switch between data saver and HD, and jump to the next chapter when you finish.",
  },
  {
    Icon: BookMarked,
    title: "Your library",
    text: "Bookmark series and Manga Hub remembers where you stopped. It all lives on your device, so there's nothing to sign up for.",
  },
  {
    Icon: Smartphone,
    title: "Install it",
    text: "Add Manga Hub to your home screen and it works like an app, with images cached so earlier chapters open fast.",
  },
];

const FACTS = [
  ["No accounts", "Nothing to sign up for"],
  ["No ads", "Just the manga"],
  ["Saved locally", "Progress stays on your device"],
];

export default async function AboutPage() {
  const results = await Promise.all(CREATORS.map((c) => getGithubProfile(c.handle)));
  const profiles = Object.fromEntries(CREATORS.map((c, i) => [c.handle, results[i]]));

  return (
    <Layout>
      <section className="mx-auto max-w-5xl px-5 py-16 md:px-8 md:py-24">
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
          <p className="mt-5 max-w-xl font-[family-name:var(--font-serif)] text-xl italic text-[color:var(--paper-dim)]">
            A quiet place to read manga without the clutter.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-2xl space-y-5 font-[family-name:var(--font-serif)] text-lg leading-relaxed text-[color:var(--paper)]">
          <p>
            Manga Hub started as a small project for people who just want to read. Pick a series, open a chapter and
            go. There are no accounts, no ads and no pop-ups getting in the way.
          </p>
          <p>
            The catalog covers thousands of titles in every genre, from action and romance to horror and slice of
            life. Everything you read is remembered on your device, so you can leave and come back to the exact page
            you stopped on.
          </p>
        </div>

        <dl className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-px overflow-hidden border border-[color:var(--rule)] bg-[color:var(--rule)] sm:grid-cols-3">
          {FACTS.map(([title, text]) => (
            <div key={title} className="bg-[color:var(--panel)] px-5 py-5 text-center">
              <dt className="font-[family-name:var(--font-display)] text-xl uppercase tracking-wide text-[color:var(--paper)]">
                {title}
              </dt>
              <dd className="mt-1 font-[family-name:var(--font-serif)] text-sm italic text-[color:var(--paper-dim)]">
                {text}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-20">
          <p className="font-[family-name:var(--font-display)] text-xs uppercase tracking-[0.4em] text-[color:var(--vermilion)]">
            What you get
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-bold uppercase tracking-tight text-[color:var(--paper)] md:text-5xl">
            Made for reading
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {FEATURES.map(({ Icon, title, text }) => (
              <div key={title} className="panel-border bg-[color:var(--panel)] p-5 transition hover:border-[color:var(--vermilion)]">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--vermilion)]/15 text-[color:var(--vermilion)]">
                    <Icon className="h-4 w-4" />
                  </span>
                  <h3 className="font-[family-name:var(--font-display)] text-xl uppercase tracking-wide text-[color:var(--paper)]">
                    {title}
                  </h3>
                </div>
                <p className="mt-3 font-[family-name:var(--font-serif)] text-base leading-relaxed text-[color:var(--paper-dim)]">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>

        <Creators profiles={profiles} />

        <div className="mt-20 border-t border-[color:var(--rule)] pt-8">
          <p className="font-[family-name:var(--font-display)] text-xs uppercase tracking-[0.4em] text-[color:var(--vermilion)]">
            Good to know
          </p>
          <p className="mt-3 max-w-2xl font-[family-name:var(--font-serif)] text-base leading-relaxed text-[color:var(--paper-dim)]">
            Manga Hub doesn&apos;t host any manga itself. Titles, covers and pages come from the MangaDex API, and
            every series belongs to its creators, publishers and uploaders. If you enjoy something, support the
            official release when you can.
          </p>
          <Link
            href="/"
            className="mt-8 inline-block border-[1.5px] border-[color:var(--paper)] px-5 py-3 font-[family-name:var(--font-display)] text-sm uppercase tracking-widest text-[color:var(--paper)] transition hover:border-[color:var(--vermilion)] hover:bg-[color:var(--vermilion)]"
          >
            Start reading →
          </Link>
        </div>
      </section>
    </Layout>
  );
}
