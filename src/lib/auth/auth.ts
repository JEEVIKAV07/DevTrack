import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

const demoEmail = process.env.DEMO_USER_EMAIL ?? "demo@engineering.internal";
const demoPassword = process.env.DEMO_USER_PASSWORD ?? "ChangeMe123!";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = String(credentials.email).toLowerCase().trim();
        const password = String(credentials.password);

        try {
          const user = await db.user.findUnique({ where: { email } });

          if (user && (await bcrypt.compare(password, user.passwordHash))) {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
            };
          }
        } catch {
          console.warn("[Auth] Database unavailable, checking demo account...");
        }

        if (email === demoEmail && password === demoPassword) {
          return {
            id: "demo-user-001",
            email: demoEmail,
            name: "Demo Engineer",
            role: "MANAGER",
          };
        }

        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "ENGINEER";
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.AUTH_SECRET,
});
