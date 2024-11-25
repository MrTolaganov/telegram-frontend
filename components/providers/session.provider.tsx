'use client'

import { ChildProps } from '@/types'
import { SessionProvider as SessionProvide } from 'next-auth/react'

export default function SessionProvider({ children }: ChildProps) {
  return <SessionProvide>{children}</SessionProvide>
}
