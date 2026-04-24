import {
  buildXmlSitemap,
  getStableNetworkSitemapEntries,
} from "@/lib/site/stableNetworkPublish";

export async function GET() {
  return new Response(buildXmlSitemap(getStableNetworkSitemapEntries()), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
