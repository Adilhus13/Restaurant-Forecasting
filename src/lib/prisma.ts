import { PrismaClient } from "@prisma/client";
import path from "path";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Initialize Prisma Client
export const prisma = globalForPrisma.prisma || (() => {
  const databaseUrl = process.env.DATABASE_URL || "file:./dev.db";
  
  // Follow the pattern in prisma-test.js
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
  
  const dbPath = path.resolve(process.cwd(), databaseUrl.replace("file:", ""));
  const adapter = new PrismaBetterSqlite3({ url: dbPath });
  
  return new PrismaClient({ adapter });
})();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
