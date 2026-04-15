import { getClusterPageMetadata, renderClusterPage } from "@/app/swap/clusterPageFactory";

export const metadata = getClusterPageMetadata("btc-to-alt");

export default function BtcToAltClusterPage() {
  return renderClusterPage("btc-to-alt");
}
