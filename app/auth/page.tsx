import { FaTelegram } from 'react-icons/fa'
import StateAuth from './components/state-auth'
import Social from './components/social'
import ModeToggle from '@/components/shared/mode-toggle'
import { getServerSession } from 'next-auth'
import { nextAuthOptions } from '@/lib/auth-options'
import { redirect } from 'next/navigation'

export default async function Page() {
  const session = await getServerSession(nextAuthOptions)

  if (session) return redirect('/')

  return (
    <div className='container max-w-md w-full h-screen flex justify-center items-center flex-col space-y-4'>
      <FaTelegram size={120} className='text-primary' />
      <div className='flex items-center gap-2'>
        <h1 className='text-4xl font-bold'>Telegram</h1>
        <ModeToggle />
      </div>
      <StateAuth />
      <Social />
    </div>
  )
}
