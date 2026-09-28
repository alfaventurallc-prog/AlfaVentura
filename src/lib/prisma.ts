import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Each serverless instance gets its own Prisma pool, and Prisma's default
// pool size (num_cpus * 2 + 1) times many concurrent instances exhausts the
// database's connection limit -- the recurring "Failed to load ..." outage.
// The real fix is a pooled DATABASE_URL, but that lives in hosting env vars.
// Until then, cap the pool per instance from code: keep the URL as-is and
// only add connection_limit / pool_timeout when they aren't already set.
const withPoolLimits = (url: string | undefined) => {
  if (!url) return undefined
  try {
    const parsed = new URL(url)
    if (!parsed.searchParams.has('connection_limit')) parsed.searchParams.set('connection_limit', '1')
    if (!parsed.searchParams.has('pool_timeout')) parsed.searchParams.set('pool_timeout', '20')
    return parsed.toString()
  } catch {
    return url
  }
}

const datasourceUrl = withPoolLimits(process.env.DATABASE_URL)

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient(datasourceUrl ? { datasourceUrl } : undefined)

// Cache the instance on `global` in every environment so a warm instance
// re-evaluating this module never creates a second client/pool.
globalForPrisma.prisma = prisma
