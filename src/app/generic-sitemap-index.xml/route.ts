import {
  buildXmlSitemapIndex,
  getGenericSitemapIndexUrls,
} from "@/lib/site/genericPublish";

export async function GET() {
  return new Response(buildXmlSitemapIndex(getGenericSitemapIndexUrls()), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
