import { getClusterPageMetadata, renderClusterPage } from "@/app/swap/clusterPageFactory";

export const metadata = getClusterPageMetadata("alt-to-btc");

export default function AltToBtcClusterPage() {
  return renderClusterPage("alt-to-btc");
}
