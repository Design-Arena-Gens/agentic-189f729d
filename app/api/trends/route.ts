import { NextResponse } from "next/server";
import { fetchGoogleDailyTrends } from "../../../lib/trends";

export const dynamic = "force-dynamic";

export async function GET() {
  const trends = await fetchGoogleDailyTrends("US", "en-US");
  return NextResponse.json({ trends }, { status: 200 });
}

