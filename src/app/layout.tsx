import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-BHDSC1T4H1";

const themeInitScript = `
  (() => {
    const STORAGE_KEY = "crypto-swap-theme";

    const resolveAutoTheme = () => {
      const hour = new Date().getHours();
      return hour >= 6 && hour < 18 ? "light" : "dark";
    };

    const resolvePreference = () => {
      try {
        const savedTheme = localStorage.getItem(STORAGE_KEY);
        return savedTheme === "light" || savedTheme === "dark" || savedTheme === "auto"
          ? savedTheme
          : "auto";
      } catch {
        return "auto";
      }
    };

    const applyTheme = (themePreference) => {
      const theme =
        themePreference === "light" || themePreference === "dark"
          ? themePreference
          : resolveAutoTheme();
      document.documentElement.dataset.theme = theme;
    };

    applyTheme(resolvePreference());

    document.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const toggle = target.closest("[data-theme-toggle]");
      if (!toggle) {
        return;
      }

      event.preventDefault();

      const currentTheme =
        document.documentElement.dataset.theme === "light" ? "light" : "dark";
      const nextTheme = currentTheme === "dark" ? "light" : "dark";

      document.documentElement.dataset.theme = nextTheme;

      try {
        localStorage.setItem(STORAGE_KEY, nextTheme);
      } catch {}
    });
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
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
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
