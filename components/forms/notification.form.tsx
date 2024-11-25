import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Button } from '../ui/button'
import { ChevronDown, CircleCheck, PlayCircle } from 'lucide-react'
import { cn, getSoundLabel } from '@/lib/utils'
import { useAudio } from '@/hooks/use-audio'
import { Separator } from '../ui/separator'
import { Switch } from '../ui/switch'
import { useState } from 'react'
import { sounds } from '@/constants'
import { useMutation } from '@tanstack/react-query'
import { INotificationPayload } from '@/types'
import { generateToken } from '@/lib/generate-token'
import { useSession } from 'next-auth/react'
import { $axios } from '@/http/axios'
import { toast } from '@/hooks/use-toast'
import { PopoverClose } from '@radix-ui/react-popover'

export default function NotificationForm() {
  const [selectedSound, setSelectedSound] = useState('')
  const { data: session, update } = useSession()
  const { playSound } = useAudio()

  const { isPending, mutate } = useMutation({
    mutationKey: ['update-notification'],
    mutationFn: async (payload: INotificationPayload) => {
      const token = await generateToken(session?.currentUser._id)
      const { data } = await $axios.put('/api/user/profile', payload, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return data
    },
    onSuccess: async () => {
      await update()
      toast({ description: 'Profile updated successfully' })
    },
  })

  const onPlaySound = (value: string) => {
    setSelectedSound(value)
    playSound(value)
  }

  return (
    <>
      <div className='flex items-center justify-between relative'>
        <div className='flex flex-col'>
          <p className='font-roboto'>Notification Sound</p>
          <p className='font-roboto text-muted-foreground text-xs'>
            {getSoundLabel(session?.currentUser.notificationSound)}
          </p>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button size={'sm'}>
              Select <ChevronDown />
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-full'>
            <div className='flex flex-col space-y-1'>
              {sounds.map(sound => (
                <div
                  className={cn(
                    'flex justify-between items-center bg-secondary cursor-pointer hover:bg-primary-foreground',
                    selectedSound === sound.value && 'bg-primary-foreground'
                  )}
                  key={sound.label}
                  onClick={() => onPlaySound(sound.value)}
                >
                  <Button
                    size={'sm'}
                    variant={'ghost'}
                    className='justify-start hover:bg-transparent'
                  >
                    {sound.label}
                  </Button>
                  <Button size={'icon'} variant={'ghost'}>
                    {session?.currentUser.notificationSound === sound.value ? (
                      <CircleCheck className={'text-primary'} />
                    ) : (
                      <PlayCircle />
                    )}
                  </Button>
                </div>
              ))}
            </div>
            <PopoverClose asChild>
              <Button
                className='w-full mt-2 font-bold'
                disabled={isPending}
                onClick={() => mutate({ notificationSound: selectedSound })}
              >
                Submit
              </Button>
            </PopoverClose>
          </PopoverContent>
        </Popover>
      </div>
      <Separator className='my-3' />
      <div className='flex items-center justify-between relative'>
        <div className='flex flex-col'>
          <p className='font-roboto'>Sending Sound</p>
          <p className='font-roboto text-muted-foreground text-xs'>
            {getSoundLabel(session?.currentUser.sendingSound)}
          </p>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button size={'sm'}>
              Select <ChevronDown />
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-full'>
            <div className='flex flex-col space-y-1'>
              {sounds.map(sound => (
                <div
                  className={cn(
                    'flex justify-between items-center bg-secondary cursor-pointer hover:bg-primary-foreground',
                    selectedSound === sound.value && 'bg-primary-foreground'
                  )}
                  key={sound.label}
                  onClick={() => onPlaySound(sound.value)}
                >
                  <Button
                    size={'sm'}
                    variant={'ghost'}
                    className='justify-start hover:bg-transparent'
                  >
                    {sound.label}
                  </Button>
                  <Button size={'icon'} variant={'ghost'}>
                    {session?.currentUser.sendingSound === sound.value ? (
                      <CircleCheck className={'text-primary'} />
                    ) : (
                      <PlayCircle />
                    )}
                  </Button>
                </div>
              ))}
            </div>
            <PopoverClose asChild>
              <Button
                className='w-full mt-2 font-bold'
                disabled={isPending}
                onClick={() => mutate({ sendingSound: selectedSound })}
              >
                Submit
              </Button>
            </PopoverClose>
          </PopoverContent>
        </Popover>
      </div>
      <Separator className='my-3' />
      <div className='flex items-center justify-between relative'>
        <div className='flex flex-col'>
          <p>Mode Mute</p>
          <p className='text-muted-foreground text-xs'>
            {session?.currentUser.muted ? 'Unmuted' : 'Muted'}
          </p>
        </div>
        <Switch
          checked={!session?.currentUser.muted}
          disabled={isPending}
          onCheckedChange={() => mutate({ muted: !session?.currentUser.muted })}
        />
      </div>
    </>
  )
}
