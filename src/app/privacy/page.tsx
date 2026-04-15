import { LegalPageTemplate } from "@/components/legal/LegalPageTemplate";
import type { Metadata } from "next";

const PRIVACY_SECTIONS = [
  {
    title: "Overview",
    paragraphs: [
      "This Privacy Policy describes how ZyroShift collects, uses, stores, and shares personal information when you use zyroshift.com, its route pages, its status pages, and related services.",
      "Because ZyroShift is a direct-to-wallet crypto service, some information connected to your transactions may also become visible on public blockchains by design.",
    ],
  },
  {
    title: "Information you provide",
    paragraphs: [
      "You may provide information directly when you use the service, contact support, submit a route, or respond to a compliance or support request.",
    ],
    bullets: [
      "Wallet addresses and destination addresses",
      "Selected assets, networks, and route preferences",
      "Shift IDs, transaction details, and support messages",
      "Any additional information you provide when we review or troubleshoot a route",
    ],
  },
  {
    title: "Information collected automatically",
    paragraphs: [
      "We and our infrastructure providers may automatically collect technical data needed to run, secure, and improve the service.",
    ],
    bullets: [
      "IP address, browser type, operating system, device details, and language settings",
      "General usage data such as pages viewed, links clicked, and route interaction timing",
      "Error logs, diagnostics, request metadata, and security-related event records",
      "Cookies, local storage, and similar browser-side settings used to keep the service functional",
    ],
  },
  {
    title: "Public blockchain data",
    paragraphs: [
      "If you use the service to prepare or complete a crypto route, wallet addresses, transaction hashes, transferred amounts, and settlement activity may appear on public blockchains and remain visible there permanently or for as long as the relevant network preserves its history.",
      "ZyroShift cannot remove information that has already been written to a public blockchain.",
    ],
  },
  {
    title: "How we use information",
    paragraphs: [
      "We use personal information to operate and improve the service, process and support routes, respond to users, protect the platform, and meet legal obligations.",
    ],
    bullets: [
      "To create, route, settle, and support transactions",
      "To remember route state and user preferences",
      "To investigate abuse, fraud, sanctions exposure, and suspicious activity",
      "To communicate with you about support, route status, updates, and security issues",
      "To analyze performance, reliability, and product usage",
    ],
  },
  {
    title: "How we share information",
    paragraphs: [
      "We may share information with third parties when needed to operate the service, support a route, comply with law, or protect the service and its users.",
    ],
    bullets: [
      "Hosting, infrastructure, analytics, and support vendors",
      "Route, compliance, settlement, wallet, and payment partners involved in a requested transaction",
      "Professional advisors and auditors where reasonably necessary",
      "Government bodies, regulators, or law enforcement when required by law or reasonably necessary to protect rights, safety, or the integrity of the service",
      "Successors or counterparties in a merger, financing, or business transfer",
    ],
  },
  {
    title: "Retention, security, and international use",
    paragraphs: [
      "We retain information for as long as reasonably necessary to provide the service, support routes, investigate abuse, meet legal or accounting obligations, and enforce our agreements.",
      "We use administrative, technical, and organizational measures designed to protect data, but no internet-connected system can guarantee absolute security.",
      "ZyroShift may process data in multiple countries depending on infrastructure, support, or provider relationships.",
    ],
  },
  {
    title: "Your choices",
    paragraphs: [
      "Depending on your location and the laws that apply to you, you may have rights to request access, correction, deletion, objection, restriction, or portability for certain personal information.",
      "You may also control some cookies or local storage through your browser settings, though disabling them may affect parts of the service.",
    ],
  },
  {
    title: "Children and policy changes",
    paragraphs: [
      "The service is not intended for children and should not be used by anyone under 18 or under the age of majority in the relevant jurisdiction.",
      "We may update this Privacy Policy from time to time. When we do, we will post the updated version here and revise the effective date.",
    ],
  },
] as const;

export const metadata: Metadata = {
  title: "Privacy Policy | ZyroShift",
  description:
    "Privacy Policy for ZyroShift, including wallet data, blockchain visibility, device information, route processing, analytics, and legal disclosures.",
  alternates: {
    canonical: "https://zyroshift.com/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <LegalPageTemplate
      eyebrow="Privacy Policy"
      title="Privacy Policy"
      intro="This policy explains what ZyroShift collects when you use the service, why the data is used, how it may be shared, and what blockchain visibility means for a direct-to-wallet crypto route."
      effectiveDate="April 16, 2026"
      sections={PRIVACY_SECTIONS.map((section) => ({
        ...section,
        paragraphs: [...section.paragraphs],
        bullets: section.bullets ? [...section.bullets] : undefined,
      }))}
    />
  );
}
