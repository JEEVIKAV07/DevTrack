// =====================================================
// Core Application Types
// =====================================================

// --- Auth ---
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
  avatarUrl?: string;
  createdAt: string;
}

export type UserRole = "ADMIN" | "MANAGER" | "ENGINEER" | "VIEWER";

// --- Deployment ---
export type DeploymentStatus = "SUCCESS" | "FAILED" | "IN_PROGRESS" | "ROLLED_BACK" | "PENDING";

export interface Deployment {
  id: string;
  application: string;
  version: string;
  environment: EnvironmentName;
  developer: string;
  deployedAt: string;
  duration: number; // seconds
  status: DeploymentStatus;
  commitHash?: string;
  notes?: string;
}

export interface DeploymentSummary {
  total: number;
  successful: number;
  failed: number;
  inProgress: number;
  rolledBack: number;
  pending: number;
  avgDuration: number; // seconds
  successRate: number; // percentage
}

export interface DeploymentTrend {
  date: string;
  successful: number;
  failed: number;
  total: number;
}

// --- Tickets ---
export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
export type TicketPriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export interface Ticket {
  id: string;
  title: string;
  team: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignee: string;
  createdAt: string;
  updatedAt: string;
  description?: string;
}

export interface TicketSummary {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface TicketVolumeTrend {
  date: string;
  created: number;
  resolved: number;
}

// --- Environments ---
export type EnvironmentName = "Development" | "QA" | "Staging" | "Production";
export type HealthStatus = "HEALTHY" | "WARNING" | "CRITICAL" | "UNKNOWN";

export interface EnvironmentHealth {
  id: string;
  name: EnvironmentName;
  status: HealthStatus;
  cpu: number; // percentage
  memory: number; // percentage
  disk: number; // percentage
  responseTime: number; // ms
  uptime: number; // percentage
  lastChecked: string;
  services: ServiceHealth[];
}

export interface ServiceHealth {
  name: string;
  status: HealthStatus;
  responseTime?: number;
}

// --- Engineering Activity ---
export interface TeamMemberActivity {
  id: string;
  developer: string;
  team: string;
  commits: number;
  pullRequests: number;
  codeReviews: number;
  deployments: number;
  issuesCreated: number;
  issuesResolved: number;
  period: string;
}

export interface ActivityTrend {
  date: string;
  commits: number;
  pullRequests: number;
  codeReviews: number;
  deployments: number;
}

export interface ActivitySummary {
  totalCommits: number;
  totalPullRequests: number;
  totalCodeReviews: number;
  totalDeployments: number;
  totalIssuesCreated: number;
  totalIssuesResolved: number;
}

// --- Dashboard ---
export interface DashboardKPIs {
  deployments: DeploymentSummary;
  tickets: TicketSummary;
  environments: {
    total: number;
    healthy: number;
    warning: number;
    critical: number;
  };
  activity: ActivitySummary;
  lastUpdated: string;
}

// --- Reports ---
export interface ReportFilters {
  dateFrom: string;
  dateTo: string;
  team?: string;
  environment?: string;
  metric?: string;
}

export interface ReportData {
  filters: ReportFilters;
  deployments: DeploymentSummary;
  tickets: TicketSummary;
  environments: EnvironmentHealth[];
  activity: ActivitySummary;
  generatedAt: string;
}

// --- API Responses ---
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  status: "success" | "error";
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// --- Filters ---
export type DateRange = "today" | "7d" | "30d" | "90d" | "custom";

export interface FilterState {
  dateRange: DateRange;
  team?: string;
  environment?: string;
  status?: string;
  priority?: string;
  search?: string;
}

// --- Chart Data ---
export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}
