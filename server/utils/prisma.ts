import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ 
  connectionString: process.env.DATABASE_URL,
  min: 2,
})

export const prisma = new PrismaClient({
    adapter: adapter,
    log: ["info", "error", "warn"],
  });

