import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

// Prevent multiple PrismaClient instances in development (hot reload)
const db = globalForPrisma.prisma ?? new PrismaClient({ log: ["error"] });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

export { db };
