import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Capacitor (mobile) and Electron (desktop) load the app from local files,
  // so the build has to be a fully static site in `out/`.
  output: "export",
  images: {
    unoptimized: true,
  },
  // Emits `out/about/index.html` instead of `out/about.html`, which is what
  // the Capacitor/Electron file handlers expect.
  trailingSlash: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
