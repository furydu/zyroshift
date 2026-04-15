import { isPairLaunchSlug } from "@/lib/pairs/launchSet";
import type { PairPageSpec } from "@/lib/pairs/types";
import type { Metadata } from "next";

const SITE_URL = "https://zyroshift.com";

export function getPairCanonicalUrl(spec: PairPageSpec) {
  return `${SITE_URL}/swap/${spec.slug}`;
}

export function getPairPageMetadata(spec: PairPageSpec): Metadata {
  const canonical = getPairCanonicalUrl(spec);
  const shouldIndex = isPairLaunchSlug(spec.slug);

  return {
    title: spec.title,
    description: spec.description,
    robots: shouldIndex
      ? {
          index: true,
          follow: true,
        }
      : {
          index: false,
          follow: true,
        },
    alternates: {
      canonical,
    },
    openGraph: {
      title: spec.title,
      description: spec.description,
      url: canonical,
      type: "website",
      siteName: "ZyroShift",
    },
    twitter: {
      card: "summary_large_image",
      title: spec.title,
      description: spec.description,
    },
  };
}
