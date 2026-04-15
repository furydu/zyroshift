import { LegalPageTemplate } from "@/components/legal/LegalPageTemplate";
import type { Metadata } from "next";

const TERMS_SECTIONS = [
  {
    title: "Acceptance and updates",
    paragraphs: [
      "These Terms & Conditions apply when you access or use zyroshift.com and the route, quote, tracking, and support flows available through the site.",
      "By using ZyroShift, you confirm that you understand these terms and agree to be bound by them. We may update these terms from time to time to reflect product changes, legal requirements, or provider changes.",
    ],
  },
  {
    title: "What the service does",
    paragraphs: [
      "ZyroShift is a route-first, direct-to-wallet crypto swap experience. The service helps you choose the asset and network you send, the asset and network you want to receive, and the destination wallet where settlement should land.",
      "ZyroShift does not promise that every asset, network, or route will be available at all times. Route availability, limits, pricing, and timing depend on live provider support, network conditions, and transaction risk checks.",
    ],
  },
  {
    title: "Eligibility and responsible use",
    paragraphs: [
      "You may use the service only if you are at least 18 years old, legally capable of agreeing to these terms, and permitted to use digital-asset services under the laws that apply to you.",
      "You are responsible for your own compliance, taxes, wallet security, transaction review, and use of the service.",
    ],
    bullets: [
      "Use the service only for your own lawful transactions.",
      "Make sure the deposit wallet and receiving wallet are under your control or used with authorization.",
      "Do not use the service for fraud, sanctions evasion, money laundering, terrorism financing, or any other prohibited activity.",
      "Do not send assets from or to addresses linked to scams, theft, unauthorized activity, or other unlawful conduct.",
    ],
  },
  {
    title: "Your route responsibilities",
    paragraphs: [
      "Before sending funds, you must verify the exact asset, network, minimums, quote mode, and receiving address shown on the route or shift page. If you send the wrong asset, use the wrong network, or enter the wrong destination address, your funds may be delayed, returned, or permanently lost.",
      "If a route uses a fixed quote, you must send the exact amount shown during the quote window. If a route uses a variable rate, the final outcome may differ from the quote preview because settlement follows live market conditions when the deposit is processed.",
    ],
  },
  {
    title: "Fees, timing, and blockchain risk",
    paragraphs: [
      "Quotes, minimums, maximums, and settlement timing can change because blockchains, liquidity, and route providers are variable by nature. Network congestion, validator behavior, custody delays at external services, or risk checks may affect completion time.",
      "You accept the technical and economic risks of blockchain-based transactions, including software issues, reorgs, chain delays, wallet errors, address mistakes, and unexpected market movement.",
    ],
  },
  {
    title: "Compliance and transaction review",
    paragraphs: [
      "ZyroShift and its supporting providers may review transactions for fraud, sanctions, risk, compliance, or abuse-prevention reasons. We may delay, reject, or require additional information for a route when a transaction is flagged or cannot be processed safely.",
      "We may keep route, quote, and transaction records where reasonably necessary to operate the service, investigate abuse, respond to legal process, and comply with applicable obligations.",
    ],
  },
  {
    title: "Non-custodial position and liability",
    paragraphs: [
      "ZyroShift is designed as a direct-to-wallet route flow. We do not provide a user balance account and do not act as a long-term custodian of customer funds as part of the ordinary service flow.",
      "To the maximum extent permitted by law, ZyroShift is not liable for losses caused by wallet mistakes, unsupported assets, incorrect network usage, third-party wallet or provider failures, public blockchain events, price movement, or delays outside our reasonable control.",
    ],
  },
  {
    title: "Support and legal contact",
    paragraphs: [
      "For support, privacy, or legal questions, use the contact details listed on this page. We may update those details as the service operational setup evolves.",
    ],
  },
] as const;

export const metadata: Metadata = {
  title: "Terms & Conditions | ZyroShift",
  description:
    "Terms & Conditions for using ZyroShift, including route use, wallet responsibility, risk review, fees, and direct-to-wallet swap rules.",
  alternates: {
    canonical: "https://zyroshift.com/terms",
  },
};

export default function TermsPage() {
  return (
    <LegalPageTemplate
      eyebrow="Terms & Conditions"
      title="Terms & Conditions"
      intro="These terms explain how ZyroShift works, what you are responsible for when using direct-to-wallet swap routes, and how the service may handle pricing, risk review, and route availability."
      effectiveDate="April 16, 2026"
      sections={TERMS_SECTIONS}
    />
  );
}
