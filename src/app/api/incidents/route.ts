import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { getMockTickets } from "@/lib/services/mockTickets";
import { getMockEnvironments } from "@/lib/services/mockEnvironments";
import { DateRange } from "@/types";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ status: "error", error: "Unauthorized" }, { status: 401 });

  const range = (new URL(request.url).searchParams.get("range") ?? "30d") as DateRange;
  try {
    const [{ tickets }, environments] = await Promise.all([
      getMockTickets(range, undefined, undefined, "CRITICAL", undefined, 1, 100),
      getMockEnvironments(),
    ]);
    const ticketIncidents = tickets
      .filter((ticket) => ticket.status !== "CLOSED")
      .map((ticket) => ({
        id: ticket.id,
        title: ticket.title,
        source: "Ticket queue",
        severity: ticket.priority,
        status: ticket.status,
        owner: ticket.assignee,
        updatedAt: ticket.updatedAt,
      }));
    const environmentIncidents = environments
      .filter((environment) => environment.status === "CRITICAL" || environment.status === "WARNING")
      .map((environment) => ({
        id: `ENV-${environment.id}`,
        title: `${environment.name} health requires attention`,
        source: "Environment monitor",
        severity: environment.status === "CRITICAL" ? "CRITICAL" : "HIGH",
        status: environment.status,
        owner: "Platform",
        updatedAt: environment.lastChecked,
      }));

    return NextResponse.json({
      status: "success",
      data: {
        incidents: [...environmentIncidents, ...ticketIncidents].sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        ),
        generatedAt: new Date().toISOString(),
      },
    });
  } catch {
    return NextResponse.json({ status: "error", error: "Unable to load incident data." }, { status: 500 });
  }
}