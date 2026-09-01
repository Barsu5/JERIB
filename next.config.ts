import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  // COOP/COEP help WASM threads used by background-removal
  async headers() {
    const coop = [
      { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
      { key: "Cross-Origin-Embedder-Policy", value: "credentialless" },
    ];
    return [
      {
        // Fresh HTML after each deploy — no stale cached pages on Render
        source: "/((?!_next/static|_next/image|brand|garments|favicon.ico).*)",
        headers: [...coop, { key: "Cache-Control", value: "no-store, max-age=0" }],
      },
    ];
  },
};

export default nextConfig;
