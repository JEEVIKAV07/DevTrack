import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { getMockDeploymentSummary } from "@/lib/services/mockDeployments";
import { getMockTicketSummary } from "@/lib/services/mockTickets";
import { getMockEnvironmentSummary } from "@/lib/services/mockEnvironments";
import { getMockActivitySummary } from "@/lib/services/mockActivity";
import { DateRange, DashboardKPIs } from "@/types";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const range = (searchParams.get("range") ?? "30d") as DateRange;

  // Fetch all data sources in parallel; handle partial failures gracefully
  const [deploymentsResult, ticketsResult, environmentsResult, activityResult] =
    await Promise.allSettled([
      getMockDeploymentSummary(range),
      getMockTicketSummary(range),
      getMockEnvironmentSummary(),
      getMockActivitySummary(range),
    ]);

  const errors: string[] = [];

  const deployments =
    deploymentsResult.status === "fulfilled"
      ? deploymentsResult.value
      : (errors.push("deployment"), {
          total: 0, successful: 0, failed: 0, inProgress: 0,
          rolledBack: 0, pending: 0, avgDuration: 0, successRate: 0,
        });

  const tickets =
    ticketsResult.status === "fulfilled"
      ? ticketsResult.value
      : (errors.push("tickets"), {
          total: 0, open: 0, inProgress: 0, resolved: 0,
          closed: 0, critical: 0, high: 0, medium: 0, low: 0,
        });

  const environments =
    environmentsResult.status === "fulfilled"
      ? environmentsResult.value
      : (errors.push("environments"), { total: 0, healthy: 0, warning: 0, critical: 0 });

  const activity =
    activityResult.status === "fulfilled"
      ? activityResult.value
      : (errors.push("activity"), {
          totalCommits: 0, totalPullRequests: 0, totalCodeReviews: 0,
          totalDeployments: 0, totalIssuesCreated: 0, totalIssuesResolved: 0,
        });

  const kpis: DashboardKPIs = {
    deployments,
    tickets,
    environments,
    activity,
    lastUpdated: new Date().toISOString(),
  };

  return NextResponse.json({
    status: "success",
    data: kpis,
    ...(errors.length > 0 && { warnings: errors.map((e) => `${e} service temporarily unavailable`) }),
  });
}
