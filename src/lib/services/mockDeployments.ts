import {
  Deployment,
  DeploymentSummary,
  DeploymentTrend,
  DeploymentStatus,
  EnvironmentName,
  DateRange,
} from "@/types";
import { subDays, format, isAfter } from "./dateUtils";

// =====================================================
// Mock Deployments Data Service
// Simulates data that would come from a real CI/CD API
// =====================================================

const APPLICATIONS = [
  "frontend-app",
  "backend-api",
  "payment-service",
  "notification-service",
  "auth-service",
  "data-pipeline",
  "admin-portal",
  "mobile-api",
];

const ENVIRONMENTS: EnvironmentName[] = ["Development", "QA", "Staging", "Production"];

const DEVELOPERS = [
  "Alex Johnson",
  "Priya Sharma",
  "Marcus Chen",
  "Sarah Williams",
  "David Kim",
  "Emma Rodriguez",
  "James O'Brien",
  "Fatima Al-Hassan",
];

const STATUSES: DeploymentStatus[] = ["SUCCESS", "FAILED", "IN_PROGRESS", "ROLLED_BACK", "PENDING"];
const STATUS_WEIGHTS = [65, 12, 8, 8, 7]; // % probability

function weightedRandom<T>(items: T[], weights: number[]): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateDeployment(id: number, daysAgo: number): Deployment {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(randomInt(6, 22), randomInt(0, 59), 0, 0);

  return {
    id: `dep-${String(id).padStart(4, "0")}`,
    application: APPLICATIONS[randomInt(0, APPLICATIONS.length - 1)],
    version: `v${randomInt(1, 5)}.${randomInt(0, 9)}.${randomInt(0, 20)}`,
    environment: ENVIRONMENTS[randomInt(0, ENVIRONMENTS.length - 1)],
    developer: DEVELOPERS[randomInt(0, DEVELOPERS.length - 1)],
    deployedAt: date.toISOString(),
    duration: randomInt(45, 480),
    status: weightedRandom(STATUSES, STATUS_WEIGHTS),
    commitHash: Math.random().toString(36).substring(2, 9),
  };
}

// Pre-generate 90 days of deployment data (deterministic seed-like generation)
function generateAllDeployments(): Deployment[] {
  // Use a fixed seed approach for consistent data across renders
  const deployments: Deployment[] = [];
  let id = 1;
  for (let day = 0; day < 90; day++) {
    const deploymentsPerDay = day === 0 ? 3 : randomInt(2, 8);
    for (let j = 0; j < deploymentsPerDay; j++) {
      deployments.push(generateDeployment(id++, day));
    }
  }
  return deployments.sort(
    (a, b) => new Date(b.deployedAt).getTime() - new Date(a.deployedAt).getTime()
  );
}

// Cached deployments (generated once per server start)
let cachedDeployments: Deployment[] | null = null;

function getAllDeployments(): Deployment[] {
  if (!cachedDeployments) {
    cachedDeployments = generateAllDeployments();
  }
  return cachedDeployments;
}

function filterByDateRange(deployments: Deployment[], range: DateRange): Deployment[] {
  const now = new Date();
  const daysMap: Record<DateRange, number> = {
    today: 0,
    "7d": 7,
    "30d": 30,
    "90d": 90,
    custom: 90,
  };
  const days = daysMap[range];
  const cutoff = subDays(now, days);
  return deployments.filter((d) => isAfter(new Date(d.deployedAt), cutoff));
}

export async function getMockDeployments(
  range: DateRange = "30d",
  environment?: string,
  status?: string,
  search?: string,
  page = 1,
  pageSize = 20
): Promise<{ deployments: Deployment[]; total: number }> {
  await new Promise((r) => setTimeout(r, 50)); // simulate async

  let deployments = filterByDateRange(getAllDeployments(), range);

  if (environment) {
    deployments = deployments.filter(
      (d) => d.environment.toLowerCase() === environment.toLowerCase()
    );
  }
  if (status) {
    deployments = deployments.filter(
      (d) => d.status.toLowerCase() === status.toLowerCase()
    );
  }
  if (search) {
    const q = search.toLowerCase();
    deployments = deployments.filter(
      (d) =>
        d.application.toLowerCase().includes(q) ||
        d.developer.toLowerCase().includes(q) ||
        d.version.toLowerCase().includes(q)
    );
  }

  const total = deployments.length;
  const paginated = deployments.slice((page - 1) * pageSize, page * pageSize);

  return { deployments: paginated, total };
}

export async function getMockDeploymentSummary(range: DateRange = "30d"): Promise<DeploymentSummary> {
  await new Promise((r) => setTimeout(r, 30));

  const deployments = filterByDateRange(getAllDeployments(), range);
  const successful = deployments.filter((d) => d.status === "SUCCESS").length;
  const failed = deployments.filter((d) => d.status === "FAILED").length;
  const inProgress = deployments.filter((d) => d.status === "IN_PROGRESS").length;
  const rolledBack = deployments.filter((d) => d.status === "ROLLED_BACK").length;
  const pending = deployments.filter((d) => d.status === "PENDING").length;

  const completedDeployments = deployments.filter(
    (d) => d.status === "SUCCESS" || d.status === "FAILED"
  );
  const avgDuration =
    completedDeployments.length > 0
      ? Math.round(
          completedDeployments.reduce((sum, d) => sum + d.duration, 0) /
            completedDeployments.length
        )
      : 0;

  return {
    total: deployments.length,
    successful,
    failed,
    inProgress,
    rolledBack,
    pending,
    avgDuration,
    successRate:
      deployments.length > 0 ? Math.round((successful / deployments.length) * 100) : 0,
  };
}

export async function getMockDeploymentTrend(range: DateRange = "30d"): Promise<DeploymentTrend[]> {
  await new Promise((r) => setTimeout(r, 30));

  const deployments = filterByDateRange(getAllDeployments(), range);
  const daysMap: Record<DateRange, number> = {
    today: 1,
    "7d": 7,
    "30d": 30,
    "90d": 30, // group to 30 data points
    custom: 30,
  };
  const days = daysMap[range];

  const trend: DeploymentTrend[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const dateStr = format(date, "MMM dd");
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayEnd = new Date(dayStart.getTime() + 86400000);

    const dayDeployments = deployments.filter((d) => {
      const dt = new Date(d.deployedAt);
      return dt >= dayStart && dt < dayEnd;
    });

    trend.push({
      date: dateStr,
      successful: dayDeployments.filter((d) => d.status === "SUCCESS").length,
      failed: dayDeployments.filter((d) => d.status === "FAILED").length,
      total: dayDeployments.length,
    });
  }

  return trend;
}
