import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ status: "error", error: "Unauthorized" }, { status: 401 });

  const hasDatabase = Boolean(process.env.DATABASE_URL);
  return NextResponse.json({
    status: "success",
    data: {
      access: { role: (session.user as { role?: string })?.role ?? "ENGINEER", authenticated: true },
      integrations: [
        { name: "Dashboard API", status: "OPERATIONAL", detail: "Live internal aggregation routes" },
        { name: "Database", status: hasDatabase ? "CONFIGURED" : "DEMO MODE", detail: hasDatabase ? "PostgreSQL connection configured" : "Using resilient mock services" },
        { name: "Telemetry refresh", status: "OPERATIONAL", detail: "Polling enabled across operational views" },
      ],
      refreshIntervals: { dashboard: "30 seconds", environments: "15 seconds", incidents: "15 seconds", reports: "60 seconds" },
      generatedAt: new Date().toISOString(),
    },
  });
}