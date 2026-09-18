import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import {
  getMockDeployments,
  getMockDeploymentSummary,
  getMockDeploymentTrend,
} from "@/lib/services/mockDeployments";
import { DateRange } from "@/types";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const range = (searchParams.get("range") ?? "30d") as DateRange;
  const environment = searchParams.get("environment") ?? undefined;
  const status = searchParams.get("status") ?? undefined;
  const search = searchParams.get("search") ?? undefined;
  const page = parseInt(searchParams.get("page") ?? "1");
  const pageSize = parseInt(searchParams.get("pageSize") ?? "20");
  const view = searchParams.get("view") ?? "list"; // list | summary | trend

  try {
    if (view === "summary") {
      const summary = await getMockDeploymentSummary(range);
      return NextResponse.json({ status: "success", data: summary });
    }

    if (view === "trend") {
      const trend = await getMockDeploymentTrend(range);
      return NextResponse.json({ status: "success", data: trend });
    }

    // Default: list with pagination
    const [{ deployments, total }, summary, trend] = await Promise.all([
      getMockDeployments(range, environment, status, search, page, pageSize),
      getMockDeploymentSummary(range),
      getMockDeploymentTrend(range),
    ]);

    return NextResponse.json({
      status: "success",
      data: {
        deployments,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
        summary,
        trend,
      },
    });
  } catch (error) {
    console.error("[API /deployments]", error);
    return NextResponse.json(
      { status: "error", error: "Unable to fetch deployment data. Please try again." },
      { status: 500 }
    );
  }
}
