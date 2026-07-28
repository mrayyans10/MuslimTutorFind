import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import type { UserRole, UserStatus } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role?: UserRole | null;
      status?: UserStatus;
    };
  }

  interface User {
    role?: UserRole | null;
    status?: UserStatus;
  }
}

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
    verifyRequest: "/verify-email",
    newUser: "/onboarding",
  },
  providers: [
    Credentials({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const email = parsed.data.email.toLowerCase();
        const user = await prisma.user.findUnique({ where: { email } });
        // Constant-ish response path to reduce enumeration via timing of bcrypt
        const hash = user?.passwordHash ?? "$2a$12$invalidhashinvalidhashinvalidhoO";
        const valid = await bcrypt.compare(parsed.data.password, hash);
        if (!user || !user.passwordHash || !valid) return null;
        if (user.status === "BANNED" || user.status === "SUSPENDED" || user.status === "DELETED") {
          return null;
        }
        return {
          id: user.id,
          email: user.email,
          name: user.displayName ?? user.legalName,
          image: user.image,
          role: user.role,
          status: user.status,
        };
      },
    }),
    ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.status = user.status;
      }
      if (trigger === "update" && session) {
        token.role = session.role ?? token.role;
        token.name = session.name ?? token.name;
      }
      if (token.id && !token.role) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, status: true, displayName: true, image: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.status = dbUser.status;
          token.name = dbUser.displayName;
          token.picture = dbUser.image;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole | null;
        session.user.status = token.status as UserStatus;
      }
      return session;
    },
  },
  trustHost: true,
  secret: process.env.AUTH_SECRET,
});
