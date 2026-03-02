import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// Force reload after schema update
export type { User, Post, Slider, Kegiatan, Peraturan, Program } from '@prisma/client'

// Function to get a fresh Prisma client (useful after schema updates)
export function getPrismaClient() {
  return new PrismaClient({
    log: ['query'],
  })
}