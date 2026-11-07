"use client";

import { useEffect, useRef, useState } from "react";
import { Github, Code2, Send } from "lucide-react";
import type { GithubProfile } from "@/lib/github";
import { CREATORS, type Creator } from "@/lib/creators";

const STACK = ["Next.js", "React", "Tailwind CSS", "MangaDex API", "Vercel"];
const PALETTE = ["#e0457b", "#7c5cff", "#14a38b", "#f59e0b"];

const githubUrl = (handle: string) => `https://github.com/${handle}`;

function useReveal() {
  const ref = useRef<HTMLElement | null>(null);
  const [live, setLive] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (
      !el ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      typeof IntersectionObserver === "undefined"
    ) {
      return undefined;
    }
    setLive(false);
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        setLive(true);
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return [ref, live] as const;
}

function CreatorBanner({ src, accent }: { src: string; accent: string }) {
  const [state, setState] = useState<"loading" | "ready" | "broken">("loading");
  const ref = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = ref.current;
    if (img && img.complete) setState(img.naturalWidth > 0 ? "ready" : "broken");
  }, [src]);

  return (
    <div className="relative h-32 w-full overflow-hidden md:h-40" aria-hidden="true">
      <div className="absolute inset-0 opacity-70" style={{ background: accent }} />
      {state !== "broken" && (
        <img
          ref={ref}
          src={src}
          alt=""
          width={1200}
          height={400}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onLoad={() => setState("ready")}
          onError={() => setState("broken")}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            state === "ready" ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
      <div className="halftone absolute inset-0 opacity-30 mix-blend-multiply" />
      <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--panel)] via-transparent to-transparent" />
    </div>
  );
}

function CreatorPhoto({ src, alt, accent }: { src: string; alt: string; accent: string }) {
  const [broken, setBroken] = useState(false);
  const ref = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setBroken(true);
  }, [src]);

  return (
    <div className="relative h-24 w-24 md:h-28 md:w-28">
      <span
        className="absolute -inset-1.5 rounded-full opacity-80 blur-md"
        style={{ background: accent }}
        aria-hidden="true"
      />
      {broken ? (
        <div className="relative flex h-full w-full items-center justify-center rounded-full border-2 border-[color:var(--panel)] bg-[color:var(--ink)] font-[family-name:var(--font-display)] text-4xl uppercase text-[color:var(--paper)]">
          {alt.charAt(0)}
        </div>
      ) : (
        <img
          ref={ref}
          src={src}
          alt={alt}
          width={160}
          height={160}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setBroken(true)}
          className="relative h-full w-full rounded-full border-2 border-[color:var(--panel)] bg-[color:var(--ink)] object-cover"
        />
      )}
    </div>
  );
}

