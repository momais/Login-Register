import type { NextAuthOptions, User, Account, Profile, Session } from 'next-auth';
import type { AdapterUser } from 'next-auth/adapters';
import type { JWT } from 'next-auth/jwt';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import Facebook from 'next-auth/providers/facebook';
import { UserService } from '@/services/userService';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await UserService.findByEmail(credentials.email.trim().toLowerCase());
        if (!user) return null;
        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;
        return { id: String(user.id), name: user.name, email: user.email };
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    Facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID || '',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }: { user: User | AdapterUser; account: Account | null; profile?: Profile | null }) {
      // Sync OAuth users into our Postgres users table
      if ((account?.provider === 'google' || account?.provider === 'facebook') && user?.email) {
        const existing = await UserService.findByEmail(user.email.toLowerCase());
        if (!existing) {
          const name = user.name ?? (profile as { name?: string } | null | undefined)?.name ?? '';
          const randomPassword = Math.random().toString(36).slice(-12);
          await UserService.createUser({ name, email: user.email, password: randomPassword });
        }
      }
      return true;
    },
    async jwt({ token, user }: { token: JWT; user?: User | AdapterUser | null }) {
      if (user) {
        token.name = (user as User).name ?? token.name;
        const userWithEmail = user as Partial<User> & { email?: string | null };
        const tokenWithEmail = token as JWT & { email?: string | null };
        tokenWithEmail.email = userWithEmail.email ?? tokenWithEmail.email;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        const t = token as JWT & { name?: string | null; email?: string | null };
        session.user.name = (t.name as string | undefined) ?? session.user.name;
        session.user.email = (t.email as string | undefined) ?? session.user.email;
      }
      return session;
    },
  },
};


