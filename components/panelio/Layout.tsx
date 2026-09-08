import type { ReactNode } from "react";
import { Nav, Footer } from "./Nav";

export function Layout({ children, bare = false }: { children: ReactNode; bare?: boolean }) {
  return (
    <div className="grain min-h-screen bg-[color:var(--ink)] text-[color:var(--paper)]">
      {!bare && <Nav />}
      <main>{children}</main>
      {!bare && <Footer />}
    </div>
  );
}