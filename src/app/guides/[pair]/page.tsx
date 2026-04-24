import { GuidePage } from "@/components/guides/GuidePage";
import {
  getGuidePageMetadata,
  getGuideStaticParams,
  isGuideRenderEnabled,
  resolveGuidePageSpec,
} from "@/lib/guides";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

type GuideRoutePageProps = {
  params: Promise<{
    pair: string;
  }>;
};

export async function generateStaticParams() {
  return getGuideStaticParams();
}

export async function generateMetadata({
  params,
}: GuideRoutePageProps): Promise<Metadata> {
  const { pair } = await params;
  const spec = resolveGuidePageSpec(pair);

  if (!isGuideRenderEnabled() || !spec) {
    return {
      title: "Guide not found | ZyroShift",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return getGuidePageMetadata(spec);
}

export default async function GuideRoutePage({ params }: GuideRoutePageProps) {
  const { pair } = await params;

  if (!isGuideRenderEnabled()) {
    notFound();
  }

  const spec = resolveGuidePageSpec(pair);

  if (!spec) {
    notFound();
  }

  if (pair.trim().toLowerCase() !== spec.slug) {
    permanentRedirect(spec.guideHref);
  }

  return <GuidePage spec={spec} />;
}
