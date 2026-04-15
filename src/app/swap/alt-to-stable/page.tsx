import { getClusterPageMetadata, renderClusterPage } from "@/app/swap/clusterPageFactory";

export const metadata = getClusterPageMetadata("alt-to-stable");

export default function AltToStableClusterPage() {
  return renderClusterPage("alt-to-stable");
}
