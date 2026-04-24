import { HomePage } from "@/components/home/HomePage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ZyroShift | Non-Custodial Crypto Swap with Live Routes",
  description:
    "Swap across supported tokens and networks with non-custodial variable-rate and fixed-quote flows, then track each shift on a dedicated status page.",
};

const siteUrl = "https://zyroshift.com";
const organizationId = `${siteUrl}/#organization`;

const homeJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": organizationId,
      name: "ZyroShift",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/icon-512.png`,
        width: 512,
        height: 512,
      },
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: "ZyroShift",
      url: siteUrl,
      publisher: {
        "@id": organizationId,
      },
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />
      <HomePage />
    </>
  );
}
