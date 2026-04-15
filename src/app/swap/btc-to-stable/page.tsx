import { getClusterPageMetadata, renderClusterPage } from "@/app/swap/clusterPageFactory";

export const metadata = getClusterPageMetadata("btc-to-stable");

export default function BtcToStableClusterPage() {
  return renderClusterPage("btc-to-stable");
}
