import {
  Ticket,
  TicketSummary,
  TicketStatus,
  TicketPriority,
  TicketVolumeTrend,
  DateRange,
} from "@/types";
import { subDays, isAfter, format } from "./dateUtils";

// =====================================================
// Mock Tickets Data Service
// Simulates data from a project management tool (Jira, Linear, etc.)
// =====================================================

const TEAMS = ["Frontend", "Backend", "DevOps", "QA", "Platform", "Security", "Data"];

const TICKET_TITLES = [
  "Fix authentication token expiry issue",
  "Optimize database query performance",
  "Update API rate limiting configuration",
  "Resolve memory leak in worker service",
  "Implement retry logic for payment gateway",
  "Add pagination to user list endpoint",
  "Fix broken SSO integration",
  "Upgrade Node.js to v20 LTS",
  "Investigate intermittent 502 errors",
  "Implement cache invalidation strategy",
  "Fix timezone handling in reports",
  "Add monitoring alerts for error rate",
  "Resolve Docker container OOM issue",
  "Update SSL certificates",
  "Fix race condition in order processing",
  "Implement feature flag for new UI",
  "Migrate legacy auth to JWT",
  "Fix missing CORS headers",
  "Add structured logging to microservices",
  "Resolve dependency security vulnerability",
  "Performance regression in checkout flow",
  "Fix email notification not sending",
  "Database connection pool exhaustion",
  "Broken CI/CD pipeline on main branch",
  "API documentation outdated",
  "Fix mobile responsive layout",
  "Add input validation to user registration",
  "Kubernetes pod scheduling failure",
  "Fix incorrect tax calculation",
  "Implement dark mode for admin panel",
];

const ASSIGNEES = [
  "Alex Johnson",
  "Priya Sharma",
  "Marcus Chen",
  "Sarah Williams",
  "David Kim",
  "Emma Rodriguez",
  "James O'Brien",
  "Fatima Al-Hassan",
  "Unassigned",
];

const PRIORITIES: TicketPriority[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
const PRIORITY_WEIGHTS = [8, 22, 45, 25];

const STATUSES: TicketStatus[] = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
const STATUS_WEIGHTS = [30, 25, 20, 25];

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

function generateTicket(id: number, daysAgo: number): Ticket {
  const createdDate = new Date();
  createdDate.setDate(createdDate.getDate() - daysAgo);
  createdDate.setHours(randomInt(8, 18), randomInt(0, 59), 0, 0);

  const status = weightedRandom(STATUSES, STATUS_WEIGHTS);

  // Update date is after created date
  const updatedDate = new Date(createdDate);
  updatedDate.setHours(
    updatedDate.getHours() + randomInt(1, Math.min(24 * daysAgo, 72))
  );
  if (updatedDate > new Date()) {
    updatedDate.setTime(new Date().getTime() - randomInt(3600000, 86400000));
  }

  return {
    id: `TKT-${String(id).padStart(4, "0")}`,
    title: TICKET_TITLES[randomInt(0, TICKET_TITLES.length - 1)],
    team: TEAMS[randomInt(0, TEAMS.length - 1)],
    priority: weightedRandom(PRIORITIES, PRIORITY_WEIGHTS),
    status,
    assignee:
      status === "OPEN" && Math.random() < 0.3
        ? "Unassigned"
        : ASSIGNEES[randomInt(0, ASSIGNEES.length - 2)],
    createdAt: createdDate.toISOString(),
    updatedAt:
      updatedDate > createdDate ? updatedDate.toISOString() : createdDate.toISOString(),
  };
}

let cachedTickets: Ticket[] | null = null;

function getAllTickets(): Ticket[] {
  if (!cachedTickets) {
    const tickets: Ticket[] = [];
    let id = 1;
    for (let day = 0; day < 90; day++) {
      const count = randomInt(3, 12);
      for (let j = 0; j < count; j++) {
        tickets.push(generateTicket(id++, day));
      }
    }
    cachedTickets = tickets.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  return cachedTickets;
}

function filterByRange(tickets: Ticket[], range: DateRange): Ticket[] {
  const daysMap: Record<DateRange, number> = {
    today: 0,
    "7d": 7,
    "30d": 30,
    "90d": 90,
    custom: 90,
  };
  const cutoff = subDays(new Date(), daysMap[range]);
  return tickets.filter((t) => isAfter(new Date(t.createdAt), cutoff));
}

export async function getMockTickets(
  range: DateRange = "30d",
  team?: string,
  status?: string,
  priority?: string,
  search?: string,
  page = 1,
  pageSize = 20
): Promise<{ tickets: Ticket[]; total: number }> {
  await new Promise((r) => setTimeout(r, 50));

  let tickets = filterByRange(getAllTickets(), range);

  if (team) {
    tickets = tickets.filter((t) => t.team.toLowerCase() === team.toLowerCase());
  }
  if (status) {
    tickets = tickets.filter((t) => t.status.toLowerCase() === status.toLowerCase());
  }
  if (priority) {
    tickets = tickets.filter((t) => t.priority.toLowerCase() === priority.toLowerCase());
  }
  if (search) {
    const q = search.toLowerCase();
    tickets = tickets.filter(
      (t) =>
        t.id.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.assignee.toLowerCase().includes(q) ||
        t.team.toLowerCase().includes(q)
    );
  }

  const total = tickets.length;
  const paginated = tickets.slice((page - 1) * pageSize, page * pageSize);

  return { tickets: paginated, total };
}

export async function getMockTicketSummary(range: DateRange = "30d"): Promise<TicketSummary> {
  await new Promise((r) => setTimeout(r, 30));

  const tickets = filterByRange(getAllTickets(), range);

  return {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "OPEN").length,
    inProgress: tickets.filter((t) => t.status === "IN_PROGRESS").length,
    resolved: tickets.filter((t) => t.status === "RESOLVED").length,
    closed: tickets.filter((t) => t.status === "CLOSED").length,
    critical: tickets.filter((t) => t.priority === "CRITICAL").length,
    high: tickets.filter((t) => t.priority === "HIGH").length,
    medium: tickets.filter((t) => t.priority === "MEDIUM").length,
    low: tickets.filter((t) => t.priority === "LOW").length,
  };
}

export async function getMockTicketTrend(range: DateRange = "30d"): Promise<TicketVolumeTrend[]> {
  await new Promise((r) => setTimeout(r, 30));

  const daysMap: Record<DateRange, number> = {
    today: 1,
    "7d": 7,
    "30d": 30,
    "90d": 30,
    custom: 30,
  };
  const days = daysMap[range];
  const tickets = getAllTickets();

  return Array.from({ length: days }, (_, i) => {
    const date = subDays(new Date(), days - 1 - i);
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayEnd = new Date(dayStart.getTime() + 86400000);

    const created = tickets.filter((t) => {
      const d = new Date(t.createdAt);
      return d >= dayStart && d < dayEnd;
    }).length;

    const resolved = tickets.filter((t) => {
      const d = new Date(t.updatedAt);
      return (
        d >= dayStart &&
        d < dayEnd &&
        (t.status === "RESOLVED" || t.status === "CLOSED")
      );
    }).length;

    return { date: format(date, "MMM dd"), created, resolved };
  });
}
