import {
  getPairClusterReport,
  getPairLaunchExpansionSuggestions,
  getPairInfrastructureReport,
  getPairLaunchSet,
  getPairLaunchSetSummary,
  getPairQaReport,
} from "@/lib/pairs";
import { NextResponse } from "next/server";

export async function GET() {
  const infrastructure = getPairInfrastructureReport();
  const clusters = getPairClusterReport();
  const qa = getPairQaReport();

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    summary: getPairLaunchSetSummary(),
    qa: qa.summary,
    clusters: {
      summary: clusters.summary,
      topClusters: clusters.clusters.map((cluster) => ({
        id: cluster.id,
        title: cluster.title,
        totalRoutes: cluster.totalRoutes,
        indexRoutes: cluster.countsByState.index,
        noindexRoutes: cluster.countsByState.noindex,
      })),
    },
    infrastructure: {
      universe: infrastructure.universe,
      phaseOne: {
        countsByState: infrastructure.phaseOne.countsByState,
        countsByTemplateFamily: infrastructure.phaseOne.countsByTemplateFamily,
        countsByIntent: infrastructure.phaseOne.countsByIntent,
        suggestedNextIndexPairs: getPairLaunchExpansionSuggestions(40),
        suggestedRenderOnlyPairs: infrastructure.phaseOne.noindexCandidates.slice(0, 60),
      },
    },
    policy: {
      indexAtLaunch:
        "Curated routes plus family-expansion routes that clear the quality threshold and fit the current launch quotas by route family.",
      renderNoindex:
        "Resolvable routes that score 55+ but are not selected by the current launch quotas.",
      skip:
        "Invalid or weak routes that fail the minimum quality threshold.",
    },
    items: getPairLaunchSet(),
  });
}
