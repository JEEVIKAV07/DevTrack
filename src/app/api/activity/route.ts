import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import {
  getMockActivity,
  getMockActivitySummary,
  getMockActivityTrend,
} from "@/lib/services/mockActivity";
import { DateRange } from "@/types";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const range = (searchParams.get("range") ?? "30d") as DateRange;
  const team = searchParams.get("team") ?? undefined;
  const view = searchParams.get("view") ?? "list";

  try {
    if (view === "summary") {
      const summary = await getMockActivitySummary(range);
      return NextResponse.json({ status: "success", data: summary });
    }

    if (view === "trend") {
      const trend = await getMockActivityTrend(range);
      return NextResponse.json({ status: "success", data: trend });
    }

    const [{ activities, total }, summary, trend] = await Promise.all([
      getMockActivity(range, team),
      getMockActivitySummary(range),
      getMockActivityTrend(range),
    ]);

    return NextResponse.json({
      status: "success",
      data: { activities, total, summary, trend },
    });
  } catch (error) {
    console.error("[API /activity]", error);
    return NextResponse.json(
      { status: "error", error: "Unable to fetch activity data. Please try again." },
      { status: 500 }
    );
  }
}
