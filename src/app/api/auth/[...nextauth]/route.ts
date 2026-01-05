import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

const handler = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // TODO: Implement credential validation against your backend
        // This is a placeholder implementation
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Replace with actual API call
        // const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`, {
        //   method: 'POST',
        //   body: JSON.stringify(credentials),
        //   headers: { 'Content-Type': 'application/json' },
        // });

        // if (!res.ok) {
        //   return null;
        // }

        // const user = await res.json();
        // return user;

        // Placeholder: return user object
        return {
          id: '1',
          email: credentials.email as string,
          name: 'Test User',
        };
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