function Count({ to, live }: { to: number; live: boolean }) {
  const [shown, setShown] = useState(to);
  const armed = useRef(false);

  useEffect(() => {
    if (!live) {
      armed.current = true;
      setShown(0);
      return undefined;
    }
    if (!armed.current) return undefined;

    const duration = 1400;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setShown(Math.round(to * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [to, live]);

  return <>{shown.toLocaleString()}</>;
}

function Tiles({ profile, live }: { profile: GithubProfile; live: boolean }) {
  const items: [string, number][] = [
    ["Followers", profile.followers],
    ["Repos", profile.repos],
    ["Stars", profile.stars],
    ["Forks", profile.forks],
  ];
  return (
    <dl className="mt-5 grid grid-cols-4 gap-px overflow-hidden border border-[color:var(--rule)] bg-[color:var(--rule)]">
      {items.map(([label, value]) => (
        <div key={label} className="bg-[color:var(--ink)] px-1 py-3 text-center">
          <dd className="font-[family-name:var(--font-display)] text-xl tabular-nums text-[color:var(--paper)] md:text-2xl">
            <Count to={value} live={live} />
          </dd>
          <dt className="mt-0.5 font-[family-name:var(--font-display)] text-[9px] uppercase tracking-[0.2em] text-[color:var(--paper-faint)] md:text-[10px]">
            {label}
          </dt>
        </div>
      ))}
    </dl>
  );
}

function Languages({ items }: { items: GithubProfile["languages"] }) {
  if (!items.length) return null;
  return (
    <div className="mt-5">
      <p className="font-[family-name:var(--font-display)] text-[10px] uppercase tracking-[0.3em] text-[color:var(--paper-faint)]">
        Most used
      </p>
      <div
        className="mt-2 flex h-1.5 w-full gap-0.5 overflow-hidden rounded-full"
        role="img"
        aria-label={items.map((l) => `${l.name} ${Math.round(l.share)}%`).join(", ")}
      >
        {items.map((l, i) => (
          <i key={l.name} style={{ flexGrow: l.share, background: PALETTE[i % PALETTE.length] }} />
        ))}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
        {items.map((l, i) => (
          <li
            key={l.name}
            className="flex items-center gap-1.5 font-[family-name:var(--font-serif)] text-sm text-[color:var(--paper-dim)]"
          >
            <i className="h-2 w-2 rounded-full" style={{ background: PALETTE[i % PALETTE.length] }} />
            {l.name}
            <b className="font-[family-name:var(--font-display)] text-xs font-normal text-[color:var(--paper-faint)]">
              {Math.round(l.share)}%
            </b>
          </li>
        ))}
      </ul>
    </div>
  );
}

const buttonBase =
  "inline-flex min-w-0 items-center justify-center gap-2 border-[1.5px] px-4 py-2.5 font-[family-name:var(--font-display)] text-xs uppercase tracking-widest transition";

function CreatorCard({ creator, profile, index }: { creator: Creator; profile?: GithubProfile | null; index: number }) {
  const [ref, live] = useReveal();
  const profileUrl = githubUrl(creator.handle);

  return (
    <article
      ref={ref}
      data-live={live}
      style={{ transitionDelay: `${index * 120}ms` }}
      className="panel-border relative overflow-hidden bg-[color:var(--panel)] transition-all duration-700 data-[live=false]:translate-y-8 data-[live=false]:opacity-0"
    >
      <CreatorBanner src={creator.banner} accent={creator.accent} />

      <div className="px-4 pb-6 sm:px-5 md:px-7 md:pb-7">
        <div className="-mt-12 md:-mt-14">
          <CreatorPhoto src={creator.img} alt={creator.plain} accent={creator.accent} />
        </div>

        <h3
          className="mt-4 font-[family-name:var(--font-display)] break-words text-2xl tracking-wide text-[color:var(--paper)] sm:text-3xl"
          aria-label={creator.plain}
        >
          <span aria-hidden="true">{creator.name}</span>
        </h3>
        <a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-flex items-center gap-1.5 font-[family-name:var(--font-serif)] text-base italic text-[color:var(--paper-dim)] transition hover:text-[color:var(--vermilion)]"
        >
          <Github className="h-3.5 w-3.5" /> @{creator.handle}
        </a>

        {profile?.bio && (
          <p className="mt-3 font-[family-name:var(--font-serif)] text-base text-[color:var(--paper)]">{profile.bio}</p>
        )}
        {profile?.location && (
          <p className="mt-1 font-[family-name:var(--font-serif)] text-sm text-[color:var(--paper-faint)]">
            {profile.location}
          </p>
        )}

        {profile && <Tiles profile={profile} live={live} />}
        {profile && <Languages items={profile.languages} />}

        <div className="mt-6 border-t border-[color:var(--rule)] pt-5">
          <div className="flex items-center justify-between gap-3">
            <span className="font-[family-name:var(--font-display)] text-[10px] uppercase tracking-[0.3em] text-[color:var(--paper-faint)]">
              About
            </span>
            <b className="rounded-full bg-[color:var(--vermilion)]/15 px-2.5 py-0.5 font-[family-name:var(--font-display)] text-[10px] font-normal uppercase tracking-widest text-[color:var(--vermilion)]">
              {creator.role}
            </b>
          </div>
          <p className="mt-3 font-[family-name:var(--font-serif)] text-base leading-relaxed text-[color:var(--paper)]">
            {creator.about}
          </p>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {creator.focus.map((f) => (
              <li
                key={f}
                className="border border-[color:var(--rule)] px-2 py-1 font-[family-name:var(--font-display)] text-[10px] uppercase tracking-widest text-[color:var(--paper-dim)]"
              >
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-2 min-[420px]:grid-cols-3 lg:flex lg:flex-wrap">
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${creator.handle} on GitHub`}
            className={`${buttonBase} border-[color:var(--vermilion)] bg-[color:var(--vermilion)] text-[color:var(--paper)] hover:brightness-110`}
          >
            <Github className="h-3.5 w-3.5" /> View profile
          </a>
          <a
            href={`${profileUrl}?tab=repositories`}
            target="_blank"
            rel="noopener noreferrer"
            className={`${buttonBase} border-[color:var(--rule)] text-[color:var(--paper)] hover:border-[color:var(--paper)]`}
          >
            <Code2 className="h-3.5 w-3.5" /> Repositories
          </a>
          <a
            href={`https://t.me/${creator.telegram}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`${buttonBase} border-[color:var(--rule)] text-[color:var(--paper)] hover:border-[color:var(--paper)]`}
          >
            <Send className="h-3.5 w-3.5" /> Telegram
          </a>
        </div>
      </div>
    </article>
  );
}

export function Creators({ profiles = {} }: { profiles?: Record<string, GithubProfile | null> }) {
  return (
    <section className="mt-16 md:mt-20" aria-labelledby="creators-h">
      <div className="text-center">
        <p className="font-[family-name:var(--font-display)] text-xs uppercase tracking-[0.4em] text-[color:var(--vermilion)]">
          The team
        </p>
        <h2
          id="creators-h"
          className="mt-2 font-[family-name:var(--font-display)] text-4xl font-bold uppercase tracking-tight text-[color:var(--paper)] md:text-5xl"
        >
          Creators
        </h2>
      </div>

      <div className="relative mt-8 overflow-hidden md:mt-10">
        <span
          className="pointer-events-none absolute left-0 top-10 h-48 w-48 md:h-64 md:w-64 rounded-full bg-fuchsia-500/10 blur-3xl"
          aria-hidden="true"
        />
        <span
          className="pointer-events-none absolute right-0 bottom-24 h-48 w-48 md:h-64 md:w-64 rounded-full bg-orange-500/10 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-2">
          {CREATORS.map((c, i) => (
            <CreatorCard key={c.key} creator={c} profile={profiles[c.handle]} index={i} />
          ))}
        </div>

        <div className="relative mt-6 flex flex-col gap-3 border border-[color:var(--rule)] px-5 py-4 md:flex-row md:items-center md:justify-between">
          <span className="font-[family-name:var(--font-display)] text-[10px] uppercase tracking-[0.3em] text-[color:var(--paper-faint)]">
            Built with
          </span>
          <ul className="flex flex-wrap gap-2">
            {STACK.map((s) => (
              <li
                key={s}
                className="rounded-full border border-[color:var(--rule)] px-3 py-1 font-[family-name:var(--font-display)] text-[11px] uppercase tracking-widest text-[color:var(--paper-dim)]"
              >
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
