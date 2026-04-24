import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ZyroShift",
    short_name: "ZyroShift",
    description:
      "Non-custodial crypto swap routes with direct-to-wallet settlement, live quotes, and dedicated tracking on ZyroShift.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#090611",
    theme_color: "#090611",
    icons: [
      {
        src: "/favicon-48x48.png",
        type: "image/png",
        sizes: "48x48",
        purpose: "any",
      },
      {
        src: "/apple-touch-icon.png",
        type: "image/png",
        sizes: "180x180",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        type: "image/png",
        sizes: "512x512",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        type: "image/png",
        sizes: "512x512",
        purpose: "maskable",
      },
    ],
  };
}
