import { resolvePairPageSpec } from "@/lib/pairs";
import {
  extractUserIp,
  fetchQuotePreview,
  toRouteErrorResponse,
} from "@/lib/sideshift/client";
import { NextRequest } from "next/server";

type RatePreviewRouteProps = {
  params: Promise<{
    pair: string;
  }>;
};

export async function GET(
  request: NextRequest,
  { params }: RatePreviewRouteProps,
) {
  try {
    const { pair } = await params;
    const spec = resolvePairPageSpec(pair);

    if (!spec) {
      return Response.json(
        {
          error: {
            message: "Swap pair not found.",
            code: "PAIR_NOT_FOUND",
          },
        },
        { status: 404 },
      );
    }

    return Response.json(
      await fetchQuotePreview(
        spec.builderPreset,
        extractUserIp(request.headers),
      ),
      {
        headers: {
          "Cache-Control":
            "public, max-age=0, s-maxage=120, stale-while-revalidate=600",
          "CDN-Cache-Control":
            "public, max-age=120, stale-while-revalidate=600",
          "Vercel-CDN-Cache-Control":
            "public, max-age=120, stale-while-revalidate=600",
        },
      },
    );
  } catch (error) {
    return toRouteErrorResponse(error);
  }
}
