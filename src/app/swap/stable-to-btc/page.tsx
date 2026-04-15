import { getClusterPageMetadata, renderClusterPage } from "@/app/swap/clusterPageFactory";

export const metadata = getClusterPageMetadata("stable-to-btc");

export default function StableToBtcClusterPage() {
  return renderClusterPage("stable-to-btc");
}
