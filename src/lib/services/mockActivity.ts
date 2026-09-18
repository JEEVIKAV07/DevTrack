import {
  TeamMemberActivity,
  ActivitySummary,
  ActivityTrend,
  DateRange,
} from "@/types";
import { subDays, format } from "./dateUtils";

// =====================================================
// Mock Engineering Activity Data Service
// Simulates data from GitHub, GitLab, or similar VCS tools
// =====================================================

const TEAM_MEMBERS = [
  { name: "Alex Johnson", team: "Frontend" },
  { name: "Priya Sharma", team: "Frontend" },
  { name: "Marcus Chen", team: "Backend" },
  { name: "Sarah Williams", team: "Backend" },
  { name: "David Kim", team: "DevOps" },
  { name: "Emma Rodriguez", team: "Platform" },
  { name: "James O'Brien", team: "QA" },
  { name: "Fatima Al-Hassan", team: "Backend" },
  { name: "Carlos Mendez", team: "Frontend" },
  { name: "Aisha Patel", team: "DevOps" },
  { name: "Tom Bradley", team: "Platform" },
  { name: "Mei Lin", team: "QA" },
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateMemberActivity(
  member: { name: string; team: string },
  id: number,
  period: string
): TeamMemberActivity {
  return {
    id: `act-${id}`,
    developer: member.name,
    team: member.team,
    commits: randomInt(5, 45),
    pullRequests: randomInt(1, 12),
    codeReviews: randomInt(2, 20),
    deployments: randomInt(0, 8),
    issuesCreated: randomInt(1, 15),
    issuesResolved: randomInt(1, 12),
    period,
  };
}

// Generate 3 months of activity data
let cachedActivity: TeamMemberActivity[] | null = null;

function getAllActivity(): TeamMemberActivity[] {
  if (!cachedActivity) {
    const activities: TeamMemberActivity[] = [];
    let id = 1;
    for (let month = 2; month >= 0; month--) {
      const date = new Date();
      date.setMonth(date.getMonth() - month);
      const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      TEAM_MEMBERS.forEach((member) => {
        activities.push(generateMemberActivity(member, id++, period));
      });
    }
    cachedActivity = activities;
  }
  return cachedActivity;
}

// Get activity for a specific period based on date range
function getCurrentPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export async function getMockActivity(
  range: DateRange = "30d",
  team?: string
): Promise<{ activities: TeamMemberActivity[]; total: number }> {
  await new Promise((r) => setTimeout(r, 40));

  const allActivity = getAllActivity();
  const now = new Date();
  const currentPeriod = getCurrentPeriod();
  const prevPeriod = (() => {
    const d = new Date(now);
    d.setMonth(d.getMonth() - 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  })();

  // For 30d+ ranges, include both current and previous month
  const activities =
    range === "7d" || range === "today"
      ? allActivity.filter((a) => a.period === currentPeriod)
      : allActivity.filter(
          (a) => a.period === currentPeriod || a.period === prevPeriod
        );

  // Aggregate by developer
  const aggregated = new Map<string, TeamMemberActivity>();
  for (const activity of activities) {
    const key = activity.developer;
    if (aggregated.has(key)) {
      const existing = aggregated.get(key)!;
      existing.commits += activity.commits;
      existing.pullRequests += activity.pullRequests;
      existing.codeReviews += activity.codeReviews;
      existing.deployments += activity.deployments;
      existing.issuesCreated += activity.issuesCreated;
      existing.issuesResolved += activity.issuesResolved;
    } else {
      aggregated.set(key, { ...activity });
    }
  }

  let result = Array.from(aggregated.values());

  if (team) {
    result = result.filter((a) => a.team.toLowerCase() === team.toLowerCase());
  }

  // Sort by commits descending
  result.sort((a, b) => b.commits - a.commits);

  return { activities: result, total: result.length };
}

export async function getMockActivitySummary(range: DateRange = "30d"): Promise<ActivitySummary> {
  await new Promise((r) => setTimeout(r, 30));

  const { activities } = await getMockActivity(range);

  return {
    totalCommits: activities.reduce((sum, a) => sum + a.commits, 0),
    totalPullRequests: activities.reduce((sum, a) => sum + a.pullRequests, 0),
    totalCodeReviews: activities.reduce((sum, a) => sum + a.codeReviews, 0),
    totalDeployments: activities.reduce((sum, a) => sum + a.deployments, 0),
    totalIssuesCreated: activities.reduce((sum, a) => sum + a.issuesCreated, 0),
    totalIssuesResolved: activities.reduce((sum, a) => sum + a.issuesResolved, 0),
  };
}

export async function getMockActivityTrend(range: DateRange = "30d"): Promise<ActivityTrend[]> {
  await new Promise((r) => setTimeout(r, 30));

  const daysMap: Record<DateRange, number> = {
    today: 1,
    "7d": 7,
    "30d": 30,
    "90d": 30,
    custom: 30,
  };
  const days = daysMap[range];

  return Array.from({ length: days }, (_, i) => {
    const date = subDays(new Date(), days - 1 - i);
    // Simulate activity patterns (more on weekdays)
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const factor = isWeekend ? 0.3 : 1.0;

    return {
      date: format(date, "MMM dd"),
      commits: Math.round(randomInt(8, 35) * factor),
      pullRequests: Math.round(randomInt(2, 12) * factor),
      codeReviews: Math.round(randomInt(3, 18) * factor),
      deployments: Math.round(randomInt(1, 10) * factor),
    };
  });
}
