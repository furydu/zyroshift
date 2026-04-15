import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-BHDSC1T4H1";

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
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: [{ url: "/icon-512.png", type: "image/png" }],
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
      <body className="theme-page min-h-full flex flex-col">
        <Script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
        {children}
      </body>
    </html>
  );
}
