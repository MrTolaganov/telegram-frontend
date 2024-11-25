import { DefaultSession } from 'next-auth'
import { IContact } from '.'

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    currentUser: IContact
    user: {} & DefaultSession['user']
  }
}
