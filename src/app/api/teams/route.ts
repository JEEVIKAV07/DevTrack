import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { getMockActivity } from "@/lib/services/mockActivity";
import { DateRange } from "@/types";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ status: "error", error: "Unauthorized" }, { status: 401 });

  const range = (new URL(request.url).searchParams.get("range") ?? "30d") as DateRange;
  try {
    const { activities, total } = await getMockActivity(range, undefined, 1, 1000);
    const teams = new Map<string, { team: string; contributors: Set<string>; commits: number; pullRequests: number; reviews: number; deployments: number; issuesResolved: number }>();

    activities.forEach((activity) => {
      const current = teams.get(activity.team) ?? {
        team: activity.team,
        contributors: new Set<string>(),
        commits: 0,
        pullRequests: 0,
        reviews: 0,
        deployments: 0,
        issuesResolved: 0,
      };
      current.contributors.add(activity.developer);
      current.commits += activity.commits;
      current.pullRequests += activity.pullRequests;
      current.reviews += activity.codeReviews;
      current.deployments += activity.deployments;
      current.issuesResolved += activity.issuesResolved;
      teams.set(activity.team, current);
    });

    return NextResponse.json({
      status: "success",
      data: {
        range,
        totalActivities: total,
        teams: Array.from(teams.values())
          .map((team) => ({ ...team, contributors: team.contributors.size }))
          .sort((a, b) => b.commits + b.pullRequests - (a.commits + a.pullRequests)),
        generatedAt: new Date().toISOString(),
      },
    });
  } catch {
    return NextResponse.json({ status: "error", error: "Unable to load team data." }, { status: 500 });
  }
}