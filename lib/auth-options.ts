import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { connectDatabase } from './mongoose'
import UserModel from '@/models/user.model'
import User from '@/models/user.model'
import GitHubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'

export const nextAuthOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email address', type: 'email' },
      },
      async authorize(credentials) {
        await connectDatabase()
        const user = await UserModel.findOne({ email: credentials?.email })
        return user
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session }) {
      await connectDatabase()
      const existedUser = await User.findOne({ email: session.user.email })
      if (!existedUser) {
        const user = await User.create({
          email: session.user?.email,
          avatar: session.user?.image,
          verified: true,
        })
        session.currentUser = user
        return session
      }
      session.currentUser = existedUser
      return session
    },
  },
  session: { strategy: 'jwt' },
  jwt: { secret: process.env.NEXT_PUBLIC_JWT_SECRET },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: '/auth', signOut: '/auth' },
}
