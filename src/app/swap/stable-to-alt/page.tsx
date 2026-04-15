import { getClusterPageMetadata, renderClusterPage } from "@/app/swap/clusterPageFactory";

export const metadata = getClusterPageMetadata("stable-to-alt");

export default function StableToAltClusterPage() {
  return renderClusterPage("stable-to-alt");
}
