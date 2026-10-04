import type { Metadata, Viewport } from "next";
import { Providers } from "./providers";
import { PWARegister } from "./pwa-register";
import "./globals.css";

const OG_IMAGE = "https://anya-file-host.vercel.app/cznc5nha4b";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);

export const metadata: Metadata = {
  metadataBase: SITE_URL ? new URL(SITE_URL) : undefined,
  title: "Manga Hub — Read manga, printed for the screen",
  description:
    "Manga Hub is an indie manga reader with an editorial, ink-and-paper aesthetic. Browse, bookmark, and read.",
  authors: [{ name: "Anya & Murali" }],
  verification: {
  google: "DnbMYj8vawrOtL3_mAD9QQEMUMVtU2rveaOSlPR4X98",
},
  icons: { icon: "https://i.ibb.co/Gv9rZ4J3/file-00000000f5cc7207bf95c73242084d2c.jpg" },
  manifest: "/manifest.webmanifest",
  applicationName: "Manga Hub",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Manga Hub" },
  openGraph: {
    title: "Manga Hub — Read manga, printed for the screen",
    description: "An indie manga reader with editorial design. Made by Anya & Murali.",
    images: [OG_IMAGE],
    type: "website",
    siteName: "Manga Hub",
  },
  twitter: { card: "summary_large_image", images: [OG_IMAGE] },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f0d0b",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;600;700&family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&display=swap"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
        <PWARegister />
      </body>
    </html>
  );
}
