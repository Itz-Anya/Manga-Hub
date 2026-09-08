"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, BookMarked, Info } from "lucide-react";

const LOGO = "https://i.ibb.co/Gv9rZ4J3/file-00000000f5cc7207bf95c73242084d2c.jpg";

export function Nav() {
  const path = usePathname() || "/";
  const items = [
    { to: "/", label: "Discover", Icon: Compass },
    { to: "/library", label: "Library", Icon: BookMarked },
    { to: "/about", label: "About", Icon: Info },
  ] as const;
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[color:var(--rule)] bg-[color:var(--ink)]/85 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-6 px-5 py-3 md:px-8">
          <Link href="/" className="group flex items-center gap-3">
            <img src={LOGO} alt="Manga Hub" className="h-9 w-9 rounded-md object-cover ring-1 ring-[color:var(--rule)]" />
            <span className="font-[family-name:var(--font-display)] text-2xl font-bold uppercase tracking-[0.02em] text-[color:var(--paper)]">
              Manga <span className="text-[color:var(--vermilion)]">Hub</span>
            </span>
          </Link>
          <span className="hidden font-[family-name:var(--font-serif)] text-xs italic text-[color:var(--paper-dim)] sm:inline">
            by Anya & Murali
          </span>
        </div>
      </header>

      <nav className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
        <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-[color:var(--rule)] bg-[color:var(--ink)]/95 p-1.5 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] backdrop-blur">
          {items.map(({ to, label, Icon }) => {
            const active = to === "/" ? path === "/" : path.startsWith(to);
            return (
              <Link
                key={to}
                href={to}
                className={`flex items-center gap-2 rounded-full px-3.5 py-2 text-[11px] uppercase tracking-[0.18em] transition-colors md:px-4 md:text-xs ${
                  active
                    ? "bg-[color:var(--vermilion)] text-[color:var(--paper)]"
                    : "text-[color:var(--paper-dim)] hover:text-[color:var(--paper)]"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="font-[family-name:var(--font-display)]">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

export function Footer() {
  return (
    <footer className="mt-24 border-t border-[color:var(--rule)] bg-[color:var(--ink)] pb-24">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-5 py-8 md:flex-row md:items-center md:justify-between md:px-8">
        <p className="font-[family-name:var(--font-serif)] text-sm italic text-[color:var(--paper-dim)]">
          Printed for the screen. Crafted by <span className="text-[color:var(--paper)]">Anya</span> &amp; <span className="text-[color:var(--paper)]">Murali</span>.
        </p>
        <p className="font-[family-name:var(--font-display)] text-xs uppercase tracking-[0.3em] text-[color:var(--paper-faint)]">
          Vol. 01 · Iss. 001
        </p>
      </div>
    </footer>
  );
}