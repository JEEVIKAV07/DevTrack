import { EnvironmentHealth, HealthStatus, ServiceHealth } from "@/types";

// =====================================================
// Mock Environments Data Service
// Simulates data from monitoring tools (Datadog, CloudWatch, etc.)
// =====================================================

const SERVICES = ["API Gateway", "Database", "Cache (Redis)", "Message Queue", "CDN", "Auth Service"];

function getHealthStatus(value: number, warningThreshold = 70, criticalThreshold = 90): HealthStatus {
  if (value >= criticalThreshold) return "CRITICAL";
  if (value >= warningThreshold) return "WARNING";
  return "HEALTHY";
}

function randomFloat(min: number, max: number): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(1));
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateServiceHealth(name: string, envStatus: HealthStatus): ServiceHealth {
  let status: HealthStatus = "HEALTHY";
  if (envStatus === "CRITICAL" && Math.random() < 0.5) status = "CRITICAL";
  else if (envStatus === "WARNING" && Math.random() < 0.4) status = "WARNING";

  return {
    name,
    status,
    responseTime: status === "HEALTHY" ? randomInt(5, 50) : randomInt(100, 2000),
  };
}

// Environments with pre-configured realistic health data
const BASE_ENVIRONMENTS = [
  {
    id: "env-dev",
    name: "Development" as const,
    cpu: randomFloat(15, 45),
    memory: randomFloat(30, 55),
    disk: randomFloat(20, 50),
    responseTime: randomInt(50, 150),
    uptime: randomFloat(97, 99.5),
    minutesAgo: 1,
  },
  {
    id: "env-qa",
    name: "QA" as const,
    cpu: randomFloat(25, 55),
    memory: randomFloat(40, 65),
    disk: randomFloat(35, 60),
    responseTime: randomInt(80, 200),
    uptime: randomFloat(98, 99.8),
    minutesAgo: 2,
  },
  {
    id: "env-staging",
    name: "Staging" as const,
    cpu: randomFloat(35, 65),
    memory: randomFloat(50, 72),
    disk: randomFloat(45, 65),
    responseTime: randomInt(100, 250),
    uptime: randomFloat(99, 99.9),
    minutesAgo: 1,
  },
  {
    id: "env-prod",
    name: "Production" as const,
    cpu: randomFloat(40, 68),
    memory: randomFloat(55, 75),
    disk: randomFloat(42, 62),
    responseTime: randomInt(120, 300),
    uptime: randomFloat(99.5, 99.99),
    minutesAgo: 0,
  },
];

let cachedEnvironments: EnvironmentHealth[] | null = null;

function buildEnvironments(): EnvironmentHealth[] {
  return BASE_ENVIRONMENTS.map((env) => {
    // Determine overall status based on all metrics
    const cpuStatus = getHealthStatus(env.cpu, 70, 85);
    const memStatus = getHealthStatus(env.memory, 75, 90);
    const diskStatus = getHealthStatus(env.disk, 70, 85);

    const statuses = [cpuStatus, memStatus, diskStatus];
    let overallStatus: HealthStatus = "HEALTHY";
    if (statuses.includes("CRITICAL")) overallStatus = "CRITICAL";
    else if (statuses.includes("WARNING")) overallStatus = "WARNING";

    const lastChecked = new Date();
    lastChecked.setMinutes(lastChecked.getMinutes() - env.minutesAgo);

    const services = SERVICES.map((s) => generateServiceHealth(s, overallStatus));

    return {
      id: env.id,
      name: env.name,
      status: overallStatus,
      cpu: env.cpu,
      memory: env.memory,
      disk: env.disk,
      responseTime: env.responseTime,
      uptime: env.uptime,
      lastChecked: lastChecked.toISOString(),
      services,
    };
  });
}

export async function getMockEnvironments(): Promise<EnvironmentHealth[]> {
  await new Promise((r) => setTimeout(r, 40));
  // Refresh cache occasionally (every 60 seconds in a real app this would hit the monitoring API)
  if (!cachedEnvironments) {
    cachedEnvironments = buildEnvironments();
  }
  return cachedEnvironments;
}

export async function getMockEnvironmentSummary(): Promise<{
  total: number;
  healthy: number;
  warning: number;
  critical: number;
}> {
  const envs = await getMockEnvironments();
  return {
    total: envs.length,
    healthy: envs.filter((e) => e.status === "HEALTHY").length,
    warning: envs.filter((e) => e.status === "WARNING").length,
    critical: envs.filter((e) => e.status === "CRITICAL").length,
  };
}

// Force refresh environment data (simulate a new check)
export function refreshEnvironments(): void {
  cachedEnvironments = null;
}
