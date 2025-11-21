import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateCaptionTopBottom } from "../../../lib/generator";

const TrendSchema = z.object({
  title: z.string(),
  query: z.string(),
  relatedHashtags: z.array(z.string()),
  source: z.enum(["google-trends", "instagram"])
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = z
    .object({
      trend: TrendSchema
    })
    .safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { trend } = parsed.data;
  const { topText, bottomText } = generateCaptionTopBottom(trend);

  return NextResponse.json(
    {
      topText,
      bottomText
    },
    { status: 200 }
  );
}

