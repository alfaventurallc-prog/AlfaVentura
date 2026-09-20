import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

// Cache the instance on `global` in every environment, not just outside
// production. The dev-only guard here was to survive Next.js's HMR module
// reloads, but on Vercel a warm serverless/Fluid Compute instance can also
// re-evaluate this module more than once per isolate -- without caching in
// production too, that can still spin up extra PrismaClients (each holding
// its own connection pool) on the same instance, compounding the DB
// connection-exhaustion issue this file was implicated in.
globalForPrisma.prisma = prisma