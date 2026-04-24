import { isGuideIndexLaunchSlug } from "@/lib/guides/guideRollout";
import type { GuidePageSpec } from "@/lib/guides/types";
import type { Metadata } from "next";

const SITE_URL = "https://zyroshift.com";

export function getGuideCanonicalUrl(spec: GuidePageSpec) {
  return `${SITE_URL}${spec.guideHref}`;
}

export function getGuidePageMetadata(spec: GuidePageSpec): Metadata {
  const canonical = getGuideCanonicalUrl(spec);
  const shouldIndex = isGuideIndexLaunchSlug(spec.slug);

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
      type: "article",
      siteName: "ZyroShift",
    },
    twitter: {
      card: "summary_large_image",
      title: spec.title,
      description: spec.description,
    },
  };
}
