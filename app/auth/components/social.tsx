'use client'

import { Button } from '@/components/ui/button'
import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { FaGithub } from 'react-icons/fa'
import { FcGoogle } from 'react-icons/fc'

export default function Social() {
  const [isLoading, setIsLoading] = useState(false)

  const signInProvider = async (provider: string) => {
    setIsLoading(true)
    await signIn(provider, { callbackUrl: '/' })
    setIsLoading(false)
  }

  return (
    <div className='grid grid-cols-2 w-full gap-x-4'>
      <Button variant={'secondary'} onClick={() => signInProvider('github')} disabled={isLoading}>
        <span>Continue with Github</span>
        <FaGithub />
      </Button>
      <Button variant={'secondary'} onClick={() => signInProvider('google')} disabled={isLoading}>
        <span>Continue with Google</span>
        <FcGoogle />
      </Button>
    </div>
  )
}
