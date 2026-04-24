import {
  buildXmlSitemap,
  getGuideSitemapEntries,
} from "@/lib/site/guidePublish";

export async function GET() {
  return new Response(buildXmlSitemap(getGuideSitemapEntries("wave-1")), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
