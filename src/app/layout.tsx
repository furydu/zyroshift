import type { Metadata } from "next";
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
  title: "Crypto Swap MVP",
  description: "Server-proxied swap flow prototype powered by SideShift.",
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
