import type { PrismaClient } from "@/generated/prisma";

const globalForPrisma = globalThis as {
  prisma?: PrismaClient;
};

export async function getDbClient() {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  const { PrismaClient } = await import("@/generated/prisma");
  const client = new PrismaClient();

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }

  return client;
}
