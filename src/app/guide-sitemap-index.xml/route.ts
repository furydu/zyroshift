import {
  buildXmlSitemapIndex,
  getGuideSitemapIndexUrls,
} from "@/lib/site/guidePublish";

export async function GET() {
  return new Response(buildXmlSitemapIndex(getGuideSitemapIndexUrls()), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
