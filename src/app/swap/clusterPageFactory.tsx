import { PairClusterPage } from "@/components/pairs/PairClusterPage";
import {
  getPairClusterPageData,
  getPairClusterPageMetadata,
  type PairClusterPageId,
} from "@/lib/pairs";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export function getClusterPageMetadata(id: PairClusterPageId): Metadata {
  return getPairClusterPageMetadata(id);
}

export function renderClusterPage(id: PairClusterPageId) {
  const data = getPairClusterPageData(id);

  if (!data) {
    notFound();
  }

  return <PairClusterPage data={data} />;
}
