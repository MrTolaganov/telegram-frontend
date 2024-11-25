'use client'

import { useAuth } from '@/hooks/use-auth'
import Verify from './verify'
import SignIn from './sign-in'

export default function StateAuth() {
  const { step } = useAuth()

  return (
    <>
      {step === 'login' && <SignIn />}
      {step === 'verify' && <Verify />}
    </>
  )
}
