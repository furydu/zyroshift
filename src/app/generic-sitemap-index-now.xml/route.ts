import {
  buildXmlSitemap,
  getGenericSitemapEntries,
} from "@/lib/site/genericPublish";

export async function GET() {
  return new Response(buildXmlSitemap(getGenericSitemapEntries("recommendedIndexNow")), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
