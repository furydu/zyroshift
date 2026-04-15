import { getPairCanonicalUrl } from "@/lib/pairs/pairMeta";
import type { PairPageSpec } from "@/lib/pairs/types";

export function getPairBreadcrumbSchema(spec: PairPageSpec) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://zyroshift.com/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Swap",
        item: "https://zyroshift.com/swap",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: spec.h1,
        item: getPairCanonicalUrl(spec),
      },
    ],
  };
}

export function getPairFaqSchema(spec: PairPageSpec) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: spec.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function getPairWebPageSchema(spec: PairPageSpec) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: spec.title,
    description: spec.description,
    url: getPairCanonicalUrl(spec),
    about: [
      spec.fromLabel,
      spec.toLabel,
      spec.fromNetworkLabel,
      spec.toNetworkLabel,
    ],
  };
}

export function getPairPageSchemas(spec: PairPageSpec) {
  return [
    getPairBreadcrumbSchema(spec),
    getPairFaqSchema(spec),
    getPairWebPageSchema(spec),
  ];
}
