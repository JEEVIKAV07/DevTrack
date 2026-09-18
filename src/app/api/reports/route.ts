import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { getMockDeploymentSummary, getMockDeployments } from "@/lib/services/mockDeployments";
import { getMockTicketSummary } from "@/lib/services/mockTickets";
import { getMockEnvironments } from "@/lib/services/mockEnvironments";
import { getMockActivitySummary } from "@/lib/services/mockActivity";
import { DateRange, ReportData } from "@/types";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const range = (searchParams.get("range") ?? "30d") as DateRange;
  const team = searchParams.get("team") ?? undefined;
  const environment = searchParams.get("environment") ?? undefined;
  const format = searchParams.get("format") ?? "json"; // json | csv

  // Build filter dates
  const daysMap: Record<DateRange, number> = {
    today: 0, "7d": 7, "30d": 30, "90d": 90, custom: 30,
  };
  const days = daysMap[range];
  const dateFrom = new Date();
  dateFrom.setDate(dateFrom.getDate() - days);
  const dateTo = new Date();

  try {
    const [deployments, tickets, environments, activity, { deployments: deploymentList }] =
      await Promise.all([
        getMockDeploymentSummary(range),
        getMockTicketSummary(range),
        getMockEnvironments(),
        getMockActivitySummary(range),
        getMockDeployments(range, environment, undefined, undefined, 1, 1000),
      ]);

    const reportData: ReportData = {
      filters: {
        dateFrom: dateFrom.toISOString(),
        dateTo: dateTo.toISOString(),
        team,
        environment,
      },
      deployments,
      tickets,
      environments,
      activity,
      generatedAt: new Date().toISOString(),
    };

    if (format === "csv") {
      // Generate CSV export
      const csvRows: string[] = [];

      // Header
      csvRows.push("Engineering Productivity Report");
      csvRows.push(`Generated: ${new Date().toLocaleString()}`);
      csvRows.push(`Period: Last ${days} days`);
      csvRows.push("");

      // Deployment Summary
      csvRows.push("=== DEPLOYMENT SUMMARY ===");
      csvRows.push("Metric,Value");
      csvRows.push(`Total Deployments,${deployments.total}`);
      csvRows.push(`Successful,${deployments.successful}`);
      csvRows.push(`Failed,${deployments.failed}`);
      csvRows.push(`Success Rate,${deployments.successRate}%`);
      csvRows.push(`Avg Duration,${Math.round(deployments.avgDuration / 60)} min`);
      csvRows.push("");

      // Ticket Summary
      csvRows.push("=== TICKET SUMMARY ===");
      csvRows.push("Metric,Value");
      csvRows.push(`Total Tickets,${tickets.total}`);
      csvRows.push(`Open,${tickets.open}`);
      csvRows.push(`In Progress,${tickets.inProgress}`);
      csvRows.push(`Resolved,${tickets.resolved}`);
      csvRows.push(`Closed,${tickets.closed}`);
      csvRows.push(`Critical,${tickets.critical}`);
      csvRows.push(`High Priority,${tickets.high}`);
      csvRows.push("");

      // Environment Health
      csvRows.push("=== ENVIRONMENT HEALTH ===");
      csvRows.push("Environment,Status,CPU %,Memory %,Disk %,Response Time (ms),Uptime %");
      environments.forEach((env) => {
        csvRows.push(
          `${env.name},${env.status},${env.cpu},${env.memory},${env.disk},${env.responseTime},${env.uptime}`
        );
      });
      csvRows.push("");

      // Activity Summary
      csvRows.push("=== ENGINEERING ACTIVITY SUMMARY ===");
      csvRows.push("Metric,Value");
      csvRows.push(`Total Commits,${activity.totalCommits}`);
      csvRows.push(`Total Pull Requests,${activity.totalPullRequests}`);
      csvRows.push(`Total Code Reviews,${activity.totalCodeReviews}`);
      csvRows.push(`Total Deployments,${activity.totalDeployments}`);
      csvRows.push(`Issues Created,${activity.totalIssuesCreated}`);
      csvRows.push(`Issues Resolved,${activity.totalIssuesResolved}`);
      csvRows.push("");

      // Deployment Details
      csvRows.push("=== DEPLOYMENT DETAILS ===");
      csvRows.push("Application,Version,Environment,Developer,Status,Date,Duration (min)");
      deploymentList.slice(0, 100).forEach((dep) => {
        csvRows.push(
          `"${dep.application}","${dep.version}","${dep.environment}","${dep.developer}","${dep.status}","${new Date(dep.deployedAt).toLocaleString()}","${Math.round(dep.duration / 60)}"`
        );
      });

      const csvContent = csvRows.join("\n");

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="engineering-report-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    return NextResponse.json({ status: "success", data: reportData });
  } catch (error) {
    console.error("[API /reports]", error);
    return NextResponse.json(
      { status: "error", error: "Unable to generate report. Please try again." },
      { status: 500 }
    );
  }
}
