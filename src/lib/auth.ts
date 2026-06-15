import { AuthOptions } from 'next-auth';
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { adminDb } from '@/lib/firebase-admin';
import { googleConfig, nextAuthConfig } from '@/lib/env';

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId:     googleConfig.clientId,
      clientSecret: googleConfig.clientSecret,
    }),
  ],
  secret: nextAuthConfig.secret,
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  callbacks: {
    async signIn({ user }) {
      if (!user?.email) return false;
      try {
        const ref  = adminDb.collection('users').doc(user.id);
        const snap = await ref.get();
        if (!snap.exists) {
          await ref.set({
            uid:         user.id,
            displayName: user.name  ?? 'Anonymous',
            email:       user.email,
            photoURL:    user.image ?? null,
            createdAt:   new Date().toISOString(),
            postCount:   0,
          });
        } else {
          await ref.update({
            displayName: user.name  ?? snap.data()!.displayName,
            photoURL:    user.image ?? snap.data()!.photoURL,
          });
        }
        return true;
      } catch (err) {
        console.error('[auth] signIn error:', err);
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user) token.uid = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.id = token.uid as string;
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error:  '/auth/error',
  },
};

export default NextAuth(authOptions);
