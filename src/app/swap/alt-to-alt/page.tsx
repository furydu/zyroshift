import { getClusterPageMetadata, renderClusterPage } from "@/app/swap/clusterPageFactory";

export const metadata = getClusterPageMetadata("alt-to-alt");

export default function AltToAltClusterPage() {
  return renderClusterPage("alt-to-alt");
}
