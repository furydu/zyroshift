import {
  buildXmlSitemapIndex,
  getStableNetworkSitemapIndexUrls,
} from "@/lib/site/stableNetworkPublish";

export async function GET() {
  return new Response(buildXmlSitemapIndex(getStableNetworkSitemapIndexUrls()), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
