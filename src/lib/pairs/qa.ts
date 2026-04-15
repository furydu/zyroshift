import { getPairInfrastructureReport } from "@/lib/pairs/inventory";
import { getReverseRouteSpec } from "@/lib/pairs/relatedRoutes";
import { getPairPageSpecs } from "@/lib/pairs/registry";
import { resolvePairPageSpec } from "@/lib/pairs/resolveSpec";

type PairQaIssue = {
  slug: string;
  detail: string;
};

type PairQaAliasSample = {
  requestedSlug: string;
  canonicalSlug: string;
  state: "index" | "noindex" | "skip";
};

type PairQaReport = {
  generatedAt: string;
  summary: {
    curatedCount: number;
    duplicateSlugCount: number;
    relatedRouteIssueCount: number;
    reverseRouteMissingCount: number;
    orphanCuratedCount: number;
    metadataIndexMismatchCount: number;
    aliasSampleCount: number;
  };
  duplicateSlugs: Array<{ slug: string; occurrences: number }>;
  metadataIndexMismatches: PairQaIssue[];
  relatedRouteIssues: PairQaIssue[];
  reverseRouteMissing: PairQaIssue[];
  orphanCuratedRoutes: PairQaIssue[];
  aliasSamples: PairQaAliasSample[];
};

function getDuplicateSlugs() {
  const counts = new Map<string, number>();

  for (const spec of getPairPageSpecs()) {
    counts.set(spec.slug, (counts.get(spec.slug) || 0) + 1);
  }

  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([slug, occurrences]) => ({
      slug,
      occurrences,
    }))
    .sort((a, b) => b.occurrences - a.occurrences || a.slug.localeCompare(b.slug, "en"));
}

function getMetadataIndexMismatches(): PairQaIssue[] {
  return getPairPageSpecs()
    .filter(
      (spec) =>
        (spec.indexability.state === "index" && !spec.indexable) ||
        (spec.indexability.state !== "index" && spec.indexable),
    )
    .map((spec) => ({
      slug: spec.slug,
      detail: `Seed indexable=${spec.indexable} but evaluated state=${spec.indexability.state}.`,
    }));
}

function getRelatedRouteIssues(): PairQaIssue[] {
  const issues: PairQaIssue[] = [];

  for (const spec of getPairPageSpecs()) {
    const seen = new Set<string>();
    const relatedSlugs = spec.relatedSlugs || [];

    for (const relatedSlug of relatedSlugs) {
      const resolved = resolvePairPageSpec(relatedSlug);

      if (!resolved) {
        issues.push({
          slug: spec.slug,
          detail: `Related slug ${relatedSlug} does not resolve.`,
        });
        continue;
      }

      if (resolved.slug === spec.slug) {
        issues.push({
          slug: spec.slug,
          detail: `Related slug ${relatedSlug} resolves back to itself.`,
        });
      }

      if (seen.has(resolved.slug)) {
        issues.push({
          slug: spec.slug,
          detail: `Related slug ${relatedSlug} duplicates canonical ${resolved.slug}.`,
        });
      }

      seen.add(resolved.slug);
    }
  }

  return issues;
}

function getReverseRouteMissing(): PairQaIssue[] {
  return getPairPageSpecs()
    .filter((spec) => !getReverseRouteSpec(spec))
    .map((spec) => ({
      slug: spec.slug,
      detail: "No reverse route resolves from the current pair.",
    }));
}

function getOrphanCuratedRoutes(): PairQaIssue[] {
  const specs = getPairPageSpecs();
  const inboundCounts = new Map<string, number>(specs.map((spec) => [spec.slug, 0]));

  for (const spec of specs) {
    const canonicalTargets = new Set(
      (spec.relatedSlugs || [])
        .map((slug) => resolvePairPageSpec(slug)?.slug)
        .filter((slug): slug is string => Boolean(slug)),
    );

    const reverseRoute = getReverseRouteSpec(spec);
    if (reverseRoute) {
      canonicalTargets.add(reverseRoute.slug);
    }

    for (const targetSlug of canonicalTargets) {
      if (inboundCounts.has(targetSlug)) {
        inboundCounts.set(targetSlug, (inboundCounts.get(targetSlug) || 0) + 1);
      }
    }
  }

  return specs
    .filter((spec) => (inboundCounts.get(spec.slug) || 0) === 0)
    .map((spec) => ({
      slug: spec.slug,
      detail: "No curated route links back to this page through related/reverse links.",
    }));
}

function getAliasSamples(): PairQaAliasSample[] {
  const report = getPairInfrastructureReport();
  const aliasMap = new Map<string, PairQaAliasSample>();

  for (const item of [
    ...report.phaseOne.indexCandidates,
    ...report.phaseOne.noindexCandidates,
    ...report.phaseOne.skippedSample,
  ]) {
    if (item.requestedSlug === item.slug) {
      continue;
    }

    const key = `${item.requestedSlug}->${item.slug}`;
    if (!aliasMap.has(key)) {
      aliasMap.set(key, {
        requestedSlug: item.requestedSlug,
        canonicalSlug: item.slug,
        state: item.state,
      });
    }
  }

  return [...aliasMap.values()]
    .sort((a, b) => a.requestedSlug.localeCompare(b.requestedSlug, "en"))
    .slice(0, 60);
}

export function getPairQaReport(): PairQaReport {
  const duplicateSlugs = getDuplicateSlugs();
  const metadataIndexMismatches = getMetadataIndexMismatches();
  const relatedRouteIssues = getRelatedRouteIssues();
  const reverseRouteMissing = getReverseRouteMissing();
  const orphanCuratedRoutes = getOrphanCuratedRoutes();
  const aliasSamples = getAliasSamples();

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      curatedCount: getPairPageSpecs().length,
      duplicateSlugCount: duplicateSlugs.length,
      relatedRouteIssueCount: relatedRouteIssues.length,
      reverseRouteMissingCount: reverseRouteMissing.length,
      orphanCuratedCount: orphanCuratedRoutes.length,
      metadataIndexMismatchCount: metadataIndexMismatches.length,
      aliasSampleCount: aliasSamples.length,
    },
    duplicateSlugs,
    metadataIndexMismatches,
    relatedRouteIssues,
    reverseRouteMissing,
    orphanCuratedRoutes,
    aliasSamples,
  };
}
