import type { Metadata, Viewport } from "next";
import "./globals.css";

const themeInitScript = `
  (() => {
    const resolveAutoTheme = () => {
      const hour = new Date().getHours();
      return hour >= 6 && hour < 18 ? "light" : "dark";
    };

    try {
      const savedTheme = localStorage.getItem("crypto-swap-theme");
      const theme =
        savedTheme === "light" || savedTheme === "dark"
          ? savedTheme
          : resolveAutoTheme();
      document.documentElement.dataset.theme = theme;
    } catch {
      document.documentElement.dataset.theme = resolveAutoTheme();
    }
  })();
`;

export const metadata: Metadata = {
  applicationName: "ZyroShift",
  title: {
    default: "ZyroShift",
    template: "%s | ZyroShift",
  },
  description:
    "Non-custodial crypto swap routes with direct-to-wallet settlement, live quotes, and dedicated tracking on ZyroShift.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ZyroShift",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "192x192", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#090611",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="theme-page min-h-full flex flex-col">{children}</body>
    </html>
  );
}
