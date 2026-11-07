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
  },
  {
    Icon: BookOpen,
    title: "Read your way",
  },
  {
    Icon: BookMarked,
    title: "Your library",
  },
  {
    Icon: Smartphone,
    title: "Install it",
  },
];

const FACTS = ["No accounts", "No ads", "Saved locally"];

export default async function AboutPage() {
  const results = await Promise.all(CREATORS.map((c) => getGithubProfile(c.handle)));
  const profiles = Object.fromEntries(CREATORS.map((c, i) => [c.handle, results[i]]));

  return (
    <Layout>
      <section className="mx-auto w-full max-w-[1200px] px-4 py-12 sm:px-6 md:px-8 md:py-20">
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

        <p className="mx-auto mt-8 max-w-2xl text-center font-[family-name:var(--font-serif)] text-lg leading-relaxed text-[color:var(--paper)] md:text-xl">
          A simple place to read manga. No accounts, no ads.
        </p>

        <dl className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-px overflow-hidden border border-[color:var(--rule)] bg-[color:var(--rule)] sm:grid-cols-3">
          {FACTS.map((title) => (
            <div key={title} className="bg-[color:var(--panel)] px-5 py-4 text-center">
              <dt className="font-[family-name:var(--font-display)] text-lg uppercase tracking-wide text-[color:var(--paper)]">
                {title}
              </dt>
            </div>
          ))}
        </dl>

        <div className="mt-16">
          <p className="font-[family-name:var(--font-display)] text-xs uppercase tracking-[0.4em] text-[color:var(--vermilion)]">
            What you get
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-bold uppercase tracking-tight text-[color:var(--paper)] md:text-5xl">
            Made for reading
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ Icon, title }) => (
              <div key={title} className="panel-border bg-[color:var(--panel)] p-4 transition hover:border-[color:var(--vermilion)]">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--vermilion)]/15 text-[color:var(--vermilion)]">
                    <Icon className="h-4 w-4" />
                  </span>
                  <h3 className="font-[family-name:var(--font-display)] text-xl uppercase tracking-wide text-[color:var(--paper)]">
                    {title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Creators profiles={profiles} />

        <div className="mt-16 border-t border-[color:var(--rule)] pt-8">
          <p className="font-[family-name:var(--font-display)] text-xs uppercase tracking-[0.4em] text-[color:var(--vermilion)]">
            Credits
          </p>
          <p className="mt-3 max-w-2xl font-[family-name:var(--font-serif)] text-base leading-relaxed text-[color:var(--paper-dim)]">
            All manga is provided by the MangaDex API and belongs to its creators and publishers.
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
