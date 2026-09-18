import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import {
  getMockTickets,
  getMockTicketSummary,
  getMockTicketTrend,
} from "@/lib/services/mockTickets";
import { DateRange } from "@/types";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const range = (searchParams.get("range") ?? "30d") as DateRange;
  const team = searchParams.get("team") ?? undefined;
  const status = searchParams.get("status") ?? undefined;
  const priority = searchParams.get("priority") ?? undefined;
  const search = searchParams.get("search") ?? undefined;
  const page = parseInt(searchParams.get("page") ?? "1");
  const pageSize = parseInt(searchParams.get("pageSize") ?? "20");
  const view = searchParams.get("view") ?? "list";

  try {
    if (view === "summary") {
      const summary = await getMockTicketSummary(range);
      return NextResponse.json({ status: "success", data: summary });
    }

    if (view === "trend") {
      const trend = await getMockTicketTrend(range);
      return NextResponse.json({ status: "success", data: trend });
    }

    const [{ tickets, total }, summary, trend] = await Promise.all([
      getMockTickets(range, team, status, priority, search, page, pageSize),
      getMockTicketSummary(range),
      getMockTicketTrend(range),
    ]);

    return NextResponse.json({
      status: "success",
      data: {
        tickets,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
        summary,
        trend,
      },
    });
  } catch (error) {
    console.error("[API /tickets]", error);
    return NextResponse.json(
      { status: "error", error: "Unable to fetch ticket data. Please try again." },
      { status: 500 }
    );
  }
}
