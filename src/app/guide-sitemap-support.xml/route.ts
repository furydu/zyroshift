import {
  buildXmlSitemap,
  getGuideSitemapEntries,
} from "@/lib/site/guidePublish";

export async function GET() {
  return new Response(buildXmlSitemap(getGuideSitemapEntries("support-full")), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
