import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { checkRateLimit } from "@/lib/security/rate-limit";

const credentialsSchema = z.object({ email: z.string().trim().email().max(160), password: z.string().min(8).max(72) });
const dummyHash = "$2b$12$LJ3m4y1Kk0r7zGz3Yf1yVeWj3iO2QqH2x7V0lA1H9s6Z8uK5u3y6W";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login" },
  trustHost: true,
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const email = parsed.data.email.toLowerCase();
        checkRateLimit(`credentials:${email}`, 12);
        const user = await prisma.user.findUnique({ where: { email } });
        const valid = await bcrypt.compare(parsed.data.password, user?.passwordHash ?? dummyHash);
        if (!user || !valid || user.status !== "ACTIVE" || !user.passwordHash) return null;
        await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } }).catch(() => undefined);
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          sessionVersion: user.sessionVersion,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        Object.assign(token, { role: user.role, sessionVersion: user.sessionVersion });
      }
      return token;
    },
    session({ session, token }) {
      const claims = token as typeof token & {
        role?: "SUPER_ADMIN" | "SUPPORT" | "CUSTOMER";
        sessionVersion?: number;
      };
      if (session.user) {
        session.user.id = String(token.sub ?? "");
        session.user.role = claims.role ?? "CUSTOMER";
        session.user.sessionVersion = Number(claims.sessionVersion ?? 1);
      }
      return session;
    },
  },
});

declare module "next-auth" {
  interface User {
    role?: "SUPER_ADMIN" | "SUPPORT" | "CUSTOMER";
    sessionVersion?: number;
  }
  interface Session {
    user: {
      id: string;
      role: "SUPER_ADMIN" | "SUPPORT" | "CUSTOMER";
      sessionVersion: number;
    } & DefaultSession["user"];
  }
}

