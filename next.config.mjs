/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: import.meta.dirname,
  turbopack: { root: import.meta.dirname },
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "uploads.mangadex.org" },
      { protocol: "https", hostname: "i.ibb.co" },
      { protocol: "https", hostname: "anya-file-host.vercel.app" },
    ],
  },
};

export default nextConfig;