import { PrismaClient } from "@prisma/client";


export const prisma = new PrismaClient({
  log: ["query", "error", "warn"], 
});

if (process.env.NODE_ENV === "development") {
  let globalWithPrisma = global as typeof globalThis & { prisma?: PrismaClient };
  if (!globalWithPrisma.prisma) {
    globalWithPrisma.prisma = prisma;
  }
}

