import { PairPage } from "@/components/pairs/PairPage";
import {
  getFrozenGoldPairStaticParams,
  getPairPageMetadata,
  getStableNetworkExpansionStaticParams,
  parsePairSlug,
  resolvePairPageSpec,
} from "@/lib/pairs";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

type PairPageProps = {
  params: Promise<{
    pair: string;
  }>;
};

function shouldIncludeStableNetworkStaticParams() {
  return process.env.NODE_ENV === "production";
}

export async function generateStaticParams() {
  const staticParams = [
    ...getFrozenGoldPairStaticParams(),
    ...(shouldIncludeStableNetworkStaticParams()
      ? getStableNetworkExpansionStaticParams()
      : []),
  ];
  const seen = new Set<string>();

  return staticParams.filter((item) => {
    const normalized = item.pair.trim().toLowerCase();
    if (seen.has(normalized)) {
      return false;
    }

    seen.add(normalized);
    return true;
  });
}

export async function generateMetadata({
  params,
}: PairPageProps): Promise<Metadata> {
  const { pair } = await params;
  const spec = resolvePairPageSpec(pair);

  if (!spec) {
    const parsed = parsePairSlug(pair);
    return {
      title: parsed
        ? `Swap ${parsed.fromToken} to ${parsed.toToken} | Route unavailable`
        : "Swap route not found | ZyroShift",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return getPairPageMetadata(spec);
}

export default async function SwapPairPage({ params }: PairPageProps) {
  const { pair } = await params;
  const spec = resolvePairPageSpec(pair);

  if (!spec) {
    notFound();
  }

  if (pair.trim().toLowerCase() !== spec.slug) {
    permanentRedirect(`/swap/${spec.slug}`);
  }

  return <PairPage spec={spec} />;
}
