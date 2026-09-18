import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const demoEmail = process.env.DEMO_USER_EMAIL ?? "demo@engineering.internal";
const demoPassword = process.env.DEMO_USER_PASSWORD ?? "ChangeMe123!";

async function main() {
  const passwordHash = await bcrypt.hash(demoPassword, 10);

  await prisma.user.upsert({
    where: { email: demoEmail },
    update: { passwordHash, name: "Demo Engineer", role: "MANAGER" },
    create: {
      email: demoEmail,
      name: "Demo Engineer",
      passwordHash,
      role: "MANAGER",
      department: "Platform",
    },
  });

  await prisma.deployment.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.environment.deleteMany();
  await prisma.engineeringActivity.deleteMany();

  const deploymentData: Prisma.DeploymentCreateInput[] = [
    { application: "frontend-app", version: "v2.9.12", environment: "Production", developer: "Alex Johnson", deployedAt: new Date(Date.now() - 3 * 60 * 60 * 1000), duration: 240, status: "SUCCESS", commitHash: "abc123", notes: "Demo seed record" },
    { application: "backend-api", version: "v4.7.3", environment: "Staging", developer: "Priya Sharma", deployedAt: new Date(Date.now() - 7 * 60 * 60 * 1000), duration: 310, status: "SUCCESS", commitHash: "def456", notes: "Demo seed record" },
    { application: "payment-service", version: "v1.8.9", environment: "Production", developer: "Marcus Chen", deployedAt: new Date(Date.now() - 22 * 60 * 60 * 1000), duration: 480, status: "FAILED", commitHash: "ghi789", notes: "Demo seed record" },
    { application: "notification-service", version: "v3.4.1", environment: "Development", developer: "Sarah Williams", deployedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), duration: 120, status: "IN_PROGRESS", commitHash: "jkl012", notes: "Demo seed record" },
    { application: "auth-service", version: "v5.1.0", environment: "QA", developer: "David Kim", deployedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), duration: 210, status: "SUCCESS", commitHash: "mno345", notes: "Demo seed record" },
    { application: "data-pipeline", version: "v7.2.0", environment: "Production", developer: "Emma Rodriguez", deployedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000), duration: 390, status: "ROLLED_BACK", commitHash: "pqr678", notes: "Demo seed record" },
  ];

  for (const item of deploymentData) {
    await prisma.deployment.create({ data: item });
  }

  const ticketData: Prisma.TicketCreateInput[] = [
    { title: "Fix auth token expiry issue", description: "Review expired tokens in edge gateways", team: "Frontend", priority: "CRITICAL", status: "OPEN", assignee: "Alex Johnson", createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000), updatedAt: new Date(Date.now() - 30 * 60 * 1000) },
    { title: "Improve checkout throughput", description: "Investigate latency during peak traffic", team: "Backend", priority: "HIGH", status: "IN_PROGRESS", assignee: "Marcus Chen", createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000) },
    { title: "Fix flaky CI job", description: "Retry logic failing on main branch", team: "DevOps", priority: "MEDIUM", status: "RESOLVED", assignee: "David Kim", createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), updatedAt: new Date(Date.now() - 10 * 60 * 60 * 1000) },
    { title: "Update API docs", description: "Refresh usage examples for new endpoints", team: "Platform", priority: "LOW", status: "CLOSED", assignee: "Emma Rodriguez", createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
  ];

  for (const item of ticketData) {
    await prisma.ticket.create({ data: item });
  }

  const environmentData: Prisma.EnvironmentCreateInput[] = [
    { name: "Development", status: "HEALTHY", cpu: 38, memory: 44, disk: 48, responseTime: 140, uptime: 99.7, lastChecked: new Date(Date.now() - 2 * 60 * 1000) },
    { name: "QA", status: "WARNING", cpu: 72, memory: 68, disk: 60, responseTime: 210, uptime: 99.2, lastChecked: new Date(Date.now() - 3 * 60 * 1000) },
    { name: "Staging", status: "HEALTHY", cpu: 52, memory: 58, disk: 54, responseTime: 180, uptime: 99.8, lastChecked: new Date(Date.now() - 1 * 60 * 1000) },
    { name: "Production", status: "HEALTHY", cpu: 42, memory: 61, disk: 48, responseTime: 180, uptime: 99.9, lastChecked: new Date(Date.now() - 2 * 60 * 1000) },
  ];

  for (const item of environmentData) {
    await prisma.environment.create({ data: item });
  }

  const activityData: Prisma.EngineeringActivityCreateInput[] = [
    { developer: "Alex Johnson", team: "Frontend", commits: 34, pullRequests: 9, codeReviews: 18, deployments: 5, issuesCreated: 6, issuesResolved: 7, period: "2026-09" },
    { developer: "Priya Sharma", team: "Frontend", commits: 28, pullRequests: 8, codeReviews: 15, deployments: 4, issuesCreated: 9, issuesResolved: 5, period: "2026-09" },
    { developer: "Marcus Chen", team: "Backend", commits: 40, pullRequests: 10, codeReviews: 16, deployments: 6, issuesCreated: 7, issuesResolved: 8, period: "2026-09" },
    { developer: "David Kim", team: "DevOps", commits: 22, pullRequests: 6, codeReviews: 10, deployments: 4, issuesCreated: 4, issuesResolved: 6, period: "2026-09" },
  ];

  for (const item of activityData) {
    await prisma.engineeringActivity.create({ data: item });
  }
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
