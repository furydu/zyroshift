export function getPriceBreadcrumbSchema(tokenLabel: string, url: string) {
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
        name: "Prices",
        item: "https://zyroshift.com/prices",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `${tokenLabel} Price Today`,
        item: url,
      },
    ],
  };
}

export function getPriceFaqSchema(
  faqs: Array<{
    question: string;
    answer: string;
  }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function getPriceWebPageSchema({
  title,
  description,
  url,
  tokenLabel,
  tokenName,
  supportedNetworkCount,
}: {
  title: string;
  description: string;
  url: string;
  tokenLabel: string;
  tokenName: string;
  supportedNetworkCount: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url,
    about: [tokenLabel, tokenName, `Supported on ${supportedNetworkCount} networks`],
  };
}
