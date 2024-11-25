import { nextAuthOptions } from '@/lib/auth-options'
import { ChildProps } from '@/types'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

export default async function Layout({ children }: ChildProps) {
  const session = await getServerSession(nextAuthOptions)

  if (!session) return redirect('/auth')

  return <>{children}</>
}
