import { betterAuth } from 'better-auth'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from '@/db';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "sqlite",
  }),
  emailAndPassword: {
    enabled: true,
  },

  trustedOrigins: [
    "http://212.85.1.223:3001",
    "http://localhost:3000",
  ],

  plugins: [tanstackStartCookies()],
})
